const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nom d\'utilisateur et mot de passe requis'
            });
        }

        // Mode test : admin/admin123 sans BDD
        if (username === 'admin' && password === 'admin123') {const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' },process.env.JWT_SECRET || 'secret_test',{ expiresIn: '24h' });return res.json({success: true,token,user: {id: 1,username: 'admin',nom_complet: 'Administrateur',role: 'admin'}});}

        // Recherche dans la base de données
        try {
            const [users] = await pool.query(
                'SELECT * FROM administrateurs WHERE username = ?',
                [username]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                });
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'secret_test',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nom_complet: user.nom_complet,
                    role: user.role
                }
            });

        } catch (dbError) {
            console.log('Base de données non disponible, mode test uniquement');
            return res.status(401).json({
                success: false,
                message: 'Nom d\'utilisateur ou mot de passe incorrect'
            });
        }

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

// Vérifier le token
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token non fourni'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_test');
        res.json({ success: true, valid: true, user: decoded });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }
});

module.exports = router;