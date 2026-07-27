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
(3, '2ère Bio-Chimie','2ère',3,50),
(3, '2ère Math-Physique','2ère',4,50),
(3, '2ère Pédagogie Générale','2ère',5,50),
(3, '3ère Commerciale et Gestion','3ère',1,50),
(3, '3ère Mécanique Générale','3ère',2,50),
(3, '3ère Bio-Chimie','3ère',3,50),
(3, '3ère Math-Physique','3ère',4,50),
(3, '3ère Pédagogie Générale','3ère',5,50);
(3, '4ère Commerciale et Gestion','4ère',1,50),
(3, '4ère Mécanique Générale','4ère',2,50),
(3, '4ère Bio-Chimie','4ère',3,50),
(3, '4ère Math-Physique','4ère',4,50),
(3, '4ère Pédagogie Générale','4ère',5,50);

-- --------------------------------------------------------