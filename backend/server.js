const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

//============== IP ==========================
const os = require('os');
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}
const LOCAL_IP = getLocalIP();
console.log(`📡 IP locale : ${LOCAL_IP}`);

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Logger des requêtes
app.use((req, res, next) => {
    const now = new Date();
    const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    console.log(`[${heure}] ${req.method} ${req.url}`);
    next();
});

// Servir les fichiers statiques (avant les routes)
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ==================== ROUTES API ====================

// Import des routes
const authRoutes = require('./routes/auth');
const elevesRoutes = require('./routes/eleves');
const classesRoutes = require('./routes/classes');
const presencesRoutes = require('./routes/presences');

// Page d'accueil de l'API
app.get('/', (req, res) => {
    res.json({
        nom: 'API Gestion Scolaire - EduManage',
        version: '1.0.0',
        statut: '✅ En ligne',
        auteur: 'Votre équipe',
        date_lancement: new Date().toISOString(),
        endpoints: {
            test: 'GET /api/test',
            auth: {
                login: 'POST /api/auth/login',
                verifier_token: 'GET /api/auth/verify'
            },
            eleves: {
                liste_par_classe: 'GET /api/eleves/classe/:classeId',
                profil_complet: 'GET /api/eleves/:id',
                creer_eleve: 'POST /api/eleves',
                modifier_eleve: 'PUT /api/eleves/:id',
                supprimer_eleve: 'DELETE /api/eleves/:id'
            },
            classes: {
                liste_classes: 'GET /api/classes',
                detail_classe: 'GET /api/classes/:id',
                stats_classe: 'GET /api/classes/:id/stats'
            },
            presences: {
                pointage: 'POST /api/presences',
                liste_presences: 'GET /api/presences',
                presences_eleve: 'GET /api/presences/eleve/:eleveId',
                presences_classe: 'GET /api/presences/classe/:classeId'
            }
        },
        comptes_test: {
            admin: {
                username: 'admin',
                password: 'admin123',
                role: 'Administrateur'
            }
        }
    });
});

// Route de test de l'API
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '🎉 API EduManage fonctionnelle !',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        node_version: process.version,
        environnement: process.env.NODE_ENV || 'development'
    });
});

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/eleves', elevesRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/presences', presencesRoutes);

// ==================== GESTION DES ERREURS ====================

// Route 404 pour les APIs
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route API non trouvée',
        details: {
            methode: req.method,
            url: req.originalUrl,
            suggestion: 'Consultez la documentation à la racine : http://localhost:' + PORT
        }
    });
});

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath, {
    index: false,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Pour les routes non-API, servir le frontend
app.get('*', (req, res) => {
    // Ignorer les requêtes API
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'Route API non trouvée'
        });
    }
    
    // Essayer de servir la page demandée
    const requestedFile = path.join(frontendPath, req.path);
    res.sendFile(requestedFile, (err) => {
        if (err) {
            // Si le fichier n'existe pas, servir index.html pour le SPA
            const indexPath = path.join(frontendPath, 'index.html');
            res.sendFile(indexPath, (err2) => {
                if (err2) {
                    res.status(404).json({
                        success: false,
                        error: 'Page non trouvée',
                        message: 'Le fichier demandé n\'existe pas'
                    });
                }
            });
        }
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// ==================== DÉMARRAGE ====================
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🏫  EduManage - API Gestion Scolaire');
    console.log('='.repeat(60));
    console.log(`✅ Serveur démarré sur : http://${LOCAL_IP}:${PORT}`);
    console.log(`📚 Documentation API : http://${LOCAL_IP}:${PORT}`);
    console.log(`🧪 Test API : http://${LOCAL_IP}:${PORT}/api/test`);
    console.log(`🔑 Login test : POST http://${LOCAL_IP}:${PORT}/api/auth/login`);
    console.log('='.repeat(60));
    console.log('✨ Prêt à gérer votre établissement !');
    console.log('='.repeat(60));
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

module.exports = app;