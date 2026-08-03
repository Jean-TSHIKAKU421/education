const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const XLSX_PATH = path.join(__dirname, '..', '..', 'database', 'datas.xlsx');

function getOrCreateWorkbook() { if (fs.existsSync(XLSX_PATH)) return XLSX.readFile(XLSX_PATH); return XLSX.utils.book_new(); }
function saveWorkbook(wb) { XLSX.writeFile(wb, XLSX_PATH); }
function getAnneeScolaire() { const now = new Date(); const mois = now.getMonth() + 1; const annee = now.getFullYear(); return mois >= 9 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`; }

function copierFeuilleModele(wb, sheetName, nomInstitution, nomClasse) {
    if (!wb.SheetNames.includes('modele')) return null;
    const modeleWs = wb.Sheets['modele'];
    const data = XLSX.utils.sheet_to_json(modeleWs, { header: 1 });
    const newData = data.map(row => [...row]);
    if (newData[0]) newData[0][4] = nomInstitution || 'Complexe Scolaire Avenir';
    if (newData[2]) newData[2][4] = nomClasse || sheetName;
    if (newData[6]) newData[6][7] = getAnneeScolaire();
    const newWs = XLSX.utils.aoa_to_sheet(newData);
    if (modeleWs['!cols']) newWs['!cols'] = modeleWs['!cols'];
    if (modeleWs['!merges']) newWs['!merges'] = modeleWs['!merges'];
    XLSX.utils.book_append_sheet(wb, newWs, sheetName);
    return newWs;
}

function ajouterFeuilleSiAbsente(wb, sheetName, nomInstitution, nomClasse) {
    if (!wb.SheetNames.includes(sheetName)) {
        const ws = copierFeuilleModele(wb, sheetName, nomInstitution, nomClasse);
        if (!ws) { const fallback = XLSX.utils.aoa_to_sheet([['Nom','Prénom','Date de naissance','Genre','Adresse','Classe']]); XLSX.utils.book_append_sheet(wb, fallback, sheetName); }
    }
}

function supprimerFeuille(wb, sheetName) { if (sheetName === 'modele') return; const idx = wb.SheetNames.indexOf(sheetName); if (idx >= 0) { wb.SheetNames.splice(idx, 1); delete wb.Sheets[sheetName]; } }

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
    try {
        const { nom, niveau } = req.body;
        const [r] = await pool.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, niveau]);
        const nomInst = nom || 'Complexe Scolaire Avenir';
        const wb = getOrCreateWorkbook();
        if (niveau === 'maternelle') {
            for (const n of ['1ère Maternelle','2ème Maternelle','3ème Maternelle']) { await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,25)', [r.insertId, n, n.split(' ')[0]]); ajouterFeuilleSiAbsente(wb, n, nomInst, n); }
        } else if (niveau === 'primaire') {
            for (let i=1;i<=6;i++) { const nc = `${i}ème Primaire`; await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,35)', [r.insertId, nc, `${i}ème`]); ajouterFeuilleSiAbsente(wb, nc, nomInst, nc); }
        } else if (niveau === 'secondaire') {
            for (const n of ['7ème E.B','8ème E.B']) { await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,40)', [r.insertId, n, n.split(' ')[0]]); ajouterFeuilleSiAbsente(wb, n, nomInst, n); }
        }
        saveWorkbook(wb);
        res.json({ success: true, message: 'Institution créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/institution/secondaire', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { nom, options } = req.body; await conn.beginTransaction();
        const [inst] = await conn.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, 'secondaire']); const instId = inst.insertId;
        const wb = getOrCreateWorkbook(); const nomInst = nom || 'Complexe Scolaire Avenir';
        for (const opt of options) {
            const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [opt.code, opt.nom]);
            for (const niv of ['1ère','2ème','3ème','4ème']) { const nc = `${niv} ${opt.nom}`; await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [instId, nc, niv, optRes.insertId]); ajouterFeuilleSiAbsente(wb, nc, nomInst, nc); }
        }
        for (const n of ['7ème E.B','8ème E.B']) { await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,40)', [instId, n, n.split(' ')[0]]); ajouterFeuilleSiAbsente(wb, n, nomInst, n); }
        saveWorkbook(wb); await conn.commit();
        res.json({ success: true, message: 'Secondaire créé' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.delete('/institution/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction(); await conn.query('SET FOREIGN_KEY_CHECKS=0');
        await conn.query(`DELETE p FROM presences p INNER JOIN eleves e ON p.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?`, [req.params.id]);
        await conn.query(`DELETE r FROM responsables r INNER JOIN eleves e ON r.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?`, [req.params.id]);
        await conn.query(`DELETE e FROM eleves e INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?`, [req.params.id]);
        await conn.query('DELETE FROM classes WHERE institution_id=?', [req.params.id]);
        await conn.query('DELETE FROM institutions WHERE id=?', [req.params.id]);
        await conn.query('SET @count=0'); await conn.query('UPDATE institutions SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE institutions AUTO_INCREMENT=1');
        await conn.query('SET FOREIGN_KEY_CHECKS=1'); await conn.commit();
        res.json({ success: true, message: 'Institution supprimée' });
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
    try {
        const { code, nom, institution_id } = req.body;
        const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [code, nom]);
        const wb = getOrCreateWorkbook(); const nomInst = 'Complexe Scolaire Avenir';
        for (const niv of ['1ère','2ème','3ème','4ème']) { const nc = `${niv} ${nom}`; await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [institution_id, nc, niv, optRes.insertId]); ajouterFeuilleSiAbsente(wb, nc, nomInst, nc); }
        saveWorkbook(wb);
        res.json({ success: true, message: 'Option créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.put('/option/:id', async (req, res) => {
    try { const { code, nom } = req.body; await pool.query('UPDATE options_secondaire SET code=?, nom=? WHERE id=?', [code, nom, req.params.id]); res.json({ success: true, message: 'Option modifiée' }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/option/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [opt] = await conn.query('SELECT * FROM options_secondaire WHERE id=?', [req.params.id]);
        if (!opt.length) return res.status(404).json({ success: false, message: 'Option non trouvée' });
        const nom = opt[0].nom;
        await conn.beginTransaction(); await conn.query('SET FOREIGN_KEY_CHECKS=0');
        const [classes] = await conn.query('SELECT id FROM classes WHERE option_id=?', [req.params.id]);
        for (const c of classes) { await conn.query('DELETE FROM presences WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]); await conn.query('DELETE FROM responsables WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]); await conn.query('DELETE FROM eleves WHERE classe_id=?', [c.id]); }
        await conn.query('DELETE FROM classes WHERE option_id=?', [req.params.id]);
        await conn.query('DELETE FROM options_secondaire WHERE id=?', [req.params.id]);
        await conn.query('SET @count=0'); await conn.query('UPDATE options_secondaire SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT=1');
        await conn.query('SET FOREIGN_KEY_CHECKS=1'); await conn.commit();
        const wb = getOrCreateWorkbook();
        for (const niv of ['1ère','2ème','3ème','4ème']) supprimerFeuille(wb, `${niv} ${nom}`);
        saveWorkbook(wb);
        res.json({ success: true, message: 'Option supprimée' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

router.post('/ajouter-excel', async (req, res) => {
    try {
        const { eleves, classe_nom } = req.body;
        if (!eleves || !eleves.length) return res.json({ success: false, message: 'Aucun élève' });
        const wb = getOrCreateWorkbook();
        const sheetName = classe_nom || eleves[0]?.Classe || 'Sans classe';
        if (!wb.SheetNames.includes(sheetName)) return res.json({ success: false, message: 'Feuille non trouvée' });
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        let lastRow = 9; while (data[lastRow] && data[lastRow].some(c => c)) lastRow++;
        eleves.forEach(e => {
            const row = Array(14).fill(null); row[4]=e.Nom||''; row[8]=e.Prénom||''; row[9]=e['Date de naissance']||''; row[12]=e.Genre||''; row[13]=e.Classe||'';
            const existe = data.some(r => r[4]?.toLowerCase()===row[4]?.toLowerCase() && r[8]?.toLowerCase()===row[8]?.toLowerCase());
            if (!existe) { data.push(row); lastRow++; }
        });
        const newWs = XLSX.utils.aoa_to_sheet(data);
        if (ws['!cols']) newWs['!cols'] = ws['!cols'];
        if (ws['!merges']) newWs['!merges'] = ws['!merges'];
        wb.Sheets[sheetName] = newWs;
        saveWorkbook(wb);
        res.json({ success: true, message: 'Ajoutés dans Excel' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:id/stats', async (req, res) => {
    try { const [classe] = await pool.query('SELECT c.*, o.nom as option_nom, o.code as option_code FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id WHERE c.id=?', [req.params.id]); if (!classe.length) return res.status(404).json({ success: false, message: 'Classe non trouvée' }); const [nb] = await pool.query('SELECT COUNT(*) as total FROM eleves WHERE classe_id=?', [req.params.id]); const today = new Date().toISOString().split('T')[0]; const [pres] = await pool.query(`SELECT COUNT(CASE WHEN p.statut='present' THEN 1 END) as presents, COUNT(CASE WHEN p.statut='absent' THEN 1 END) as absents FROM presences p JOIN eleves e ON p.eleve_id=e.id WHERE e.classe_id=? AND p.date_presence=?`, [req.params.id, today]); const t=nb[0].total, p=pres[0].presents||0, a=pres[0].absents||0; res.json({ success: true, data: { ...classe[0], nb_eleves:t, presents:p, absents:a, taux_presence:t>0?((p/t)*100).toFixed(1):'0.0' } }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/nettoyer-ids', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction(); await conn.query('SET FOREIGN_KEY_CHECKS=0');
        await conn.query('UPDATE eleves SET id=id+10000'); await conn.query('UPDATE responsables SET id=id+10000'); await conn.query('UPDATE presences SET id=id+10000');
        await conn.query('UPDATE classes SET id=id+10000'); await conn.query('UPDATE options_secondaire SET id=id+10000'); await conn.query('UPDATE institutions SET id=id+10000');
        await conn.query('SET @count=0'); await conn.query('UPDATE institutions SET id=@count:=@count+1 ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")'); await conn.query('ALTER TABLE institutions AUTO_INCREMENT=1');
        await conn.query('SET @count=0'); await conn.query('UPDATE options_secondaire SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT=1');
        await conn.query('SET @count=0'); await conn.query('UPDATE classes c INNER JOIN institutions i ON c.institution_id=i.id SET c.id=@count:=@count+1 ORDER BY FIELD(i.niveau,"maternelle","primaire","secondaire"), c.niveau_detail, c.nom_classe'); await conn.query('ALTER TABLE classes AUTO_INCREMENT=1');
        await conn.query('SET @count=0'); await conn.query('UPDATE eleves SET id=@count:=@count+1 ORDER BY classe_id, nom, prenom'); await conn.query('ALTER TABLE eleves AUTO_INCREMENT=1');
        await conn.query('SET @count=0'); await conn.query('UPDATE responsables SET id=@count:=@count+1 ORDER BY eleve_id'); await conn.query('ALTER TABLE responsables AUTO_INCREMENT=1');
        await conn.query('SET @count=0'); await conn.query('UPDATE presences SET id=@count:=@count+1 ORDER BY eleve_id, date_presence'); await conn.query('ALTER TABLE presences AUTO_INCREMENT=1');
        await conn.query('SET FOREIGN_KEY_CHECKS=1'); await conn.commit();
        res.json({ success: true, message: 'IDs réorganisés' });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

module.exports = router;