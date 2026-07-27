class Router {
    constructor() { this.routes = {}; this.currentRoute = null; }
    add(route, handler) { this.routes[route] = handler; return this; }
    async navigate(route, params = {}) {
        if (this.currentRoute === route) return;
        this.currentRoute = route;
        window.history.pushState({}, '', `#${route}`);
        const main = document.getElementById('main-content');
        if (!main) return;
        main.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p>Chargement...</p></div>`;
        this.updateNav(route);
        try {
            let handler = null, routeParams = {};
            for (const [pattern, h] of Object.entries(this.routes)) {
                const m = this.match(pattern, route);
                if (m) { handler = h; routeParams = m; break; }
            }
            if (handler) { await handler({ ...params, ...routeParams }); }
            else { main.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-map-signs" style="font-size:4rem;color:#95a5a6"></i><h2>404</h2><p>Page non trouvée</p></div>`; }
        } catch(e) { main.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger)"></i><p>Erreur</p></div>`; }
    }
    match(pattern, route) { const pp = pattern.split('/'), rp = route.split('/'); if (pp.length !== rp.length) return null; const params = {}; for (let i = 0; i < pp.length; i++) { if (pp[i].startsWith(':')) { params[pp[i].slice(1)] = rp[i]; } else if (pp[i] !== rp[i]) { return null; } } return params; }
    updateNav(route) { document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); const active = document.querySelector(`.nav-item[data-route="${route.split('/')[0]}"]`); if (active) active.classList.add('active'); }
}
const router = new Router();
window.addEventListener('hashchange', () => { const route = window.location.hash.slice(1) || 'dashboard'; router.navigate(route); });