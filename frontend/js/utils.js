const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : `http://${window.location.hostname}:3000/api`;

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function getToken() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
function setAuthHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }; }

async function apiGet(url) { const r = await fetch(`${API_URL}${url}`, { headers: setAuthHeaders() }); return r.json(); }
async function apiPost(url, data) { const r = await fetch(`${API_URL}${url}`, { method: 'POST', headers: setAuthHeaders(), body: JSON.stringify(data) }); return r.json(); }
async function apiPut(url, data) { const r = await fetch(`${API_URL}${url}`, { method: 'PUT', headers: setAuthHeaders(), body: JSON.stringify(data) }); return r.json(); }
async function apiDelete(url) { const r = await fetch(`${API_URL}${url}`, { method: 'DELETE', headers: setAuthHeaders() }); return r.json(); }

function formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); }
function formatDateShort(dateStr) { return new Date(dateStr).toLocaleDateString('fr-FR'); }
function getInitiales(prenom, nom) { return (prenom?.charAt(0) || '') + (nom?.charAt(0) || ''); }
function calculerAge(dateNaissance) { const a = new Date(), n = new Date(dateNaissance); let age = a.getFullYear() - n.getFullYear(); const m = a.getMonth() - n.getMonth(); if (m < 0 || (m === 0 && a.getDate() < n.getDate())) age--; return age; }
function afficherAlerte(conteneurId, message, type = 'error') { const c = document.getElementById(conteneurId); if (!c) return; const icons = { error: 'exclamation-circle', success: 'check-circle', warning: 'exclamation-triangle', info: 'info-circle' }; c.innerHTML = `<div class="alert-message ${type}"><i class="fas fa-${icons[type]}"></i><span>${message}</span></div>`; setTimeout(() => c.innerHTML = '', type === 'success' ? 4000 : 6000); }

function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
function escapeHTML(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }