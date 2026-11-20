-- ==============================================================================
-- SISTEMA ASISCR - CONTROL DE ASISTENCIA ESCOLAR
-- Base de Datos Relacional MySQL / MariaDB para PHP PDO
-- Institución Educativa Cristo Rey - Dosquebradas
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `asiscr_db` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `asiscr_db`;

-- Deshabilitar comprobación de claves foráneas temporalmente para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `asistencias`;
DROP TABLE IF EXISTS `materias`;
DROP TABLE IF EXISTS `estudiantes`;
DROP TABLE IF EXISTS `grados`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios (Docentes, Directivos, Estudiantes, Acudientes)
-- ------------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `documento` VARCHAR(20) NOT NULL UNIQUE,
  `nombre` VARCHAR(120) NOT NULL,
  `tipo` ENUM('docente', 'directivo', 'estudiante', 'padre') NOT NULL DEFAULT 'estudiante',
  `contrasena` VARCHAR(255) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_usuarios_doc` (`documento`),
  INDEX `idx_usuarios_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA: grados (Grupos escolares)
-- ------------------------------------------------------------------------------
CREATE TABLE `grados` (
  `id` VARCHAR(20) PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL,
  `director_grupo` VARCHAR(120) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: materias (Asignaturas dictadas por docentes)
-- ------------------------------------------------------------------------------
CREATE TABLE `materias` (
  `id` VARCHAR(30) PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `grado_id` VARCHAR(20) NOT NULL,
  `docente_id` INT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`grado_id`) REFERENCES `grados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_materias_grado` (`grado_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: estudiantes (Matriculados en los grados)
-- ------------------------------------------------------------------------------
CREATE TABLE `estudiantes` (
  `id` VARCHAR(20) PRIMARY KEY,
  `nombre` VARCHAR(120) NOT NULL,
  `documento` VARCHAR(20) NOT NULL UNIQUE,
  `grado_id` VARCHAR(20) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`grado_id`) REFERENCES `grados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_estudiantes_doc` (`documento`),
  INDEX `idx_estudiantes_grado` (`grado_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: asistencias (Registros diarios de asistencia)
-- ------------------------------------------------------------------------------
CREATE TABLE `asistencias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudiante_id` VARCHAR(20) NOT NULL,
  `materia_id` VARCHAR(30) NOT NULL,
  `fecha` DATE NOT NULL,
  `estado` ENUM('Presente', 'Tarde', 'Ausente') NOT NULL DEFAULT 'Presente',
  `registrado_por` VARCHAR(120) NOT NULL,
  `observaciones` TEXT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_estudiante_materia_fecha` (`estudiante_id`, `materia_id`, `fecha`),
  INDEX `idx_asistencias_fecha` (`fecha`),
  INDEX `idx_asistencias_materia` (`materia_id`),
  INDEX `idx_asistencias_estudiante` (`estudiante_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEMILLA)
-- ==============================================================================

-- 1. Usuarios del sistema
INSERT INTO `usuarios` (`id`, `documento`, `nombre`, `tipo`, `contrasena`) VALUES
(1, '12345678', 'Carlos Mendoza', 'docente', '123456'),
(2, '87654321', 'Sandra Gómez', 'docente', '123456'),
(3, '10987654', 'Ana Martínez', 'estudiante', '123456'),
(4, '10987655', 'Juan Camilo', 'estudiante', '123456'),
(5, '10987656', 'Sebastián Beltrán', 'estudiante', '123456'),
(6, '10987657', 'Camilo Vargas', 'estudiante', '123456'),
(7, '10987658', 'Laura Sofia Ruiz', 'estudiante', '123456');

-- 2. Grados escolares
INSERT INTO `grados` (`id`, `nombre`, `director_grupo`) VALUES
('gr_11a', '11-A', 'Carlos Mendoza'),
('gr_11b', '11-B', 'Sandra Gómez'),
('gr_10a', '10-A', 'Roberto Silva'),
('gr_10b', '10-B', 'Elena Restrepo');

-- 3. Materias
INSERT INTO `materias` (`id`, `nombre`, `grado_id`, `docente_id`) VALUES
('mat_mat_11a', 'Matemáticas', 'gr_11a', 1),
('mat_bio_11a', 'Biología', 'gr_11a', 2),
('mat_esp_11a', 'Español', 'gr_11a', 1),
('mat_art_11a', 'Artes', 'gr_11a', 2),
('mat_his_11a', 'Historia', 'gr_11a', 1),
('mat_mat_11b', 'Matemáticas', 'gr_11b', 1),
('mat_bio_10a', 'Biología', 'gr_10a', 2);

-- 4. Estudiantes
INSERT INTO `estudiantes` (`id`, `nombre`, `documento`, `grado_id`) VALUES
('est_1', 'Ana Martínez', '10987654', 'gr_11a'),
('est_2', 'Juan Camilo', '10987655', 'gr_11a'),
('est_3', 'Sebastián Beltrán', '10987656', 'gr_11a'),
('est_4', 'Camilo Vargas', '10987657', 'gr_11a'),
('est_5', 'Laura Sofia Ruiz', '10987658', 'gr_11a'),
('est_6', 'Mateo Hernández', '10987659', 'gr_11a'),
('est_7', 'Valentina Gómez', '10987660', 'gr_11a'),
('est_8', 'Santiago Díaz', '10987661', 'gr_11a');

-- 5. Asistencias de ejemplo
INSERT INTO `asistencias` (`estudiante_id`, `materia_id`, `fecha`, `estado`, `registrado_por`, `observaciones`) VALUES
('est_1', 'mat_mat_11a', '2026-04-01', 'Presente', 'Carlos Mendoza', NULL),
('est_1', 'mat_mat_11a', '2026-04-02', 'Ausente', 'Carlos Mendoza', 'Falta no justificada'),
('est_1', 'mat_mat_11a', '2026-04-03', 'Presente', 'Carlos Mendoza', NULL),
('est_1', 'mat_mat_11a', '2026-04-06', 'Tarde', 'Carlos Mendoza', 'Llegó 15 min tarde'),
('est_1', 'mat_mat_11a', '2026-04-07', 'Presente', 'Carlos Mendoza', NULL),
('est_2', 'mat_mat_11a', '2026-04-01', 'Presente', 'Carlos Mendoza', NULL),
('est_2', 'mat_mat_11a', '2026-04-02', 'Presente', 'Carlos Mendoza', NULL),
('est_3', 'mat_mat_11a', '2026-04-01', 'Tarde', 'Carlos Mendoza', 'Retraso de ruta'),
('est_4', 'mat_mat_11a', '2026-04-01', 'Ausente', 'Carlos Mendoza', 'Cita médica justificada');
