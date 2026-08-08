class Validator {
    constructor() { this.errors = {}; }
    validate(fieldName, value, rules = []) {
        this.clearError(fieldName);
        for (const rule of rules) {
            const result = this.applyRule(value, rule);
            if (!result.valid) { this.setError(fieldName, result.message); return false; }
        }
        return true;
    }
    applyRule(value, rule) {
        switch (rule.type) {
            case 'required': return { valid: value && value.trim().length > 0, message: rule.message || 'Ce champ est requis' };
            case 'minLength': return { valid: value && value.length >= rule.value, message: rule.message || `Minimum ${rule.value} caractères` };
            case 'email': return { valid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: rule.message || 'Email invalide' };
            case 'match': return { valid: value === rule.value, message: rule.message || 'Les valeurs ne correspondent pas' };
            case 'custom': return { valid: rule.validator(value), message: rule.message || 'Valeur invalide' };
            default: return { valid: true };
        }
    }
    setError(fieldName, message) { this.errors[fieldName] = message; this.afficherErreur(fieldName, message); }
    clearError(fieldName) { delete this.errors[fieldName]; this.effacerErreur(fieldName); }
    clearAll() { Object.keys(this.errors).forEach(k => this.clearError(k)); }
    hasErrors() { return Object.keys(this.errors).length > 0; }
    afficherErreur(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`); if (!field) return;
        const fg = field.closest('.form-group, .input-wrapper'); if (fg) fg.classList.add('has-error');
        const ex = field.parentElement.querySelector('.field-message'); if (ex) ex.remove();
        const el = document.createElement('div'); el.className = 'field-message error'; el.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        field.parentElement.appendChild(el);
    }
    effacerErreur(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`); if (!field) return;
        const fg = field.closest('.form-group, .input-wrapper'); if (fg) fg.classList.remove('has-error');
        const msg = field.parentElement.querySelector('.field-message'); if (msg) msg.remove();
    }
    validateLogin(username, password) {
        this.clearAll(); let valid = true;
        valid = this.validate('username', username, [{ type: 'required', message: 'Nom d\'utilisateur requis' }]) && valid;
        valid = this.validate('password', password, [{ type: 'required', message: 'Mot de passe requis' }]) && valid;
        return valid;
    }
}
const validator = new Validator();