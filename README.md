```markdown
# 🏫 EduManage

**Plateforme de gestion scolaire — RDC**

Solution complète, locale et sécurisée pour administrer les établissements scolaires (Maternelle, Primaire, Secondaire). Aucune connexion internet requise.

---

## 🚀 Démarrage rapide

```bash
git clone https://github.com/...
cd education
bash demarer.sh
```

Le script automatise tout : détection OS, installation MySQL/MariaDB si absent, création de la base de données `education`, installation des dépendances Node.js, génération des certificats SSL, et démarrage du serveur.

Ouvrir `https://localhost:3443` dans le navigateur.

**Compte par défaut :** `admin` / `admin123`

---

## ⚡ Fonctionnalités

- **Institutions** — Multi-niveaux (Maternelle, Primaire, Secondaire), régimes Anglais/Français, logos personnalisés
- **Élèves** — Création manuelle ou import Excel, QR code unique, photo de profil, fiche imprimable
- **Classes** — Auto-générées selon le niveau, options pour le secondaire (Commerciale, Bio-Chimie, etc.)
- **Pointage** — Scan QR code (caméra), pointage manuel, justifications personnalisées, détection auto des absents
- **Présences** — Vue journalière (tri par date), hebdomadaire (taux + jours absents), mensuelle (alerte si ≥10 absences)
- **Calendrier** — Jours fériés RDC, dimanches, régimes détectés automatiquement
- **Logs système** — Toutes les requêtes HTTP et SQL enregistrées, filtrage par catégorie, recherche, impression personnalisée, archive automatique après 6 mois
- **Sécurité** — Authentification JWT, rôles (super_admin, admin, secrétaire), actions sensibles protégées par mot de passe
- **Interface** — Design Glassmorphism, mode clair/sombre, responsive (mobile, tablette, desktop)

---

## 🛠 Technologies

Node.js · Express · MySQL/MariaDB · Vanilla JavaScript · CSS3 · JWT · bcrypt · html5-qrcode · jsQR · SheetJS

---

## 📂 Structure du projet

```
education/
├── assets/               # Logos et photos des institutions/élèves
├── backend/              # Serveur API REST
│   ├── config/           # Connexion base de données
│   ├── middleware/       # Logger (requêtes HTTP/SQL)
│   ├── models/           # Classe, Eleve, Presence
│   └── routes/           # Auth, Classes, Eleves, Presences
├── database/             # Schéma SQL, seeds, logs, backups
├── frontend/             # Interface utilisateur
│   ├── composants/       # Composants UI réutilisables
│   ├── css/              # Feuilles de style
│   └── js/               # Services, pages, utilitaires
├── demarer.sh            # Script de démarrage automatique
├── pousser.sh            # Script git push avec animation
└── rec.sh                # Script git pull avec détection de conflits
```

---

## 📡 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/register` | Création administrateur |
| `GET` | `/api/classes/institutions` | Liste des institutions |
| `POST` | `/api/classes/institution` | Créer une institution |
| `PUT` | `/api/classes/institution/:id` | Modifier une institution |
| `DELETE` | `/api/classes/institution/:id` | Supprimer une institution |
| `GET` | `/api/eleves/classe/:classeId` | Élèves par classe |
| `POST` | `/api/eleves` | Créer un élève |
| `PUT` | `/api/eleves/:id` | Modifier un élève |
| `DELETE` | `/api/eleves/:id` | Supprimer un élève |
| `POST` | `/api/presences` | Pointer une présence |
| `GET` | `/api/presences/classe/:classeId` | Présences par classe |
| `GET` | `/api/classes/logs` | Logs système |

---

## 📝 Licence

Développé pour les établissements scolaires de la RDC. Usage interne.
```