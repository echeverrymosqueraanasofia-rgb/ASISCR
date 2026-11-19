-- =====================================================================
-- BASE DE DATOS ASISCR - CONTROL DE ASISTENCIA ESCOLAR CRISTO REY
-- COMPATIBILIDAD 100% IDÉNTICA ENTRE CLOUD FIRESTORE Y MYSQL LOCAL
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `asiscr` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `asiscr`;

-- 1. Tabla de Usuarios con roles y permisos modulares (RBAC)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `tipo` ENUM('super_user', 'directivo', 'docente', 'estudiantes', 'acudientes', 'porteria') NOT NULL,
  `documento` VARCHAR(50) NOT NULL UNIQUE,
  `contrasena` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `grado` VARCHAR(20) DEFAULT NULL,
  `modulos_permitidos` TEXT DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Grados
CREATE TABLE IF NOT EXISTS `grados` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL,
  `director_grupo` VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Materias
CREATE TABLE IF NOT EXISTS `materias` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `grado_id` VARCHAR(50) NOT NULL,
  `docente_id` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (`grado_id`) REFERENCES `grados`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS `estudiantes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `grado` VARCHAR(50) NOT NULL,
  `documento` VARCHAR(50) NOT NULL UNIQUE,
  `nombre_acudiente` VARCHAR(150) DEFAULT NULL,
  `telefono_acudiente` VARCHAR(50) DEFAULT NULL,
  `id_padre` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabla de Asistencias
CREATE TABLE IF NOT EXISTS `asistencias` (
  `id` VARCHAR(100) PRIMARY KEY,
  `estudiante_id` VARCHAR(50) NOT NULL,
  `materia_id` VARCHAR(50) NOT NULL,
  `fecha` DATE NOT NULL,
  `estado` ENUM('Presente', 'Tarde', 'Ausente') NOT NULL,
  `registrado_por` VARCHAR(150) NOT NULL,
  `observaciones` TEXT DEFAULT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `asistencia_unica` (`materia_id`, `fecha`, `estudiante_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabla de Horarios de Clase
