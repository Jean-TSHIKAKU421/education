const pool = require('../config/database');
class Titulaire {
    static async getTitulaires() { const [r] = await pool.query('SELECT t.*, p.nom as prof_nom, p.prenom as prof_prenom, c.nom_classe FROM titulaires t JOIN professeurs p ON t.professeur_id=p.id JOIN classes c ON t.classe_id=c.id ORDER BY c.nom_classe'); return r; }
    static async getClassesDuProfesseur(professeurId) { const [r] = await pool.query('SELECT t.*, c.nom_classe, c.niveau_detail, c.institution_id FROM titulaires t JOIN classes c ON t.classe_id=c.id WHERE t.professeur_id=?', [professeurId]); return r; }
    static async assigner({ professeur_id, classe_id, annee_scolaire }) { const [r] = await pool.query('INSERT INTO titulaires (professeur_id, classe_id, annee_scolaire) VALUES (?,?,?)', [professeur_id, classe_id, annee_scolaire || '2024-2025']); return r.insertId; }
    static async retirer(id) { const [r] = await pool.query('DELETE FROM titulaires WHERE id=?', [id]); return r.affectedRows > 0; }
    static async findByProfesseurAndClasse(professeurId, classeId) { const [r] = await pool.query('SELECT * FROM titulaires WHERE professeur_id=? AND classe_id=?', [professeurId, classeId]); return r.length ? r[0] : null; }
}
module.exports = Titulaire;