export type UserRole = 
  | 'super_user' 
  | 'directivo' 
  | 'docente' 
  | 'estudiantes' 
  | 'acudientes' 
  | 'porteria'
  // Compatibilidad con registros existentes:
  | 'estudiante' 
  | 'padre';

export type AppModule = 
  | 'gestion_usuarios'
  | 'gestion_grupos'
  | 'gestion_estudiantes'
  | 'avisos_docente_celador'
  | 'consulta_asistencia'
  | 'toma_asistencia'
  | 'crear_horarios'
  | 'admin_base_datos'
  | 'porteria_scanner'
  | 'expediente_estudiante'
  | 'mi_horario';

export interface ModuleDefinition {
  id: AppModule;
  label: string;
  description: string;
  category: 'Administración' | 'Académico' | 'Seguridad & Acceso' | 'Comunidad';
}

export const SYSTEM_MODULES: ModuleDefinition[] = [
  { id: 'gestion_usuarios', label: 'Gestión de Usuarios y Roles', description: 'Creación de cuentas, asignación de roles y modulación de permisos', category: 'Administración' },
  { id: 'admin_base_datos', label: 'Administración de Base de Datos', description: 'Exportar respaldo JSON, restaurar, sincronizar Firestore y diagnóstico', category: 'Administración' },
  { id: 'consulta_asistencia', label: 'Consulta de Asistencia', description: 'Filtros avanzados por grado, fecha, alumno y exportación de reportes', category: 'Académico' },
  { id: 'toma_asistencia', label: 'Toma de Asistencia', description: 'Registro diario y por materia de asistencia del estudiantado', category: 'Académico' },
  { id: 'crear_horarios', label: 'Creación y Gestión de Horarios', description: 'Planificación de bloques horarios, asignación de docentes y aulas', category: 'Académico' },
  { id: 'avisos_docente_celador', label: 'Avisos Docente / Celador', description: 'Canal de comunicación para retiros, visitas de acudientes y novedades de portería', category: 'Seguridad & Acceso' },
  { id: 'porteria_scanner', label: 'Control de Portería & Entrada', description: 'Registro de llegadas tardías y control de ingreso/salida en puerta', category: 'Seguridad & Acceso' },
  { id: 'expediente_estudiante', label: 'Expediente Estudiantil', description: 'Historial individual de inasistencias y calendario de asistencia', category: 'Comunidad' },
  { id: 'mi_horario', label: 'Mi Horario de Clases', description: 'Visualización de clases semanales programadas por salón y hora', category: 'Comunidad' },
  { id: 'gestion_grupos', label: 'Gestión de Grupos', description: 'Crear, editar y organizar los grupos de la institución', category: 'Administración' },
  { id: 'gestion_estudiantes', label: 'Gestión de Estudiantes', description: 'Registrar estudiantes manualmente o importar un archivo CSV', category: 'Administración' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, AppModule[]> = {
  super_user: [
    'gestion_usuarios',
    'admin_base_datos',
    'consulta_asistencia',
    'toma_asistencia',
    'crear_horarios',
    'avisos_docente_celador',
    'porteria_scanner',
    'expediente_estudiante',
    'mi_horario',
    'gestion_grupos',
    'gestion_estudiantes'
  ],
  directivo: [
    'crear_horarios',
    'consulta_asistencia',
    'avisos_docente_celador',
    'expediente_estudiante',
    'mi_horario'
  ],
  docente: [
    'toma_asistencia',
    'avisos_docente_celador',
    'consulta_asistencia',
    'mi_horario'
  ],
  porteria: [
    'porteria_scanner',
    'avisos_docente_celador',
    'consulta_asistencia'
  ],
  estudiantes: [
    'expediente_estudiante',
    'mi_horario',
    'avisos_docente_celador'
  ],
  acudientes: [
    'expediente_estudiante',
    'mi_horario',
    'avisos_docente_celador'
  ],
  estudiante: [
    'expediente_estudiante',
    'mi_horario',
    'avisos_docente_celador'
  ],
  padre: [
    'expediente_estudiante',
    'mi_horario',
    'avisos_docente_celador'
  ],
};

export interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  tipo: UserRole;
  documento: string; // Cédula, tarjeta de identidad o código
  contrasena: string;
  modulosPermitidos?: AppModule[];
  grado?: string; // Para estudiantes o directores de grado
  telefono?: string;
  activo?: boolean;
  creadoEn?: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  grado: string; // e.g. '11-A'
  documento: string;
  id_padre?: string;
  nombre_acudiente?: string;
  telefono_acudiente?: string;
  avatarUrl?: string;
}

export interface Grado {
  id: string;
  nombre: string; // e.g. '11-A'
  director_grupo: string; // Nombre del docente director
}

export interface Materia {
  id: string;
  nombre: string; // e.g. 'Matemáticas'
  grado_id: string;
  docente_id: string;
}

export type AttendanceStatus = 'Presente' | 'Tarde' | 'Ausente';

export interface Asistencia {
  id: string;
  estudiante_id: string;
  materia_id: string;
  fecha: string; // YYYY-MM-DD
  estado: AttendanceStatus;
  registrado_por: string;
  observaciones?: string;
}

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface HorarioClase {
  id: string;
  grado_id: string;
  grado_nombre: string;
  dia: DiaSemana;
  hora_inicio: string; // e.g. '07:00'
  hora_fin: string;    // e.g. '08:30'
  materia_nombre: string;
  docente_nombre: string;
  aula: string; // e.g. 'Salón 201' o 'Laboratorio 1'
}

export type AvisoCategoria = 
  | 'autorizacion_salida' 
  | 'llegada_acudiente' 
  | 'llegada_tardia' 
  | 'alerta_urgente' 
  | 'comunicado_general';

export interface AvisoDocenteCelador {
  id: string;
  categoria: AvisoCategoria;
  titulo: string;
  mensaje: string;
  emisor_id: string;
  emisor_nombre: string;
  emisor_rol: UserRole;
  destinatario_rol: 'todos' | 'docente' | 'porteria' | 'directivo';
  estudiante_nombre?: string;
  grado?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  estado: 'pendiente' | 'atendido' | 'resuelto';
  respuesta?: string;
  atendido_por?: string;
  fecha: string; // YYYY-MM-DD HH:mm
}

export type AppView = 
  | 'splash'
  | 'login_docente'
  | 'login_directivo'
  | 'login_estudiante'
  | 'login_super'
  | 'select_grado'
  | 'toma_asistencia'
  | 'expediente_estudiante'
  | 'gestion_usuarios'
  | 'gestion_grupos'
  | 'gestion_estudiantes'
  | 'avisos_docente_celador'
  | 'consulta_asistencia'
  | 'crear_horarios'
  | 'admin_base_datos'
  | 'porteria_scanner'
  | 'mi_horario'
  | 'contact'
  | 'php_inspector'
  | 'firebase_inspector';

export type EngineMode = 'php' | 'firebase';
