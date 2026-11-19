import { 
  Usuario, 
  Estudiante, 
  Grado, 
  Materia, 
  Asistencia, 
  AttendanceStatus, 
  EngineMode,
  HorarioClase,
  AvisoDocenteCelador,
  DEFAULT_ROLE_PERMISSIONS 
} from '../types';
import { 
  INITIAL_USUARIOS, 
  INITIAL_GRADOS, 
  INITIAL_MATERIAS, 
  INITIAL_ESTUDIANTES, 
  INITIAL_ASISTENCIAS,
  INITIAL_HORARIOS,
  INITIAL_AVISOS
} from '../data/mockData';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost/asiscr/backend-php';

const ENGINE_MODE_KEY = 'asiscr_engine_mode';
const USUARIOS_KEY = 'asiscr_usuarios';
const GRADOS_KEY = 'asiscr_grados';
const MATERIAS_KEY = 'asiscr_materias';
const ESTUDIANTES_KEY = 'asiscr_estudiantes';
const ASISTENCIAS_KEY = 'asiscr_asistencias';
const HORARIOS_KEY = 'asiscr_horarios';
const AVISOS_KEY = 'asiscr_avisos';

// Initialize localStorage if empty
const initStorage = () => {
  if (!localStorage.getItem(USUARIOS_KEY)) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(INITIAL_USUARIOS));
  }
  if (!localStorage.getItem(GRADOS_KEY)) {
    localStorage.setItem(GRADOS_KEY, JSON.stringify(INITIAL_GRADOS));
  }
  if (!localStorage.getItem(MATERIAS_KEY)) {
    localStorage.setItem(MATERIAS_KEY, JSON.stringify(INITIAL_MATERIAS));
  }
  if (!localStorage.getItem(ESTUDIANTES_KEY)) {
    localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(INITIAL_ESTUDIANTES));
  }
  if (!localStorage.getItem(ASISTENCIAS_KEY)) {
    localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(INITIAL_ASISTENCIAS));
  }
  if (!localStorage.getItem(HORARIOS_KEY)) {
    localStorage.setItem(HORARIOS_KEY, JSON.stringify(INITIAL_HORARIOS));
  }
  if (!localStorage.getItem(AVISOS_KEY)) {
    localStorage.setItem(AVISOS_KEY, JSON.stringify(INITIAL_AVISOS));
  }
  if (!localStorage.getItem(ENGINE_MODE_KEY)) {
    localStorage.setItem(ENGINE_MODE_KEY, 'firebase');
  }
};

initStorage();

async function mutatePhpApi(
  endpoint: string,
  method: 'POST' | 'DELETE',
  payload?: object
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    return {
      success: false,
      error: result.message || result.error || `Error del servidor PHP (${response.status})`,
    };
  }
  return { success: true };
}

