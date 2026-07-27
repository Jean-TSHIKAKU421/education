class DashboardPage {
    constructor() { this.institutionActive = null; this.institutions = []; this.allClasses = []; }
    async render() {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement...</p></div>`;
        try { const ir = await apiGet('/classes/institutions'); this.institutions = ir.data || []; if (!this.institutionActive && this.institutions.length) this.institutionActive = this.institutions[0]; await this.afficher(m); }
        catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p style="color:var(--text-secondary);margin-top:0.5rem">${e.message}</p></div>`; }
    }
    async afficher(m) {
        const inst = this.institutionActive;
        if (!inst) { m.innerHTML = `<div style="text-align:center;padding:4rem"><i class="fas fa-school" style="font-size:3rem;color:var(--text-muted)"></i><h3 style="margin-top:1rem;font-weight:700">Aucune institution</h3><p style="color:var(--text-secondary)">Configurez votre établissement</p></div>`; return; }
        const cr = await apiGet(`/classes/institution/${inst.id}`); this.allClasses = cr.data || [];
        for (const c of this.allClasses) { try { const s = await apiGet(`/classes/${c.id}/stats`); if (s.data) { c.presents = s.data.presents || 0; c.taux = s.data.taux_presence || '0.0'; c.nb_eleves = s.data.nb_eleves || c.nb_eleves || 0; } } catch(e) { c.presents = 0; c.taux = '0.0'; } }
        const classesAffichees = inst.niveau === 'secondaire' ? this.regrouperSecondaire() : this.allClasses;
        const labels = { maternelle: 'Maternelle', primaire: 'Primaire', secondaire: 'Secondaire' };
        const icons = { maternelle: 'child', primaire: 'child-reaching', secondaire: 'user-graduate' };
        const te = this.allClasses.reduce((s,c) => s + (c.nb_eleves||0), 0);
        const searchRendu = await CL.render('forms/search-bar', { id: 'search-classes', placeholder: 'Rechercher une classe...', oninput: "dashboard.filtrerClasses();var c=document.getElementById('search-classes-clear');if(c)c.style.display=this.value?'':'none'", onclear: 'dashboard.filtrerClasses()' });
        m.innerHTML = `<div class="dashboard-page">
  <div class="niveau-switcher">${this.institutions.map(i => `<button class="btn btn-sm ${i.id===inst.id?'btn-primary':'btn-ghost'}" onclick="dashboard.switchInstitution(${i.id})"><i class="fas fa-${icons[i.niveau]}"></i> ${labels[i.niveau]}</button>`).join('')}</div>
  <div style="display:flex;justify-content:center;margin-bottom:1.25rem">
    <div class="ui-card" style="width:220px;text-align:center">
      <div class="card-body" style="padding:1.5rem">
        <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.03em;margin-bottom:0.75rem">Nombre d'élèves inscrits</div>
        <div class="card-icon-wrapper" style="background:var(--gradient-1);box-shadow:0 8px 24px var(--primary-glow);margin:0 auto 0.75rem;width:48px;height:48px"><i class="fas fa-user-graduate"></i></div>
        <div style="font-size:2rem;font-weight:800">${te}</div>
      </div>
    </div>
  </div>
  ${searchRendu}
  <div class="section-header"><h3><i class="fas fa-layer-group"></i> Classes</h3><span style="color:var(--text-muted);font-size:0.78rem">${classesAffichees.length} classe(s)</span></div>
  <div class="classes-grid" id="classes-grid">${classesAffichees.map(c => this.carteClasse(c, inst)).join('')}</div></div>`;
    }
    regrouperSecondaire() {
        const groupes = {}, ordre = { '7ème':1, '8ème':2, '1ère':3, '2ème':4, '3ème':5, '4ème':6 };
        for (const c of this.allClasses) {
            const cle = c.niveau_detail;
            if (!groupes[cle]) groupes[cle] = { ...c, options: [], nb_eleves: 0, presents: 0, taux: '0.0' };
            groupes[cle].nb_eleves += c.nb_eleves || 0;
            groupes[cle].presents += c.presents || 0;
            if (c.option_id) groupes[cle].options.push(c);
        }
        for (const k of Object.keys(groupes)) { const g = groupes[k]; g.taux = g.nb_eleves > 0 ? ((g.presents / g.nb_eleves) * 100).toFixed(1) : '0.0'; }
        return Object.values(groupes).sort((a,b) => (ordre[a.niveau_detail]||99) - (ordre[b.niveau_detail]||99));
    }
    carteClasse(c, inst) {
        const colors = { maternelle: 'linear-gradient(135deg,#f472b6,#ec4899)', primaire: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', secondaire: 'linear-gradient(135deg,#818cf8,#6366f1)' };
        const shadows = { maternelle: 'rgba(244,114,182,0.35)', primaire: 'rgba(56,189,248,0.35)', secondaire: 'rgba(129,140,248,0.35)' };
        const tauxColor = (c.taux||0) >= 70 ? 'var(--success)' : (c.taux||0) >= 40 ? 'var(--warning)' : 'var(--danger)';
        const aDesOptions = c.options && c.options.length > 0;
        const nomAffichage = inst.niveau === 'secondaire' ? `${c.niveau_detail}${aDesOptions ? ' (options)' : ''}` : c.nom_classe;
        const onclick = aDesOptions ? `event.stopPropagation();dashboard.ouvrirModalOptions('${c.niveau_detail}','${inst.id}')` : `router.navigate('classe/${c.id}')`;
        return `<div class="ui-card card-hoverable classe-item" data-nom="${nomAffichage.toLowerCase()}" onclick="${onclick}">
  <div class="card-icon-wrapper" style="background:${colors[inst.niveau]};box-shadow:0 8px 24px ${shadows[inst.niveau]}"><i class="fas fa-users"></i></div>
  <div class="card-body"><h4 style="font-weight:700;font-size:1rem;margin-bottom:0.5rem">${nomAffichage}</h4>
    <div style="display:flex;gap:1rem;margin-top:0.5rem"><div style="text-align:center;flex:1"><div style="font-size:1.3rem;font-weight:700">${c.nb_eleves||0}</div><div style="color:var(--text-muted);font-size:0.68rem;text-transform:uppercase">Élèves</div></div><div style="text-align:center;flex:1"><div style="font-size:1.3rem;font-weight:700;color:var(--success)">${c.presents||0}</div><div style="color:var(--text-muted);font-size:0.68rem;text-transform:uppercase">Présents</div></div><div style="text-align:center;flex:1"><div style="font-size:1.3rem;font-weight:700;color:${tauxColor}">${c.taux||0}%</div><div style="color:var(--text-muted);font-size:0.68rem;text-transform:uppercase">Présence</div></div></div>
    <div style="margin-top:0.75rem;background:var(--input-bg);border-radius:6px;height:5px;overflow:hidden"><div style="width:${c.taux||0}%;height:100%;background:${tauxColor};border-radius:6px;transition:width 0.8s cubic-bezier(0.4,0,0.2,1)"></div></div></div>
  <div class="card-footer">${aDesOptions?`<span class="badge badge-info"><i class="fas fa-cog"></i> ${c.options.length} option(s)</span>`:'<span><i class="fas fa-arrow-right"></i> Ouvrir</span>'}</div></div>`;
    }
    filtrerClasses() { const q = document.getElementById('search-classes')?.value.toLowerCase() || ''; document.querySelectorAll('.classe-item').forEach(el => { el.style.display = el.dataset.nom.includes(q) ? '' : 'none'; }); }
    async ouvrirModalOptions(niveauDetail, institutionId) {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-options';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div></div>`;
        document.body.appendChild(overlay);
        try {
            const res = await apiGet(`/classes/options/${institutionId}/${niveauDetail}`); const options = res.data || [];
            const icns = { CG:'chart-line', MG:'cogs', BC:'flask', MP:'calculator', PE:'book', EL:'bolt', CT:'cut' };
            overlay.innerHTML = `<div class="modal modal-md" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-cogs"></i> ${niveauDetail} - Choisir une option</h3><button class="modal-close" onclick="document.getElementById('modal-options').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.6rem">${options.length?options.map(o=>`<div class="ui-card card-hoverable" onclick="document.getElementById('modal-options').remove();router.navigate('classe/${o.id}')"><div style="display:flex;align-items:center;gap:0.8rem;padding:0.8rem 1rem"><div style="width:40px;height:40px;border-radius:10px;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:1rem"><i class="fas fa-${icns[o.option_code]||'book'}"></i></div><div style="flex:1"><strong>${o.option_nom}</strong><p style="color:var(--text-muted);font-size:0.78rem">${o.option_code} · ${o.nb_eleves||0} élèves</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted)"></i></div></div>`).join(''):'<p style="text-align:center;color:var(--text-muted);padding:1rem">Aucune option disponible</p>'}</div>
  <div class="modal-footer"><button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal-options').remove()"><i class="fas fa-times"></i> Fermer</button></div></div>`;
        } catch(e) { overlay.innerHTML = `<div class="modal modal-md"><div class="modal-header"><h3>Erreur</h3></div><div class="modal-body"><p>${e.message}</p></div></div>`; }
    }
    async switchInstitution(id) {
        this.institutionActive = this.institutions.find(i => i.id === id);
        // Mettre à jour le niveau dans le header
        const nivEl = document.getElementById('header-institution-niveau');
        const labels = { maternelle: 'Maternelle', primaire: 'Primaire', secondaire: 'Secondaire' };
        const icons = { maternelle: 'child', primaire: 'child-reaching', secondaire: 'user-graduate' };
        if (nivEl) nivEl.innerHTML = `<i class="fas fa-${icons[this.institutionActive.niveau]}"></i> ${labels[this.institutionActive.niveau]}`;
        await this.afficher(document.getElementById('main-content'));
    }
}