const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Tentative connexion:', username);
        const [users] = await pool.query('SELECT * FROM administrateurs WHERE username = ?', [username]);
        console.log('Utilisateur trouvé:', users.length);
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', valid);
        if (!valid) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, institution_id: user.institution_id }, process.env.JWT_SECRET || 'secret_test', { expiresIn: '24h' });
        res.json({ success: true, token, user: { id: user.id, username: user.username, nom_complet: user.nom_complet, role: user.role, institution_id: user.institution_id } });
    } catch(e) { console.error('Erreur login:', e); res.status(500).json({ success: false, error: e.message }); }
});

router.post('/register', async (req, res) => {
    try {
        const { nom_complet, username, password, institution_id } = req.body;
        if (!nom_complet || !username || !password) return res.status(400).json({ success: false, message: 'Champs requis' });
        const [existing] = await pool.query('SELECT id FROM administrateurs WHERE username=?', [username]);
        if (existing.length > 0) return res.json({ success: true, message: 'Administrateur existe déjà' });
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO administrateurs (nom_complet, username, password_hash, role, institution_id) VALUES (?,?,?,?,?)', [nom_complet, username, hash, 'admin', institution_id || null]);
        res.json({ success: true, message: 'Administrateur créé' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Token non fourni' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_test');
        res.json({ success: true, valid: true, user: decoded });
    } catch(e) { res.status(401).json({ success: false, message: 'Token invalide' }); }
});

module.exports = router;