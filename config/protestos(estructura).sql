-- Tipos y catálogos
CREATE TABLE `ciudad` (
  `id_ciudad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id_ciudad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `moneda` (
  `id_moneda` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_moneda` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_moneda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `persona` (
  `id_persona` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `pais` varchar(50) DEFAULT NULL,
  `fecha_muerte` date DEFAULT NULL,
  PRIMARY KEY (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sociedad` (
  `id_sociedad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_sociedad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('letracambio','endoso','protesto') NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `rol_nombres` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`,`nombre_rol`),
  CONSTRAINT `rol_nombres_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_letra` (
  `id_tipo_letra` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_tipo_letra`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_plazo` (
  `id_tipo_plazo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dias_plazo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_tipo_plazo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_valor` (
  `id_tipo_valor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_tipo_valor`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_negociacion` (
  `id_tipo_negociacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_tipo_negociacion`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_uso` (
  `id_tipo_uso` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_tipo_uso`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_protesto` (
  `id_tipo_protesto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_tipo_protesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Documentos
CREATE TABLE `letracambio` (
  `id_letra` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_letra` date DEFAULT NULL,
  `fecha_vencimiento` varchar(255) DEFAULT NULL,
  `importe` decimal(10,2) DEFAULT NULL,
  `id_moneda` int(11) DEFAULT NULL,
  `id_tipo_letra` int(11) DEFAULT NULL,
  `id_tipo_plazo` int(11) DEFAULT NULL,
  `id_tipo_valor` int(11) DEFAULT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `texto_indicacion` text DEFAULT NULL,
  `plazo_dias` int(11) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `uso` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_letra`),
  KEY `id_moneda` (`id_moneda`),
  KEY `id_tipo_letra` (`id_tipo_letra`),
  KEY `id_tipo_plazo` (`id_tipo_plazo`),
  KEY `id_tipo_valor` (`id_tipo_valor`),
  KEY `id_ciudad` (`id_ciudad`),
  CONSTRAINT `letracambio_ibfk_1` FOREIGN KEY (`id_moneda`) REFERENCES `moneda` (`id_moneda`),
  CONSTRAINT `letracambio_ibfk_2` FOREIGN KEY (`id_tipo_letra`) REFERENCES `tipo_letra` (`id_tipo_letra`),
  CONSTRAINT `letracambio_ibfk_3` FOREIGN KEY (`id_tipo_plazo`) REFERENCES `tipo_plazo` (`id_tipo_plazo`),
  CONSTRAINT `letracambio_ibfk_4` FOREIGN KEY (`id_tipo_valor`) REFERENCES `tipo_valor` (`id_tipo_valor`),
  CONSTRAINT `letracambio_ibfk_5` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `endoso` (
  `id_endoso` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_endoso` date DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `id_moneda` int(11) DEFAULT NULL,
  `id_tipo_negociacion` int(11) DEFAULT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `id_tipo_valor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_endoso`),
  KEY `id_moneda` (`id_moneda`),
  KEY `id_tipo_negociacion` (`id_tipo_negociacion`),
  KEY `id_ciudad` (`id_ciudad`),
  KEY `endoso_ibfk_4` (`id_tipo_valor`),
  CONSTRAINT `endoso_ibfk_1` FOREIGN KEY (`id_moneda`) REFERENCES `moneda` (`id_moneda`),
  CONSTRAINT `endoso_ibfk_2` FOREIGN KEY (`id_tipo_negociacion`) REFERENCES `tipo_negociacion` (`id_tipo_negociacion`),
  CONSTRAINT `endoso_ibfk_3` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`),
  CONSTRAINT `endoso_ibfk_4` FOREIGN KEY (`id_tipo_valor`) REFERENCES `tipo_valor` (`id_tipo_valor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `protesto` (
  `id_protesto` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_protesto` date DEFAULT NULL,
  `importe` decimal(10,2) DEFAULT NULL,
  `id_moneda` int(11) DEFAULT NULL,
  `introduccion` varchar(255) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fuente` varchar(255) DEFAULT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `protocolo` varchar(100) DEFAULT NULL,
  `pagina` varchar(50) DEFAULT NULL,
  `texto_indicacion` text DEFAULT NULL,
  `texto_abono` text DEFAULT NULL,
  `id_tipo_letra` int(11) DEFAULT NULL,
  `id_tipo_protesto` int(11) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  PRIMARY KEY (`id_protesto`),
  KEY `id_moneda` (`id_moneda`),
  KEY `id_ciudad` (`id_ciudad`),
  KEY `id_tipo_letra` (`id_tipo_letra`),
  KEY `id_tipo_protesto` (`id_tipo_protesto`),
  CONSTRAINT `protesto_ibfk_1` FOREIGN KEY (`id_moneda`) REFERENCES `moneda` (`id_moneda`),
  CONSTRAINT `protesto_ibfk_2` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`),
  CONSTRAINT `protesto_ibfk_3` FOREIGN KEY (`id_tipo_letra`) REFERENCES `tipo_letra` (`id_tipo_letra`),
  CONSTRAINT `protesto_ibfk_4` FOREIGN KEY (`id_tipo_protesto`) REFERENCES `tipo_protesto` (`id_tipo_protesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Relaciones
CREATE TABLE `letra_endoso` (
  `id_letra` int(11) NOT NULL,
  `id_endoso` int(11) NOT NULL,
  PRIMARY KEY (`id_letra`,`id_endoso`),
  KEY `id_endoso` (`id_endoso`),
  CONSTRAINT `letra_endoso_ibfk_1` FOREIGN KEY (`id_letra`) REFERENCES `letracambio` (`id_letra`),
  CONSTRAINT `letra_endoso_ibfk_2` FOREIGN KEY (`id_endoso`) REFERENCES `endoso` (`id_endoso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `protesto_letra` (
  `id_letra` int(11) NOT NULL,
  `id_protesto` int(11) NOT NULL,
  PRIMARY KEY (`id_letra`,`id_protesto`),
  KEY `id_protesto` (`id_protesto`),
  CONSTRAINT `protesto_letra_ibfk_1` FOREIGN KEY (`id_letra`) REFERENCES `letracambio` (`id_letra`),
  CONSTRAINT `protesto_letra_ibfk_2` FOREIGN KEY (`id_protesto`) REFERENCES `protesto` (`id_protesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `letra_roles` (
  `id_letra_rol` int(11) NOT NULL AUTO_INCREMENT,
  `id_letra` int(11) NOT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_letra_rol`),
  UNIQUE KEY `uq_letra_rol_persona` (`id_letra`,`id_rol`,`id_persona`),
  KEY `id_rol` (`id_rol`),
  KEY `id_ciudad` (`id_ciudad`),
  KEY `id_persona` (`id_persona`),
  CONSTRAINT `letra_roles_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `letra_roles_ibfk_2` FOREIGN KEY (`id_letra`) REFERENCES `letracambio` (`id_letra`) ON DELETE CASCADE,
  CONSTRAINT `letra_roles_ibfk_3` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`) ON DELETE SET NULL,
  CONSTRAINT `letra_roles_ibfk_4` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `endoso_roles` (
  `id_endoso_rol` int(11) NOT NULL AUTO_INCREMENT,
  `id_endoso` int(11) NOT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_endoso_rol`),
  UNIQUE KEY `uq_endoso_rol_persona` (`id_endoso`,`id_rol`,`id_persona`),
  KEY `id_rol` (`id_rol`),
  KEY `id_ciudad` (`id_ciudad`),
  KEY `id_persona` (`id_persona`),
  CONSTRAINT `endoso_roles_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `endoso_roles_ibfk_2` FOREIGN KEY (`id_endoso`) REFERENCES `endoso` (`id_endoso`) ON DELETE CASCADE,
  CONSTRAINT `endoso_roles_ibfk_3` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`) ON DELETE SET NULL,
  CONSTRAINT `endoso_roles_ibfk_4` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `protesto_roles` (
  `id_protesto_rol` int(11) NOT NULL AUTO_INCREMENT,
  `id_protesto` int(11) NOT NULL,
  `id_ciudad` int(11) DEFAULT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_protesto_rol`),
  UNIQUE KEY `uq_protesto_rol_persona` (`id_protesto`,`id_rol`,`id_persona`),
  KEY `id_rol` (`id_rol`),
  KEY `id_ciudad` (`id_ciudad`),
  KEY `id_persona` (`id_persona`),
  CONSTRAINT `protesto_roles_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `protesto_roles_ibfk_2` FOREIGN KEY (`id_protesto`) REFERENCES `protesto` (`id_protesto`) ON DELETE CASCADE,
  CONSTRAINT `protesto_roles_ibfk_3` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`) ON DELETE SET NULL,
  CONSTRAINT `protesto_roles_ibfk_4` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Rutas y cambios
CREATE TABLE `ruta` (
  `id_ruta` int(11) NOT NULL AUTO_INCREMENT,
  `id_ciudad_origen` int(11) NOT NULL,
  `id_ciudad_destino` int(11) NOT NULL,
  PRIMARY KEY (`id_ruta`),
  KEY `id_ciudad_origen` (`id_ciudad_origen`),
  KEY `id_ciudad_destino` (`id_ciudad_destino`),
  CONSTRAINT `ruta_ibfk_1` FOREIGN KEY (`id_ciudad_origen`) REFERENCES `ciudad` (`id_ciudad`),
  CONSTRAINT `ruta_ibfk_2` FOREIGN KEY (`id_ciudad_destino`) REFERENCES `ciudad` (`id_ciudad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `moneda_ruta` (
  `id_ruta` int(11) NOT NULL,
  `id_moneda_local` int(11) NOT NULL,
  `id_moneda_extranjera` int(11) NOT NULL,
  `tasa_cambio` decimal(8,7) DEFAULT NULL,
  PRIMARY KEY (`id_ruta`,`id_moneda_local`,`id_moneda_extranjera`),
  KEY `id_moneda_local` (`id_moneda_local`),
  KEY `id_moneda_extranjera` (`id_moneda_extranjera`),
  CONSTRAINT `moneda_ruta_ibfk_1` FOREIGN KEY (`id_ruta`) REFERENCES `ruta` (`id_ruta`),
  CONSTRAINT `moneda_ruta_ibfk_2` FOREIGN KEY (`id_moneda_local`) REFERENCES `moneda` (`id_moneda`),
  CONSTRAINT `moneda_ruta_ibfk_3` FOREIGN KEY (`id_moneda_extranjera`) REFERENCES `moneda` (`id_moneda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Personas y sociedades
CREATE TABLE `persona_sociedad` (
  `id_persona` int(11) NOT NULL,
  `id_sociedad` int(11) NOT NULL,
  `relacion` varchar(50) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  PRIMARY KEY (`id_persona`,`id_sociedad`),
  KEY `id_sociedad` (`id_sociedad`),
  CONSTRAINT `persona_sociedad_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `persona_sociedad_ibfk_2` FOREIGN KEY (`id_sociedad`) REFERENCES `sociedad` (`id_sociedad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;