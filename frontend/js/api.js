class API {
    static async getInstitutions() { return apiGet('/classes/institutions'); }
    static async createInstitution(data) { return apiPost('/classes/institution', data); }
    static async updateInstitution(id, data) { return apiPut(`/classes/institution/${id}`, data); }
    static async deleteInstitution(id) { return apiDelete(`/classes/institution/${id}`); }
    static async getClasses() { return apiGet('/classes'); }
    static async getClassesByInstitution(id) { return apiGet(`/classes/institution/${id}`); }
    static async getClasseStats(id) { return apiGet(`/classes/${id}/stats`); }
    static async getOptions() { return apiGet('/classes/options/secondaire'); }
    static async getOptionsByNiveau(institutionId, niveauDetail) { return apiGet(`/classes/options/${institutionId}/${niveauDetail}`); }
    static async createOption(data) { return apiPost('/classes/option/secondaire', data); }
    static async updateOption(id, data) { return apiPut(`/classes/option/${id}`, data); }
    static async deleteOption(id) { return apiDelete(`/classes/option/${id}`); }
    static async getElevesByClasse(classeId) { return apiGet(`/eleves/classe/${classeId}`); }
    static async getEleve(id) { return apiGet(`/eleves/${id}`); }
    static async createEleve(data) { return apiPost('/eleves', data); }
    static async updateEleve(id, data) { return apiPut(`/eleves/${id}`, data); }
    static async deleteEleve(id) { return apiDelete(`/eleves/${id}`); }
    static async addResponsable(data) { return apiPost('/eleves/responsable', data); }
    static async deleteResponsable(id) { return apiDelete(`/eleves/responsable/${id}`); }
    static async setEmpreinte(id, data) { return apiPost(`/eleves/${id}/empreinte`, data); }
    static async deleteEmpreinte(id) { return apiDelete(`/eleves/${id}/empreinte`); }
    static async pointerPresence(data) { return apiPost('/presences', data); }
    static async getPresencesByEleve(eleveId) { return apiGet(`/presences/eleve/${eleveId}`); }
    static async getPresencesByClasse(classeId, date) { return apiGet(`/presences/classe/${classeId}${date ? `?date=${date}` : ''}`); }
    static async getProfesseurs() { return apiGet('/professeurs'); }
    static async getProfesseur(id) { return apiGet(`/professeurs/${id}`); }
    static async createProfesseur(data) { return apiPost('/professeurs', data); }
    static async updateProfesseur(id, data) { return apiPut(`/professeurs/${id}`, data); }
    static async deleteProfesseur(id) { return apiDelete(`/professeurs/${id}`); }
    static async pointerProfesseur(data) { return apiPost('/professeurs/pointer', data); }
    static async getPresenceProfesseur(professeurId) { return apiGet(`/professeurs/presence/${professeurId}`); }
    static async login(data) { return apiPost('/auth/login', data); }
    static async register(data) { return apiPost('/auth/register', data); }
    static async verifyToken() { return apiGet('/auth/verify'); }
    static async genererQR(data) { return apiPost('/auth/generer-qr', data); }
    static async createPreparation(data) { return apiPost('/preparations', data); }
    static async getPreparationsProfesseur(professeurId) { return apiGet(`/preparations/professeur/${professeurId}`); }
    static async getPreparationsEnAttente() { return apiGet('/preparations/en-attente'); }
    static async approuverPreparation(id, adminId) { return apiPut(`/preparations/${id}/approuver`, { admin_id: adminId }); }
    static async rejeterPreparation(id, adminId) { return apiPut(`/preparations/${id}/rejeter`, { admin_id: adminId }); }
    static async deletePreparation(id) { return apiDelete(`/preparations/${id}`); }
    static async getMatieres() { return apiGet('/matieres'); }
    static async createMatiere(data) { return apiPost('/matieres', data); }
    static async updateMatiere(id, data) { return apiPut(`/matieres/${id}`, data); }
    static async deleteMatiere(id) { return apiDelete(`/matieres/${id}`); }
    static async assignerTitulaire(data) { return apiPost('/titulaires', data); }
    static async retirerTitulaire(id) { return apiDelete(`/titulaires/${id}`); }
    static async getTitulaires() { return apiGet('/titulaires'); }
    static async getMatieresByClasse(classeId) { return apiGet(`/matieres/classe/${classeId}`); }
    static async getClassesProfesseur(professeurId) { return apiGet(`/titulaires/professeur/${professeurId}`); }
}