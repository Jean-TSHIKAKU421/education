const mysql = require('mysql2/promise');require('dotenv').config();
const pool = mysql.createPool({host: process.env.DB_HOST || 'localhost',user: process.env.DB_USER || 'root',password: process.env.DB_PASSWORD || '',database: process.env.DB_NAME || 'education',waitForConnections: true,connectionLimit: 10,queueLimit: 0});
pool.getConnection() .then(connection => {console.log('✅ Connecté à la base de données MySQL');connection.release();}) .catch(err => {console.warn('⚠️ Base de données non disponible - mode dégradé actif');console.warn('   Les routes API fonctionnent mais sans persistance');});
pool.on('error', (err) => {console.error('❌ Erreur inattendue du pool MySQL:', err.message);});
module.exports = pool;