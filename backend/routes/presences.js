const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.post('/', async (req, res) => {
    try {
        const { eleve_id, statut, justification, methode_pointage } = req.body;
        console.log('Pointage reçu:', { eleve_id, statut, justification });
        
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        let finalStatut = statut;
        if (justification === 'malade' || justification === 'endeuille') finalStatut = 'justifie';
        
        const [existing] = await pool.query('SELECT id FROM presences WHERE eleve_id=? AND date_presence=?', [eleve_id, today]);
        
        if (existing.length > 0) {
            await pool.query('UPDATE presences SET statut=?, heure_arrivee=?, methode_pointage=?, justification=? WHERE id=?', [finalStatut, now, methode_pointage || 'MANUEL', justification || null, existing[0].id]);
        } else {
            await pool.query('INSERT INTO presences (eleve_id, date_presence, statut, heure_arrivee, methode_pointage, justification) VALUES (?,?,?,?,?,?)', [eleve_id, today, finalStatut, now, methode_pointage || 'MANUEL', justification || null]);
        }
        
        res.json({ success: true, message: 'Pointage enregistré' });
    } catch(e) {
        console.error('Erreur presences:', e.message);
        console.error('Stack:', e.stack);
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/eleve/:eleveId', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM presences WHERE eleve_id=? ORDER BY date_presence DESC LIMIT 30', [req.params.eleveId]); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/classe/:classeId', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [r] = await pool.query('SELECT e.id, e.matricule, e.nom, e.prenom, e.genre, p.statut, p.justification FROM eleves e LEFT JOIN presences p ON e.id=p.eleve_id AND p.date_presence=? WHERE e.classe_id=? ORDER BY e.nom, e.prenom', [today, req.params.classeId]);
        res.json({ success: true, data: r });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;