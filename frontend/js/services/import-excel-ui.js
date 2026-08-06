class ImportExcelUI {
    constructor(options = {}) { this.service = importExcelService; this.institutionId = options.institutionId || 1; this.classeId = options.classeId || null; this.classeNom = options.classeNom || ''; this.onComplete = options.onComplete || (() => {}); this.onOptionCreated = options.onOptionCreated || (() => {}); }

    async lancerImport(file) {
        try {
            const eleves = await this.service.lireFichier(file);
            if (!eleves.length) { alert('Aucun élève trouvé dans le fichier'); return; }
            await this.service.chargerContexte(this.institutionId);
            const optionsInconnues = this.service.verifierOptionsInconnues();
            let listeFinale = eleves;
            if (optionsInconnues.length > 0) {
                const resultat = await this.afficherModalOptionsInconnues(optionsInconnues);
                if (resultat === 'cancel') return;
                listeFinale = this.service.filtrerSansOptionsInconnues(optionsInconnues);
                if (this.onOptionCreated) this.onOptionCreated();
            }
            const avecStatut = listeFinale.map(e => {
                const np = String(e.nom || '').toLowerCase().trim(), p = String(e.prenom || '').toLowerCase().trim();
                return { ...e, doublon: this.service.existants.some(ex => ex.nom === np && ex.prenom === p) };
            });
            const nouveaux = avecStatut.filter(e => !e.doublon);
            const ok = await this.afficherModalApercu(avecStatut, nouveaux, listeFinale.length);
            if (!ok) return;
            await this.executerImport(nouveaux);
            if (this.onComplete) this.onComplete();
        } catch (ex) { alert('Erreur : ' + ex); }
    }

    afficherModalOptionsInconnues(optionsInconnues) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-options-inc';
            overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve('cancel'); } };
            const lignes = optionsInconnues.map(o => `<tr><td><strong>${o.nom}</strong></td><td>${o.niveau}</td><td>${o.count} élève(s)</td></tr>`).join('');
            overlay.innerHTML = `<div class="modal" style="max-width:550px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-exclamation-triangle" style="color:var(--warning)"></i> Options inconnues détectées</h3><button class="modal-close" onclick="document.getElementById('modal-options-inc').remove();resolve('cancel')"><i class="fas fa-times"></i></button></div><div class="modal-body"><p style="color:var(--text-secondary);margin-bottom:1rem">Ces options n'existent pas encore :</p><div class="table-container"><table class="data-table"><thead><tr><th>Option</th><th>Niveau</th><th>Élèves</th></tr></thead><tbody>${lignes}</tbody></table></div><p style="color:var(--text-muted);margin-top:1rem">Voulez-vous créer ces options ?</p></div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-options-inc').remove();resolve('cancel')">Ignorer</button><button class="btn btn-primary" id="btn-creer-options-inc">Créer</button></div></div>`;
            document.body.appendChild(overlay);
            document.getElementById('btn-creer-options-inc').onclick = async () => {
                overlay.remove();
                const instSecondaire = this.service.classes.find(c => c.option_nom) || {};
                for (const opt of optionsInconnues) { try { await apiPost('/classes/option/secondaire', { code: opt.code, nom: opt.nom, institution_id: this.institutionId }); } catch (e) {} }
                alert('Options créées !');
                resolve('created');
            };
        });
    }

    afficherModalApercu(avecStatut, nouveaux, total) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-apercu-import';
            overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
            const lignes = avecStatut.slice(0, 100).map((e, i) => {
                const badge = e.doublon ? '<span class="badge badge-warning">Existe déjà</span>' : '<span class="badge badge-success">Nouveau</span>';
                return `<tr style="${e.doublon ? 'opacity:0.5' : ''}"><td>${i + 1}</td><td>${e.nom || ''}</td><td>${e.prenom || ''}</td><td>${String(e.genre || '').toUpperCase().charAt(0)}</td><td>${e['date de naissance'] || ''}</td><td>${e.classe || ''}${e.option ? ' - ' + e.option : ''}</td><td>${badge}</td></tr>`;
            }).join('');
            overlay.innerHTML = `<div class="modal" style="max-width:750px;max-height:80vh;display:flex;flex-direction:column" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-list"></i> Aperçu (${total} élèves)</h3><button class="modal-close" onclick="document.getElementById('modal-apercu-import').remove();resolve(false)"><i class="fas fa-times"></i></button></div><div class="modal-body" style="flex:1;overflow-y:auto;padding-bottom:0.5rem"><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:1rem">🟢 ${nouveaux.length} nouveaux · 🟡 ${avecStatut.length - nouveaux.length} déjà existants</p><div class="table-container"><table class="data-table"><thead><tr><th>#</th><th>Nom & Postnom</th><th>Prénom</th><th>G</th><th>Date naiss.</th><th>Classe</th><th>Statut</th></tr></thead><tbody>${lignes}</tbody></table></div></div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-apercu-import').remove();resolve(false)">Annuler</button><button class="btn btn-primary" id="btn-lancer-import" ${nouveaux.length === 0 ? 'disabled' : ''}>Importer ${nouveaux.length} nouveaux</button></div></div>`;
            document.body.appendChild(overlay);
            document.getElementById('btn-lancer-import').onclick = () => { overlay.remove(); resolve(true); };
        });
    }

    async executerImport(eleves) {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-progression';
        overlay.innerHTML = `<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem"><div class="spinner"></div><p style="margin-top:1rem">Importation... <span id="import-count">0</span> / ${eleves.length}</p></div></div>`; document.body.appendChild(overlay);
        let success = 0, errors = 0;
        const processNext = (i) => {
            if (i >= eleves.length) { overlay.innerHTML = `<div class="modal" style="max-width:400px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem"><i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);margin-bottom:0.5rem;display:block"></i><h3>Import terminé</h3><p style="color:var(--text-secondary)">${success} élèves importés${errors > 0 ? ` · ${errors} erreurs` : ''}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('modal-progression').remove()"><i class="fas fa-check"></i> OK</button></div></div>`; return; }
            const e = eleves[i];
            const nomPostnom = String(e.nom || '').trim(), prenom = String(e.prenom || '').trim(), date_naissance = String(e['date de naissance'] || ''), genre = (String(e.genre || 'M').trim().toUpperCase().charAt(0) === 'F') ? 'F' : 'M', adresse = String(e.adresse || '').trim(), classe_nom = String(e.classe || '').trim(), option_nom = String(e.option || '').trim();
            const classe_id = this.service.trouverClasseId(classe_nom, option_nom) || this.classeId;
            API.createEleve({ nom: nomPostnom, prenom, date_naissance, genre, adresse, classe_id }).then(r => { if (r && r.success) success++; else errors++; }).catch(() => errors++).finally(() => { document.getElementById('import-count').textContent = i + 1; requestAnimationFrame(() => processNext(i + 1)); });
        };
        processNext(0);
    }
}