CREATE DATABASE IF NOT EXISTS education;
USE education;
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : lun. 27 juil. 2026 à 13:29
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `education`
--

-- --------------------------------------------------------

--
-- Structure de la table `administrateurs`
--

CREATE TABLE IF NOT EXISTS `administrateurs` (
  `id` int(11) NOT NULL  AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','secretaire') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `administrateurs`
--

INSERT INTO `administrateurs` (`id`, `username`, `password_hash`, `nom_complet`, `role`) VALUES
(1, 'admin', '$2b$10$rQZ5qpT8qFqGJqGTqGNJZuNhXV7qGJoGZHvGqGBqqMGzMGzMGMzMG', 'Administrateur Principal', 'super_admin');

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `institution_id` int(11) NOT NULL,
  `nom_classe` varchar(100) NOT NULL,
  `niveau_detail` varchar(50) NOT NULL,
  `option_id` int(11) DEFAULT NULL,
  `capacite` int(11) DEFAULT 35,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`institution_id`, `nom_classe`, `niveau_detail`, `option_id`, `capacite`) VALUES
(1, '1ère Maternelle', '1ère', NULL, 25),
(1, '2ème Maternelle', '2ème', NULL, 25),
(1, '3ème Maternelle', '3ème', NULL, 25),
(2, '1ère Primaire', '1ère', NULL, 35),
(2, '2ème Primaire', '2ème', NULL, 35),
(2, '3ème Primaire', '3ème', NULL, 35),
(2, '4ème Primaire', '4ème', NULL, 35),
(2, '5ème Primaire', '5ème', NULL, 35),
(2, '6ème Primaire', '6ème', NULL, 35),
(3, '7ème E.B', '7ème', NULL, 40),
(3, '8ème E.B', '8ème', NULL, 40),
(3, '1ère Commerciale et Gestion','1ère',1,50),
(3, '1ère Mécanique Générale','1ère',2,50),
(3, '1ère Bio-Chimie','1ère',3,50),
(3, '1ère Math-Physique','1ère',4,50),
(3, '1ère Pédagogie Générale','1ère',5,50),
(3, '2ère Commerciale et Gestion','2ère',1,50),
(3, '2ère Mécanique Générale','2ère',2,50),
(3, '2ère Bio-Chimie','2ème',3,50),
(3, '2ère Math-Physique','2ème',4,50),
(3, '2ère Pédagogie Générale','2ère',5,50),
(3, '3ère Commerciale et Gestion','3ème',1,50),
(3, '3ère Mécanique Générale','3ème',2,50),
(3, '3ère Bio-Chimie','3ème',3,50),
(3, '3ère Math-Physique','3ème',4,50),
(3, '3ère Pédagogie Générale','3ère',5,50),
(3, '4ère Commerciale et Gestion','4ème',1,50),
(3, '4ère Mécanique Générale','4ème',2,50),
(3, '4ère Bio-Chimie','4ème',3,50),
(3, '4ère Math-Physique','4ème',4,50),
(3, '4ère Pédagogie Générale','4ère',5,50);

-- --------------------------------------------------------

--
-- Structure de la table `eleves`
--

CREATE TABLE IF NOT EXISTS `eleves` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `date_naissance` date NOT NULL,
  `genre` enum('M','F') NOT NULL,
  `adresse` text DEFAULT NULL,
  `classe_id` int(11) NOT NULL,
  `qr_code` text DEFAULT NULL,
  `empreinte_digitale` text DEFAULT NULL,
  `date_inscription` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `institutions`
--

CREATE TABLE IF NOT EXISTS `institutions` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nom` varchar(150) NOT NULL,
  `niveau` enum('maternelle','primaire','secondaire') NOT NULL,
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT '/assets/logo-ecole.png',
  `annee_scolaire` varchar(9) DEFAULT '2024-2025',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `institutions`
--

INSERT INTO `institutions` (`nom`, `niveau`, `adresse`, `telephone`, `email`, `logo`, `annee_scolaire`) VALUES
('Complexe Scolaire Avenir', 'maternelle', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027'),
('Complexe Scolaire Avenir', 'primaire', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027'),
('Complexe Scolaire Avenir', 'secondaire', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027');

-- --------------------------------------------------------

--
-- Structure de la table `options_secondaire`
--

CREATE TABLE IF NOT EXISTS `options_secondaire` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` varchar(10) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `options_secondaire`
--

INSERT INTO `options_secondaire` (`code`, `nom`, `description`) VALUES
('CG', 'Commerciale et Gestion', NULL),
('MG', 'Mécanique Générale', NULL),
('BC', 'Bio-Chimie', NULL),
('MP', 'Math-Physique', NULL),
('PE', 'Pédagogie', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `presences`
--

CREATE TABLE IF NOT EXISTS `presences` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `eleve_id` int(11) NOT NULL,
  `date_presence` date NOT NULL,
  `statut` enum('present','absent','retard','excuse','justifie') NOT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `methode_pointage` enum('QR','QR+EMPREINTE','MANUEL') DEFAULT 'MANUEL',
  `justification` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `responsables`
--

CREATE TABLE IF NOT EXISTS `responsables` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `eleve_id` int(11) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `lien_parente` varchar(50) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Index pour les tables déchargées
--

--
-- Index pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  ADD UNIQUE KEY `username` (`username`);

--
-- Index pour la table `classes`
--
ALTER TABLE `classes`
  ADD KEY `institution_id` (`institution_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Index pour la table `eleves`
--
ALTER TABLE `eleves`
  ADD UNIQUE KEY `matricule` (`matricule`),
  ADD KEY `classe_id` (`classe_id`);

--
-- Index pour la table `presences`
--
ALTER TABLE `presences`
  ADD UNIQUE KEY `unique_presence` (`eleve_id`,`date_presence`);

--
-- Index pour la table `responsables`
--
ALTER TABLE `responsables`
  ADD KEY `eleve_id` (`eleve_id`);

-- Contraintes pour la table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `options_secondaire` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `eleves`
--
ALTER TABLE `eleves`
  ADD CONSTRAINT `eleves_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `presences`
--
ALTER TABLE `presences`
  ADD CONSTRAINT `presences_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `responsables`
--
ALTER TABLE `responsables`
  ADD CONSTRAINT `responsables_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;