class ProfilInstitutionPage {
    async render() {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div></div>`;
        try {
            const user = authService.getUser();
            const instRes = await apiGet('/classes/institutions');
            const institutions = instRes.data || [];
            const inst = institutions[0] || {};
            m.innerHTML = `<div style="max-width:600px;margin:0 auto">
  <button class="btn btn-ghost" onclick="router.navigate('dashboard')" style="margin-bottom:1.5rem"><i class="fas fa-arrow-left"></i> Retour</button>
  <div class="ui-card" style="text-align:center;padding:2rem">
    <img src="${inst.logo||'/assets/logo-ecole.png'}" alt="Logo" style="width:80px;height:80px;border-radius:20px;object-fit:cover;margin-bottom:1rem;border:2px solid var(--primary)" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏫</text></svg>'">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:0.25rem">${inst.nom||'Complexe Scolaire Avenir'}</h2>
    <p style="color:var(--text-secondary);font-size:0.9rem">${inst.niveau||'—'} · ${inst.annee_scolaire||'2024-2025'}</p>
    <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.75rem;text-align:left">
      <div class="info-item"><span class="info-label"><i class="fas fa-map-marker-alt"></i> Adresse</span><span class="info-value">${inst.adresse||'Non renseignée'}</span></div>
      <div class="info-item"><span class="info-label"><i class="fas fa-phone"></i> Téléphone</span><span class="info-value">${inst.telephone||'Non renseigné'}</span></div>
      <div class="info-item"><span class="info-label"><i class="fas fa-envelope"></i> Email</span><span class="info-value">${inst.email||'Non renseigné'}</span></div>
      <div class="info-item"><span class="info-label"><i class="fas fa-user-shield"></i> Administrateur</span><span class="info-value">${user?.nom_complet||'Admin'}</span></div>
    </div>
  </div></div>`;
        } catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p>${e.message}</p></div>`; }
    }
}