CREATE TABLE IF NOT EXISTS `horarios` (
  `id` VARCHAR(50) PRIMARY KEY,
  `grado_id` VARCHAR(50) NOT NULL,
  `grado_nombre` VARCHAR(50) NOT NULL,
  `dia` ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes') NOT NULL,
  `hora_inicio` VARCHAR(10) NOT NULL,
  `hora_fin` VARCHAR(10) NOT NULL,
  `materia_nombre` VARCHAR(100) NOT NULL,
  `docente_nombre` VARCHAR(150) NOT NULL,
  `aula` VARCHAR(100) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabla de Avisos Docente / Celador
CREATE TABLE IF NOT EXISTS `avisos` (
  `id` VARCHAR(50) PRIMARY KEY,
  `categoria` ENUM('autorizacion_salida', 'llegada_acudiente', 'llegada_tardia', 'alerta_urgente', 'comunicado_general') NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `emisor_id` VARCHAR(50) NOT NULL,
  `emisor_nombre` VARCHAR(150) NOT NULL,
  `emisor_rol` VARCHAR(50) NOT NULL,
  `destinatario_rol` VARCHAR(50) NOT NULL,
  `estudiante_nombre` VARCHAR(150) DEFAULT NULL,
  `grado` VARCHAR(50) DEFAULT NULL,
  `prioridad` ENUM('normal', 'alta', 'urgente') DEFAULT 'normal',
  `estado` ENUM('pendiente', 'atendido', 'resuelto') DEFAULT 'pendiente',
  `respuesta` TEXT DEFAULT NULL,
  `atendido_por` VARCHAR(150) DEFAULT NULL,
  `fecha` VARCHAR(30) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- DATOS INICIALES POR DEFECTO (IDÉNTICOS A FIRESTORE)
-- CLAVE: 123456 PARA TODOS
-- =====================================================================

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `tipo`, `documento`, `contrasena`, `telefono`, `grado`, `modulos_permitidos`, `activo`) VALUES
('usr_super_1', 'Ing. J. F. Cortez', 'jfcortez@unitecnica.net', 'super_user', '10001000', '123456', '3104567890', NULL, '["gestion_usuarios","admin_base_datos","consulta_asistencia","toma_asistencia","crear_horarios","avisos_docente_celador","porteria_scanner","expediente_estudiante","mi_horario","gestion_grupos","gestion_estudiantes"]', 1),
('usr_dir_1', 'Dr. Roberto Silva (Rector)', 'rectoria@cristorey.edu.co', 'directivo', '20002000', '123456', '3117894561', NULL, '["crear_horarios","consulta_asistencia","avisos_docente_celador","expediente_estudiante","mi_horario"]', 1),
('usr_doc_1', 'Carlos Mendoza', 'carlos.mendoza@cristorey.edu.co', 'docente', '12345678', '123456', '3129876543', '11-A', '["toma_asistencia","avisos_docente_celador","consulta_asistencia","mi_horario"]', 1),
('usr_doc_2', 'Sandra Gómez', 'sandra.gomez@cristorey.edu.co', 'docente', '87654321', '123456', '3131234567', '11-B', '["toma_asistencia","avisos_docente_celador","consulta_asistencia","mi_horario"]', 1),
('usr_por_1', 'José Quintero (Guardia Portería)', 'porteria@cristorey.edu.co', 'porteria', '30003000', '123456', '3145678901', NULL, '["porteria_scanner","avisos_docente_celador","consulta_asistencia"]', 1),
('usr_est_1', 'Ana Martínez', 'ana.martinez@estudiantes.edu.co', 'estudiantes', '10987654', '123456', '3156789012', '11-A', '["expediente_estudiante","mi_horario","avisos_docente_celador"]', 1),
('usr_acu_1', 'Marta Elena Betancur', 'marta.betancur@gmail.com', 'acudientes', '40004000', '123456', '3167890123', NULL, '["expediente_estudiante","mi_horario","avisos_docente_celador"]', 1),
('usr_est_2', 'Juan Camilo', NULL, 'estudiantes', '10987655', '123456', NULL, '11-A', '["expediente_estudiante","mi_horario"]', 1),
('usr_est_3', 'Sebastián Beltrán', NULL, 'estudiantes', '10987656', '123456', NULL, '11-A', '["expediente_estudiante","mi_horario"]', 1),
('usr_est_4', 'Camilo Vargas', NULL, 'estudiantes', '10987657', '123456', NULL, '11-A', '["expediente_estudiante","mi_horario"]', 1)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`), `contrasena` = VALUES(`contrasena`);

INSERT INTO `grados` (`id`, `nombre`, `director_grupo`) VALUES
('gr_11a', '11-A', 'Carlos Mendoza'),
('gr_11b', '11-B', 'Sandra Gómez'),
('gr_10a', '10-A', 'Roberto Silva'),
('gr_10b', '10-B', 'Elena Restrepo')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `materias` (`id`, `nombre`, `grado_id`, `docente_id`) VALUES
('mat_mat_11a', 'Matemáticas', 'gr_11a', 'usr_doc_1'),
('mat_bio_11a', 'Biología', 'gr_11a', 'usr_doc_2'),
('mat_esp_11a', 'Español', 'gr_11a', 'usr_doc_1'),
('mat_art_11a', 'Artes', 'gr_11a', 'usr_doc_2'),
('mat_his_11a', 'Historia', 'gr_11a', 'usr_doc_1'),
('mat_mat_11b', 'Matemáticas', 'gr_11b', 'usr_doc_1'),
('mat_bio_10a', 'Biología', 'gr_10a', 'usr_doc_2')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `estudiantes` (`id`, `nombre`, `grado`, `documento`, `nombre_acudiente`, `telefono_acudiente`) VALUES
('est_1', 'Ana Martínez', '11-A', '10987654', 'Marta Elena Betancur', '3167890123'),
('est_2', 'Juan Camilo', '11-A', '10987655', 'Gonzalo Camilo', '3101112233'),
('est_3', 'Sebastián Beltrán', '11-A', '10987656', 'Patricia Beltrán', '3144445566'),
('est_4', 'Camilo Vargas', '11-A', '10987657', 'Hernán Vargas', '3157778899'),
('est_5', 'Laura Sofía Ruiz', '11-A', '10987658', 'Gloria Ruiz', '3182223344'),
('est_6', 'Mateo Hernández', '11-A', '10987659', 'Jorge Hernández', '3119998877'),
('est_7', 'Valentina Gómez', '11-A', '10987660', 'Claudia Gómez', '3203334455'),
('est_8', 'Santiago Díaz', '11-A', '10987661', 'Fernando Díaz', '3176665544')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `horarios` (`id`, `grado_id`, `grado_nombre`, `dia`, `hora_inicio`, `hora_fin`, `materia_nombre`, `docente_nombre`, `aula`) VALUES
('hor_1', 'gr_11a', '11-A', 'Lunes', '07:00', '08:30', 'Matemáticas', 'Carlos Mendoza', 'Salón 201'),
('hor_2', 'gr_11a', '11-A', 'Lunes', '08:30', '10:00', 'Biología', 'Sandra Gómez', 'Laboratorio de Ciencias'),
('hor_3', 'gr_11a', '11-A', 'Martes', '07:00', '09:00', 'Español & Literatura', 'Carlos Mendoza', 'Salón 201'),
('hor_4', 'gr_11a', '11-A', 'Miércoles', '07:00', '08:30', 'Historia y Geografía', 'Carlos Mendoza', 'Salón 201'),
('hor_5', 'gr_11a', '11-A', 'Jueves', '09:30', '11:00', 'Artes Plásticas', 'Sandra Gómez', 'Taller de Artes'),
('hor_6', 'gr_11a', '11-A', 'Viernes', '07:00', '08:30', 'Matemáticas Avanzadas', 'Carlos Mendoza', 'Salón 201'),
('hor_7', 'gr_10a', '10-A', 'Lunes', '07:00', '08:30', 'Biología General', 'Sandra Gómez', 'Salón 102')
ON DUPLICATE KEY UPDATE `materia_nombre` = VALUES(`materia_nombre`);

INSERT INTO `avisos` (`id`, `categoria`, `titulo`, `mensaje`, `emisor_id`, `emisor_nombre`, `emisor_rol`, `destinatario_rol`, `estudiante_nombre`, `grado`, `prioridad`, `estado`, `respuesta`, `atendido_por`, `fecha`) VALUES
('av_1', 'autorizacion_salida', 'Autorización Salida Médica: Ana Martínez (11-A)', 'La estudiante Ana Martínez cuenta con permiso firmado de coordinación para retirarse a las 10:30 am con su acudiente Marta Elena Betancur.', 'usr_doc_1', 'Carlos Mendoza', 'docente', 'porteria', 'Ana Martínez', '11-A', 'alta', 'pendiente', NULL, NULL, '2026-04-15 08:15'),
('av_2', 'llegada_acudiente', 'Acudiente en Portería para Entrega de Documentos', 'Se encuentra en la reja principal la señora Patricia Beltrán solicitando hablar con el director de grupo de 11-A.', 'usr_por_1', 'José Quintero (Guardia Portería)', 'porteria', 'docente', 'Sebastián Beltrán', '11-A', 'normal', 'atendido', 'Enterado, bajo en 5 minutos al descanso.', 'Carlos Mendoza', '2026-04-15 09:20'),
('av_3', 'llegada_tardia', 'Ingreso Tardío Registrado en Portería', 'El estudiante Camilo Vargas ingresó a las 07:25 AM. Reportó congestión vehicular en el viaducto.', 'usr_por_1', 'José Quintero (Guardia Portería)', 'porteria', 'docente', 'Camilo Vargas', '11-A', 'normal', 'resuelto', NULL, 'Carlos Mendoza', '2026-04-15 07:26'),
('av_4', 'comunicado_general', 'Jornada Pedagógica y Cierre de Puertas 12:00 PM', 'Estimado cuerpo docente y celaduría: Por reunión de directivos, la salida de todos los grados se efectuará hoy a las 12:00 PM.', 'usr_dir_1', 'Dr. Roberto Silva (Rector)', 'directivo', 'todos', NULL, NULL, 'alta', 'pendiente', NULL, NULL, '2026-04-14 06:45')
ON DUPLICATE KEY UPDATE `titulo` = VALUES(`titulo`);

INSERT INTO `asistencias` (`id`, `estudiante_id`, `materia_id`, `fecha`, `estado`, `registrado_por`, `observaciones`) VALUES
('att_p8_1', 'est_1', 'mat_mat_11a', '2026-04-15', 'Presente', 'Carlos Mendoza', ''),
('att_p8_2', 'est_2', 'mat_mat_11a', '2026-04-15', 'Presente', 'Carlos Mendoza', ''),
('att_p8_3', 'est_3', 'mat_mat_11a', '2026-04-15', 'Tarde', 'Carlos Mendoza', 'Ingreso tardío por congestión vehicular'),
('att_p8_4', 'est_4', 'mat_mat_11a', '2026-04-15', 'Ausente', 'Carlos Mendoza', 'Falta sin justificar')
ON DUPLICATE KEY UPDATE `estado` = VALUES(`estado`);
