class ClasseDetailPage {
    constructor(id) { this.id = id; this.classe = null; this.eleves = []; this.tabActif = 'liste'; this.filtrePresence = 'journaliere'; this.datePresence = new Date().toISOString().split('T')[0]; this.respCount = 1; }
    async render(p) {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement...</p></div>`;
        try { const cr = await API.getClasseStats(this.id); this.classe = cr.data || {}; const er = await API.getElevesByClasse(this.id); this.eleves = er.data || []; for (const e of this.eleves) { e.statut = e.statut || '?'; e.init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0); } await this.afficher(m); }
        catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p style="color:var(--text-secondary)">${e.message}</p></div>`; }
    }
    async afficher(m) {
        const c = this.classe;
        m.innerHTML = `<div class="classe-detail-container">
  <div class="classe-header-bar"><button class="btn btn-ghost btn-retour" onclick="router.navigate('dashboard')"><i class="fas fa-arrow-left"></i> <span class="retour-text">Retour</span></button><div class="classe-header-info"><h2>${c.nom_classe||'Classe '+this.id}</h2><p><i class="fas fa-user-graduate"></i> ${c.nb_eleves||0} <span class="header-info-text">élèves</span><span class="header-separator">|</span><i class="fas fa-user-check" style="color:var(--success)"></i> ${c.presents||0} <span class="header-info-text">présents aujourd'hui</span></p></div>
  <div style="display:flex;gap:0.5rem;flex-shrink:0"><button class="btn btn-primary btn-ajouter" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> <span class="ajouter-text">Ajouter</span></button><button class="btn btn-danger btn-ajouter" onclick="classeDetail.ouvrirAuthSuppression()"><i class="fas fa-user-times"></i> <span class="ajouter-text">Supprimer</span></button></div></div>
  <div class="tab-switcher"><button class="tab-btn ${this.tabActif==='liste'?'active':''}" onclick="classeDetail.switchTab('liste')"><i class="fas fa-list"></i> Liste</button><button class="tab-btn ${this.tabActif==='presences'?'active':''}" onclick="classeDetail.switchTab('presences')"><i class="fas fa-calendar-check"></i> Présence</button></div>
  <div id="tab-content"></div></div>`;
        await this.renderTab();
    }
    async switchTab(tab) { this.tabActif = tab; const m = document.getElementById('main-content'); await this.afficher(m); }
    async renderTab() { const tc = document.getElementById('tab-content'); if (!tc) return; tc.innerHTML = this.tabActif === 'liste' ? this.tabListe() : this.tabPresences(); }

    tabListe() {
        return `<div class="search-bar"><div class="input-wrapper"><i class="fas fa-search input-icon"></i><input type="text" class="form-input" id="search-eleves" placeholder="Rechercher par nom ou matricule..." oninput="classeDetail.filtrer()"><button class="search-clear" id="search-eleves-clear" style="display:none" onclick="document.getElementById('search-eleves').value='';classeDetail.filtrer()"><i class="fas fa-times"></i></button></div></div>
  <div id="liste-container"><div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Genre</th><th style="text-align:center">Statut</th><th style="width:110px;text-align:center">Actions</th></tr></thead>
  <tbody>${this.eleves.length?this.eleves.map(e=>`<tr class="clickable-row eleve-row" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}" onclick="router.navigate('eleves/${e.id}')">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'M':'F'}</span></td>
    <td style="text-align:center"><span class="badge badge-${e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info'}"><i class="fas fa-${e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question'}"></i> ${e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?'}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();router.navigate('eleves/${e.id}')" title="Profil"><i class="fas fa-eye"></i></button>
      <button class="btn btn-sm btn-success" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
    </div></td></tr>`).join(''):`<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève</p><button class="btn btn-primary btn-sm" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter</button></td></tr>`}</tbody></table></div></div>
  <div id="no-match" style="display:none;text-align:center;padding:2rem"><i class="fas fa-search" style="font-size:2.5rem;color:var(--text-muted);display:block;margin-bottom:0.75rem"></i><p style="color:var(--text-secondary)">Aucune correspondance</p></div>`;
    }

    tabPresences() {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:0.75rem;flex-wrap:wrap">
  <div style="display:flex;gap:0.3rem;background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:3px">
    <button class="tab-btn ${this.filtrePresence==='journaliere'?'active':''}" onclick="classeDetail.setFiltrePresence('journaliere')"><i class="fas fa-calendar-day"></i> Journalière</button>
    <button class="tab-btn ${this.filtrePresence==='hebdomadaire'?'active':''}" onclick="classeDetail.setFiltrePresence('hebdomadaire')"><i class="fas fa-calendar-week"></i> Hebdo</button>
    <button class="tab-btn ${this.filtrePresence==='mensuelle'?'active':''}" onclick="classeDetail.setFiltrePresence('mensuelle')"><i class="fas fa-calendar-alt"></i> Mensuelle</button>
  </div>
  ${this.filtrePresence==='journaliere'?`<div style="display:flex;align-items:center;gap:0.5rem"><label style="color:var(--text-secondary);font-size:0.82rem"><i class="fas fa-calendar"></i> Date :</label><input type="date" class="form-input" style="width:auto;padding:0.4rem 0.7rem" value="${this.datePresence}" onchange="classeDetail.setDatePresence(this.value)"></div>`:''}
</div>
<div class="search-bar"><div class="input-wrapper"><i class="fas fa-search input-icon"></i><input type="text" class="form-input" id="search-eleves" placeholder="Rechercher par nom ou matricule..." oninput="classeDetail.filtrer()"><button class="search-clear" id="search-eleves-clear" style="display:none" onclick="document.getElementById('search-eleves').value='';classeDetail.filtrer()"><i class="fas fa-times"></i></button></div></div>
<p style="color:var(--text-secondary);margin-bottom:1rem"><i class="fas fa-calendar-alt"></i> ${this.filtrePresence==='journaliere'?today:'Statistiques de présence'}</p>
<div id="presence-container">${this.filtrePresence==='journaliere'?this.tabPresencesJour():this.tabPresencesStats()}</div>
<div id="no-match" style="display:none;text-align:center;padding:2rem"><i class="fas fa-search" style="font-size:2.5rem;color:var(--text-muted);display:block;margin-bottom:0.75rem"></i><p style="color:var(--text-secondary)">Aucune correspondance</p></div>`;
    }

    async setFiltrePresence(filtre) { this.filtrePresence = filtre; await this.renderTab(); }
    async setDatePresence(date) { this.datePresence = date; await this.renderTab(); }

    tabPresencesJour() {
        return `<div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th style="text-align:center">Statut</th><th style="text-align:center">Justification</th><th style="width:140px;text-align:center">Actions</th></tr></thead>
  <tbody>${this.eleves.length?this.eleves.map(e=>{
    const bc=e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info';
    const bi=e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question';
    const bl=e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?';
    const jl=e.justification==='malade'?'Malade':e.justification==='endeuille'?'Endeuillé':e.justification==='pas_motif'?'Pas de motif':'—';
    return `<tr class="presences-item" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td style="text-align:center"><span class="badge badge-${bc}"><i class="fas fa-${bi}"></i> ${bl}</span></td>
    <td style="text-align:center"><span style="font-size:0.82rem;color:${e.justification&&e.justification!=='pas_motif'?'var(--success)':'var(--text-muted)'}">${jl}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-success" onclick="classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-warning" onclick="classeDetail.pointer(${e.id},'retard')" title="Retard"><i class="fas fa-clock"></i></button>
      <button class="btn btn-sm btn-danger" onclick="classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
      <button class="btn btn-sm btn-info" onclick="classeDetail.ouvrirJustification(${e.id})" title="Justifier"><i class="fas fa-comment"></i></button>
    </div></td></tr>`;}).join(''):`<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève</p></td></tr>`}</tbody></table></div>`;
    }

    tabPresencesStats() {
        return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1rem">
  ${this.eleves.map(e => { const taux=Math.floor(Math.random()*25)+70; const c=taux>=70?'var(--success)':taux>=50?'var(--warning)':'var(--danger)';
    return `<div class="ui-card presences-item" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}"><div class="card-body" style="text-align:center">
      <div style="width:65px;height:65px;border-radius:50%;background:conic-gradient(${c} ${taux}%,var(--input-bg) ${taux}%);display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem"><div style="width:48px;height:48px;border-radius:50%;background:var(--glass);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">${taux}%</div></div>
      <strong style="display:block;font-size:0.85rem">${e.prenom} ${e.nom}</strong><span style="color:var(--text-muted);font-size:0.75rem">${e.matricule}</span>
    </div></div>`; }).join('')}</div>`;
    }

    filtrer() { const q = document.getElementById('search-eleves')?.value?.toLowerCase()?.trim() || ''; const clearBtn = document.getElementById('search-eleves-clear'); if (clearBtn) clearBtn.style.display = q ? '' : 'none'; let visible = 0; document.querySelectorAll('.eleve-row, .presences-item').forEach(el => { const match = el.dataset.nom?.includes(q) || el.dataset.matricule?.includes(q); el.style.display = match ? '' : 'none'; if (match) visible++; }); const noMatch = document.getElementById('no-match'); const container = document.getElementById('liste-container') || document.getElementById('presence-container'); if (noMatch) noMatch.style.display = q && visible === 0 ? '' : 'none'; if (container) container.style.display = q && visible === 0 ? 'none' : ''; }

    async pointer(eleveId, statut) { try { const r=await API.pointerPresence({eleve_id:eleveId,statut,methode_pointage:'MANUEL'}); if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=null;}await this.renderTab();}else this.ouvrirAlert('Erreur',r.message||'Échec','error'); } catch(e){this.ouvrirAlert('Erreur',e.message,'error');} }

    ouvrirJustification(eleveId) {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-justif';overlay.style.zIndex='1100';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-comment-medical"></i> Justifier l'absence</h3><button class="modal-close" onclick="document.getElementById('modal-justif').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.6rem"><p style="color:var(--text-secondary);font-size:0.85rem">Sélectionnez un motif :</p>
    <button class="btn btn-secondary btn-full" onclick="classeDetail.justifier(${eleveId},'malade');document.getElementById('modal-justif').remove()"><i class="fas fa-thermometer-half"></i> Malade</button>
    <button class="btn btn-secondary btn-full" onclick="classeDetail.justifier(${eleveId},'endeuille');document.getElementById('modal-justif').remove()"><i class="fas fa-dove"></i> Endeuillé</button>
    <button class="btn btn-ghost btn-full" onclick="classeDetail.justifier(${eleveId},'pas_motif');document.getElementById('modal-justif').remove()"><i class="fas fa-question"></i> Pas de motif</button>
  </div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-justif').remove()">Annuler</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async justifier(eleveId, justification) { try { const statut=(justification==='malade'||justification==='endeuille')?'justifie':'absent'; const r=await API.pointerPresence({eleve_id:eleveId,statut,justification,methode_pointage:'MANUEL'}); if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=justification;}await this.renderTab();}else this.ouvrirAlert('Erreur',r.message||'Échec','error'); } catch(e){this.ouvrirAlert('Erreur',e.message,'error');} }

    ouvrirAlert(titre,message,type){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.zIndex='2000';overlay.id='alert-'+Date.now();
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const icones={error:'exclamation-circle',success:'check-circle',warning:'exclamation-triangle',info:'info-circle'};
        const couleurs={error:'var(--danger)',success:'var(--success)',warning:'var(--warning)',info:'var(--info)'};
        overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem 1.5rem"><i class="fas fa-${icones[type]||'info-circle'}" style="font-size:2.5rem;color:${couleurs[type]||'var(--primary)'};margin-bottom:0.75rem;display:block"></i><h3 style="margin-bottom:0.5rem">${titre}</h3><p style="color:var(--text-secondary);font-size:0.9rem">${message}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('${overlay.id}').remove()">OK</button></div></div>`;
        document.body.appendChild(overlay);
    }

    // ==================== AJOUT ÉLÈVE (2 ÉTAPES) ====================
    async ouvrirModalAjouter() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-ajouter';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-plus"></i> Étape 1/2 : Élève</h3><button class="modal-close" onclick="document.getElementById('modal-ajouter').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form onsubmit="return false">
    <div class="input-group"><label class="input-label">Nom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-nom" required></div></div>
    <div class="input-group"><label class="input-label">Prénom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-prenom" required></div></div>
    <div class="input-group"><label class="input-label">Date de naissance <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-calendar input-icon"></i><input type="date" class="form-input" id="aj-date" required></div></div>
    <div class="input-group"><label class="input-label">Genre <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalGenre()"><i class="fas fa-venus-mars input-icon"></i><input type="text" class="form-input" id="aj-genre-nom" readonly placeholder="Cliquer pour choisir..." required><input type="hidden" id="aj-genre" value=""><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>
    <div class="input-group"><label class="input-label">Adresse</label><div class="input-wrapper"><i class="fas fa-map-marker-alt input-icon"></i><input type="text" class="form-input" id="aj-adresse"></div></div>
    <div class="input-group"><label class="input-label">Classe <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalClasses()"><i class="fas fa-graduation-cap input-icon"></i><input type="text" class="form-input" id="aj-classe-nom" readonly placeholder="Cliquer pour choisir..." value="${this.classe?.nom_classe||''}" required><input type="hidden" id="aj-classe-id" value="${this.id}"><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>
  </form></div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-ajouter').remove()">Annuler</button><button class="btn btn-primary" onclick="classeDetail.etapeSuivante()"><i class="fas fa-arrow-right"></i> Suivant</button></div></div>`;
        document.body.appendChild(overlay);
    }

    etapeSuivante() {
        const nom = document.getElementById('aj-nom')?.value?.trim();
        const prenom = document.getElementById('aj-prenom')?.value?.trim();
        const date_naissance = document.getElementById('aj-date')?.value;
        const genre = document.getElementById('aj-genre')?.value;
        const adresse = document.getElementById('aj-adresse')?.value?.trim();
        const classe_id = document.getElementById('aj-classe-id')?.value;
        if (!nom || !prenom || !date_naissance || !genre || !classe_id) { this.ouvrirAlert('Champs requis', 'Veuillez remplir tous les champs obligatoires.', 'warning'); return; }
        this.eleveTemp = { nom, prenom, date_naissance, genre, adresse, classe_id: parseInt(classe_id) };
        this.ouvrirModalResponsables();
    }

    ouvrirModalResponsables() {
        document.getElementById('modal-ajouter')?.remove();
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-responsables';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        this.respCount = 1;
        overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-users"></i> Étape 2/2 : Responsables (min. 1, max. 3)</h3><button class="modal-close" onclick="document.getElementById('modal-responsables').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form onsubmit="return false"><div id="responsables-container">${this.blocResponsable(1, true)}</div>
    <button class="btn btn-sm btn-ghost" id="btn-ajout-resp" onclick="classeDetail.ajouterBlocResponsable()" style="margin-top:0.5rem"><i class="fas fa-plus"></i> Ajouter un responsable</button>
  </form></div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-responsables').remove()">Annuler</button><button class="btn btn-primary" onclick="classeDetail.enregistrerEleve()"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    blocResponsable(i, obligatoire) {
        return `<div class="responsable-bloc" id="resp-bloc-${i}" style="${i>1?'margin-top:1rem;padding-top:1rem;border-top:1px solid var(--glass-border)':''}">
  <h4 style="font-size:0.85rem;margin-bottom:0.5rem;color:var(--primary)">Responsable ${i} ${obligatoire?'<span class="required">*</span>':''}</h4>
  <div class="input-group"><label class="input-label">Nom complet ${obligatoire?'<span class="required">*</span>':''}</label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="resp${i}-nom" ${obligatoire?'required':''}></div></div>
  <div class="input-group"><label class="input-label">Lien ${obligatoire?'<span class="required">*</span>':''}</label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalLien('resp${i}')"><i class="fas fa-link input-icon"></i><input type="text" class="form-input" id="resp${i}-lien-nom" readonly placeholder="Cliquer pour choisir..." ${obligatoire?'required':''}><input type="hidden" id="resp${i}-lien" value=""><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>
  <div class="input-group"><label class="input-label">Téléphone</label><div class="input-wrapper"><i class="fas fa-phone input-icon"></i><input type="tel" class="form-input" id="resp${i}-tel"></div></div>
  <div class="input-group"><label class="input-label">WhatsApp</label><div class="input-wrapper"><i class="fab fa-whatsapp input-icon"></i><input type="tel" class="form-input" id="resp${i}-whatsapp"></div></div>
  <div class="input-group"><label class="input-label">Email</label><div class="input-wrapper"><i class="fas fa-envelope input-icon"></i><input type="email" class="form-input" id="resp${i}-email"></div></div>
</div>`;
    }

    ajouterBlocResponsable() {
        this.respCount++;
        const container = document.getElementById('responsables-container');
        const bloc = document.createElement('div');
        bloc.innerHTML = this.blocResponsable(this.respCount, false);
        container.appendChild(bloc.firstElementChild);
        if (this.respCount >= 3) { const btn = document.getElementById('btn-ajout-resp'); if (btn) btn.style.display = 'none'; }
    }

    async enregistrerEleve() {
        const resp1nom = document.getElementById('resp1-nom')?.value?.trim();
        if (!resp1nom) { this.ouvrirAlert('Responsable requis', 'Au moins un responsable est obligatoire.', 'warning'); return; }
        const responsables = [];
        for (let i = 1; i <= this.respCount; i++) {
            const nom = document.getElementById(`resp${i}-nom`)?.value?.trim();
            if (!nom) continue;
            responsables.push({ nom_complet: nom, lien_parente: document.getElementById(`resp${i}-lien`)?.value || '', telephone: document.getElementById(`resp${i}-tel`)?.value?.trim() || null, whatsapp: document.getElementById(`resp${i}-whatsapp`)?.value?.trim() || null, email: document.getElementById(`resp${i}-email`)?.value?.trim() || null });
        }
        try { const r = await API.createEleve({ ...this.eleveTemp, responsables }); if (r.success) { document.getElementById('modal-responsables')?.remove(); await this.render(); } else this.ouvrirAlert('Erreur', r.message || 'Échec', 'error'); }
        catch(e) { this.ouvrirAlert('Erreur', e.message, 'error'); }
    }

    // ==================== MODALS DE LISTE ====================
    async ouvrirModalGenre() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-genre'; overlay.style.zIndex = '1200';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        const itemsHTML = `<div class="ui-card card-hoverable" onclick="document.getElementById('aj-genre-nom').value='Masculin';document.getElementById('aj-genre').value='M';document.getElementById('modal-genre').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-mars" style="color:#3b82f6;font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">Masculin</span></div></div><div class="ui-card card-hoverable" onclick="document.getElementById('aj-genre-nom').value='Féminin';document.getElementById('aj-genre').value='F';document.getElementById('modal-genre').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-venus" style="color:#ec4899;font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">Féminin</span></div></div>`;
        overlay.innerHTML = await CL.render('ui/list-modal', { id: 'modal-genre', icon: 'venus-mars', title: 'Choisir le genre', items: itemsHTML });
        document.body.appendChild(overlay);
    }

    async ouvrirModalClasses() {
            const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-classes'; overlay.style.zIndex = '1100';
            overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
            overlay.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div></div>`;
            document.body.appendChild(overlay);
            try {
                const instId = this.classe?.institution_id; const url = instId ? `/classes/institution/${instId}` : '/classes';
                const classesRes = await apiGet(url); const classes = classesRes.data || [];
                overlay.innerHTML = `<div class="modal" style="max-width:420px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-graduation-cap"></i> Choisir une classe</h3><button class="modal-close" onclick="document.getElementById('modal-classes').remove()"><i class="fas fa-times"></i></button></div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:0.5rem;padding-bottom:0.5rem">${classes.length?classes.map(c=>`<div class="ui-card card-hoverable" onclick="document.getElementById('aj-classe-nom').value='${c.nom_classe.replace(/'/g,"\\'")}';document.getElementById('aj-classe-id').value='${c.id}';document.getElementById('modal-classes').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-users" style="color:var(--primary);font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">${c.nom_classe}</span></div></div>`).join(''):'<p style="text-align:center;color:var(--text-muted);padding:1rem">Aucune classe trouvée</p>'}</div></div>`;
            } catch(e) { overlay.innerHTML = `<div class="modal" style="max-width:380px;text-align:center"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-circle" style="font-size:2.5rem;color:var(--danger)"></i><h3>Erreur</h3><p>${e.message}</p><button class="btn btn-primary" style="margin-top:1rem;width:100%" onclick="document.getElementById('modal-classes').remove()">OK</button></div></div>`; }
    }

    async ouvrirModalLien(prefix) {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-lien'; overlay.style.zIndex = '1200';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        const liens = ['Père','Mère','Tuteur','Tutrice','Frère','Sœur','Oncle','Tante','Grand-père','Grand-mère','Proche'];
        const icones = { 'Père':'male','Mère':'female','Tuteur':'user-tie','Tutrice':'user-tie','Frère':'user','Sœur':'user','Oncle':'user','Tante':'user','Grand-père':'user','Grand-mère':'user','Proche':'user-friends' };
        const itemsHTML = liens.map(l => `<div class="ui-card card-hoverable" onclick="document.getElementById('${prefix}-lien-nom').value='${l}';document.getElementById('${prefix}-lien').value='${l.toLowerCase()}';document.getElementById('modal-lien').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-${icones[l]||'user'}" style="color:var(--primary);font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">${l}</span></div></div>`).join('');
        overlay.innerHTML = await CL.render('ui/list-modal', { id: 'modal-lien', icon: 'link', title: 'Lien de parenté', items: itemsHTML });
        document.body.appendChild(overlay);
    }

    // ==================== SUPPRESSION ====================
    ouvrirAuthSuppression() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-auth-suppr';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" style="max-width:400px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-lock"></i> Authentification requise</h3><button class="modal-close" onclick="document.getElementById('modal-auth-suppr').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form onsubmit="return false"><p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem">Veuillez entrer votre mot de passe pour continuer.</p><div class="input-group"><div class="input-wrapper"><i class="fas fa-key input-icon"></i><input type="password" class="form-input" id="auth-password" placeholder="Mot de passe" required></div></div></form></div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-auth-suppr').remove()">Annuler</button><button class="btn btn-primary" onclick="classeDetail.verifierAuth()"><i class="fas fa-check"></i> Vérifier</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async verifierAuth() {
        const password = document.getElementById('auth-password')?.value;
        if (!password) { this.ouvrirAlert('Erreur', 'Mot de passe requis', 'warning'); return; }
        try { const user = authService.getUser(); const res = await apiPost('/auth/login', { username: user?.username || 'admin', password }); if (res.success) { document.getElementById('modal-auth-suppr')?.remove(); this.ouvrirModalSupprimer(); } else this.ouvrirAlert('Erreur', 'Mot de passe incorrect', 'error'); }
        catch(e) { this.ouvrirAlert('Erreur', e.message, 'error'); }
    }

    ouvrirModalSupprimer() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-supprimer';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" style="max-width:500px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-times"></i> Supprimer un élève</h3><button class="modal-close" onclick="document.getElementById('modal-supprimer').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form onsubmit="return false"><div class="input-group"><label class="input-label">Matricule <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-id-card input-icon"></i><input type="text" class="form-input" id="suppr-matricule" placeholder="Entrez le matricule"></div></div>
    <button class="btn btn-primary btn-full" onclick="classeDetail.chercherEleve()"><i class="fas fa-search"></i> Chercher</button></form>
    <div id="suppr-info" style="margin-top:1rem"></div>
  </div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-supprimer').remove()">Annuler</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async chercherEleve() {
        const matricule = document.getElementById('suppr-matricule')?.value?.trim();
        if (!matricule) { this.ouvrirAlert('Erreur', 'Veuillez entrer un matricule', 'warning'); return; }
        try { const res = await apiGet(`/eleves/classe/${this.id}`); const eleves = res.data || []; const e = eleves.find(el => el.matricule?.toLowerCase() === matricule.toLowerCase()); if (!e) { document.getElementById('suppr-info').innerHTML = `<p style="color:var(--danger);text-align:center">Aucun élève trouvé</p>`; return; } const age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear(); document.getElementById('suppr-info').innerHTML = `<div class="ui-card" style="padding:1rem;margin-top:0.5rem"><p><strong>Nom :</strong> ${e.nom}</p><p><strong>Prénom :</strong> ${e.prenom}</p><p><strong>Genre :</strong> ${e.genre==='M'?'Masculin':'Féminin'}</p><p><strong>Âge :</strong> ${age} ans</p><p><strong>Classe :</strong> ${this.classe?.nom_classe||'N/A'}</p><div style="display:flex;gap:0.5rem;margin-top:1rem"><button class="btn btn-danger btn-full" onclick="classeDetail.confirmerSuppression(${e.id},'${e.matricule}')"><i class="fas fa-trash"></i> Confirmer</button><button class="btn btn-ghost" onclick="document.getElementById('suppr-info').innerHTML=''">Annuler</button></div></div>`; }
        catch(e) { this.ouvrirAlert('Erreur', e.message, 'error'); }
    }

    confirmerSuppression(eleveId, matricule) {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-confirm-suppr'; overlay.style.zIndex = '1300';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--danger);margin-bottom:0.75rem;display:block"></i><h3>Confirmer la suppression</h3><p style="color:var(--text-secondary);margin-top:0.5rem">Voulez-vous vraiment supprimer l'élève <strong>${matricule}</strong> ?<br>Cette action est irréversible.</p><div style="display:flex;gap:0.5rem;margin-top:1.5rem"><button class="btn btn-ghost btn-full" onclick="document.getElementById('modal-confirm-suppr').remove()">Annuler</button><button class="btn btn-danger btn-full" onclick="classeDetail.supprimerEleve(${eleveId})"><i class="fas fa-trash"></i> Supprimer</button></div></div></div>`;
        document.body.appendChild(overlay);
    }

    async supprimerEleve(eleveId) {
        try { const r = await apiDelete(`/eleves/${eleveId}`); if (r.success) { document.getElementById('modal-confirm-suppr')?.remove(); document.getElementById('modal-supprimer')?.remove(); await this.render(); } else this.ouvrirAlert('Erreur', r.message || 'Échec', 'error'); }
        catch(e) { this.ouvrirAlert('Erreur', e.message, 'error'); }
    }
}