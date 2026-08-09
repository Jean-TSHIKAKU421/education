const express = require('express');const cors = require('cors');const { requestLogger } = require('./middleware/logger');const bodyParser = require('body-parser');const path = require('path');const fs = require('fs');const https = require('https');require('dotenv').config();
const app = express();const PORT = process.env.PORT || 3443;
let sslOptions; try { sslOptions = { key: fs.readFileSync(path.join(__dirname, 'key.pem')), cert: fs.readFileSync(path.join(__dirname, 'cert.pem')) }; } catch(e) {}
app.use(cors());app.use(bodyParser.json({ limit: '10mb' }));app.use(bodyParser.urlencoded({ extended: true }));app.use(requestLogger);
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));app.use('/uploads', express.static(path.join(__dirname, '..', 'assets', 'photos')));app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/api/auth', require('./routes/auth'));app.use('/api/eleves', require('./routes/eleves'));app.use('/api/classes', require('./routes/classes'));app.use('/api/presences', require('./routes/presences'));
app.get('/api', (req, res) => { res.json({ nom: 'EduManage API', version: '1.0.0' }); });
app.get('/api/test', (req, res) => { res.json({ success: true }); });
app.use('/api/*', (req, res) => { res.status(404).json({ success: false, error: 'Route non trouvée' }); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')); });
app.use((err, req, res, next) => { res.status(500).json({ success: false, error: 'Erreur interne' }); });
const server = sslOptions ? https.createServer(sslOptions, app) : app;
server.listen(PORT, () => { console.log(`Serveur ${sslOptions?'HTTPS':'HTTP'} démarré sur le port ${PORT}`); });
module.exports = app;