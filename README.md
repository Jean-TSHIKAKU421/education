# 🏫 EduManage

Plateforme de gestion scolaire moderne pour les établissements de la RDC (Maternelle, Primaire, Secondaire).

![EduManage](assets/logo-ecole.png)

---

## ✨ Fonctionnalités

- 📊 **Dashboard** par niveau (Maternelle, Primaire, Secondaire)
- 👥 **Gestion des classes** avec options (Commerciale, Pédagogie, Bio-Chimie...)
- 📋 **Liste des élèves** avec recherche par nom ou matricule
- ✅ **Pointage de présence** journalier (Présent/Absent/Retard/Justifié)
- 📝 **Justification d'absence** (Malade, Endeuillé, Pas de motif)
- 📈 **Statistiques de fréquentation** (journalière, hebdomadaire, mensuelle)
- 🌗 **Mode clair/sombre** avec toggle animé
- 📱 **Responsive** (mobile, tablette, desktop)
- 🔐 **Authentification sécurisée** (JWT)
- 🎨 **Design Glassmorphism** moderne

---

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/Jean-Nuel-Projects/ecole.git
cd ecole

# Installer les dépendances backend
cd backend
npm install

# Créer la base de données
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql

# Configurer l'environnement
cp .env.example .env
# Modifier les identifiants DB si nécessaire

# Lancer le serveur
npm run dev
