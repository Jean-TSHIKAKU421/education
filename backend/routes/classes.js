const express = require('express');
const router = express.Router();
const Classe = require('../models/Classe');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const XLSX_PATH = path.join(__dirname, '..', '..', 'database', 'datas.xlsx');

async function getOrCreateWorkbook() { const wb = new ExcelJS.Workbook(); if (fs.existsSync(XLSX_PATH)) await wb.xlsx.readFile(XLSX_PATH); return wb; }
async function saveWorkbook(wb) { await wb.xlsx.writeFile(XLSX_PATH); }
function getAnneeScolaire() { const now = new Date(), mois = now.getMonth() + 1, annee = now.getFullYear(); return mois >= 9 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`; }

async function copierFeuilleModele(wb, sheetName, nomInstitution, nomClasse) { /* ... identique ... */ }
async function ajouterFeuilleSiAbsente(wb, sheetName, nomInstitution, nomClasse) { /* ... identique ... */ }
function supprimerFeuille(wb, sheetName) { /* ... identique ... */ }

router.get('/institutions', async (req, res) => { try { const data = await Classe.getInstitutions(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/institution/:id', async (req, res) => {
    try {
        const data = await Classe.findByInstitution(req.params.id);
        res.json({ success: true, data });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});
router.put('/institution/:id', async (req, res) => { try { await Classe.updateInstitution(req.params.id, req.body); res.json({ success: true, message: 'Institution modifiée' }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.post('/institution', async (req, res) => {
    try {
        const { nom, niveau } = req.body;
        const id = await Classe.createInstitution(nom, niveau);
        const nomInst = nom || '... ... ...';
        const wb = await getOrCreateWorkbook();
        
        if (niveau === 'maternelle') {
            const classes = ['1ère Maternelle', '2ème Maternelle', '3ème Maternelle'];
            for (const n of classes) {
                await Classe.createClasse(id, n, n.split(' ')[0], 25);
                await ajouterFeuilleSiAbsente(wb, n, nomInst, n);
            }
        } else if (niveau === 'primaire') {
            for (let i = 1; i <= 6; i++) {
                const nc = `${i}ème Primaire`;
                await Classe.createClasse(id, nc, `${i}ème`, 35);
                await ajouterFeuilleSiAbsente(wb, nc, nomInst, nc);
            }
        } else if (niveau === 'secondaire') {
            const classes = ['7ème E.B', '8ème E.B'];
            for (const n of classes) {
                await Classe.createClasse(id, n, n.split(' ')[0], 40);
                await ajouterFeuilleSiAbsente(wb, n, nomInst, n);
            }
        }
        
        await saveWorkbook(wb);
        res.json({ success: true, id, message: 'Institution créée' });
    } catch(e) {
        console.error('Erreur création institution:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/option/secondaire', async (req, res) => {
    try {
        const { code, nom, institution_id } = req.body;
        const optId = await Classe.createOption({ code, nom, institution_id }); // ← objet
        const wb = await getOrCreateWorkbook();
        const nomInst = 'Complexe Scolaire Avenir';
        for (const niv of ['1ère', '2ème', '3ème', '4ème']) {
            await ajouterFeuilleSiAbsente(wb, `${niv} ${nom}`, nomInst, `${niv} ${nom}`);
        }
        await saveWorkbook(wb);
        res.json({ success: true, id: optId, message: 'Option créée' });
    } catch(e) {
        console.error('Erreur création option:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

router.delete('/institution/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        // Récupérer le niveau avant suppression
        const [inst] = await conn.query('SELECT niveau FROM institutions WHERE id=?', [req.params.id]);
        const niveau = inst.length ? inst[0].niveau : null;
        
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        
        // Supprimer présences, responsables, élèves
        await conn.query('DELETE p FROM presences p INNER JOIN eleves e ON p.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [req.params.id]);
        await conn.query('DELETE r FROM responsables r INNER JOIN eleves e ON r.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [req.params.id]);
        await conn.query('DELETE e FROM eleves e INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [req.params.id]);
        
        // Supprimer les classes
        await conn.query('DELETE FROM classes WHERE institution_id=?', [req.params.id]);
        
        // Si c'est le secondaire, supprimer aussi toutes les options
        if (niveau === 'secondaire') {
            await conn.query('DELETE FROM options_secondaire');
        }
        
        // Supprimer l'institution
        await conn.query('DELETE FROM institutions WHERE id=?', [req.params.id]);
        
        await conn.query('SET @count=0'); await conn.query('UPDATE institutions SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE institutions AUTO_INCREMENT=1');
        if (niveau === 'secondaire') {
            await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT=1');
        }
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
        await conn.commit();
        
        res.json({ success: true, message: 'Institution supprimée' + (niveau === 'secondaire' ? ' avec toutes les options' : '') });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});
router.get('/', async (req, res) => { try { const data = await Classe.findAll(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/:institutionId/:niveauDetail', async (req, res) => { try { const data = await Classe.getOptionsByNiveau(req.params.institutionId, req.params.niveauDetail); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/secondaire', async (req, res) => { try { const data = await Classe.getOptions(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.post('/option/secondaire', async (req, res) => {
    try {
        const { code, nom, institution_id } = req.body;
        const optId = await Classe.createOption(code, nom, institution_id);
        const wb = await getOrCreateWorkbook(); const nomInst = '... ... ...';
        for (const niv of ['1ère','2ème','3ème','4ème']) await ajouterFeuilleSiAbsente(wb, `${niv} ${nom}`, nomInst, `${niv} ${nom}`);
        await saveWorkbook(wb);
        res.json({ success: true, id: optId, message: 'Option créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/option/:id', async (req, res) => { try { await Classe.updateOption(req.params.id, req.body); res.json({ success: true, message: 'Option modifiée' }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.delete('/option/:id', async (req, res) => {
    try {
        const nom = await Classe.deleteOption(req.params.id);
        if (!nom) return res.status(404).json({ success: false, message: 'Option non trouvée' });
        const wb = await getOrCreateWorkbook();
        for (const niv of ['1ère','2ème','3ème','4ème']) supprimerFeuille(wb, `${niv} ${nom}`);
        await saveWorkbook(wb);
        res.json({ success: true, message: 'Option supprimée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/ajouter-excel', async (req, res) => { /* ... identique ... */ });
router.get('/:id/stats', async (req, res) => { try { const data = await Classe.findById(req.params.id); if (!data) return res.status(404).json({ success: false, message: 'Classe non trouvée' }); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.post('/nettoyer-ids', async (req, res) => { /* ... identique ... */ });

module.exports = router;