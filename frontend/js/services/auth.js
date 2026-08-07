class AuthService {
    constructor() { this.TOKEN_KEY = 'token'; this.USER_KEY = 'user'; }
    async login(username, password, remember = false) {
        try {
            const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await r.json();
            if (!data.success) return { success: false, message: data.message || 'Erreur de connexion' };
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(this.TOKEN_KEY, data.token); storage.setItem(this.USER_KEY, JSON.stringify(data.user));
            return { success: true, user: data.user, token: data.token };
        } catch(e) { return { success: false, message: 'Erreur de connexion au serveur' }; }
    }
    logout() { localStorage.removeItem(this.TOKEN_KEY); localStorage.removeItem(this.USER_KEY); sessionStorage.clear(); window.location.href = '/login.html'; }
    isAuth() { const token = this.getToken(); if (!token) return false; try { const payload = JSON.parse(atob(token.split('.')[1])); if (payload.exp * 1000 < Date.now()) { this.logout(); return false; } return true; } catch(e) { return false; } }
    getToken() { return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY); }
    getUser() { const u = sessionStorage.getItem(this.USER_KEY) || localStorage.getItem(this.USER_KEY); return u ? JSON.parse(u) : null; }
    async verifyToken() { try { const r = await fetch(`${API_URL}/auth/verify`, { headers: { 'Authorization': `Bearer ${this.getToken()}` } }); const data = await r.json(); return data.valid; } catch(e) { return false; } }
}
const authService = new AuthService();