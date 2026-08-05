const pool = require('../config/database');

class Classe {
    static async getInstitutions() {
        const [r] = await pool.query('SELECT * FROM institutions ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")');
        return r;
    }

    static async findByInstitution(institutionId) {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`, [institutionId]);
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`);
        return rows;
    }

    static async findById(id) {
        const [classe] = await pool.query('SELECT c.*, o.nom as option_nom, o.code as option_code FROM classes c LEFT JOIN options_secondaire o ON c.option_id=o.id WHERE c.id=?', [id]);
        if (!classe.length) return null;
        const [nb] = await pool.query('SELECT COUNT(*) as total FROM eleves WHERE classe_id=?', [id]);
        const today = new Date().toISOString().split('T')[0];
        const [pres] = await pool.query(`SELECT COUNT(CASE WHEN p.statut='present' THEN 1 END) as presents, COUNT(CASE WHEN p.statut='absent' THEN 1 END) as absents FROM presences p JOIN eleves e ON p.eleve_id=e.id WHERE e.classe_id=? AND p.date_presence=?`, [id, today]);
        const t = nb[0].total, p = pres[0].presents || 0, a = pres[0].absents || 0;
        return { ...classe[0], nb_eleves: t, presents: p, absents: a, taux_presence: t > 0 ? ((p / t) * 100).toFixed(1) : '0.0' };
    }

    static async getOptionsByNiveau(institutionId, niveauDetail) {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.option_id, o.nom as option_nom, o.code as option_code, c.capacite, COUNT(e.id) as nb_eleves FROM classes c JOIN options_secondaire o ON c.option_id=o.id LEFT JOIN eleves e ON c.id=e.classe_id WHERE c.institution_id=? AND c.niveau_detail=? GROUP BY c.id ORDER BY o.nom`, [institutionId, niveauDetail]);
        return rows;
    }

    static async getOptions() {
        const [r] = await pool.query('SELECT * FROM options_secondaire ORDER BY nom');
        return r;
    }

    static async createInstitution({ nom, niveau }) {
        const [r] = await pool.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, niveau]);
        return r.insertId;
    }

    static async createInstitutionWithOptions({ nom, options }) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [inst] = await conn.query('INSERT INTO institutions (nom, niveau) VALUES (?,?)', [nom, 'secondaire']);
            const instId = inst.insertId;
            for (const opt of options) {
                const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [opt.code, opt.nom]);
                for (const niv of ['1ère', '2ème', '3ème', '4ème']) {
                    await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [instId, `${niv} ${opt.nom}`, niv, optRes.insertId]);
                }
            }
            for (const n of ['7ème E.B', '8ème E.B']) {
                await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,40)', [instId, n, n.split(' ')[0]]);
            }
            await conn.commit();
            return instId;
        } catch (e) { await conn.rollback(); throw e; }
        finally { conn.release(); }
    }

    static async updateInstitution(id, { nom, adresse, telephone, email }) {
        await pool.query('UPDATE institutions SET nom=?, adresse=?, telephone=?, email=? WHERE id=?', [nom || '', adresse || null, telephone || null, email || null, id]);
    }

    static async deleteInstitution(id) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query('SET FOREIGN_KEY_CHECKS=0');
            await conn.query('DELETE p FROM presences p INNER JOIN eleves e ON p.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [id]);
            await conn.query('DELETE r FROM responsables r INNER JOIN eleves e ON r.eleve_id=e.id INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [id]);
            await conn.query('DELETE e FROM eleves e INNER JOIN classes c ON e.classe_id=c.id WHERE c.institution_id=?', [id]);
            await conn.query('DELETE FROM classes WHERE institution_id=?', [id]);
            await conn.query('DELETE FROM institutions WHERE id=?', [id]);
            await conn.query('SET @count=0'); await conn.query('UPDATE institutions SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE institutions AUTO_INCREMENT=1');
            await conn.query('SET FOREIGN_KEY_CHECKS=1');
            await conn.commit();
        } catch (e) { await conn.rollback(); throw e; }
        finally { conn.release(); }
    }

    static async createClasse(institutionId, nom_classe, niveau_detail, capacite) {
        await pool.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES (?,?,?,?)', [institutionId, nom_classe, niveau_detail, capacite]);
    }

    static async createOption({ code, nom, institution_id }) {
        const conn = await pool.getConnection();
        try {
            const [optRes] = await conn.query('INSERT INTO options_secondaire (code, nom) VALUES (?,?)', [code, nom]);
            for (const niv of ['1ère', '2ème', '3ème', '4ème']) {
                await conn.query('INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES (?,?,?,?,35)', [institution_id, `${niv} ${nom}`, niv, optRes.insertId]);
            }
            return optRes.insertId;
        } finally { conn.release(); }
    }

    static async updateOption(id, { code, nom }) {
        await pool.query('UPDATE options_secondaire SET code=?, nom=? WHERE id=?', [code, nom, id]);
    }

    static async deleteOption(id) {
        const conn = await pool.getConnection();
        try {
            const [opt] = await conn.query('SELECT * FROM options_secondaire WHERE id=?', [id]);
            if (!opt.length) return null;
            const nom = opt[0].nom;
            await conn.beginTransaction();
            await conn.query('SET FOREIGN_KEY_CHECKS=0');
            const [classes] = await conn.query('SELECT id FROM classes WHERE option_id=?', [id]);
            for (const c of classes) {
                await conn.query('DELETE FROM presences WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]);
                await conn.query('DELETE FROM responsables WHERE eleve_id IN (SELECT id FROM eleves WHERE classe_id=?)', [c.id]);
                await conn.query('DELETE FROM eleves WHERE classe_id=?', [c.id]);
            }
            await conn.query('DELETE FROM classes WHERE option_id=?', [id]);
            await conn.query('DELETE FROM options_secondaire WHERE id=?', [id]);
            await conn.query('SET @count=0'); await conn.query('UPDATE options_secondaire SET id=@count:=@count+1 ORDER BY id'); await conn.query('ALTER TABLE options_secondaire AUTO_INCREMENT=1');
            await conn.query('SET FOREIGN_KEY_CHECKS=1');
            await conn.commit();
            return nom;
        } catch (e) { await conn.rollback(); throw e; }
        finally { conn.release(); }
    }
}

module.exports = Classe;