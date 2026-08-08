class ProfilElevePage {
    constructor(id) { this.id = id; this.eleveData = null; }
    async render() {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement du profil...</p></div>`;
        try {
            const res = await API.getEleve(this.id);
            if (!res.success || !res.data) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-user-slash" style="font-size:3rem;color:var(--text-muted)"></i><h3 style="margin-top:1rem">Élève non trouvé</h3></div>`; return; }
            const e = res.data; this.eleveData = e;
            const photoUrl = e.photo || null;
            const init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0);
            const age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear();
            const respHTML = (e.responsables||[]).map(r => `<div class="responsable-card" style="display:flex;flex-direction:column;height:100%"><div class="responsable-header"><strong>${r.nom_complet}</strong><span class="badge badge-info">${r.lien_parente}</span></div><div class="responsable-contacts" style="flex:1">${r.telephone?`<a href="tel:${r.telephone}" class="contact-item contact-clickable"><span class="contact-moyen"><i class="fas fa-phone"></i> Téléphone</span><span class="contact-valeur">${r.telephone}</span></a>`:''}${r.whatsapp?`<a href="https://wa.me/${(r.whatsapp||'').replace(/\+/g,'')}" target="_blank" class="contact-item contact-clickable"><span class="contact-moyen"><i class="fab fa-whatsapp"></i> WhatsApp</span><span class="contact-valeur">${r.whatsapp}</span></a>`:''}${r.email?`<a href="mailto:${r.email}" class="contact-item contact-clickable"><span class="contact-moyen"><i class="fas fa-envelope"></i> E-mail</span><span class="contact-valeur">${r.email}</span></a>`:''}</div><button class="btn btn-sm btn-danger no-print" style="margin-top:auto;width:100%" onclick="event.stopPropagation();profilEleve.confirmerSuppressionResponsable(${r.id},'${(r.nom_complet||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i> Supprimer</button></div>`).join('');
            const taux = e.taux_presence||0; const tauxColor = taux>=70?'var(--success)':taux>=50?'var(--warning)':'var(--danger)';
            m.innerHTML = `<div class="profil-eleve-container">
  <div class="print-header" style="display:none;text-align:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:15px">
    <div style="display:flex;align-items:center;justify-content:center;gap:15px">
      <img src="/assets/logo-ecole.png" alt="Logo" style="width:60px;height:60px;border-radius:10px;object-fit:cover">
      <div style="text-align:left"><h2 style="margin:0;font-size:1.2rem;font-weight:800" id="print-inst-nom">EduManage</h2><p style="margin:2px 0;font-size:0.85rem" id="print-inst-adr">Adresse non renseignée</p><p style="margin:2px 0;font-size:0.85rem" id="print-inst-contact">Contact non renseigné</p></div>
    </div>
  </div>
  <div class="no-print" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;margin-top:7rem"><button class="btn btn-ghost" onclick="router.navigate('classe/${e.classe_id}')"><i class="fas fa-arrow-left"></i> Retour</button><button class="btn btn-sm btn-warning" style="margin-left:auto" onclick="profilEleve.ouvrirModalModifier()"><i class="fas fa-edit"></i> Modifier</button></div>
  <div class="profil-header-card">
    <div class="profil-photo-wrapper no-print" onclick="profilEleve.ouvrirApercuPhoto()" style="cursor:pointer">${photoUrl?`<img src="${photoUrl}" alt="Photo" class="profil-photo-img"><div class="photo-overlay"><i class="fas fa-search-plus"></i></div>`:`<div class="profil-avatar-lg" style="background:var(--gradient-${e.genre==='F'?'3':'1'})">${init}</div>`}</div>
    <div class="print-only" style="display:none">${photoUrl?`<img src="${photoUrl}" alt="Photo" style="width:80px;height:80px;border-radius:50%;object-fit:cover">`:`<div style="width:80px;height:80px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:700">${init}</div>`}</div>
    <div style="flex:1"><h2>${e.prenom} ${e.nom}</h2><div style="display:flex;gap:1rem;color:var(--text-secondary);margin-top:0.5rem;flex-wrap:wrap"><span><i class="fas fa-id-card"></i> ${e.matricule}</span><span><i class="fas fa-graduation-cap"></i> ${e.classe_nom||'N/A'}</span><span><i class="fas fa-calendar"></i> ${new Date(e.date_inscription).toLocaleDateString('fr-FR')}</span><span><i class="fas fa-birthday-cake"></i> ${age} ans</span></div></div>
  </div>
  <div class="profil-grid-top">
    <div class="profil-section"><h3><i class="fas fa-address-card"></i> Identité</h3><div class="info-liste"><div class="info-item"><span class="info-label">Date de naissance</span><span class="info-value">${new Date(e.date_naissance).toLocaleDateString('fr-FR',{year:'numeric',month:'long',day:'numeric'})}</span></div><div class="info-item"><span class="info-label">Genre</span><span class="info-value"><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'Masculin':'Féminin'}</span></span></div><div class="info-item"><span class="info-label">Adresse</span><span class="info-value">${e.adresse||'Non renseignée'}</span></div><div class="info-item"><span class="info-label">Âge</span><span class="info-value">${age} ans</span></div></div></div>
    <div class="profil-section no-print"><h3><i class="fas fa-qrcode"></i> Carte d'identité</h3><div style="text-align:center;padding:1rem">${e.qr_code?`<img src="${e.qr_code}" alt="QR Code" style="width:160px;height:160px;border-radius:var(--radius);background:white;padding:0.5rem"><div class="no-print" style="margin-top:0.75rem"><button class="btn btn-sm btn-primary" onclick="profilEleve.telechargerQR()"><i class="fas fa-download"></i> Télécharger</button></div>`:'<p style="color:var(--text-muted)">Aucun QR code généré</p>'}</div></div>
  </div>
  <div class="profil-section" style="margin-top:1rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><h3 style="margin:0"><i class="fas fa-users"></i> Responsables</h3><button class="btn btn-sm btn-primary no-print" onclick="profilEleve.ouvrirModalAjouterResponsable(${this.id})"><i class="fas fa-plus"></i> Ajouter</button></div><div class="responsables-grid">${respHTML||'<p style="color:var(--text-muted);text-align:center;padding:1rem;grid-column:1/-1">Aucun responsable enregistré</p>'}</div></div>
  <div class="profil-section no-print" style="margin-top:1rem"><h3><i class="fas fa-fingerprint"></i> Empreinte digitale</h3><div style="text-align:center;padding:1rem">${e.empreinte_digitale?`<i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);display:block;margin-bottom:0.5rem"></i><p style="color:var(--success);font-weight:600">Empreinte enregistrée</p><p style="color:var(--text-muted);font-size:0.8rem">ID: ${e.empreinte_digitale}</p><button class="btn btn-sm btn-danger" style="margin-top:0.75rem" onclick="profilEleve.confirmerSuppressionEmpreinte(${e.id})"><i class="fas fa-trash"></i> Supprimer</button>`:`<i class="fas fa-fingerprint" style="font-size:3rem;color:var(--text-muted);display:block;margin-bottom:0.5rem"></i><p style="color:var(--text-muted)">Aucune empreinte</p><button class="btn btn-sm btn-primary" style="margin-top:0.75rem" onclick="profilEleve.enregistrerEmpreinte(${e.id})"><i class="fas fa-fingerprint"></i> Scanner</button>`}</div></div>
  <div class="profil-section" style="margin-top:1rem"><h3><i class="fas fa-chart-bar"></i> Fréquentation</h3>
    <div style="text-align:center;padding:1rem 0"><div style="width:140px;height:140px;border-radius:50%;background:conic-gradient(${tauxColor} ${taux}%,var(--input-bg) ${taux}%);display:flex;align-items:center;justify-content:center;margin:0 auto"><div style="width:105px;height:105px;border-radius:50%;background:var(--glass);display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:2rem;font-weight:800;color:${tauxColor}">${taux}%</span><span style="font-size:0.7rem;color:var(--text-muted)">présence</span></div></div></div>
    <div style="display:flex;gap:1rem;justify-content:center;margin-top:0.5rem"><span style="text-align:center"><i class="fas fa-check-circle" style="color:var(--success);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.presents||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">présences</div></span><span style="text-align:center"><i class="fas fa-times-circle" style="color:var(--danger);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.absents||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">absences</div></span><span style="text-align:center"><i class="fas fa-clock" style="color:var(--warning);font-size:1.2rem"></i><div style="font-weight:700">${e.stats_presence?.retards||0}</div><div style="font-size:0.7rem;color:var(--text-muted)">retards</div></span></div>
    ${this.genererCalendrier(e.presences||[])}
    <div class="no-print" style="text-align:center;margin-top:1.5rem"><button class="btn btn-sm btn-outline" onclick="profilEleve.imprimerFiche()"><i class="fas fa-print"></i> Imprimer la fiche</button></div>
  </div></div>`;
            window.profilEleve = this;
            const instRes = await apiGet('/classes/institutions');
            const inst = (instRes.data||[])[0] || {};
            setTimeout(() => {
                const n=document.getElementById('print-inst-nom'),a=document.getElementById('print-inst-adr'),c=document.getElementById('print-inst-contact');
                if(n)n.textContent=inst.nom||'EduManage';
                if(a)a.innerHTML=`<i class="fas fa-map-marker-alt"></i> ${inst.adresse||'Adresse non renseignée'}`;
                if(c)c.innerHTML=`<i class="fas fa-phone"></i> ${inst.telephone||'Non renseigné'} | <i class="fas fa-envelope"></i> ${inst.email||'Non renseigné'}`;
            },100);
        } catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p>${e.message}</p></div>`; }
    }

    ouvrirApercuPhoto() {
        const e=this.eleveData;
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-photo';overlay.style.zIndex='1500';
        overlay.onclick=ev=>{if(ev.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-camera"></i> Photo de profil</h3><button class="modal-close" onclick="document.getElementById('modal-photo').remove()"><i class="fas fa-times"></i></button></div><div class="modal-body" style="padding:1.5rem">${e.photo?`<img src="${e.photo}" alt="Photo" style="width:100%;max-height:350px;object-fit:contain;border-radius:var(--radius)">`:`<div style="width:120px;height:120px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:3rem;margin:0 auto">${(e.prenom||'').charAt(0)+(e.nom||'').charAt(0)}</div>`}<div style="margin-top:1rem"><input type="file" id="photo-input" accept="image/*" style="display:none" onchange="profilEleve.changerPhoto()"><button class="btn btn-sm btn-primary" onclick="document.getElementById('photo-input').click()"><i class="fas fa-edit"></i> Modifier la photo</button></div></div></div>`;
        document.body.appendChild(overlay);
    }

    async changerPhoto() {
        const file=document.getElementById('photo-input')?.files[0];if(!file)return;
        const fd=new FormData();fd.append('photo',file);fd.append('nom',this.eleveData.nom||'');fd.append('prenom',this.eleveData.prenom||'');fd.append('date_naissance',(this.eleveData.date_naissance||'').split('T')[0]);fd.append('genre',this.eleveData.genre||'');fd.append('adresse',this.eleveData.adresse||'');
        try{const r=await fetch(`${API_URL}/eleves/${this.id}`,{method:'PUT',headers:{'Authorization':`Bearer ${getToken()}`},body:fd});const d=await r.json();if(d.success){document.getElementById('modal-photo')?.remove();await this.render();}else this.ouvrirAlert('Erreur',d.message||'Échec','error');}
        catch(ex){this.ouvrirAlert('Erreur',ex.message,'error');}
    }

    telechargerQR(){const e=this.eleveData;if(e.qr_code){const a=document.createElement('a');a.href=e.qr_code;a.download=`QR_${e.matricule}.png`;a.click();}}
    
    async imprimerFiche() {
        const e = this.eleveData;
        const nomFichier = `Fiche_${(e.prenom||'').replace(/\s+/g,'_')}_${(e.nom||'').replace(/\s+/g,'_')}`;
        // Sur mobile/desktop : ouvre la boîte d'impression avec le bon nom
        const oldTitle = document.title;
        document.title = nomFichier;
        window.print();
        setTimeout(() => { document.title = oldTitle; }, 100);
    }

    genererCalendrier(presences) {
        const now=new Date(),mois=now.getMonth(),annee=now.getFullYear();
        const moisNoms=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
        const joursDansMois=new Date(annee,mois+1,0).getDate(),premierJour=new Date(annee,mois,1).getDay()||7;
        const presencesMap={};presences.forEach(p=>{presencesMap[p.date_presence.split('T')[0]]=p.statut;});
        const statsParJour={present:'Présent',absent:'Absent',retard:'Retard',justifie:'Justifié'};
        let html=`<div style="margin-top:1.5rem"><h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;text-align:center">${moisNoms[mois]} ${annee}</h4><div class="calendrier-grid"><div class="calendrier-day-name">Lun</div><div class="calendrier-day-name">Mar</div><div class="calendrier-day-name">Mer</div><div class="calendrier-day-name">Jeu</div><div class="calendrier-day-name">Ven</div><div class="calendrier-day-name">Sam</div><div class="calendrier-day-name">Dim</div>`;
        for(let i=1;i<premierJour;i++)html+=`<div class="calendrier-day empty"></div>`;
        for(let j=1;j<=joursDansMois;j++){const dateStr=`${annee}-${String(mois+1).padStart(2,'0')}-${String(j).padStart(2,'0')}`;const statut=presencesMap[dateStr]||'';const sc=statut==='present'?'present':statut==='absent'?'absent':statut==='retard'?'retard':statut==='justifie'?'justifie':'';const tooltip=statut?`${j} ${moisNoms[mois]} : ${statsParJour[statut]||statut}`:`${j} ${moisNoms[mois]}`;const today=new Date().toDateString()===new Date(dateStr).toDateString()?'today':'';html+=`<div class="calendrier-day ${sc} ${today}" title="${tooltip}">${j}</div>`;}
        html+=`</div><div style="display:flex;gap:1rem;justify-content:center;margin-top:0.75rem;font-size:0.7rem"><span><span class="calendrier-dot present"></span> Présent</span><span><span class="calendrier-dot absent"></span> Absent</span><span><span class="calendrier-dot retard"></span> Retard</span><span><span class="calendrier-dot justifie"></span> Justifié</span></div></div>`;
        return html;
    }

    ouvrirModalModifier() {
        const e=this.eleveData;if(!e)return;
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-modifier';
        overlay.onclick=ev=>{if(ev.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-edit"></i> Modifier l'élève</h3><button class="modal-close" onclick="document.getElementById('modal-modifier').remove()"><i class="fas fa-times"></i></button></div><div class="modal-body"><form onsubmit="return false"><div class="input-group"><label class="input-label">Nom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="mod-nom" value="${e.nom||''}" required></div></div><div class="input-group"><label class="input-label">Prénom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="mod-prenom" value="${e.prenom||''}" required></div></div><div class="input-group"><label class="input-label">Date de naissance <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-calendar input-icon"></i><input type="date" class="form-input" id="mod-date" value="${(e.date_naissance||'').split('T')[0]}" required></div></div><div class="input-group"><label class="input-label">Genre <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="profilEleve.ouvrirModalGenreModif()"><i class="fas fa-venus-mars input-icon"></i><input type="text" class="form-input" id="mod-genre-nom" readonly value="${e.genre==='M'?'Masculin':'Féminin'}" required><input type="hidden" id="mod-genre" value="${e.genre||''}"><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div><div class="input-group"><label class="input-label">Adresse</label><div class="input-wrapper"><i class="fas fa-map-marker-alt input-icon"></i><input type="text" class="form-input" id="mod-adresse" value="${e.adresse||''}"></div></div><p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.5rem"><i class="fas fa-info-circle"></i> Matricule et classe non modifiables.</p></form></div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-modifier').remove()">Annuler</button><button class="btn btn-primary" onclick="profilEleve.enregistrerModifications()"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    ouvrirModalGenreModif() {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-genre-modif';overlay.style.zIndex='1200';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const itemsHTML=`<div class="ui-card card-hoverable" onclick="document.getElementById('mod-genre-nom').value='Masculin';document.getElementById('mod-genre').value='M';document.getElementById('modal-genre-modif').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-mars" style="color:#3b82f6;font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">Masculin</span></div></div><div class="ui-card card-hoverable" onclick="document.getElementById('mod-genre-nom').value='Féminin';document.getElementById('mod-genre').value='F';document.getElementById('modal-genre-modif').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-venus" style="color:#ec4899;font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">Féminin</span></div></div>`;
        overlay.innerHTML=CL.composants['ui/list-modal']?CL.composants['ui/list-modal'].replace(/\$\{id\}/g,'modal-genre-modif').replace(/\$\{icon\}/g,'venus-mars').replace(/\$\{title\}/g,'Choisir le genre').replace(/\$\{items\}/g,itemsHTML):`<div class="modal" style="max-width:420px;max-height:80vh;display:flex;flex-direction:column" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-venus-mars"></i> Choisir le genre</h3><button class="modal-close" onclick="document.getElementById('modal-genre-modif').remove()"><i class="fas fa-times"></i></button></div><div class="modal-body" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.5rem;padding-bottom:0.5rem">${itemsHTML}</div></div>`;
        document.body.appendChild(overlay);
    }

    async enregistrerModifications() {
        const nom=document.getElementById('mod-nom')?.value?.trim(),prenom=document.getElementById('mod-prenom')?.value?.trim(),date_naissance=document.getElementById('mod-date')?.value,genre=document.getElementById('mod-genre')?.value,adresse=document.getElementById('mod-adresse')?.value?.trim();
        if(!nom||!prenom||!date_naissance||!genre){this.ouvrirAlert('Champs requis','Veuillez remplir tous les champs obligatoires.','warning');return;}
        try{const r=await apiPut(`/eleves/${this.id}`,{nom,prenom,date_naissance,genre,adresse});if(r.success){document.getElementById('modal-modifier')?.remove();await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');}
        catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }

    ouvrirModalAjouterResponsable(eleveId) {
        if((this.eleveData?.responsables||[]).length>=3){this.ouvrirAlert('Limite','Maximum 3 responsables.','warning');return;}
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-ajout-resp';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-plus"></i> Ajouter un responsable</h3><button class="modal-close" onclick="document.getElementById('modal-ajout-resp').remove()"><i class="fas fa-times"></i></button></div><div class="modal-body"><form onsubmit="return false"><div class="input-group"><label class="input-label">Nom complet <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="resp-nom" required></div></div><div class="input-group"><label class="input-label">Lien <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="profilEleve.ouvrirModalLien()"><i class="fas fa-link input-icon"></i><input type="text" class="form-input" id="resp-lien-nom" readonly placeholder="Cliquer..." required><input type="hidden" id="resp-lien" value=""><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div><div class="input-group"><label class="input-label">Téléphone</label><div class="input-wrapper"><i class="fas fa-phone input-icon"></i><input type="tel" class="form-input" id="resp-tel"></div></div><div class="input-group"><label class="input-label">WhatsApp</label><div class="input-wrapper"><i class="fab fa-whatsapp input-icon"></i><input type="tel" class="form-input" id="resp-whatsapp"></div></div><div class="input-group"><label class="input-label">Email</label><div class="input-wrapper"><i class="fas fa-envelope input-icon"></i><input type="email" class="form-input" id="resp-email"></div></div></form></div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-ajout-resp').remove()">Annuler</button><button class="btn btn-primary" onclick="profilEleve.ajouterResponsable(${eleveId})"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async ouvrirModalLien() {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-lien';overlay.style.zIndex='1200';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const liens=['Père','Mère','Tuteur','Tutrice','Frère','Sœur','Oncle','Tante','Grand-père','Grand-mère','Proche'];
        const icones={'Père':'male','Mère':'female','Tuteur':'user-tie','Tutrice':'user-tie','Frère':'user','Sœur':'user','Oncle':'user','Tante':'user','Grand-père':'user','Grand-mère':'user','Proche':'user-friends'};
        const itemsHTML=liens.map(l=>`<div class="ui-card card-hoverable" onclick="document.getElementById('resp-lien-nom').value='${l}';document.getElementById('resp-lien').value='${l.toLowerCase()}';document.getElementById('modal-lien').remove()"><div style="padding:0.8rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-${icones[l]||'user'}" style="color:var(--primary);font-size:1.2rem;flex-shrink:0"></i><span style="font-size:0.9rem;font-weight:500">${l}</span></div></div>`).join('');
        overlay.innerHTML=await CL.render('ui/list-modal',{id:'modal-lien',icon:'link',title:'Lien de parenté',items:itemsHTML});
        document.body.appendChild(overlay);
    }

    async ajouterResponsable(eleveId) {
        const nom_complet=document.getElementById('resp-nom')?.value?.trim(),lien_parente=document.getElementById('resp-lien')?.value;
        if(!nom_complet||!lien_parente){this.ouvrirAlert('Champs requis','Nom et lien obligatoires.','warning');return;}
        try{const r=await apiPost('/eleves/responsable',{eleve_id:eleveId,nom_complet,lien_parente,telephone:document.getElementById('resp-tel')?.value?.trim()||null,whatsapp:document.getElementById('resp-whatsapp')?.value?.trim()||null,email:document.getElementById('resp-email')?.value?.trim()||null});if(r.success){document.getElementById('modal-ajout-resp')?.remove();await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');}
        catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }

    confirmerSuppressionResponsable(responsableId,nom) {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-suppr-resp';overlay.style.zIndex='1300';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--danger);margin-bottom:0.75rem;display:block"></i><h3>Supprimer le responsable</h3><p style="color:var(--text-secondary);margin-top:0.5rem">Supprimer <strong>${nom}</strong> ?</p><div style="display:flex;gap:0.5rem;margin-top:1.5rem"><button class="btn btn-ghost btn-full" onclick="document.getElementById('modal-suppr-resp').remove()">Annuler</button><button class="btn btn-danger btn-full" onclick="profilEleve.supprimerResponsable(${responsableId})"><i class="fas fa-trash"></i> Supprimer</button></div></div></div>`;
        document.body.appendChild(overlay);
    }

    async supprimerResponsable(responsableId){try{const r=await apiDelete(`/eleves/responsable/${responsableId}`);if(r.success){document.getElementById('modal-suppr-resp')?.remove();await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');}catch(e){this.ouvrirAlert('Erreur',e.message,'error');}}

    async enregistrerEmpreinte(eleveId) {
        if(window.PublicKeyCredential){try{const challenge=new Uint8Array(32);crypto.getRandomValues(challenge);const credential=await navigator.credentials.create({publicKey:{challenge,rp:{name:'EduManage',id:window.location.hostname},user:{id:new Uint8Array(16),name:`eleve-${eleveId}`,displayName:`Élève ${eleveId}`},pubKeyCredParams:[{type:'public-key',alg:-7}],timeout:60000,authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},attestation:'none'}});const empreinteId=btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));const r=await apiPost(`/eleves/${eleveId}/empreinte`,{empreinte_digitale:empreinteId});if(r.success){await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');return;}catch(e){if(e.name==='NotAllowedError'){this.ouvrirAlert('Annulé','Enregistrement annulé.','info');return;}}}
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-empreinte';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-fingerprint"></i> Enregistrer l'empreinte</h3><button class="modal-close" onclick="document.getElementById('modal-empreinte').remove()"><i class="fas fa-times"></i></button></div><div class="modal-body" style="padding:2rem"><i class="fas fa-fingerprint" style="font-size:4rem;color:var(--primary);display:block;margin-bottom:1rem;animation:pulse 1.5s infinite"></i><p style="margin-bottom:1rem">Lecteur non détecté. Entrez un ID d'empreinte :</p><div class="input-group"><div class="input-wrapper"><i class="fas fa-id-card input-icon"></i><input type="text" class="form-input" id="empreinte-id" placeholder="Ex: EMP-001"></div></div><button class="btn btn-primary btn-full" style="margin-top:1rem" onclick="profilEleve.simulerEmpreinte(${eleveId})"><i class="fas fa-check"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async simulerEmpreinte(eleveId){const empreinteId=document.getElementById('empreinte-id')?.value?.trim()||('EMP-'+Date.now());try{const r=await apiPost(`/eleves/${eleveId}/empreinte`,{empreinte_digitale:empreinteId});if(r.success){document.getElementById('modal-empreinte')?.remove();await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');}catch(e){this.ouvrirAlert('Erreur',e.message,'error');}}

    confirmerSuppressionEmpreinte(eleveId) {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-suppr-emp';overlay.style.zIndex='1300';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--danger);margin-bottom:0.75rem;display:block"></i><h3>Supprimer l'empreinte</h3><p style="color:var(--text-secondary);margin-top:0.5rem">Voulez-vous vraiment supprimer cette empreinte ?</p><div style="display:flex;gap:0.5rem;margin-top:1.5rem"><button class="btn btn-ghost btn-full" onclick="document.getElementById('modal-suppr-emp').remove()">Annuler</button><button class="btn btn-danger btn-full" onclick="profilEleve.supprimerEmpreinte(${eleveId})"><i class="fas fa-trash"></i> Supprimer</button></div></div></div>`;
        document.body.appendChild(overlay);
    }

    async supprimerEmpreinte(eleveId){try{const r=await apiDelete(`/eleves/${eleveId}/empreinte`);if(r.success){document.getElementById('modal-suppr-emp')?.remove();await this.render();}else this.ouvrirAlert('Erreur',r.message||'Échec','error');}catch(e){this.ouvrirAlert('Erreur',e.message,'error');}}

    ouvrirAlert(titre,message,type){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.zIndex='2000';overlay.id='alert-'+Date.now();
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const icones={error:'exclamation-circle',success:'check-circle',warning:'exclamation-triangle',info:'info-circle'};
        const couleurs={error:'var(--danger)',success:'var(--success)',warning:'var(--warning)',info:'var(--info)'};
        overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem 1.5rem"><i class="fas fa-${icones[type]||'info-circle'}" style="font-size:2.5rem;color:${couleurs[type]||'var(--primary)'};margin-bottom:0.75rem;display:block"></i><h3 style="margin-bottom:0.5rem">${titre}</h3><p style="color:var(--text-secondary);font-size:0.9rem">${message}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('${overlay.id}').remove()">OK</button></div></div>`;
        document.body.appendChild(overlay);
    }
}