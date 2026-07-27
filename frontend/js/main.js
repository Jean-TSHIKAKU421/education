let dashboard, classeDetail;
async function initApp() {
    if (!authService.isAuth()) { window.location.href = '/login.html'; return; }
    if (document.getElementById('header-container').children.length > 0) return;
    const user = authService.getUser();
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
    try { const h = await CL.loadTemplate('/composants/layout/header.html'); document.getElementById('header-container').innerHTML = h; updateThemeIcon(); updateHeaderInfo(); } catch(e) {}
    for (const c of ['button','input','select','modal','card','table','badge','alert','loader','textarea']) { try { CL.register(`ui/${c}`, await CL.loadTemplate(`/composants/ui/${c}.html`)); } catch(e) {} }
    try { CL.register('forms/search-bar', await CL.loadTemplate('/composants/forms/search-bar.html')); } catch(e) {}
    try { CL.register('ui/list-modal', await CL.loadTemplate('/composants/ui/list-modal.html')); } catch(e) {}
    dashboard = new DashboardPage();
    router.add('dashboard', () => dashboard.render());
    router.add('classe/:id', (p) => { classeDetail = new ClasseDetailPage(p.id); classeDetail.render(p); });
    router.add('eleves/:id', (p) => new ProfilElevePage(p.id).render());
    router.add('profil', () => new ProfilInstitutionPage().render());
    router.add('presences', () => new PresencesPage().render());
    router.add('pointage', () => new PointagePage().render());
    const route = window.location.hash.slice(1) || 'dashboard'; router.navigate(route);
}
async function updateHeaderInfo() {
    try { const res = await apiGet('/classes/institutions'); const institutions = res.data || []; if (institutions.length > 0) { const inst = institutions[0]; const nomEl = document.getElementById('header-institution-nom'); const nivEl = document.getElementById('header-institution-niveau'); if (nomEl) nomEl.textContent = inst.nom || 'EduManage'; if (nivEl) nivEl.innerHTML = `<i class="fas fa-school"></i> ${inst.niveau || ''}`; } } catch(e) {}
}
function toggleTheme() { const btn = document.getElementById('theme-toggle'); if (!btn) return; btn.classList.add('switching'); setTimeout(() => { document.body.classList.toggle('light'); localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); updateThemeIcon(); btn.classList.remove('switching'); }, 300); }
function updateThemeIcon() { const i = document.querySelector('#theme-toggle i'); if (i) i.className = document.body.classList.contains('light') ? 'fas fa-sun' : 'fas fa-moon'; }
function closeModal(id) { const m = document.getElementById(`${id}-overlay`); if (m) m.remove(); }
function confirmModal(id) { closeModal(id); }
class PresencesPage { async render() { document.getElementById('main-content').innerHTML = `<div style="padding:2rem"><h2><i class="fas fa-calendar-check"></i> Présences</h2><p style="color:var(--text-secondary)">En construction...</p></div>`; } }
class PointagePage { async render() { document.getElementById('main-content').innerHTML = `<div style="padding:2rem"><h2><i class="fas fa-qrcode"></i> Pointage</h2><p style="color:var(--text-secondary)">En construction...</p></div>`; } }
document.addEventListener('DOMContentLoaded', initApp);