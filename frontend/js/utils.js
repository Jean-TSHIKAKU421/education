const API_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function getToken() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
function setAuthHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }; }
async function apiRequest(url, options = {}) {try {const r = await fetch(`${API_URL}${url}`, { headers: setAuthHeaders(), ...options });const data = await r.json();if (!r.ok) throw new Error(data.message || data.error || `Erreur ${r.status}`);return data;} catch(e) {if (e.message === 'Failed to fetch') throw new Error('Serveur injoignable');throw e;}}
async function apiGet(url) { return apiRequest(url); }
async function apiPost(url, data) { return apiRequest(url, { method: 'POST', body: JSON.stringify(data) }); }
async function apiPut(url, data) { return apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }); }
async function apiDelete(url, data) { return apiRequest(url, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }); }
function formatDate(dateStr) { if (!dateStr) return 'N/A'; return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); }
function formatDateShort(dateStr) { if (!dateStr) return 'N/A'; return new Date(dateStr).toLocaleDateString('fr-FR'); }
function getInitiales(prenom, nom) { return ((prenom?.charAt(0) || '') + (nom?.charAt(0) || '')).toUpperCase() || '?'; }
function calculerAge(dateNaissance) { if (!dateNaissance) return '?'; const a = new Date(), n = new Date(dateNaissance); let age = a.getFullYear() - n.getFullYear(); const m = a.getMonth() - n.getMonth(); if (m < 0 || (m === 0 && a.getDate() < n.getDate())) age--; return age; }
function afficherAlerte(conteneurId, message, type = 'error') { const c = document.getElementById(conteneurId); if (!c) return; const icons = { error: 'exclamation-circle', success: 'check-circle', warning: 'exclamation-triangle', info: 'info-circle' }; c.innerHTML = `<div class="alert-message ${type}"><i class="fas fa-${icons[type] || 'info-circle'}"></i><span>${message}</span></div>`; if (type === 'success') setTimeout(() => { if (c) c.innerHTML = ''; }, 4000); }
function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
function escapeHTML(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
