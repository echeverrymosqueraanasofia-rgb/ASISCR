import { 
  Usuario, 
  Estudiante, 
  Grado, 
  Materia, 
  Asistencia, 
  HorarioClase, 
  AvisoDocenteCelador,
  DEFAULT_ROLE_PERMISSIONS 
} from '../types';

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'usr_super_1',
    nombre: 'Ing. J. F. Cortez',
    email: 'jfcortez@unitecnica.net',
    tipo: 'super_user',
    documento: '10001000',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.super_user,
    telefono: '3104567890',
    activo: true,
    creadoEn: '2026-01-15'
  },
  {
    id: 'usr_dir_1',
    nombre: 'Dr. Roberto Silva (Rector)',
    email: 'rectoria@cristorey.edu.co',
    tipo: 'directivo',
    documento: '20002000',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.directivo,
    telefono: '3117894561',
    activo: true,
    creadoEn: '2026-01-15'
  },
  {
    id: 'usr_doc_1',
    nombre: 'Carlos Mendoza',
    email: 'carlos.mendoza@cristorey.edu.co',
    tipo: 'docente',
    documento: '12345678',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.docente,
    grado: '11-A',
    telefono: '3129876543',
    activo: true,
    creadoEn: '2026-01-20'
  },
  {
    id: 'usr_doc_2',
    nombre: 'Sandra Gómez',
    email: 'sandra.gomez@cristorey.edu.co',
    tipo: 'docente',
    documento: '87654321',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.docente,
    grado: '11-B',
    telefono: '3131234567',
    activo: true,
    creadoEn: '2026-01-20'
  },
  {
    id: 'usr_por_1',
    nombre: 'José Quintero (Guardia Portería)',
    email: 'porteria@cristorey.edu.co',
    tipo: 'porteria',
    documento: '30003000',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.porteria,
    telefono: '3145678901',
    activo: true,
    creadoEn: '2026-02-01'
  },
  {
    id: 'usr_est_1',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@estudiantes.edu.co',
    tipo: 'estudiantes',
    documento: '10987654',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.estudiantes,
    grado: '11-A',
    telefono: '3156789012',
    activo: true,
    creadoEn: '2026-02-01'
  },
  {
    id: 'usr_acu_1',
    nombre: 'Marta Elena Betancur (Acudiente)',
    email: 'marta.betancur@gmail.com',
    tipo: 'acudientes',
    documento: '40004000',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.acudientes,
    telefono: '3167890123',
    activo: true,
    creadoEn: '2026-02-05'
  },
  {
    id: 'usr_est_2',
    nombre: 'Juan Camilo',
    tipo: 'estudiantes',
    documento: '10987655',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.estudiantes,
    grado: '11-A',
    activo: true,
    creadoEn: '2026-02-01'
  },
  {
    id: 'usr_est_3',
    nombre: 'Sebastián Beltrán',
    tipo: 'estudiantes',
    documento: '10987656',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.estudiantes,
    grado: '11-A',
    activo: true,
    creadoEn: '2026-02-01'
  },
  {
    id: 'usr_est_4',
    nombre: 'Camilo Vargas',
    tipo: 'estudiantes',
    documento: '10987657',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.estudiantes,
    grado: '11-A',
    activo: true,
    creadoEn: '2026-02-01'
  },
];

export const INITIAL_GRADOS: Grado[] = [
  { id: 'gr_11a', nombre: '11-A', director_grupo: 'Carlos Mendoza' },
  { id: 'gr_11b', nombre: '11-B', director_grupo: 'Sandra Gómez' },
  { id: 'gr_10a', nombre: '10-A', director_grupo: 'Roberto Silva' },
  { id: 'gr_10b', nombre: '10-B', director_grupo: 'Elena Restrepo' },
];

export const INITIAL_MATERIAS: Materia[] = [
  { id: 'mat_mat_11a', nombre: 'Matemáticas', grado_id: 'gr_11a', docente_id: 'usr_doc_1' },
  { id: 'mat_bio_11a', nombre: 'Biología', grado_id: 'gr_11a', docente_id: 'usr_doc_2' },
  { id: 'mat_esp_11a', nombre: 'Español', grado_id: 'gr_11a', docente_id: 'usr_doc_1' },
  { id: 'mat_art_11a', nombre: 'Artes', grado_id: 'gr_11a', docente_id: 'usr_doc_2' },
  { id: 'mat_his_11a', nombre: 'Historia', grado_id: 'gr_11a', docente_id: 'usr_doc_1' },
  { id: 'mat_mat_11b', nombre: 'Matemáticas', grado_id: 'gr_11b', docente_id: 'usr_doc_1' },
  { id: 'mat_bio_10a', nombre: 'Biología', grado_id: 'gr_10a', docente_id: 'usr_doc_2' },
];

