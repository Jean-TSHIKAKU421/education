const express = require('express');
const router = express.Router();
const Presence = require('../models/Presence');

router.post('/', async (req, res) => {
    try { await Presence.pointer(req.body); res.json({ success: true, message: 'Pointage enregistré' }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/eleve/:eleveId', async (req, res) => {
    try { const data = await Presence.getByEleve(req.params.eleveId); res.json({ success: true, data }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/classe/:classeId', async (req, res) => {
    try { const data = await Presence.getByClasse(req.params.classeId, req.query.date); res.json({ success: true, data }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;