class ImportExcelService {
    constructor() { this.eleves = []; this.classes = []; this.existants = []; }

    async lireFichier(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const wb = XLSX.read(e.target.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    let lastRow = data.length - 1;
                    while (lastRow >= 6 && (!data[lastRow] || !String(data[lastRow][0] || '').trim())) { lastRow--; }
                    if (lastRow < 6) { reject('Aucun élève trouvé'); return; }
                    const rows = data.slice(6, lastRow + 1);
                    const eleves = [];
                    for (const row of rows) {
                        if (!row || !String(row[0] || '').trim()) continue;
                        let dateNaissance = row[7];
                        if (typeof dateNaissance === 'number') { dateNaissance = new Date((dateNaissance - 25569) * 86400 * 1000).toISOString().split('T')[0]; }
                        else dateNaissance = String(dateNaissance || '').trim();
                        eleves.push({ nom: String(row[0] || '').trim(), prenom: String(row[5] || '').trim(), 'date de naissance': dateNaissance, genre: String(row[9] || '').trim(), adresse: String(row[10] || '').trim(), classe: String(row[12] || '').trim(), option: String(row[13] || '').trim() });
                    }
                    this.eleves = eleves;
                    resolve(eleves);
                } catch (ex) { reject(ex.message); }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    async chargerContexte(institutionId) {
        const cr = await apiGet(`/classes/institution/${institutionId}`);
        this.classes = cr.data || [];
        const allEleves = [];
        for (const c of this.classes) { const er = await apiGet(`/eleves/classe/${c.id}`); if (er.data) allEleves.push(...er.data); }
        this.existants = allEleves.map(e => ({ nom: (e.nom || '').toLowerCase().trim(), prenom: (e.prenom || '').toLowerCase().trim() }));
    }

    estDoublon(nom, prenom) { const nl = nom.toLowerCase(), pl = prenom.toLowerCase(); return this.existants.some(e => e.nom === nl && e.prenom === pl); }

    trouverClasseId(nomClasse, optionNom) {
        const nomComplet = optionNom ? `${nomClasse} ${optionNom}` : nomClasse;
        let found = this.classes.find(c => String(c.nom_classe || '').toLowerCase() === nomComplet.toLowerCase());
        if (found) return found.id;
        found = this.classes.find(c => String(c.nom_classe || '').toLowerCase() === nomClasse.toLowerCase());
        return found ? found.id : null;
    }

    verifierOptionsInconnues() {
        const optionsInconnues = [];
        const optionsConnues = [...new Set(this.classes.filter(c => c.option_nom).map(c => c.option_nom.toLowerCase()))];
        for (const e of this.eleves) {
            const opt = String(e.option || '').trim();
            if (opt && !optionsConnues.includes(opt.toLowerCase()) && !optionsInconnues.find(o => o.nom.toLowerCase() === opt.toLowerCase())) {
                const niveau = String(e.classe || '').trim();
                optionsInconnues.push({ nom: opt, niveau, code: opt.substring(0, 2).toUpperCase(), count: this.eleves.filter(el => String(el.option || '').trim().toLowerCase() === opt.toLowerCase()).length });
            }
        }
        return optionsInconnues;
    }

    filtrerSansOptionsInconnues(optionsInconnues) {
        const nomsInconnus = optionsInconnues.map(o => o.nom.toLowerCase());
        return this.eleves.filter(e => !nomsInconnus.includes(String(e.option || '').trim().toLowerCase()));
    }
}

const importExcelService = new ImportExcelService();