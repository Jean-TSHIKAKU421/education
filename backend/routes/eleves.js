const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Eleve = require('../models/Eleve');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'assets', 'photos'),
    filename: (req, file, cb) => { const nom = (req.body.nom || 'inconnu').replace(/\s+/g, '_'); const prenom = (req.body.prenom || '').replace(/\s+/g, '_'); cb(null, `${nom}_${prenom}_${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/classe/:classeId', async (req, res) => { try { const data = await Eleve.findByClasse(req.params.classeId); res.json({ success: true, data }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.get('/:id', async (req, res) => { try { const data = await Eleve.findById(req.params.id); if (!data) return res.status(404).json({ success: false, message: 'Élève non trouvé' }); res.json({ success: true, data }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.post('/', async (req, res) => {
    try {
        console.log('POST /eleves - body:', JSON.stringify(req.body));
        const data = await Eleve.create(req.body);
        res.status(201).json({ success: true, data });
    } catch(e) {
        console.error('ERREUR POST /eleves:', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});
router.put('/:id', upload.single('photo'), async (req, res) => { try { let photoUrl = req.body.photo_existante || null; if (req.file) photoUrl = '/uploads/' + req.file.filename; const ok = await Eleve.update(req.params.id, { ...req.body, photo: photoUrl }); if (!ok) return res.status(404).json({ success: false, message: 'Élève non trouvé' }); res.json({ success: true, message: 'Élève modifié', photo: photoUrl }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.delete('/:id', async (req, res) => { try { const ok = await Eleve.delete(req.params.id); if (!ok) return res.status(404).json({ success: false, message: 'Élève non trouvé' }); res.json({ success: true, message: 'Élève supprimé' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.post('/responsable', async (req, res) => { try { await Eleve.addResponsable(req.body); res.json({ success: true, message: 'Responsable ajouté' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.delete('/responsable/:id', async (req, res) => { try { const ok = await Eleve.deleteResponsable(req.params.id); if (!ok) return res.status(404).json({ success: false, message: 'Responsable non trouvé' }); res.json({ success: true, message: 'Responsable supprimé' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.post('/:id/empreinte', async (req, res) => { try { const ok = await Eleve.setEmpreinte(req.params.id, req.body.empreinte_digitale); if (!ok) return res.status(404).json({ success: false, message: 'Élève non trouvé' }); res.json({ success: true, message: 'Empreinte enregistrée' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });
router.delete('/:id/empreinte', async (req, res) => { try { const ok = await Eleve.deleteEmpreinte(req.params.id); if (!ok) return res.status(404).json({ success: false, message: 'Élève non trouvé' }); res.json({ success: true, message: 'Empreinte supprimée' }); } catch (e) { res.status(500).json({ success: false, error: e.message }); } });

module.exports = router;