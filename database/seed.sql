USE education;

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

INSERT INTO `administrateurs` (`username`, `password_hash`, `nom_complet`, `role`) VALUES
('super-admin', '$2b$10$FBePQl7VckkLM6fGMRq5E.rpr01yXpsFEHXpf9cB.teUp.KWfqj1a', 'Jean TSHIKAKU', 'super_admin');
