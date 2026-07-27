CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

CREATE TABLE administrateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100) NOT NULL,
    role ENUM('super_admin','admin','secretaire') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(150) NOT NULL,
    niveau ENUM('maternelle','primaire','secondaire') NOT NULL,
    adresse TEXT, telephone VARCHAR(20), email VARCHAR(100),
    logo VARCHAR(255) DEFAULT '/assets/logo-ecole.png',
    annee_scolaire VARCHAR(9) DEFAULT '2024-2025',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE options_secondaire (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    nom_classe VARCHAR(100) NOT NULL,
    niveau_detail VARCHAR(50) NOT NULL,
    option_id INT NULL,
    capacite INT DEFAULT 35,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options_secondaire(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eleves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(50) NOT NULL, prenom VARCHAR(50) NOT NULL,
    date_naissance DATE NOT NULL, genre ENUM('M','F') NOT NULL,
    adresse TEXT, classe_id INT NOT NULL,
    qr_code TEXT, empreinte_digitale TEXT,
    date_inscription DATE NOT NULL,
    FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responsables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eleve_id INT NOT NULL, nom_complet VARCHAR(100) NOT NULL,
    lien_parente VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL, email VARCHAR(100), whatsapp VARCHAR(20),
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE
);

CREATE TABLE presences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eleve_id INT NOT NULL, date_presence DATE NOT NULL,
    statut ENUM('present','absent','retard','excuse','justifie') NOT NULL,
    heure_arrivee TIME, methode_pointage ENUM('QR','QR+EMPREINTE','MANUEL') DEFAULT 'MANUEL',
    justification VARCHAR(20) NULL,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    UNIQUE KEY unique_presence (eleve_id, date_presence)
);

INSERT INTO administrateurs (username, password_hash, nom_complet, role)
VALUES ('admin','$2b$10$rQZ5qpT8qFqGJqGTqGNJZuNhXV7qGJoGZHvGqGBqqMGzMGzMGMzMG','Administrateur Principal','super_admin');