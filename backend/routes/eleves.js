const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const pool = require('../config/database');

router.get('/classe/:classeId', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT e.id, e.matricule, e.nom, e.prenom, e.genre, e.date_naissance, p.statut, p.justification FROM eleves e LEFT JOIN presences p ON e.id=p.eleve_id AND p.date_presence=CURDATE() WHERE e.classe_id=? ORDER BY e.nom, e.prenom`, [req.params.classeId]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [eleve] = await pool.query(`SELECT e.*, c.nom_classe as classe_nom FROM eleves e LEFT JOIN classes c ON e.classe_id=c.id WHERE e.id=?`, [req.params.id]);
        if (!eleve.length) return res.status(404).json({ success: false, message: 'Élève non trouvé' });
        const [responsables] = await pool.query('SELECT * FROM responsables WHERE eleve_id=?', [req.params.id]);
        const [presences] = await pool.query('SELECT date_presence, statut, justification FROM presences WHERE eleve_id=? ORDER BY date_presence DESC LIMIT 30', [req.params.id]);
        const [stats] = await pool.query(`SELECT COUNT(CASE WHEN statut='present' THEN 1 END) as presents, COUNT(CASE WHEN statut='absent' THEN 1 END) as absents, COUNT(CASE WHEN statut='retard' THEN 1 END) as retards, COUNT(*) as total FROM presences WHERE eleve_id=?`, [req.params.id]);
        const s = stats[0];
        res.json({ success: true, data: { ...eleve[0], responsables, presences, stats_presence: s, taux_presence: s.total>0?((s.presents/s.total)*100).toFixed(1):0 } });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { nom, prenom, date_naissance, genre, adresse, classe_id, responsables } = req.body;
        const matricule = 'ELV' + Date.now();
        let qrCode = '';
        try { qrCode = await QRCode.toDataURL(JSON.stringify({ matricule, nom, prenom, classe_id })); } catch(e) {}
        await conn.beginTransaction();
        const [r] = await conn.query('INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, qr_code, date_inscription) VALUES (?,?,?,?,?,?,?,?,CURDATE())', [matricule, nom, prenom, date_naissance, genre, adresse||null, classe_id, qrCode]);
        if (responsables && responsables.length) { for (const resp of responsables) { await conn.query('INSERT INTO responsables (eleve_id, nom_complet, lien_parente, telephone, email, whatsapp) VALUES (?,?,?,?,?,?)', [r.insertId, resp.nom_complet, resp.lien_parente, resp.telephone, resp.email||null, resp.whatsapp||null]); } }
        await conn.commit();
        res.status(201).json({ success: true, data: { id: r.insertId, matricule, qr_code: qrCode } });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM eleves WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Élève non trouvé' });
        res.json({ success: true, message: 'Élève supprimé avec succès' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/responsable', async (req, res) => {
    try {
        const { eleve_id, nom_complet, lien_parente, telephone, whatsapp, email } = req.body;
        await pool.query('INSERT INTO responsables (eleve_id, nom_complet, lien_parente, telephone, email, whatsapp) VALUES (?,?,?,?,?,?)', [eleve_id, nom_complet, lien_parente, telephone||null, email||null, whatsapp||null]);
        res.json({ success: true, message: 'Responsable ajouté' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/responsable/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM responsables WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Responsable non trouvé' });
        res.json({ success: true, message: 'Responsable supprimé' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { nom, prenom, date_naissance, genre, adresse } = req.body;
        const [result] = await pool.query('UPDATE eleves SET nom=?, prenom=?, date_naissance=?, genre=?, adresse=? WHERE id=?', [nom, prenom, date_naissance, genre, adresse||null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Élève non trouvé' });
        res.json({ success: true, message: 'Élève modifié avec succès' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/:id/empreinte', async (req, res) => {
    try {
        const { empreinte_digitale } = req.body;
        const [r] = await pool.query('UPDATE eleves SET empreinte_digitale=? WHERE id=?', [empreinte_digitale, req.params.id]);
        if (r.affectedRows===0) return res.status(404).json({success:false, message:'Élève non trouvé'});
        res.json({success:true, message:'Empreinte enregistrée'});
    } catch(e) { res.status(500).json({success:false, error:e.message}); }
});

router.delete('/:id/empreinte', async (req, res) => {
    try {
        const [r] = await pool.query('UPDATE eleves SET empreinte_digitale=NULL WHERE id=?', [req.params.id]);
        if (r.affectedRows===0) return res.status(404).json({success:false, message:'Élève non trouvé'});
        res.json({success:true, message:'Empreinte supprimée'});
    } catch(e) { res.status(500).json({success:false, error:e.message}); }
});

module.exports = router;