export const INITIAL_ESTUDIANTES: Estudiante[] = [
  { 
    id: 'est_1', 
    nombre: 'Ana Martínez', 
    grado: '11-A', 
    documento: '10987654',
    nombre_acudiente: 'Marta Elena Betancur',
    telefono_acudiente: '3167890123'
  },
  { 
    id: 'est_2', 
    nombre: 'Juan Camilo', 
    grado: '11-A', 
    documento: '10987655',
    nombre_acudiente: 'Gonzalo Camilo',
    telefono_acudiente: '3101112233'
  },
  { 
    id: 'est_3', 
    nombre: 'Sebastián Beltrán', 
    grado: '11-A', 
    documento: '10987656',
    nombre_acudiente: 'Patricia Beltrán',
    telefono_acudiente: '3144445566'
  },
  { 
    id: 'est_4', 
    nombre: 'Camilo Vargas', 
    grado: '11-A', 
    documento: '10987657',
    nombre_acudiente: 'Hernán Vargas',
    telefono_acudiente: '3157778899'
  },
  { 
    id: 'est_5', 
    nombre: 'Laura Sofía Ruiz', 
    grado: '11-A', 
    documento: '10987658',
    nombre_acudiente: 'Gloria Ruiz',
    telefono_acudiente: '3182223344'
  },
  { 
    id: 'est_6', 
    nombre: 'Mateo Hernández', 
    grado: '11-A', 
    documento: '10987659',
    nombre_acudiente: 'Jorge Hernández',
    telefono_acudiente: '3119998877'
  },
  { 
    id: 'est_7', 
    nombre: 'Valentina Gómez', 
    grado: '11-A', 
    documento: '10987660',
    nombre_acudiente: 'Claudia Gómez',
    telefono_acudiente: '3203334455'
  },
  { 
    id: 'est_8', 
    nombre: 'Santiago Díaz', 
    grado: '11-A', 
    documento: '10987661',
    nombre_acudiente: 'Fernando Díaz',
    telefono_acudiente: '3176665544'
  },
];

export const INITIAL_HORARIOS: HorarioClase[] = [
  {
    id: 'hor_1',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Lunes',
    hora_inicio: '07:00',
    hora_fin: '08:30',
    materia_nombre: 'Matemáticas',
    docente_nombre: 'Carlos Mendoza',
    aula: 'Salón 201'
  },
  {
    id: 'hor_2',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Lunes',
    hora_inicio: '08:30',
    hora_fin: '10:00',
    materia_nombre: 'Biología',
    docente_nombre: 'Sandra Gómez',
    aula: 'Laboratorio de Ciencias'
  },
  {
    id: 'hor_3',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Martes',
    hora_inicio: '07:00',
    hora_fin: '09:00',
    materia_nombre: 'Español & Literatura',
    docente_nombre: 'Carlos Mendoza',
    aula: 'Salón 201'
  },
  {
    id: 'hor_4',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Miércoles',
    hora_inicio: '07:00',
    hora_fin: '08:30',
    materia_nombre: 'Historia y Geografía',
    docente_nombre: 'Carlos Mendoza',
    aula: 'Salón 201'
  },
  {
    id: 'hor_5',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Jueves',
    hora_inicio: '09:30',
    hora_fin: '11:00',
    materia_nombre: 'Artes Plásticas',
    docente_nombre: 'Sandra Gómez',
    aula: 'Taller de Artes'
  },
  {
    id: 'hor_6',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Viernes',
    hora_inicio: '07:00',
    hora_fin: '08:30',
    materia_nombre: 'Matemáticas Avanzadas',
    docente_nombre: 'Carlos Mendoza',
    aula: 'Salón 201'
  },
  {
    id: 'hor_7',
    grado_id: 'gr_10a',
    grado_nombre: '10-A',
    dia: 'Lunes',
    hora_inicio: '07:00',
    hora_fin: '08:30',
    materia_nombre: 'Biología General',
    docente_nombre: 'Sandra Gómez',
    aula: 'Salón 102'
  }
];

