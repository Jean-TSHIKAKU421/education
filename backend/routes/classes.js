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
router.get('/institution/:id', async (req, res) => { try { const data = await Classe.findByInstitution(req.params.id); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.put('/institution/:id', async (req, res) => { try { await Classe.updateInstitution(req.params.id, req.body); res.json({ success: true, message: 'Institution modifiée' }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.post('/institution', async (req, res) => {
    try {
        const { nom, niveau } = req.body;
        const id = await Classe.createInstitution(nom, niveau);
        const nomInst = nom || 'Complexe Scolaire Avenir';
        const wb = await getOrCreateWorkbook();
        if (niveau === 'maternelle') { for (const n of ['1ère Maternelle','2ème Maternelle','3ème Maternelle']) { await Classe.createClasse(id, n, n.split(' ')[0], 25); await ajouterFeuilleSiAbsente(wb, n, nomInst, n); } }
        else if (niveau === 'primaire') { for (let i=1;i<=6;i++) { const nc = `${i}ème Primaire`; await Classe.createClasse(id, nc, `${i}ème`, 35); await ajouterFeuilleSiAbsente(wb, nc, nomInst, nc); } }
        else if (niveau === 'secondaire') { for (const n of ['7ème E.B','8ème E.B']) { await Classe.createClasse(id, n, n.split(' ')[0], 40); await ajouterFeuilleSiAbsente(wb, n, nomInst, n); } }
        await saveWorkbook(wb);
        res.json({ success: true, id, message: 'Institution créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/institution/secondaire', async (req, res) => {
    try {
        const { nom, options } = req.body;
        const id = await Classe.createInstitutionWithOptions(nom, options);
        const nomInst = nom || 'Complexe Scolaire Avenir';
        const wb = await getOrCreateWorkbook();
        for (const opt of options) { for (const niv of ['1ère','2ème','3ème','4ème']) { const nc = `${niv} ${opt.nom}`; await ajouterFeuilleSiAbsente(wb, nc, nomInst, nc); } }
        for (const n of ['7ème E.B','8ème E.B']) { await ajouterFeuilleSiAbsente(wb, n, nomInst, n); }
        await saveWorkbook(wb);
        res.json({ success: true, id, message: 'Secondaire créé' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete('/institution/:id', async (req, res) => { try { await Classe.deleteInstitution(req.params.id); res.json({ success: true, message: 'Institution supprimée' }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/', async (req, res) => { try { const data = await Classe.findAll(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/:institutionId/:niveauDetail', async (req, res) => { try { const data = await Classe.getOptionsByNiveau(req.params.institutionId, req.params.niveauDetail); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/secondaire', async (req, res) => { try { const data = await Classe.getOptions(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.post('/option/secondaire', async (req, res) => {
    try {
        const { code, nom, institution_id } = req.body;
        const optId = await Classe.createOption(code, nom, institution_id);
        const wb = await getOrCreateWorkbook(); const nomInst = 'Complexe Scolaire Avenir';
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