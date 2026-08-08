class AuthService {
    constructor() { this.TOKEN_KEY = 'token'; this.USER_KEY = 'user'; }
    async login(username, password) {
        try {
            const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await r.json();
            if (!data.success) return { success: false, message: data.message || 'Erreur de connexion' };
            sessionStorage.setItem(this.TOKEN_KEY, data.token);
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
            return { success: true, user: data.user, token: data.token };
        } catch (e) { return { success: false, message: 'Erreur de connexion au serveur' }; }
    }
    logout() { sessionStorage.clear(); window.location.href = '/login.html'; }
    isAuth() { return !!sessionStorage.getItem(this.TOKEN_KEY); }
    getUser() { const u = sessionStorage.getItem(this.USER_KEY); return u ? JSON.parse(u) : null; }
}
const authService = new AuthService();