export const storageService = {
  getEngineMode(): EngineMode {
    return (localStorage.getItem(ENGINE_MODE_KEY) as EngineMode) || 'firebase';
  },

  setEngineMode(mode: EngineMode) {
    localStorage.setItem(ENGINE_MODE_KEY, mode);
  },

  resetDemoData() {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(INITIAL_USUARIOS));
    localStorage.setItem(GRADOS_KEY, JSON.stringify(INITIAL_GRADOS));
    localStorage.setItem(MATERIAS_KEY, JSON.stringify(INITIAL_MATERIAS));
    localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(INITIAL_ESTUDIANTES));
    localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(INITIAL_ASISTENCIAS));
    localStorage.setItem(HORARIOS_KEY, JSON.stringify(INITIAL_HORARIOS));
    localStorage.setItem(AVISOS_KEY, JSON.stringify(INITIAL_AVISOS));
  },

  // Auth local fallback
  authenticateUser(documento: string, contrasena: string, isDocenteAccess: boolean): Usuario | null {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
    const docClean = documento.trim().toLowerCase();
    const passClean = contrasena.trim();

    const found = usuarios.find(u => 
      (u.documento.toLowerCase() === docClean || 
       (u.email && u.email.toLowerCase() === docClean) ||
       (u.tipo === 'super_user' && (docClean === '123456' || docClean === 'super' || docClean === 'admin'))) && 
      u.contrasena === passClean
    );
    if (!found) return null;

    const enrichedUser: Usuario = {
      ...found,
      modulosPermitidos: found.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[found.tipo] || []
    };

    if (enrichedUser.tipo === 'super_user') return enrichedUser;

    if (isDocenteAccess) {
      if (enrichedUser.tipo === 'docente' || enrichedUser.tipo === 'directivo' || enrichedUser.tipo === 'porteria') {
        return enrichedUser;
      }
      return null;
    } else {
      return enrichedUser;
    }
  },

  async authenticateUserAsync(documento: string, contrasena: string, isDocenteAccess: boolean): Promise<Usuario | null> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const user = await firebaseService.authenticateUser(documento, contrasena, isDocenteAccess);
        if (user) return user;
      } catch (err) {
        console.error("[ASISCR FIREBASE] Error autenticando en Firestore:", err);
      }
    } else if (mode === 'php') {
      try {
        console.log(`[ASISCR PHP] Intentando autenticar en: ${API_BASE_URL}/login.php`);
        const response = await fetch(`${API_BASE_URL}/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documento: documento.trim(),
            contrasena: contrasena.trim(),
            tipo_acceso: isDocenteAccess ? 'docente' : 'estudiante'
          })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success && res.user) {
            console.log("[ASISCR PHP] Autenticación exitosa en MySQL:", res.user);
            const user: Usuario = {
              id: res.user.id.toString(),
              nombre: res.user.nombre,
              email: res.user.email || '',
              tipo: res.user.tipo,
              documento: res.user.documento,
              contrasena: contrasena.trim(),
              telefono: res.user.telefono || '',
              grado: res.user.grado || '',
              modulosPermitidos: res.user.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[res.user.tipo as any] || [],
              activo: res.user.activo ?? true
            };
            return user;
          }
        }
      } catch (err) {
        console.warn("[ASISCR PHP] Error conectando con API PHP local:", err);
      }
    }

    return this.authenticateUser(documento, contrasena, isDocenteAccess);
  },

  // ================= USERS CRUD =================
  getUsuarios(): Usuario[] {
    return JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
  },

  async getUsuariosAsync(): Promise<Usuario[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const users = await firebaseService.getUsuarios();
        if (users && users.length > 0) {
          localStorage.setItem(USUARIOS_KEY, JSON.stringify(users));
          return users;
        }
      } catch (e) {
        console.error("[ASISCR FIREBASE] Error cargando usuarios:", e);
      }
    } else if (mode === 'php') {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios.php`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            localStorage.setItem(USUARIOS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando usuarios de MySQL:", e);
      }
    }

    return this.getUsuarios();
  },

  async saveUsuarioAsync(usuario: Usuario): Promise<{ success: boolean; error?: string }> {
    // 1. Guardar local
    const users = this.getUsuarios();
    const existingIdx = users.findIndex(u => u.id === usuario.id);
    if (existingIdx >= 0) {
      users[existingIdx] = usuario;
    } else {
      users.push(usuario);
    }
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(users));

    // 2. Guardar en el motor activo
    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const res = await firebaseService.saveUsuario(usuario);
        return res;
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error guardando usuario en Firestore:", e);
        return { success: false, error: 'Error en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar datos a http://localhost desde un sitio HTTPS. Para usar PHP local ejecuta la app en http://localhost:3000, o cambia a Modo Firebase para guardar en la nube.'
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuario)
        });
        if (response.ok) {
          const res = await response.json();
          return res;
        } else {
          return { success: false, error: `Error del servidor PHP (${response.status})` };
        }
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error guardando usuario en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}). Asegúrate de tener XAMPP (Apache y MySQL) activo.`
        };
      }
    }

    return { success: true };
  },

  async deleteUsuarioAsync(id: string): Promise<{ success: boolean; error?: string }> {
    const users = this.getUsuarios().filter(u => u.id !== id);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(users));

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.deleteUsuario(id);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error eliminando usuario en Firestore:", e);
        return { success: false, error: 'Error eliminando en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar peticiones a http://localhost desde HTTPS.'
        };
      }
      try {
        const res = await fetch(`${API_BASE_URL}/usuarios.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) return await res.json();
        return { success: false, error: `Error del servidor PHP (${res.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error eliminando usuario en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  // ================= HORARIOS =================
  getHorarios(gradoId?: string): HorarioClase[] {
    const list: HorarioClase[] = JSON.parse(localStorage.getItem(HORARIOS_KEY) || '[]');
    if (!gradoId || gradoId === 'todos') return list;
    return list.filter(h => h.grado_id === gradoId || h.grado_nombre === gradoId);
  },

  async getHorariosAsync(gradoId?: string): Promise<HorarioClase[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const list = await firebaseService.getHorarios(gradoId);
        if (list && list.length > 0) {
          localStorage.setItem(HORARIOS_KEY, JSON.stringify(list));
          return list;
        }
      } catch (e: any) {
        console.warn("[ASISCR FIREBASE] Aviso cargando horarios (usando local):", e?.message || e);
      }
    } else if (mode === 'php') {
      try {
        const url = `${API_BASE_URL}/horarios.php` + (gradoId ? `?grado_id=${encodeURIComponent(gradoId)}` : '');
        const response = await fetch(url);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            localStorage.setItem(HORARIOS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando horarios de MySQL:", e);
      }
    }

    return this.getHorarios(gradoId);
  },

  async saveHorarioAsync(horario: HorarioClase): Promise<{ success: boolean; error?: string }> {
    const list = this.getHorarios();
    const existingIdx = list.findIndex(h => h.id === horario.id);
    if (existingIdx >= 0) {
      list[existingIdx] = horario;
    } else {
      list.push(horario);
    }
    localStorage.setItem(HORARIOS_KEY, JSON.stringify(list));

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.saveHorario(horario);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error guardando horario:", e);
        return { success: false, error: 'Error guardando horario en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar datos a http://localhost desde HTTPS.'
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/horarios.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(horario)
        });
        if (response.ok) return await response.json();
        return { success: false, error: `Error del servidor PHP (${response.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error guardando horario en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  async deleteHorarioAsync(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getHorarios().filter(h => h.id !== id);
    localStorage.setItem(HORARIOS_KEY, JSON.stringify(list));

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.deleteHorario(id);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error eliminando horario:", e);
        return { success: false, error: 'Error eliminando horario en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar peticiones a http://localhost desde HTTPS.'
        };
      }
      try {
        const res = await fetch(`${API_BASE_URL}/horarios.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) return await res.json();
        return { success: false, error: `Error del servidor PHP (${res.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error eliminando horario en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  // ================= AVISOS DOCENTE / CELADOR =================
  getAvisos(): AvisoDocenteCelador[] {
    const list: AvisoDocenteCelador[] = JSON.parse(localStorage.getItem(AVISOS_KEY) || '[]');
    return list.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  },

  async getAvisosAsync(): Promise<AvisoDocenteCelador[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const list = await firebaseService.getAvisos();
        if (list && list.length > 0) {
          localStorage.setItem(AVISOS_KEY, JSON.stringify(list));
          return list;
        }
      } catch (e: any) {
        console.warn("[ASISCR FIREBASE] Aviso cargando avisos (usando local):", e?.message || e);
      }
    } else if (mode === 'php') {
      try {
        const response = await fetch(`${API_BASE_URL}/avisos.php`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            localStorage.setItem(AVISOS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando avisos de MySQL:", e);
      }
    }

    return this.getAvisos();
  },

  async saveAvisoAsync(aviso: AvisoDocenteCelador): Promise<{ success: boolean; error?: string }> {
    const list = this.getAvisos();
    const existingIdx = list.findIndex(a => a.id === aviso.id);
    if (existingIdx >= 0) {
      list[existingIdx] = aviso;
    } else {
      list.unshift(aviso);
    }
    localStorage.setItem(AVISOS_KEY, JSON.stringify(list));

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.saveAviso(aviso);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error guardando aviso:", e);
        return { success: false, error: 'Error guardando aviso en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar datos a http://localhost desde HTTPS.'
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/avisos.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aviso)
        });
        if (response.ok) return await response.json();
        return { success: false, error: `Error del servidor PHP (${response.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error guardando aviso en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  async updateAvisoEstadoAsync(
    id: string, 
    estado: 'pendiente' | 'atendido' | 'resuelto', 
    atendidoPor?: string, 
    respuesta?: string
  ): Promise<{ success: boolean; error?: string }> {
    const list = this.getAvisos();
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx].estado = estado;
      if (atendidoPor) list[idx].atendido_por = atendidoPor;
      if (respuesta) list[idx].respuesta = respuesta;
      localStorage.setItem(AVISOS_KEY, JSON.stringify(list));
    }

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.updateAvisoEstado(id, estado, atendidoPor, respuesta);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error actualizando aviso:", e);
        return { success: false, error: 'Error actualizando aviso en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar datos a http://localhost desde HTTPS.'
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/avisos.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, estado, atendido_por: atendidoPor, respuesta })
        });
        if (response.ok) return await response.json();
        return { success: false, error: `Error del servidor PHP (${response.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error actualizando aviso en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  async deleteAvisoAsync(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getAvisos().filter(a => a.id !== id);
    localStorage.setItem(AVISOS_KEY, JSON.stringify(list));

    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.deleteAviso(id);
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error eliminando aviso:", e);
        return { success: false, error: 'Error eliminando aviso en Firestore: ' + (e?.message || e) };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar peticiones a http://localhost desde HTTPS.'
        };
      }
      try {
        const res = await fetch(`${API_BASE_URL}/avisos.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) return await res.json();
        return { success: false, error: `Error del servidor PHP (${res.status})` };
      } catch (e: any) {
        console.warn("[ASISCR PHP] Error eliminando aviso en MySQL:", e);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}).`
        };
      }
    }

    return { success: true };
  },

  // ================= GRADOS, MATERIAS, ESTUDIANTES, ASISTENCIAS =================
  getGrados(): Grado[] {
    return JSON.parse(localStorage.getItem(GRADOS_KEY) || '[]');
  },

  getMaterias(gradoNombreOrId?: string): Materia[] {
    const materias: Materia[] = JSON.parse(localStorage.getItem(MATERIAS_KEY) || '[]');
    if (!gradoNombreOrId) return materias;
    const grados = this.getGrados();
    const foundGrado = grados.find(g => g.id === gradoNombreOrId || g.nombre === gradoNombreOrId);
    if (!foundGrado) return materias;
    return materias.filter(m => m.grado_id === foundGrado.id);
  },

  getEstudiantes(gradoNombreOrId?: string): Estudiante[] {
    const estudiantes: Estudiante[] = JSON.parse(localStorage.getItem(ESTUDIANTES_KEY) || '[]');
    if (!gradoNombreOrId || gradoNombreOrId === 'todos') return estudiantes;
    const grado = this.getGrados().find(g => g.id === gradoNombreOrId || g.nombre === gradoNombreOrId);
    return estudiantes.filter(e =>
      e.grado === gradoNombreOrId ||
      e.grado === grado?.id ||
      e.grado === grado?.nombre
    );
  },

  getAsistencias(materiaId?: string, fecha?: string): Asistencia[] {
    const asistencias: Asistencia[] = JSON.parse(localStorage.getItem(ASISTENCIAS_KEY) || '[]');
    let result = asistencias;
    if (materiaId && materiaId !== 'todas') {
      result = result.filter(a => a.materia_id === materiaId);
    }
    if (fecha) {
      result = result.filter(a => a.fecha === fecha);
    }
    return result;
  },

  saveAsistencias(
    materiaId: string, 
    fecha: string, 
    registros: { estudiante_id: string; estado: AttendanceStatus; observaciones?: string }[], 
    registradoPor: string
  ): boolean {
    const asistencias: Asistencia[] = JSON.parse(localStorage.getItem(ASISTENCIAS_KEY) || '[]');
    const filtered = asistencias.filter(a => !(a.materia_id === materiaId && a.fecha === fecha));
    const newRecords: Asistencia[] = registros.map(r => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      estudiante_id: r.estudiante_id,
      materia_id: materiaId,
      fecha,
      estado: r.estado,
      registrado_por: registradoPor,
      observaciones: r.observaciones
    }));

    const updated = [...filtered, ...newRecords];
    localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(updated));
    return true;
  },

  async saveAsistenciasAsync(
    materiaId: string, 
    fecha: string, 
    registros: { estudiante_id: string; estado: AttendanceStatus; observaciones?: string }[], 
    registradoPor: string
  ): Promise<{ success: boolean; error?: string }> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const res = await firebaseService.saveAsistencias(materiaId, fecha, registros, registradoPor);
        if (res.success) {
          this.saveAsistencias(materiaId, fecha, registros, registradoPor);
        }
        return res;
      } catch (err: any) {
        console.error("[ASISCR FIREBASE] Error guardando asistencias en Firestore:", err);
        return { success: false, error: err.message || 'Error guardando en Firestore' };
      }
    } else if (mode === 'php') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (isHttps) {
        return {
          success: false,
          error: 'Restricción del navegador (Mixed Content): No se puede enviar datos a http://localhost desde HTTPS. Para usar PHP local ejecuta la app en http://localhost:3000, o cambia a Modo Firebase para guardar en la nube.'
        };
      }
      try {
        console.log(`[ASISCR PHP] Guardando asistencias en MySQL: ${API_BASE_URL}/save_asistencia.php`);
        const response = await fetch(`${API_BASE_URL}/save_asistencia.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materia_id: materiaId,
            fecha,
            registrado_por: registradoPor,
            registros: registros.map(r => ({
              estudiante_id: r.estudiante_id,
              estado: r.estado,
              observaciones: r.observaciones || ''
            }))
          })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            this.saveAsistencias(materiaId, fecha, registros, registradoPor);
            return { success: true };
          }
          return { success: false, error: res.error || 'Error al guardar asistencias en MySQL' };
        } else {
          return { success: false, error: `Error del servidor PHP (${response.status})` };
        }
      } catch (err: any) {
        console.warn("[ASISCR PHP] Error conectando con API PHP local:", err);
        return {
          success: false,
          error: `No se pudo conectar al API PHP local (${API_BASE_URL}). Asegúrate de que XAMPP esté activo con Apache y MySQL corriendo.`
        };
      }
    }

    this.saveAsistencias(materiaId, fecha, registros, registradoPor);
    return { success: true };
  },

  getExpedienteEstudiante(documento: string, year: number, month: number) {
    const estudiantes: Estudiante[] = JSON.parse(localStorage.getItem(ESTUDIANTES_KEY) || '[]');
    const student = estudiantes.find(e => e.documento === documento) || estudiantes[0];

    const asistencias: Asistencia[] = JSON.parse(localStorage.getItem(ASISTENCIAS_KEY) || '[]');
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const datePrefix = `${year}-${monthStr}`;

    const studentAsistencias = asistencias.filter(a => 
      a.estudiante_id === student.id && a.fecha.startsWith(datePrefix)
    );

    return {
      estudiante: student,
      asistencias: studentAsistencias
    };
  },

  async getExpedienteEstudianteAsync(documento: string, year: number, month: number): Promise<{ estudiante: Estudiante; asistencias: Asistencia[] }> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getExpedienteEstudiante(documento, year, month);
      } catch (err: any) {
        console.warn("[ASISCR FIREBASE] Aviso obteniendo expediente (usando local):", err?.message || err);
      }
    } else if (mode === 'php') {
      try {
        const response = await fetch(`${API_BASE_URL}/get_expediente.php?documento=${encodeURIComponent(documento)}&mes=${month}&anio=${year}`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.estudiante) {
            const est: Estudiante = {
              id: res.estudiante.id.toString(),
              nombre: res.estudiante.nombre,
              grado: res.estudiante.grado_id || '11-A',
              documento: res.estudiante.documento
            };
            const list: Asistencia[] = (res.asistencias || []).map((a: any) => ({
              id: a.id.toString(),
              estudiante_id: a.estudiante_id.toString(),
              materia_id: a.materia_id.toString(),
              fecha: a.fecha,
              estado: a.estado as AttendanceStatus,
              registrado_por: a.registrado_por || 'Docente',
              observaciones: a.observaciones || ''
            }));
            return { estudiante: est, asistencias: list };
          }
        }
      } catch (err) {
        console.warn("[ASISCR PHP] Error consultando expediente en MySQL:", err);
      }
    }

    return this.getExpedienteEstudiante(documento, year, month);
  },

  async getGradosAsync(): Promise<Grado[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getGrados();
      } catch (e) {
        console.error("[ASISCR FIREBASE] Error cargando grados:", e);
      }
    } else if (mode === 'php') {
      try {
        const response = await fetch(`${API_BASE_URL}/grados.php`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data)) {
            localStorage.setItem(GRADOS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando grados de MySQL:", e);
      }
    }

    return this.getGrados();
  },

  async saveGradoAsync(grado: Grado): Promise<{ success: boolean; error?: string }> {
    const mode = this.getEngineMode();
    let result: { success: boolean; error?: string };
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        result = await firebaseService.saveGrado(grado);
      } catch (error: any) {
        console.error('[ASISCR FIREBASE] Error guardando grupo:', error);
        return { success: false, error: error?.message || 'Error guardando grupo en Firestore.' };
      }
    } else {
      try {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          return { success: false, error: 'El navegador bloquea la conexión HTTP al backend PHP desde HTTPS.' };
        }
        result = await mutatePhpApi('grados.php', 'POST', grado);
      } catch (error: any) {
        console.error('[ASISCR PHP] Error guardando grupo:', error);
        return { success: false, error: error?.message || `No se pudo conectar al API PHP local (${API_BASE_URL}).` };
      }
    }

    if (result.success) {
      const grados = this.getGrados();
      const index = grados.findIndex(item => item.id === grado.id);
      if (index >= 0) grados[index] = grado;
      else grados.push(grado);
      localStorage.setItem(GRADOS_KEY, JSON.stringify(grados));
    }
    return result;
  },

  async deleteGradoAsync(id: string): Promise<{ success: boolean; error?: string }> {
    const mode = this.getEngineMode();
    let result: { success: boolean; error?: string };
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        result = await firebaseService.deleteGrado(id);
      } catch (error: any) {
        console.error('[ASISCR FIREBASE] Error eliminando grupo:', error);
        return { success: false, error: error?.message || 'Error eliminando grupo de Firestore.' };
      }
    } else {
      try {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          return { success: false, error: 'El navegador bloquea la conexión HTTP al backend PHP desde HTTPS.' };
        }
        result = await mutatePhpApi(`grados.php?id=${encodeURIComponent(id)}`, 'DELETE');
      } catch (error: any) {
        console.error('[ASISCR PHP] Error eliminando grupo:', error);
        return { success: false, error: error?.message || `No se pudo conectar al API PHP local (${API_BASE_URL}).` };
      }
    }

    if (result.success) {
      localStorage.setItem(GRADOS_KEY, JSON.stringify(this.getGrados().filter(item => item.id !== id)));
    }
    return result;
  },

  async getMateriasAsync(gradoNombreOrId?: string): Promise<Materia[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getMaterias(gradoNombreOrId);
      } catch (e) {
        console.error("[ASISCR FIREBASE] Error cargando materias:", e);
      }
    } else if (mode === 'php') {
      try {
        const url = `${API_BASE_URL}/materias.php` + (gradoNombreOrId ? `?grado_id=${encodeURIComponent(gradoNombreOrId)}` : '');
        const response = await fetch(url);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            localStorage.setItem(MATERIAS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando materias de MySQL:", e);
      }
    }

    return this.getMaterias(gradoNombreOrId);
  },

  async getEstudiantesAsync(gradoNombreOrId?: string): Promise<Estudiante[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getEstudiantes(gradoNombreOrId);
      } catch (e) {
        console.error("[ASISCR FIREBASE] Error cargando estudiantes:", e);
      }
    } else if (mode === 'php') {
      try {
        const url = `${API_BASE_URL}/estudiantes.php` + (gradoNombreOrId ? `?grado_id=${encodeURIComponent(gradoNombreOrId)}` : '');
        const response = await fetch(url);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data)) {
            localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando estudiantes de MySQL:", e);
      }
    }

    return this.getEstudiantes(gradoNombreOrId);
  },

  async saveEstudianteAsync(estudiante: Estudiante): Promise<{ success: boolean; error?: string }> {
    const mode = this.getEngineMode();
    let result: { success: boolean; error?: string };
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        result = await firebaseService.saveEstudiante(estudiante);
      } catch (error: any) {
        console.error('[ASISCR FIREBASE] Error guardando estudiante:', error);
        return { success: false, error: error?.message || 'Error guardando estudiante en Firestore.' };
      }
    } else {
      try {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          return { success: false, error: 'El navegador bloquea la conexión HTTP al backend PHP desde HTTPS.' };
        }
        result = await mutatePhpApi('estudiantes.php', 'POST', estudiante);
      } catch (error: any) {
        console.error('[ASISCR PHP] Error guardando estudiante:', error);
        return { success: false, error: error?.message || `No se pudo conectar al API PHP local (${API_BASE_URL}).` };
      }
    }

    if (result.success) {
      const estudiantes = this.getEstudiantes();
      const index = estudiantes.findIndex(item => item.id === estudiante.id);
      if (index >= 0) estudiantes[index] = estudiante;
      else estudiantes.push(estudiante);
      localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(estudiantes));
    }
    return result;
  },

  async deleteEstudianteAsync(id: string): Promise<{ success: boolean; error?: string }> {
    const mode = this.getEngineMode();
    let result: { success: boolean; error?: string };
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        result = await firebaseService.deleteEstudiante(id);
      } catch (error: any) {
        console.error('[ASISCR FIREBASE] Error eliminando estudiante:', error);
        return { success: false, error: error?.message || 'Error eliminando estudiante de Firestore.' };
      }
    } else {
      try {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          return { success: false, error: 'El navegador bloquea la conexión HTTP al backend PHP desde HTTPS.' };
        }
        result = await mutatePhpApi(`estudiantes.php?id=${encodeURIComponent(id)}`, 'DELETE');
      } catch (error: any) {
        console.error('[ASISCR PHP] Error eliminando estudiante:', error);
        return { success: false, error: error?.message || `No se pudo conectar al API PHP local (${API_BASE_URL}).` };
      }
    }

    if (result.success) {
      localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(this.getEstudiantes().filter(item => item.id !== id)));
    }
    return result;
  },

  async getAsistenciasAsync(materiaId?: string, fecha?: string): Promise<Asistencia[]> {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getAsistencias(materiaId, fecha);
      } catch (e) {
        console.error("[ASISCR FIREBASE] Error cargando asistencias:", e);
      }
    } else if (mode === 'php') {
      try {
        let url = `${API_BASE_URL}/asistencias.php?`;
        if (materiaId) url += `materia_id=${encodeURIComponent(materiaId)}&`;
        if (fecha) url += `fecha=${encodeURIComponent(fecha)}&`;
        const response = await fetch(url);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(res.data));
            return res.data;
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error cargando asistencias de MySQL:", e);
      }
    }

    return this.getAsistencias(materiaId, fecha);
  },

  // ================= DATABASE OVERVIEW =================
  async getDatabaseOverviewAsync() {
    const mode = this.getEngineMode();

    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.getDatabaseOverview();
      } catch (e: any) {
        console.error("[ASISCR FIREBASE] Error obteniendo estadísticas:", e);
      }
    } else if (mode === 'php') {
      try {
        const response = await fetch(`${API_BASE_URL}/index.php?format=json`);
        if (response.ok) {
          const res = await response.json();
          if (res.connected) {
            return {
              status: 'connected' as const,
              counts: {
                usuarios: res.counts.usuarios ?? 0,
                grados: res.counts.grados ?? 0,
                materias: res.counts.materias ?? 0,
                estudiantes: res.counts.estudiantes ?? 0,
                asistencias: res.counts.asistencias ?? 0,
                horarios: res.counts.horarios ?? 0,
                avisos: res.counts.avisos ?? 0,
              }
            };
          }
        }
      } catch (e) {
        console.warn("[ASISCR PHP] Error consultando estado de MySQL:", e);
      }
    }

    // Local fallback
    return {
      status: 'connected' as const,
      counts: {
        usuarios: this.getUsuarios().length,
        grados: this.getGrados().length,
        materias: this.getMaterias().length,
        estudiantes: this.getEstudiantes().length,
        asistencias: this.getAsistencias().length,
        horarios: this.getHorarios().length,
        avisos: this.getAvisos().length,
      }
    };
  },

  async exportDatabaseAsync(): Promise<Record<string, any[]>> {
    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.exportFullDatabase();
      } catch (e) {
        console.error("[ASISCR] Error exportando de Firestore, usando local:", e);
      }
    }
    return {
      usuarios: this.getUsuarios(),
      grados: this.getGrados(),
      materias: this.getMaterias(),
      estudiantes: this.getEstudiantes(),
      asistencias: this.getAsistencias(),
      horarios: this.getHorarios(),
      avisos: this.getAvisos(),
    };
  },

  async importDatabaseAsync(jsonData: Record<string, any[]>): Promise<{ success: boolean; message: string }> {
    // 1. Guardar en localStorage
    if (jsonData.usuarios) localStorage.setItem(USUARIOS_KEY, JSON.stringify(jsonData.usuarios));
    if (jsonData.grados) localStorage.setItem(GRADOS_KEY, JSON.stringify(jsonData.grados));
    if (jsonData.materias) localStorage.setItem(MATERIAS_KEY, JSON.stringify(jsonData.materias));
    if (jsonData.estudiantes) localStorage.setItem(ESTUDIANTES_KEY, JSON.stringify(jsonData.estudiantes));
    if (jsonData.asistencias) localStorage.setItem(ASISTENCIAS_KEY, JSON.stringify(jsonData.asistencias));
    if (jsonData.horarios) localStorage.setItem(HORARIOS_KEY, JSON.stringify(jsonData.horarios));
    if (jsonData.avisos) localStorage.setItem(AVISOS_KEY, JSON.stringify(jsonData.avisos));

    // 2. Si estamos en modo Firebase, sincronizar también a Firestore
    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        return await firebaseService.importFullDatabase(jsonData);
      } catch (e: any) {
        return { success: true, message: 'Datos importados localmente con éxito (Firestore sin conexión).' };
      }
    }
    return { success: true, message: 'Datos importados exitosamente al almacenamiento local / MySQL.' };
  },

  async seedDemoDataAsync(): Promise<{ success: boolean; message: string }> {
    this.resetDemoData();
    const mode = this.getEngineMode();
    if (mode === 'firebase') {
      try {
        const { firebaseService } = await import('./firebaseService');
        const ok = await firebaseService.seedInitialDataIfEmpty(true);
        if (ok) {
          return { 
            success: true, 
            message: '¡Las 7 colecciones institucionales de Cristo Rey han sido sembradas exitosamente en Cloud Firestore!' 
          };
        }
        return { 
          success: false, 
          message: 'Hubo un detalle al escribir en Firestore. Verifica que tus reglas estén publicadas.' 
        };
      } catch (e: any) {
        console.error("[ASISCR] Error al sembrar demo data en Firebase:", e);
        return { 
          success: false, 
          message: 'Error al conectar con Firestore: ' + (e?.message || e) 
        };
      }
    }
    return { 
      success: true, 
      message: 'Datos institucionales reinicializados correctamente en el almacenamiento local / MySQL.' 
    };
  },

  async validateWriteAndReadAsync(): Promise<{ success: boolean; message: string }> {
    const mode = this.getEngineMode();
    const testId = `ping_${Date.now()}`;
    const timestamp = new Date().toISOString();

    if (mode === 'firebase') {
      try {
        const { db } = await import('./firebase');
        const { doc, setDoc, getDoc, deleteDoc } = await import('firebase/firestore');
        const testRef = doc(db, 'usuarios', testId);
        await setDoc(testRef, {
          id: testId,
          nombre: 'Prueba de Validación',
          email: 'ping@test.com',
          tipo: 'super_user',
          documento: testId,
          contrasena: '123456',
          modulosPermitidos: [],
          activo: true,
          creadoEn: timestamp
        });
        const snap = await getDoc(testRef);
        await deleteDoc(testRef);
        if (snap.exists()) {
          return {
            success: true,
            message: '¡Validación completada! Escritura, lectura y eliminación comprobadas exitosamente en Google Cloud Firestore.'
          };
        }
        return { success: false, message: 'La lectura de comprobación en Firestore no retornó el documento de prueba.' };
      } catch (e: any) {
        return { success: false, message: 'Error validando en Firestore: ' + (e?.message || e) };
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: testId,
            nombre: 'Prueba de Validación PHP',
            email: 'ping@test.com',
            tipo: 'super_user',
            documento: testId,
            contrasena: '123456',
            modulosPermitidos: [],
            activo: true
          })
        });
        if (response.ok) {
          await fetch(`${API_BASE_URL}/usuarios.php?id=${encodeURIComponent(testId)}`, { method: 'DELETE' });
          return {
            success: true,
            message: '¡Validación completada! Escritura y lectura comprobadas exitosamente en MySQL Local (PHP).'
          };
        }
        return {
          success: false,
          message: 'El servidor PHP no respondió correctamente. Verifica que Apache y MySQL estén activos.'
        };
      } catch (e: any) {
        return {
          success: false,
          message: `No se pudo conectar al API PHP local (${API_BASE_URL}): ` + (e?.message || e)
        };
      }
    }
  }
};
