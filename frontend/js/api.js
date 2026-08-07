class API {
    // Institutions
    static async getInstitutions() { return apiGet('/classes/institutions'); }
    static async createInstitution(data) { return apiPost('/classes/institution', data); }
    static async updateInstitution(id, data) { return apiPut(`/classes/institution/${id}`, data); }
    static async deleteInstitution(id) { return apiDelete(`/classes/institution/${id}`); }
    
    // Classes
    static async getClasses() { return apiGet('/classes'); }
    static async getClassesByInstitution(id) { return apiGet(`/classes/institution/${id}`); }
    static async getClasseStats(id) { return apiGet(`/classes/${id}/stats`); }
    static async getOptions() { return apiGet('/classes/options/secondaire'); }
    static async getOptionsByNiveau(institutionId, niveauDetail) { return apiGet(`/classes/options/${institutionId}/${niveauDetail}`); }
    static async createOption(data) { return apiPost('/classes/option/secondaire', data); }
    static async updateOption(id, data) { return apiPut(`/classes/option/${id}`, data); }
    static async deleteOption(id) { return apiDelete(`/classes/option/${id}`); }
    
    // Élèves
    static async getElevesByClasse(classeId) { return apiGet(`/eleves/classe/${classeId}`); }
    static async getEleve(id) { return apiGet(`/eleves/${id}`); }
    static async createEleve(data) { return apiPost('/eleves', data); }
    static async updateEleve(id, data) { return apiPut(`/eleves/${id}`, data); }
    static async deleteEleve(id) { return apiDelete(`/eleves/${id}`); }
    static async addResponsable(data) { return apiPost('/eleves/responsable', data); }
    static async deleteResponsable(id) { return apiDelete(`/eleves/responsable/${id}`); }
    static async setEmpreinte(id, data) { return apiPost(`/eleves/${id}/empreinte`, data); }
    static async deleteEmpreinte(id) { return apiDelete(`/eleves/${id}/empreinte`); }
    
    // Présences
    static async pointerPresence(data) { return apiPost('/presences', data); }
    static async getPresencesByEleve(eleveId) { return apiGet(`/presences/eleve/${eleveId}`); }
    static async getPresencesByClasse(classeId, date) { return apiGet(`/presences/classe/${classeId}${date ? `?date=${date}` : ''}`); }
    
    // Auth
    static async login(data) { return apiPost('/auth/login', data); }
    static async register(data) { return apiPost('/auth/register', data); }
    static async verifyToken() { return apiGet('/auth/verify'); }
}