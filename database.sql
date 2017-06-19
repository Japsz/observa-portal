

CREATE TABLE IF NOT EXISTS `user` (
  `iduser` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(15),
  `apellido` VARCHAR(15),
  `correo` VARCHAR(40),
  `fnac` VARCHAR(15),
  `gender` VARCHAR(15),
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(16) NOT NULL,
  `tipo` INT(1) UNSIGNED NOT NULL,
  PRIMARY KEY (`iduser`)
);
CREATE TABLE IF NOT EXISTS `admin` (
  `idadmin` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idadmin`)
);
CREATE TABLE IF NOT EXISTS `post` (
  `idpost` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo` INT UNSIGNED NOT NULL,
  `iduser` INT(11) NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idpost`),
  FOREIGN KEY(`iduser`) REFERENCES user(iduser)
);
CREATE TABLE IF NOT EXISTS `tags` (
  `tag` VARCHAR(20) NOT NULL,
  `idtag` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idtag`),
);
CREATE TABLE IF NOT EXISTS `institucion` (
  `idinstitucion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(80) NOT NULL,
  `avatar_pat` MEDIUMTEXT NULL,
  PRIMARY KEY (`idinstitucion`)
);
CREATE TABLE IF NOT EXISTS `observatorio` (
  `idobservatorio` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `maximo` INT NOT NULL,
  `nom` VARCHAR(80) NOT NULL,
  `estado` INT UNSIGNED NOT NULL,
  `avatar_pat` MEDIUMTEXT NULL,
  `idinst` INT UNSIGNED NOT NULL,
  `idmonitor` INT(11),
  PRIMARY KEY (`idobservatorio`),
  FOREIGN KEY(`idinst`) REFERENCES institucion(idinstitucion),
  FOREIGN KEY(`idmonitor`) REFERENCES user(iduser)
);
