class ProfilElevePage {
    constructor(id) { this.id = id; this.respCount = 0; this.responsablesExistants = 0; }
    async render() {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement du profil...</p></div>`;
        try {
            const res = await API.getEleve(this.id);
            if (!res.success || !res.data) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-user-slash" style="font-size:3rem;color:var(--text-muted)"></i><h3 style="margin-top:1rem">Élève non trouvé</h3></div>`; return; }
            const e = res.data;
            this.responsablesExistants = (e.responsables||[]).length;
            const init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0);
            const age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear();
            const respHTML = (e.responsables||[]).map(r => `<div class="responsable-card"><div class="responsable-header"><strong>${r.nom_complet}</strong><span class="badge badge-info">${r.lien_parente}</span></div><div class="responsable-contacts">${r.telephone?`<div class="contact-item"><span class="contact-moyen"><i class="fas fa-phone"></i> Téléphone</span><span class="contact-valeur">${r.telephone}</span></div>`:''}${r.whatsapp?`<div class="contact-item"><span class="contact-moyen"><i class="fab fa-whatsapp"></i> WhatsApp</span><span class="contact-valeur">${r.whatsapp}</span></div>`:''}${r.email?`<div class="contact-item"><span class="contact-moyen"><i class="fas fa-envelope"></i> E-mail</span><span class="contact-valeur">${r.email}</span></div>`:''}</div></div>`).join('');
            const derniersJours = (e.presences||[]).slice(0,14).map(p => { const d=new Date(p.date_presence); const sc=p.statut==='present'?'present':p.statut==='absent'?'absent':p.statut==='retard'?'retard':p.statut==='justifie'?'justifie':''; return `<div class="presence-day ${sc}" title="${d.toLocaleDateString('fr-FR')}: ${p.statut||'?'}">${d.getDate()}</div>`; }).join('');
            const taux = e.taux_presence||0; const tauxColor = taux>=70?'var(--success)':taux>=50?'var(--warning)':'var(--danger)';
            m.innerHTML = `<div class="profil-eleve-container">
  <button class="btn btn-ghost" onclick="router.navigate('classe/${e.classe_id}')" style="margin-bottom:1.5rem"><i class="fas fa-arrow-left"></i> Retour</button>
  <div class="profil-header-card"><div class="profil-avatar-lg" style="background:var(--gradient-${e.genre==='F'?'3':'1'})">${init}</div><div style="flex:1"><h2>${e.prenom} ${e.nom}</h2><div style="display:flex;gap:1rem;color:var(--text-secondary);margin-top:0.5rem;flex-wrap:wrap"><span><i class="fas fa-id-card"></i> ${e.matricule}</span><span><i class="fas fa-graduation-cap"></i> ${e.classe_nom||'N/A'}</span><span><i class="fas fa-calendar"></i> ${new Date(e.date_inscription).toLocaleDateString('fr-FR')}</span><span><i class="fas fa-birthday-cake"></i> ${age} ans</span></div></div></div>
  <div class="profil-grid-top">
    <div class="profil-section"><h3><i class="fas fa-address-card"></i> Identité</h3><div class="info-liste"><div class="info-item"><span class="info-label">Date de naissance</span><span class="info-value">${new Date(e.date_naissance).toLocaleDateString('fr-FR',{year:'numeric',month:'long',day:'numeric'})}</span></div><div class="info-item"><span class="info-label">Genre</span><span class="info-value"><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'Masculin':'Féminin'}</span></span></div><div class="info-item"><span class="info-label">Adresse</span><span class="info-value">${e.adresse||'Non renseignée'}</span></div><div class="info-item"><span class="info-label">Âge</span><span class="info-value">${age} ans</span></div></div></div>
    <div class="profil-section"><h3><i class="fas fa-qrcode"></i> Carte d'identité</h3><div style="text-align:center;padding:1rem">${e.qr_code?`<img src="${e.qr_code}" alt="QR Code" style="width:160px;height:160px;border-radius:var(--radius);background:white;padding:0.5rem"><div style="margin-top:0.75rem;display:flex;gap:0.5rem;justify-content:center"><button class="btn btn-sm btn-primary" onclick="window.open('${e.qr_code}')"><i class="fas fa-download"></i> Télécharger</button><button class="btn btn-sm btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Imprimer</button></div>`:'<p style="color:var(--text-muted)">Aucun QR code généré</p>'}</div></div>
  </div>
  <div class="profil-section" style="margin-top:1rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><h3 style="margin:0"><i class="fas fa-users"></i> Responsables</h3><button class="btn btn-sm btn-primary" onclick="profilEleve.ouvrirModalAjouterResponsable(${this.id})"><i class="fas fa-plus"></i> Ajouter</button></div><div class="responsables-grid">${respHTML||'<p style="color:var(--text-muted);text-align:center;padding:1rem;grid-column:1/-1">Aucun responsable enregistré</p>'}</div></div>
  <div class="profil-section" style="margin-top:1rem"><h3><i class="fas fa-chart-bar"></i> Fréquentation</h3>
    <div style="text-align:center;padding:1rem 0"><div style="width:140px;height:140px;border-radius:50%;background:conic-gradient(${tauxColor} ${taux}%,var(--input-bg) ${taux}%);display:flex;align-items:center;justify-content:center;margin:0 auto"><div style="width:105px;height:105px;border-radius:50%;background:var(--glass);display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:2rem;font-weight:800;color:${tauxColor}">${taux}%</span><span style="font-size:0.7rem;color:var(--text-muted)">présence</span></div></div></div>
    <div style="display:flex;gap:1rem;justify-content:center;margin-top:0.5rem"><span style="text-align:center"><i class="fas fa-check-circle" style="color:var(--success);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.presents||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">présences</div></span><span style="text-align:center"><i class="fas fa-times-circle" style="color:var(--danger);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.absents||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">absences</div></span><span style="text-align:center"><i class="fas fa-clock" style="color:var(--warning);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.retards||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">retards</div></span></div>
    ${derniersJours?`<div style="margin-top:1rem"><h4 style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.5rem">Derniers jours</h4><div class="presence-calendar">${derniersJours}</div></div>`:''}
  </div></div>`;
            window.profilEleve = this;
        } catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p>${e.message}</p></div>`; }
    }

    // ==================== AJOUT RESPONSABLE ====================
    ouvrirModalAjouterResponsable(eleveId) {
        if (this.responsablesExistants >= 3) { this.ouvrirAlert('Limite atteinte', 'Maximum 3 responsables autorisés.', 'warning'); return; }
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-ajout-resp';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-plus"></i> Ajouter un responsable</h3><button class="modal-close" onclick="document.getElementById('modal-ajout-resp').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form onsubmit="return false">
    <div class="input-group"><label class="input-label">Nom complet <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="resp-nom" required></div></div>
    <div class="input-group"><label class="input-label">Lien de parenté <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="profilEleve.ouvrirModalLien()"><i class="fas fa-link input-icon"></i><input type="text" class="form-input" id="resp-lien-nom" readonly placeholder="Cliquer pour choisir..." required><input type="hidden" id="resp-lien" value=""><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>
    <div class="input-group"><label class="input-label">Téléphone</label><div class="input-wrapper"><i class="fas fa-phone input-icon"></i><input type="tel" class="form-input" id="resp-tel"></div></div>
    <div class="input-group"><label class="input-label">WhatsApp</label><div class="input-wrapper"><i class="fab fa-whatsapp input-icon"></i><input type="tel" class="form-input" id="resp-whatsapp"></div></div>
    <div class="input-group"><label class="input-label">Email</label><div class="input-wrapper"><i class="fas fa-envelope input-icon"></i><input type="email" class="form-input" id="resp-email"></div></div>
  </form></div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-ajout-resp').remove()">Annuler</button><button class="btn btn-primary" onclick="profilEleve.ajouterResponsable(${eleveId})"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async ouvrirModalLien() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-lien'; overlay.style.zIndex = '1200';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        const liens = ['Père','Mère','Tuteur','Tutrice','Frère','Sœur','Oncle','Tante','Grand-père','Grand-mère','Proche'];
        const icones = { 'Père':'male','Mère':'female','Tuteur':'user-tie','Tutrice':'user-tie','Frère':'user','Sœur':'user','Oncle':'user','Tante':'user','Grand-père':'user','Grand-mère':'user','Proche':'user-friends' };
        const itemsHTML = liens.map(l => `<div class="ui-card card-hoverable" onclick="document.getElementById('resp-lien-nom').value='${l}';document.getElementById('resp-lien').value='${l.toLowerCase()}';document.getElementById('modal-lien').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-${icones[l]||'user'}" style="color:var(--primary);font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">${l}</span></div></div>`).join('');
        overlay.innerHTML = await CL.render('ui/list-modal', { id: 'modal-lien', icon: 'link', title: 'Lien de parenté', items: itemsHTML });
        document.body.appendChild(overlay);
    }

    async ajouterResponsable(eleveId) {
        const nom_complet = document.getElementById('resp-nom')?.value?.trim();
        const lien_parente = document.getElementById('resp-lien')?.value;
        if (!nom_complet || !lien_parente) { this.ouvrirAlert('Champs requis', 'Nom et lien sont obligatoires.', 'warning'); return; }
        const telephone = document.getElementById('resp-tel')?.value?.trim() || null;
        const whatsapp = document.getElementById('resp-whatsapp')?.value?.trim() || null;
        const email = document.getElementById('resp-email')?.value?.trim() || null;
        try {
            const r = await apiPost('/eleves/responsable', { eleve_id: eleveId, nom_complet, lien_parente, telephone, whatsapp, email });
            if (r.success) { document.getElementById('modal-ajout-resp')?.remove(); await this.render(); }
            else this.ouvrirAlert('Erreur', r.message || 'Échec', 'error');
        } catch(e) { this.ouvrirAlert('Erreur', e.message, 'error'); }
    }

    ouvrirAlert(titre,message,type){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.zIndex='2000';overlay.id='alert-'+Date.now();
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const icones={error:'exclamation-circle',success:'check-circle',warning:'exclamation-triangle',info:'info-circle'};
        const couleurs={error:'var(--danger)',success:'var(--success)',warning:'var(--warning)',info:'var(--info)'};
        overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem 1.5rem"><i class="fas fa-${icones[type]||'info-circle'}" style="font-size:2.5rem;color:${couleurs[type]||'var(--primary)'};margin-bottom:0.75rem;display:block"></i><h3 style="margin-bottom:0.5rem">${titre}</h3><p style="color:var(--text-secondary);font-size:0.9rem">${message}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('${overlay.id}').remove()">OK</button></div></div>`;
        document.body.appendChild(overlay);
    }
}