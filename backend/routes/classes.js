const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/institutions', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM institutions ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/institution/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/options/:institutionId/:niveauDetail', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? AND c.niveau_detail=? GROUP BY c.id ORDER BY o.nom`, [req.params.institutionId, req.params.niveauDetail]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/options/secondaire', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM options_secondaire ORDER BY nom'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:id/stats', async (req, res) => {
    try {
        const [classe] = await pool.query('SELECT c.*, o.nom as option_nom, o.code as option_code FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id WHERE c.id=?', [req.params.id]);
        if (!classe.length) return res.status(404).json({ success: false, message: 'Classe non trouvée' });
        const [nb] = await pool.query('SELECT COUNT(*) as total FROM eleves WHERE classe_id=?', [req.params.id]);
        const today = new Date().toISOString().split('T')[0];
        const [pres] = await pool.query(`SELECT COUNT(CASE WHEN p.statut='present' THEN 1 END) as presents, COUNT(CASE WHEN p.statut='absent' THEN 1 END) as absents FROM presences p JOIN eleves e ON p.eleve_id=e.id WHERE e.classe_id=? AND p.date_presence=?`, [req.params.id, today]);
        const t=nb[0].total, p=pres[0].presents||0, a=pres[0].absents||0;
        res.json({ success: true, data: { ...classe[0], nb_eleves:t, presents:p, absents:a, taux_presence:t>0?((p/t)*100).toFixed(1):'0.0' } });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;