export const INITIAL_AVISOS: AvisoDocenteCelador[] = [
  {
    id: 'av_1',
    categoria: 'autorizacion_salida',
    titulo: 'Autorización Salida Médica: Ana Martínez (11-A)',
    mensaje: 'La estudiante Ana Martínez cuenta con permiso firmado de coordinación para retirarse a las 10:30 am con su acudiente Marta Elena Betancur.',
    emisor_id: 'usr_doc_1',
    emisor_nombre: 'Carlos Mendoza',
    emisor_rol: 'docente',
    destinatario_rol: 'porteria',
    estudiante_nombre: 'Ana Martínez',
    grado: '11-A',
    prioridad: 'alta',
    estado: 'pendiente',
    fecha: '2026-04-15 08:15'
  },
  {
    id: 'av_2',
    categoria: 'llegada_acudiente',
    titulo: 'Acudiente en Portería para Entrega de Documentos',
    mensaje: 'Se encuentra en la reja principal la señora Patricia Beltrán solicitando hablar con el director de grupo de 11-A.',
    emisor_id: 'usr_por_1',
    emisor_nombre: 'José Quintero (Guardia Portería)',
    emisor_rol: 'porteria',
    destinatario_rol: 'docente',
    estudiante_nombre: 'Sebastián Beltrán',
    grado: '11-A',
    prioridad: 'normal',
    estado: 'atendido',
    respuesta: 'Enterado, bajo en 5 minutos al descanso.',
    atendido_por: 'Carlos Mendoza',
    fecha: '2026-04-15 09:20'
  },
  {
    id: 'av_3',
    categoria: 'llegada_tardia',
    titulo: 'Ingreso Tardío Registrado en Portería',
    mensaje: 'El estudiante Camilo Vargas ingresó a las 07:25 AM. Reportó congestión vehicular en el viaducto.',
    emisor_id: 'usr_por_1',
    emisor_nombre: 'José Quintero (Guardia Portería)',
    emisor_rol: 'porteria',
    destinatario_rol: 'docente',
    estudiante_nombre: 'Camilo Vargas',
    grado: '11-A',
    prioridad: 'normal',
    estado: 'resuelto',
    atendido_por: 'Carlos Mendoza',
    fecha: '2026-04-15 07:26'
  },
  {
    id: 'av_4',
    categoria: 'comunicado_general',
    titulo: 'Jornada Pedagógica y Cierre de Puertas 12:00 PM',
    mensaje: 'Estimado cuerpo docente y celaduría: Por reunión de directivos, la salida de todos los grados se efectuará hoy a las 12:00 PM.',
    emisor_id: 'usr_dir_1',
    emisor_nombre: 'Dr. Roberto Silva (Rector)',
    emisor_rol: 'directivo',
    destinatario_rol: 'todos',
    prioridad: 'alta',
    estado: 'pendiente',
    fecha: '2026-04-14 06:45'
  }
];

// Helper to generate past sample attendance logs
const generateSampleAttendance = (): Asistencia[] => {
  const records: Asistencia[] = [];
  const materiaId = 'mat_mat_11a'; // Matemáticas

  const aprilDates = [
    '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-06', '2026-04-07', 
    '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-13', '2026-04-14', 
    '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-20', '2026-04-21'
  ];

  aprilDates.forEach((fecha, idx) => {
    let estado: 'Presente' | 'Tarde' | 'Ausente' = 'Presente';
    if (idx === 1 || idx === 12) estado = 'Ausente';
    if (idx === 5 || idx === 10) estado = 'Tarde';

    records.push({
      id: `att_ana_${idx}`,
      estudiante_id: 'est_1',
      materia_id: materiaId,
      fecha,
      estado,
      registrado_por: 'Carlos Mendoza',
      observaciones: estado === 'Ausente' ? 'Falta no justificada' : (estado === 'Tarde' ? 'Llegó 15 min tarde' : '')
    });
  });

  // Recent sample record for May 20, 2024 as shown in institutional sheets
  const page8Date = '2024-05-20';
  records.push(
    { id: 'att_p8_1', estudiante_id: 'est_1', materia_id: materiaId, fecha: page8Date, estado: 'Presente', registrado_por: 'Carlos Mendoza', observaciones: '' },
    { id: 'att_p8_2', estudiante_id: 'est_2', materia_id: materiaId, fecha: page8Date, estado: 'Presente', registrado_por: 'Carlos Mendoza', observaciones: '' },
    { id: 'att_p8_3', estudiante_id: 'est_3', materia_id: materiaId, fecha: page8Date, estado: 'Tarde', registrado_por: 'Carlos Mendoza', observaciones: 'Ingreso tardío por cita médica' },
    { id: 'att_p8_4', estudiante_id: 'est_4', materia_id: materiaId, fecha: page8Date, estado: 'Ausente', registrado_por: 'Carlos Mendoza', observaciones: 'Falta con excusa' }
  );

  return records;
};

export const INITIAL_ASISTENCIAS: Asistencia[] = generateSampleAttendance();
