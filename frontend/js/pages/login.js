class LoginPage {
    async init() {
        if (authService.isAuth()) { window.location.href = '/index.html'; return; }
        document.getElementById('login-container').innerHTML = this.html();
        this.bindEvents();
    }
    html() {
        return `<div class="login-card">
  <div class="login-header"><div class="login-logo"><i class="fas fa-graduation-cap"></i></div><h1>EduManage</h1><p>Plateforme de Gestion Scolaire</p></div>
  <div id="alert-container"></div>
  <form class="login-form" id="login-form" autocomplete="off">
    <div class="form-group"><label><i class="fas fa-user"></i> Nom d'utilisateur</label><div class="input-wrapper"><i class="fas fa-user input-icon input-icon-left"></i><input type="text" id="username" name="username" class="form-input has-icon" placeholder="Nom d'utilisateur" autocomplete="username"></div></div>
    <div class="form-group"><label><i class="fas fa-lock"></i> Mot de passe</label><div class="input-wrapper"><i class="fas fa-lock input-icon input-icon-left"></i><input type="password" id="password" name="password" class="form-input has-icon" placeholder="Mot de passe" autocomplete="current-password"><button type="button" class="toggle-password" id="toggle-pwd"><i class="fas fa-eye"></i></button></div></div>
    <button type="submit" class="btn-login" id="btn-login"><i class="fas fa-sign-in-alt"></i> <span>Se connecter</span></button>
  </form>
  <div class="login-footer"><p>Fait avec <i class="fas fa-heart"></i> pour l'éducation</p></div>
</div><div class="version-info">v1.0.0</div>`;
    }
    bindEvents() {
        $('#login-form').addEventListener('submit', (e) => this.handleSubmit(e));
        $('#toggle-pwd').addEventListener('click', () => { const p = $('#password'); p.type = p.type === 'password' ? 'text' : 'password'; $('#toggle-pwd i').className = p.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'; });
    }
    async handleSubmit(e) {
        e.preventDefault();
        const username = $('#username').value, password = $('#password').value;
        if (!username || !password) { afficherAlerte('alert-container', 'Veuillez remplir tous les champs', 'error'); return; }
        this.setLoading(true);
        const result = await authService.login(username, password);
        if (result.success) { afficherAlerte('alert-container', 'Connexion réussie !', 'success'); setTimeout(() => window.location.href = '/index.html', 800); }
        else { afficherAlerte('alert-container', result.message, 'error'); this.setLoading(false); }
    }
    setLoading(l) {
        const btn = $('#btn-login'), icon = btn.querySelector('i'), span = btn.querySelector('span');
        btn.disabled = l; icon.className = l ? 'fas fa-spinner fa-spin' : 'fas fa-sign-in-alt'; span.textContent = l ? 'Connexion...' : 'Se connecter';
    }
}
document.addEventListener('DOMContentLoaded', async () => { setTimeout(() => { const loader = document.getElementById('app-loader'); if (loader) loader.classList.add('hidden'); }, 500); await new LoginPage().init(); });