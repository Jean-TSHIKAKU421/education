USE education;

-- Déchargement des données de la table `administrateurs`

INSERT INTO `administrateurs` (`id`, `username`, `password_hash`, `nom_complet`, `role`) VALUES
(1, 'admin', '$2b$10$rQZ5qpT8qFqGJqGTqGNJZuNhXV7qGJoGZHvGqGBqqMGzMGzMGMzMG', 'Administrateur Principal', 'super_admin');


SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM presences;
DELETE FROM responsables;
DELETE FROM eleves;
DELETE FROM classes;
DELETE FROM options_secondaire;
DELETE FROM institutions;
DELETE FROM administrateurs;
ALTER TABLE eleves AUTO_INCREMENT = 1;
ALTER TABLE classes AUTO_INCREMENT = 1;
ALTER TABLE options_secondaire AUTO_INCREMENT = 1;
ALTER TABLE institutions AUTO_INCREMENT = 1;
ALTER TABLE presences AUTO_INCREMENT = 1;
ALTER TABLE responsables AUTO_INCREMENT = 1;
ALTER TABLE administrateurs AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------