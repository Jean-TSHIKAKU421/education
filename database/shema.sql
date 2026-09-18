SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `education` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `education`;

DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `preparations`;
DROP TABLE IF EXISTS `titulaires`;
DROP TABLE IF EXISTS `presences_professeurs`;
DROP TABLE IF EXISTS `professeurs`;
DROP TABLE IF EXISTS `responsables`;
DROP TABLE IF EXISTS `presences`;
DROP TABLE IF EXISTS `eleves`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `matieres`;
DROP TABLE IF EXISTS `options_secondaire`;
DROP TABLE IF EXISTS `institutions`;
DROP TABLE IF EXISTS `administrateurs`;

CREATE TABLE `administrateurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','secretaire','professeur') DEFAULT 'admin',
  `professeur_id` int(11) DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `administrateurs` (`username`, `password_hash`, `nom_complet`, `role`) VALUES
('admin', '$2b$10$y/kmxAF3/BrapXXdkeEjXuuMfp6D54QwuwirmzGU4mXdwPrmtHJ1K', 'JTT', 'super_admin');

CREATE TABLE `institutions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) NOT NULL,
  `niveau` enum('maternelle','primaire','secondaire') NOT NULL,
  `regime` enum('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS',
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT '/assets/logo-ecole.png',
  `annee_scolaire` varchar(9) DEFAULT '2024-2025',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `options_secondaire` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `matieres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `intitule` varchar(150) NOT NULL,
  `ponderation` int(11) DEFAULT 1,
  `classe_id` int(11) DEFAULT NULL,
  `niveau` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `classe_id` (`classe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `institution_id` int(11) NOT NULL,
  `nom_classe` varchar(100) NOT NULL,
  `niveau_detail` varchar(50) NOT NULL,
  `option_id` int(11) DEFAULT NULL,
  `capacite` int(11) DEFAULT 35,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `institution_id` (`institution_id`),
  KEY `option_id` (`option_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `options_secondaire` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `eleves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `date_naissance` date NOT NULL,
  `genre` enum('M','F') NOT NULL,
  `adresse` text DEFAULT NULL,
  `classe_id` int(11) NOT NULL,
  `qr_code` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `empreinte_digitale` text DEFAULT NULL,
  `date_inscription` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `classe_id` (`classe_id`),
  CONSTRAINT `eleves_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `presences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eleve_id` int(11) NOT NULL,
  `date_presence` date NOT NULL,
  `statut` enum('present','absent','retard','excuse','justifie') NOT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `methode_pointage` enum('QR','QR+EMPREINTE','MANUEL','AUTO') DEFAULT 'MANUEL',
  `pointe_par` int(11) DEFAULT NULL,
  `justification` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_presence` (`eleve_id`,`date_presence`),
  CONSTRAINT `presences_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `responsables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eleve_id` int(11) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `lien_parente` varchar(50) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `responsables_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `professeurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `date_naissance` date NOT NULL,
  `genre` enum('M','F') NOT NULL,
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `charge_horaire` text DEFAULT NULL,
  `date_embauche` date NOT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `presences_professeurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `professeur_id` int(11) NOT NULL,
  `date_presence` date NOT NULL,
  `statut` enum('present','absent','retard','justifie') NOT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `methode_pointage` enum('QR','MANUEL','AUTO') DEFAULT 'QR',
  `pointe_par` int(11) DEFAULT NULL,
  `justification` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_presence_prof` (`professeur_id`,`date_presence`),
  CONSTRAINT `presences_prof_ibfk_1` FOREIGN KEY (`professeur_id`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `presences_prof_ibfk_2` FOREIGN KEY (`pointe_par`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `titulaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `professeur_id` int(11) NOT NULL,
  `classe_id` int(11) NOT NULL,
  `annee_scolaire` varchar(9) DEFAULT '2024-2025',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_titulaire` (`professeur_id`,`classe_id`,`annee_scolaire`),
  CONSTRAINT `titulaires_ibfk_1` FOREIGN KEY (`professeur_id`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `titulaires_ibfk_2` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `preparations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `professeur_id` int(11) NOT NULL,
  `date_preparation` date NOT NULL,
  `matiere_id` int(11) NOT NULL,
  `classe_id` int(11) DEFAULT NULL,
  `titre_lecon` varchar(200) NOT NULL,
  `objectifs` text DEFAULT NULL,
  `contenu` text NOT NULL,
  `methode` text DEFAULT NULL,
  `materiel` text DEFAULT NULL,
  `evaluation` text DEFAULT NULL,
  `statut` enum('en_attente','approuve','rejete') DEFAULT 'en_attente',
  `approuve_par` int(11) DEFAULT NULL,
  `date_approbation` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `professeur_id` (`professeur_id`),
  KEY `matiere_id` (`matiere_id`),
  KEY `classe_id` (`classe_id`),
  CONSTRAINT `preparations_ibfk_1` FOREIGN KEY (`professeur_id`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `preparations_ibfk_2` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `preparations_ibfk_3` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `matiere_id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `epreuve` varchar(100) DEFAULT NULL,
  `point` decimal(5,2) NOT NULL,
  `ponderation` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `matiere_id` (`matiere_id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `matieres` ADD COLUMN `professeur_id` int(11) DEFAULT NULL AFTER `classe_id`;
ALTER TABLE `matieres` ADD CONSTRAINT `matieres_ibfk_2` FOREIGN KEY (`professeur_id`) REFERENCES `professeurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
