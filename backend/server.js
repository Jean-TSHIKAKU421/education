const express = require('express');const cors = require('cors');const { requestLogger } = require('./middleware/logger');const bodyParser = require('body-parser');const path = require('path');const fs = require('fs');const https = require('https');const os = require('os');require('dotenv').config();
const app = express();const PORT = process.env.PORT || 3443;
function getLocalIP() { const interfaces = os.networkInterfaces(); for (const name of Object.keys(interfaces)) { for (const iface of interfaces[name]) { if (iface.family === 'IPv4' && !iface.internal) return iface.address; } } return 'localhost'; }
const LOCAL_IP = getLocalIP();
let sslOptions; try { sslOptions = { key: fs.readFileSync(path.join(__dirname, 'key.pem')), cert: fs.readFileSync(path.join(__dirname, 'cert.pem')) }; } catch(e) {}
app.use(cors());app.use(bodyParser.json({ limit: '10mb' }));app.use(bodyParser.urlencoded({ extended: true }));app.use(requestLogger);
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));app.use('/uploads', express.static(path.join(__dirname, '..', 'assets', 'photos')));app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/api/auth', require('./routes/auth'));app.use('/api/eleves', require('./routes/eleves'));app.use('/api/classes', require('./routes/classes'));app.use('/api/presences', require('./routes/presences'));
app.get('/api', (req, res) => { res.json({ nom: 'EduManage API', version: '1.0.0', statut: 'En ligne' }); });
app.get('/api/test', (req, res) => { res.json({ success: true, message: 'API fonctionnelle' }); });
app.use('/api/*', (req, res) => { res.status(404).json({ success: false, error: 'Route API non trouvée' }); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')); });
app.use((err, req, res, next) => { res.status(500).json({ success: false, error: 'Erreur interne' }); });
const PROTOCOL = sslOptions ? 'https' : 'http';const server = sslOptions ? https.createServer(sslOptions, app) : app;
server.listen(PORT, () => { console.log(`\n  EduManage API v1.0.0`);console.log(`  ${PROTOCOL.toUpperCase()} · ${LOCAL_IP}:${PORT}`);console.log(`  ${PROTOCOL}://${LOCAL_IP}:${PORT}/api\n`); });
process.on('SIGTERM', () => process.exit(0));process.on('SIGINT', () => process.exit(0));
module.exports = app;