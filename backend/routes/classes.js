const express = require('express');
const router = express.Router();
const pool = require('../config/database');

async function reorganiserIDs(table) {
    try {
        await pool.query('SET @count = 0');
        await pool.query(`UPDATE ${table} SET id = @count:= @count + 1`);
        await pool.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    } catch(e) { console.error(`Erreur réorganisation ${table}:`, e.message); }
}

router.get('/institutions', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM institutions ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/institution/:id', async (req, res) => {
    try { const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`, [req.params.id]); res.json({ success: true, data: rows }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/institution/:id', async (req, res) => {
    try { const { nom, adresse, telephone, email } = req.body; await pool.query('UPDATE institutions SET nom=?, adresse=?, telephone=?, email=? WHERE id=?', [nom, adresse||null, telephone||null, email||null, req.params.id]); res.json({ success: true, message: 'Institution modifiée' }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/institution', async (req, res) => {
    try { const { nom, niveau } = req.body; const [r] = await pool.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, niveau]);
        if (niveau === 'maternelle') { for (const n of ['1ère Maternelle','2ème Maternelle','3ème Maternelle']) await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,25)', [r.insertId, n, n.split(' ')[0]]); }
        else if (niveau === 'primaire') { for (let i=1;i<=6;i++) await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,35)', [r.insertId, `${i}ème Primaire`, `${i}ème`]); }
        res.json({ success: true, message: 'Institution créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/institution/secondaire', async (req, res) => {
    const conn = await pool.getConnection();
    try { const { nom, options } = req.body; await conn.beginTransaction(); const [inst] = await conn.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, 'secondaire']); const instId = inst.insertId;
        for (const opt of options) { const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [opt.code, opt.nom]); for (const niv of ['1ère','2ème','3ème','4ème']) await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [instId, `${niv} ${opt.nom}`, niv, optRes.insertId]); }
        await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,40),(?,?,?,40)', [instId,'7ème E.B','7ème',instId,'8ème E.B','8ème']); await conn.commit();
        res.json({ success: true, message: 'Secondaire créé avec options' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.delete('/institution/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        await conn.query('DELETE FROM institutions WHERE id=?', [req.params.id]);
        await conn.query('SET @count = 0');
        await conn.query('UPDATE institutions SET id = @count:= @count + 1 ORDER BY id');
        await conn.query('ALTER TABLE institutions AUTO_INCREMENT = 1');
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
        await conn.commit();
        res.json({ success: true, message: 'Niveau supprimé et IDs réorganisés' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.get('/', async (req, res) => {
    try { const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`); res.json({ success: true, data: rows }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/options/:institutionId/:niveauDetail', async (req, res) => {
    try { const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? AND c.niveau_detail=? GROUP BY c.id ORDER BY o.nom`, [req.params.institutionId, req.params.niveauDetail]); res.json({ success: true, data: rows }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/options/secondaire', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM options_secondaire ORDER BY nom'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/option/secondaire', async (req, res) => {
    const conn = await pool.getConnection();
    try { const { code, nom, institution_id } = req.body; const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [code, nom]); for (const niv of ['1ère','2ème','3ème','4ème']) await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [institution_id, `${niv} ${nom}`, niv, optRes.insertId]); res.json({ success: true, message: 'Option et classes créées' }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/option/:id', async (req, res) => {
    try { const { code, nom } = req.body; await pool.query('UPDATE options_secondaire SET code=?, nom=? WHERE id=?', [code, nom, req.params.id]); res.json({ success: true, message: 'Option modifiée' }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/option/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        const [classes] = await conn.query('SELECT id FROM classes WHERE option_id=?', [req.params.id]);
        for (const c of classes) { await conn.query('DELETE FROM presences WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]); await conn.query('DELETE FROM responsables WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]); await conn.query('DELETE FROM eleves WHERE classe_id=?', [c.id]); }
        await conn.query('DELETE FROM classes WHERE option_id=?', [req.params.id]);
        await conn.query('DELETE FROM options_secondaire WHERE id=?', [req.params.id]);
        await conn.query('SET @count = 0'); await conn.query('UPDATE options_secondaire SET id = @count:= @count + 1 ORDER BY id'); await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT = 1');
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
        await conn.commit();
        res.json({ success: true, message: 'Option supprimée et IDs réorganisés' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.get('/:id/stats', async (req, res) => {
    try { const [classe] = await pool.query('SELECT c.*, o.nom as option_nom, o.code as option_code FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id WHERE c.id=?', [req.params.id]); if (!classe.length) return res.status(404).json({ success: false, message: 'Classe non trouvée' }); const [nb] = await pool.query('SELECT COUNT(*) as total FROM eleves WHERE classe_id=?', [req.params.id]); const today = new Date().toISOString().split('T')[0]; const [pres] = await pool.query(`SELECT COUNT(CASE WHEN p.statut='present' THEN 1 END) as presents, COUNT(CASE WHEN p.statut='absent' THEN 1 END) as absents FROM presences p JOIN eleves e ON p.eleve_id=e.id WHERE e.classe_id=? AND p.date_presence=?`, [req.params.id, today]); const t=nb[0].total, p=pres[0].presents||0, a=pres[0].absents||0; res.json({ success: true, data: { ...classe[0], nb_eleves:t, presents:p, absents:a, taux_presence:t>0?((p/t)*100).toFixed(1):'0.0' } }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/nettoyer-ids', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        
        // Décaler temporairement pour éviter les conflits
        await conn.query('UPDATE eleves SET id = id + 10000');
        await conn.query('UPDATE responsables SET id = id + 10000');
        await conn.query('UPDATE presences SET id = id + 10000');
        await conn.query('UPDATE classes SET id = id + 10000');
        await conn.query('UPDATE options_secondaire SET id = id + 10000');
        await conn.query('UPDATE institutions SET id = id + 10000');
        
        // Réorganiser
        await conn.query('SET @count = 0');
        await conn.query('UPDATE institutions SET id = @count:= @count + 1 ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")');
        await conn.query('ALTER TABLE institutions AUTO_INCREMENT = 1');
        
        await conn.query('SET @count = 0');
        await conn.query('UPDATE options_secondaire SET id = @count:= @count + 1 ORDER BY id');
        await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT = 1');
        
        // Réorganiser classes (maternelle → primaire → secondaire)
        await conn.query('SET @count = 0');
        await conn.query(`UPDATE classes c 
            INNER JOIN institutions i ON c.institution_id = i.id 
            SET c.id = @count:= @count + 1 
            ORDER BY FIELD(i.niveau, "maternelle", "primaire", "secondaire"), c.niveau_detail, c.nom_classe`);
        await conn.query('ALTER TABLE classes AUTO_INCREMENT = 1');
        
        await conn.query('SET @count = 0');
        await conn.query('UPDATE eleves SET id = @count:= @count + 1 ORDER BY classe_id, nom, prenom');
        await conn.query('ALTER TABLE eleves AUTO_INCREMENT = 1');
        
        await conn.query('SET @count = 0');
        await conn.query('UPDATE responsables SET id = @count:= @count + 1 ORDER BY eleve_id');
        await conn.query('ALTER TABLE responsables AUTO_INCREMENT = 1');
        
        await conn.query('SET @count = 0');
        await conn.query('UPDATE presences SET id = @count:= @count + 1 ORDER BY eleve_id, date_presence');
        await conn.query('ALTER TABLE presences AUTO_INCREMENT = 1');
        
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
        await conn.commit();
        res.json({ success: true, message: 'IDs réorganisés' });
    } catch(e) {
        console.error('ERREUR nettoyage:', e);
        await conn.rollback();
        res.status(500).json({ success: false, error: e.message });
    }
    finally { conn.release(); }
});
module.exports = router;