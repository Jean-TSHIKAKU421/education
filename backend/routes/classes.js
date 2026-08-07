const express = require('express');
const router = express.Router();
const Classe = require('../models/Classe');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

function getAnneeScolaire() { const now = new Date(), mois = now.getMonth() + 1, annee = now.getFullYear(); return mois >= 9 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`; }

router.get('/institutions', async (req, res) => { try { const data = await Classe.getInstitutions(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/institution/:id', async (req, res) => {
    try {
        const data = await Classe.findByInstitution(req.params.id);
        res.json({ success: true, data });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

const uploadLogo = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', '..', 'assets'),
        filename: (req, file, cb) => {
            const niveau = req._niveau || 'ecole';
            const ext = path.extname(file.originalname);
            cb(null, `logo-${niveau}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.put('/institution/:id', async (req, res, next) => {
    try {
        const niveau = await Classe.updateInstitution(req.params.id, req.body);
        req._niveau = niveau; // Passer le niveau au middleware multer
        next();
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
}, uploadLogo.single('logo'), (req, res) => {
    res.json({ success: true, message: 'Institution modifiée' });
});

router.post('/institution', async (req, res) => {
    try {
        const { nom, niveau } = req.body;
        const id = await Classe.createInstitution(nom, niveau);
        if (niveau === 'maternelle') {
            for (const n of ['1ère Maternelle', '2ème Maternelle', '3ème Maternelle']) await Classe.createClasse(id, n, n.split(' ')[0], 25);
        } else if (niveau === 'primaire') {
            for (let i = 1; i <= 6; i++) {
                const niv = i === 1 ? '1ère' : `${i}ème`;
                await Classe.createClasse(id, `${niv} Primaire`, niv, 35);
            }
        } else if (niveau === 'secondaire') {
            for (const n of ['7ème E.B', '8ème E.B']) await Classe.createClasse(id, n, n.split(' ')[0], 40);
        }
        res.json({ success: true, id, message: 'Institution créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/option/secondaire', async (req, res) => {
    try {
        const { code, nom, institution_id } = req.body;
        const optId = await Classe.createOption({ code, nom, institution_id }); // ← objet
        res.json({ success: true, id: optId, message: 'Option créée' });
    } catch(e) {
        console.error('Erreur création option:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

router.delete('/institution/:id', async (req, res) => { try { await Classe.deleteInstitution(req.params.id);res.json({ success: true, message: 'Institution supprimée' });} catch(e) { res.status(500).json({ success: false, error: e.message }); }});
router.get('/', async (req, res) => { try { const data = await Classe.findAll(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/:institutionId/:niveauDetail', async (req, res) => { try { const data = await Classe.getOptionsByNiveau(req.params.institutionId, req.params.niveauDetail); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/options/secondaire', async (req, res) => { try { const data = await Classe.getOptions(); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.post('/option/secondaire', async (req, res) => {
    try {
        const { code, nom, institution_id } = req.body;
        const optId = await Classe.createOption(code, nom, institution_id);
        res.json({ success: true, id: optId, message: 'Option créée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.put('/option/:id', async (req, res) => { try { await Classe.updateOption(req.params.id, req.body); res.json({ success: true, message: 'Option modifiée' }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });

router.delete('/option/:id', async (req, res) => {
    try {
        const nom = await Classe.deleteOption(req.params.id);
        if (!nom) return res.status(404).json({ success: false, message: 'Option non trouvée' });
        res.json({ success: true, message: 'Option supprimée' });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/ajouter-excel', async (req, res) => { /* ... identique ... */ });
router.get('/:id/stats', async (req, res) => { try { const data = await Classe.findById(req.params.id); if (!data) return res.status(404).json({ success: false, message: 'Classe non trouvée' }); res.json({ success: true, data }); } catch(e) { res.status(500).json({ success: false, error: e.message }); } });
router.post('/nettoyer-ids', async (req, res) => { /* ... identique ... */ });

module.exports = router;