SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `education` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `education`;

DROP TABLE IF EXISTS `responsables`;
DROP TABLE IF EXISTS `presences`;
DROP TABLE IF EXISTS `eleves`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `options_secondaire`;
DROP TABLE IF EXISTS `institutions`;
DROP TABLE IF EXISTS `administrateurs`;

CREATE TABLE `administrateurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','secretaire') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `options_secondaire` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
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
  `justification` varchar(20) DEFAULT NULL,
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

COMMIT;


ALTER TABLE eleves ADD COLUMN photo VARCHAR(255) NULL AFTER qr_code;
ALTER TABLE presences MODIFY COLUMN statut ENUM('present','absent','retard','excuse','justifie') NOT NULL;
ALTER TABLE presences MODIFY COLUMN methode_pointage ENUM('QR','QR+EMPREINTE','MANUEL','AUTO') DEFAULT 'MANUEL';
ALTER TABLE `institutions` ADD COLUMN `regime` ENUM('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS' AFTER `niveau`;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
