USE school_management;

INSERT INTO institutions (nom, niveau) VALUES
('Complexe Scolaire Avenir', 'maternelle'),
('Complexe Scolaire Avenir', 'primaire'),
('Complexe Scolaire Avenir', 'secondaire');

INSERT INTO options_secondaire (code, nom) VALUES
('CG','Commerciale et Gestion'), ('MG','Mécanique Générale'),
('BC','Bio-Chimie'), ('MP','Math-Physique'), ('PE','Pédagogie');

-- Maternelle
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(1,'1ère Maternelle','1ère',25),(1,'2ème Maternelle','2ème',25),(1,'3ème Maternelle','3ème',25);

-- Primaire
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(2,'1ère Primaire','1ère',35),(2,'2ème Primaire','2ème',35),(2,'3ème Primaire','3ème',35),
(2,'4ème Primaire','4ème',35),(2,'5ème Primaire','5ème',35),(2,'6ème Primaire','6ème',35);

-- Secondaire : 7è, 8è EB
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(3,'7ème E.B','7ème',40),(3,'8ème E.B','8ème',40);

-- Secondaire : 1ère à 4ème avec options (2 options ici : CG et PE, tu peux adapter)
INSERT INTO classes (institution_id, nom_classe, niveau_detail, option_id, capacite) VALUES
(3,'1ère Commerciale et Gestion','1ère',1,35),(3,'1ère Pédagogie','1ère',5,30),
(3,'2ème Commerciale et Gestion','2ème',1,35),(3,'2ème Pédagogie','2ème',5,30),
(3,'3ème Commerciale et Gestion','3ème',1,35),(3,'3ème Pédagogie','3ème',5,30),
(3,'4ème Commerciale et Gestion','4ème',1,35),(3,'4ème Pédagogie','4ème',5,30);

-- Élèves
INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, classe_id, date_inscription) VALUES
('ELV001','Dupont','Jean','2018-05-15','M',1,'2024-09-01'),
('ELV002','Kabila','Sarah','2018-08-22','F',1,'2024-09-01'),
('ELV003','Mutombo','David','2014-03-10','M',4,'2024-09-01'),
('ELV004','Ngoy','Grace','2014-12-05','F',4,'2024-09-01'),
('ELV005','Lumumba','Patrick','2008-06-18','M',12,'2024-09-01'),
('ELV006','Tshisekedi','Anne','2008-01-30','F',12,'2024-09-01');