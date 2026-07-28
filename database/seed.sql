USE education;

-- Déchargement des données de la table `administrateurs`

INSERT INTO `administrateurs` (`id`, `username`, `password_hash`, `nom_complet`, `role`) VALUES
(1, 'admin', '$2b$10$rQZ5qpT8qFqGJqGTqGNJZuNhXV7qGJoGZHvGqGBqqMGzMGzMGMzMG', 'Administrateur Principal', 'super_admin');

-- --------------------------------------------------------
-- Déchargement des données de la table `institutions`

INSERT INTO `institutions` (`nom`, `niveau`, `adresse`, `telephone`, `email`, `logo`, `annee_scolaire`) VALUES
('Complexe Scolaire Avenir', 'maternelle', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027'),
('Complexe Scolaire Avenir', 'primaire', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027'),
('Complexe Scolaire Avenir', 'secondaire', 'Golf-Lido/Lubumbashi/RDC', '+243999543276', 'jtshikaku@gmail.com', '/assets/logo-ecole.png', '2026-2027');

-- --------------------------------------------------------
-- Déchargement des données de la table `options_secondaire`

INSERT INTO `options_secondaire` (`code`, `nom`, `description`) VALUES
('CG', 'Commerciale et Gestion', NULL),
('MG', 'Mécanique Générale', NULL),
('BC', 'Bio-Chimie', NULL),
('MP', 'Math-Physique', NULL),
('PE', 'Pédagogie', NULL);

-- --------------------------------------------------------
-- Déchargement des données de la table `classes`

INSERT INTO `classes` (`institution_id`, `nom_classe`, `niveau_detail`, `option_id`, `capacite`) VALUES
(1, '1ère Maternelle', '1ère', NULL, 25),
(1, ' Maternelle', '', NULL, 25),
(1, '3ème Maternelle', '3ème', NULL, 25),
(2, '1ère Primaire', '1ère', NULL, 35),
(2, ' Primaire', '', NULL, 35),
(2, '3ème Primaire', '3ème', NULL, 35),
(2, '4ème Primaire', '4ème', NULL, 35),
(2, '5ème Primaire', '5ème', NULL, 35),
(2, '6ème Primaire', '6ème', NULL, 35),
(3, '7ème E.B', '7ème', NULL, 40),
(3, '8ème E.B', '8ème', NULL, 40),
(3, '1ème Commerciale et Gestion','1ère',1,50),
(3, '1ème Mécanique Générale','1ère',2,50),
(3, '1ème Bio-Chimie','1ère',3,50),
(3, '1ème Math-Physique','1ère',4,50),
(3, '1ème Pédagogie Générale','1ère',5,50),
(3, '2ème Commerciale et Gestion','2ème',1,50),
(3, '2ème Mécanique Générale','2ème',2,50),
(3, '2ème Bio-Chimie','2ème',3,50),
(3, '2ème Math-Physique','2ème',4,50),
(3, '2ème Pédagogie Générale','2ème',5,50),
(3, '3ème Commerciale et Gestion','3ème',1,50),
(3, '3ème Mécanique Générale','3ème',2,50),
(3, '3ème Bio-Chimie','3ème',3,50),
(3, '3ème Math-Physique','3ème',4,50),
(3, '3ème Pédagogie Générale','3ème',5,50),
(3, '4ème Commerciale et Gestion','4ème',1,50),
(3, '4ème Mécanique Générale','4ème',2,50),
(3, '4ème Bio-Chimie','4ème',3,50),
(3, '4ème Math-Physique','4ème',4,50),
(3, '4ème Pédagogie Générale','4ème',5,50);

-- --------------------------------------------------------