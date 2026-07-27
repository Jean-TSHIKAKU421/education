class ComponentLoader {
    constructor() { this.composants = {}; this.cache = new Map(); }
    register(name, template) { this.composants[name] = template; }
    async loadTemplate(path) { if (this.cache.has(path)) return this.cache.get(path); try { const r = await fetch(path); const h = await r.text(); this.cache.set(path, h); return h; } catch (e) { console.error(`Erreur chargement ${path}:`, e); return ''; } }
    async render(name, props = {}) { let html = this.composants[name] || ''; Object.keys(props).forEach(k => { html = html.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), props[k] || ''); }); return html; }
    async inject(containerId, name, props = {}) { const c = document.getElementById(containerId); if (!c) return; c.innerHTML = await this.render(name, props); }
    async append(containerId, name, props = {}) { const c = document.getElementById(containerId); if (!c) return; c.insertAdjacentHTML('beforeend', await this.render(name, props)); }
}
const CL = new ComponentLoader();
const UI = {
    button: (p) => CL.render('ui/button', p), input: (p) => CL.render('ui/input', p), select: (p) => CL.render('ui/select', p),
    modal: (p) => CL.render('ui/modal', p), card: (p) => CL.render('ui/card', p), table: (p) => CL.render('ui/table', p),
    badge: (p) => CL.render('ui/badge', p), alert: (p) => CL.render('ui/alert', p), loader: (p) => CL.render('ui/loader', p),
};