import { 
  collection, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  doc, 
  deleteDoc,
  writeBatch, 
  limit,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Usuario, 
  Estudiante, 
  Grado, 
  Materia, 
  Asistencia, 
  AttendanceStatus,
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

// Helper to remove any undefined fields before Firestore operations
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export const firebaseService = {
  // Seeds the database if it is empty (very helpful on first run)
  async seedInitialDataIfEmpty(forceSeed = false): Promise<boolean> {
    try {
      console.log("[ASISCR FIREBASE] Comprobando si existen datos en Firestore...");
      const usersCol = collection(db, 'usuarios');
      const usersSnapshot = await getDocs(query(usersCol, limit(1)));
      
      if (!usersSnapshot.empty && !forceSeed) {
        console.log("[ASISCR FIREBASE] Firestore ya cuenta con datos preexistentes.");
        return false;
      }
      
      console.log("[ASISCR FIREBASE] Sembrando datos por defecto de Cristo Rey por colecciones...");
      
      const commitCollection = async (name: string, populateFn: (b: ReturnType<typeof writeBatch>) => void) => {
        try {
          const colBatch = writeBatch(db);
          populateFn(colBatch);
          await colBatch.commit();
          console.log(`[ASISCR FIREBASE] Colección '${name}' sincronizada en Firestore.`);
          return true;
        } catch (e: any) {
          console.warn(`[ASISCR FIREBASE] Aviso en colección '${name}':`, e?.message || e);
          return false;
        }
      };
      
      // 1. Seed Usuarios
      await commitCollection('usuarios', (batch) => {
        for (const u of INITIAL_USUARIOS) {
          const uRef = doc(db, 'usuarios', u.id);
          batch.set(uRef, cleanForFirestore({
            id: u.id,
            nombre: u.nombre,
            email: u.email || '',
            tipo: u.tipo,
            documento: u.documento,
            contrasena: u.contrasena,
            modulosPermitidos: u.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[u.tipo] || [],
            grado: u.grado || '',
            telefono: u.telefono || '',
            activo: u.activo ?? true,
            creadoEn: u.creadoEn || new Date().toISOString()
          }));
        }
      });
      
      // 2. Seed Grados
      await commitCollection('grados', (batch) => {
        for (const g of INITIAL_GRADOS) {
          const gRef = doc(db, 'grados', g.id);
          batch.set(gRef, cleanForFirestore(g));
        }
      });
      
      // 3. Seed Estudiantes
      await commitCollection('estudiantes', (batch) => {
        for (const e of INITIAL_ESTUDIANTES) {
          const eRef = doc(db, 'estudiantes', e.id);
          batch.set(eRef, cleanForFirestore({
            id: e.id,
            nombre: e.nombre,
            grado: e.grado,
            documento: e.documento,
            nombre_acudiente: e.nombre_acudiente || '',
            telefono_acudiente: e.telefono_acudiente || '',
            id_padre: e.id_padre || '',
            avatarUrl: e.avatarUrl || ''
          }));
        }
      });
      
      // 4. Seed Materias
      await commitCollection('materias', (batch) => {
        for (const m of INITIAL_MATERIAS) {
          const mRef = doc(db, 'materias', m.id);
          batch.set(mRef, cleanForFirestore(m));
        }
      });
      
      // 5. Seed Horarios
      await commitCollection('horarios', (batch) => {
        for (const h of INITIAL_HORARIOS) {
          const hRef = doc(db, 'horarios', h.id);
          batch.set(hRef, cleanForFirestore(h));
        }
      });
      
      // 6. Seed Avisos
      await commitCollection('avisos', (batch) => {
        for (const av of INITIAL_AVISOS) {
          const avRef = doc(db, 'avisos', av.id);
          batch.set(avRef, cleanForFirestore({
            ...av,
            estudiante_nombre: av.estudiante_nombre || '',
            grado: av.grado || '',
            respuesta: av.respuesta || '',
            atendido_por: av.atendido_por || ''
          }));
        }
      });
      
      // 7. Seed Asistencias
      await commitCollection('asistencias', (batch) => {
        for (const a of INITIAL_ASISTENCIAS) {
          const docId = `${a.materia_id}_${a.fecha}_${a.estudiante_id}`;
          const aRef = doc(db, 'asistencias', docId);
          batch.set(aRef, cleanForFirestore({
            id: a.id || docId,
            estudiante_id: a.estudiante_id,
            materia_id: a.materia_id,
            fecha: a.fecha,
            estado: a.estado,
            registrado_por: a.registrado_por,
            observaciones: a.observaciones || ''
          }));
        }
      });
      
      console.log("[ASISCR FIREBASE] Proceso de inicialización de colecciones finalizado.");
      return true;
    } catch (err) {
      console.error("[ASISCR FIREBASE] Error general durante la inicialización de datos:", err);
      return false;
    }
  },

  // Auth: Checks if there's a user matching credentials in the Firestore collection
  async authenticateUser(documento: string, contrasena: string, isDocenteAccess: boolean): Promise<Usuario | null> {
    try {
      await this.seedInitialDataIfEmpty();
      
      const docClean = documento.trim().toLowerCase();
      const passClean = contrasena.trim();
      
      console.log(`[ASISCR FIREBASE] Autenticando usuario: ${docClean}...`);
      const usersCol = collection(db, 'usuarios');
      
      // Intentar buscar por documento o email
      let q = query(usersCol, where('documento', '==', docClean));
      let snapshot = await getDocs(q);
      
      if (snapshot.empty && docClean.includes('@')) {
        q = query(usersCol, where('email', '==', docClean));
        snapshot = await getDocs(q);
      }
      
      if (snapshot.empty) {
        // Fallback: check all if docClean matches
        const allUsers = await getDocs(usersCol);
        allUsers.forEach(docSnap => {
          const u = docSnap.data() as Usuario;
          if (
            (u.documento && u.documento.toLowerCase() === docClean) ||
            (u.email && u.email.toLowerCase() === docClean) ||
            (u.tipo === 'super_user' && (docClean === '123456' || docClean === 'super' || docClean === 'admin'))
          ) {
            snapshot = { empty: false, docs: [docSnap], forEach: (fn: any) => fn(docSnap) } as any;
          }
        });
      }

      if (snapshot.empty) {
        console.warn("[ASISCR FIREBASE] Ningún usuario encontrado con este documento/email.");
        return null;
      }
      
      let authenticatedUser: Usuario | null = null;
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Usuario;
        if (data.contrasena === passClean) {
          authenticatedUser = {
            ...data,
            modulosPermitidos: data.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[data.tipo] || []
          };
        }
      });
      
      if (!authenticatedUser) {
        console.warn("[ASISCR FIREBASE] Contraseña incorrecta.");
        return null;
      }
      
      const user = authenticatedUser as Usuario;
      // Super user can access everything
      if (user.tipo === 'super_user') return user;

      if (isDocenteAccess) {
        if (user.tipo === 'docente' || user.tipo === 'directivo' || user.tipo === 'porteria') {
          return user;
        }
        console.warn("[ASISCR FIREBASE] Intento de acceso administrativo por parte de rol sin permisos.");
        return null;
      } else {
        return user;
      }
    } catch (err) {
      console.error("[ASISCR FIREBASE] Error de consulta en la autenticación de usuarios:", err);
      throw err;
    }
  },

  // ================= USERS CRUD =================
  async getUsuarios(): Promise<Usuario[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const list: Usuario[] = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data() as Usuario;
        list.push({
          ...u,
          modulosPermitidos: u.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[u.tipo] || []
        });
      });
      return list;
    } catch (err) {
      console.error("[ASISCR FIREBASE] Error leyendo usuarios de Firestore:", err);
      throw err;
    }
  },

  async saveUsuario(usuario: Usuario): Promise<{ success: boolean; error?: string }> {
    try {
      const uRef = doc(db, 'usuarios', usuario.id);
      const cleanUser = cleanForFirestore({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email || '',
        tipo: usuario.tipo,
        documento: usuario.documento,
        contrasena: usuario.contrasena,
        modulosPermitidos: usuario.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[usuario.tipo] || [],
        grado: usuario.grado || '',
        telefono: usuario.telefono || '',
        activo: usuario.activo ?? true,
        creadoEn: usuario.creadoEn || new Date().toISOString()
      });
      await setDoc(uRef, cleanUser);
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error guardando usuario:", err);
      return { success: false, error: err.message || 'Error guardando usuario' };
    }
  },

  async deleteUsuario(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'usuarios', id));
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error eliminando usuario:", err);
      return { success: false, error: err.message || 'Error eliminando usuario' };
    }
  },

  // ================= HORARIOS CRUD =================
  async getHorarios(gradoId?: string): Promise<HorarioClase[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'horarios'));
      const list: HorarioClase[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as HorarioClase);
      });
      if (list.length > 0) {
        if (!gradoId || gradoId === 'todos') return list;
        return list.filter(h => h.grado_id === gradoId || h.grado_nombre === gradoId);
      }
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo horarios de Firestore (usando fallback local):", err?.message || err);
    }
    // Fallback if Firestore query was blocked or returned empty
    const fallbackList = INITIAL_HORARIOS;
    if (!gradoId || gradoId === 'todos') return fallbackList;
    return fallbackList.filter(h => h.grado_id === gradoId || h.grado_nombre === gradoId);
  },

  async saveHorario(horario: HorarioClase): Promise<{ success: boolean; error?: string }> {
    try {
      const hRef = doc(db, 'horarios', horario.id);
      await setDoc(hRef, cleanForFirestore(horario));
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error guardando horario en Firestore:", err?.message || err);
      return { success: false, error: err?.message || 'Error guardando horario en Firestore' };
    }
  },

  async deleteHorario(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'horarios', id));
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error eliminando horario en Firestore:", err?.message || err);
      return { success: false, error: err?.message || 'Error eliminando horario en Firestore' };
    }
  },

  // ================= AVISOS DOCENTE / CELADOR =================
  async getAvisos(): Promise<AvisoDocenteCelador[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'avisos'));
      const list: AvisoDocenteCelador[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AvisoDocenteCelador);
      });
      if (list.length > 0) {
        return list.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
      }
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo avisos de Firestore (usando fallback local):", err?.message || err);
    }
    // Fallback if Firestore query was blocked or returned empty
    return [...INITIAL_AVISOS].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  },

  async saveAviso(aviso: AvisoDocenteCelador): Promise<{ success: boolean; error?: string }> {
    try {
      const avRef = doc(db, 'avisos', aviso.id);
      await setDoc(avRef, cleanForFirestore({
        ...aviso,
        estudiante_nombre: aviso.estudiante_nombre || '',
        grado: aviso.grado || '',
        respuesta: aviso.respuesta || '',
        atendido_por: aviso.atendido_por || ''
      }));
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error guardando aviso en Firestore:", err?.message || err);
      return { success: false, error: err?.message || 'Error guardando aviso en Firestore' };
    }
  },

  async updateAvisoEstado(
    id: string, 
    estado: 'pendiente' | 'atendido' | 'resuelto', 
    atendidoPor?: string, 
    respuesta?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const avRef = doc(db, 'avisos', id);
      const updateData: any = { estado };
      if (atendidoPor) updateData.atendido_por = atendidoPor;
      if (respuesta) updateData.respuesta = respuesta;
      await setDoc(avRef, updateData, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error actualizando estado de aviso:", err);
      return { success: false, error: err.message || 'Error actualizando aviso' };
    }
  },

  async deleteAviso(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'avisos', id));
      return { success: true };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error eliminando aviso:", err);
      return { success: false, error: err.message || 'Error eliminando aviso' };
    }
  },

  // ================= GRADOS, MATERIAS, ESTUDIANTES =================
  async getGrados(): Promise<Grado[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'grados'));
      const list: Grado[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Grado);
      });
      return list;
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo grados de Firestore (usando iniciales):", err?.message || err);
      return INITIAL_GRADOS;
    }
  },

  async saveGrado(grado: Grado): Promise<{ success: boolean; error?: string }> {
    try {
      const gradosSnapshot = await getDocs(collection(db, 'grados'));
      const existing = gradosSnapshot.docs.find(item => item.id === grado.id);
      const duplicate = gradosSnapshot.docs.find(item =>
        item.id !== grado.id &&
        String(item.data().nombre || '').trim().toLocaleLowerCase() === grado.nombre.trim().toLocaleLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Ya existe un grupo con ese nombre.' };
      }

      const oldName = String(existing?.data().nombre || '');
      const nameChanged = Boolean(existing && oldName !== grado.nombre);
      const batch = writeBatch(db);
      batch.set(doc(db, 'grados', grado.id), cleanForFirestore(grado));

      if (nameChanged) {
        const [students, schedules, users] = await Promise.all([
          getDocs(collection(db, 'estudiantes')),
          getDocs(collection(db, 'horarios')),
          getDocs(collection(db, 'usuarios')),
        ]);
        const matchingStudents = students.docs.filter(item =>
          item.data().grado === oldName || item.data().grado === grado.id
        );
        const matchingSchedules = schedules.docs.filter(item =>
          item.data().grado_id === grado.id || item.data().grado_nombre === oldName
        );
        const matchingUsers = users.docs.filter(item =>
          item.data().grado === oldName || item.data().grado === grado.id
        );
        if (1 + matchingStudents.length + matchingSchedules.length + matchingUsers.length > 500) {
          return { success: false, error: 'No se pudo renombrar el grupo: hay demasiados registros relacionados para actualizar de forma segura.' };
        }

        matchingStudents.forEach(item => batch.update(doc(db, 'estudiantes', item.id), { grado: grado.nombre }));
        matchingSchedules.forEach(item => batch.update(doc(db, 'horarios', item.id), { grado_nombre: grado.nombre }));
        matchingUsers.forEach(item => batch.update(doc(db, 'usuarios', item.id), { grado: grado.nombre }));
      }

      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.error('[ASISCR FIREBASE] Error guardando grupo:', err);
      return { success: false, error: err?.message || 'Error guardando grupo en Firestore.' };
    }
  },

  async deleteGrado(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const grados = await getDocs(collection(db, 'grados'));
      const grade = grados.docs.find(item => item.id === id);
      const gradeName = String(grade?.data().nombre || '');
      const [students, subjects, schedules, users] = await Promise.all([
        getDocs(collection(db, 'estudiantes')),
        getDocs(collection(db, 'materias')),
        getDocs(collection(db, 'horarios')),
        getDocs(collection(db, 'usuarios')),
      ]);
      const inUse = students.docs.some(item => item.data().grado === gradeName || item.data().grado === id)
        || subjects.docs.some(item => item.data().grado_id === id)
        || schedules.docs.some(item => item.data().grado_id === id || item.data().grado_nombre === gradeName)
        || users.docs.some(item => item.data().grado === gradeName || item.data().grado === id);
      if (inUse) {
        return { success: false, error: 'No se puede eliminar el grupo porque tiene estudiantes, materias, horarios o usuarios asignados.' };
      }
      await deleteDoc(doc(db, 'grados', id));
      return { success: true };
    } catch (err: any) {
      console.error('[ASISCR FIREBASE] Error eliminando grupo:', err);
      return { success: false, error: err?.message || 'Error eliminando grupo de Firestore.' };
    }
  },

  async getMaterias(gradoNombreOrId?: string): Promise<Materia[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'materias'));
      let list: Materia[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Materia);
      });
      if (list.length === 0) list = INITIAL_MATERIAS;
      if (!gradoNombreOrId || gradoNombreOrId === 'todas') return list;
      const grados = await this.getGrados();
      const foundGrado = grados.find(g => g.id === gradoNombreOrId || g.nombre === gradoNombreOrId);
      if (!foundGrado) return list;
      return list.filter(m => m.grado_id === foundGrado.id);
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo materias de Firestore (usando iniciales):", err?.message || err);
      const list = INITIAL_MATERIAS;
      if (!gradoNombreOrId || gradoNombreOrId === 'todas') return list;
      const foundGrado = INITIAL_GRADOS.find(g => g.id === gradoNombreOrId || g.nombre === gradoNombreOrId);
      if (!foundGrado) return list;
      return list.filter(m => m.grado_id === foundGrado.id);
    }
  },

  async getEstudiantes(gradoNombreOrId?: string): Promise<Estudiante[]> {
    try {
      await this.seedInitialDataIfEmpty();
      const snapshot = await getDocs(collection(db, 'estudiantes'));
      const list: Estudiante[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Estudiante);
      });
      if (!gradoNombreOrId || gradoNombreOrId === 'todos') return list;
      const grades = await this.getGrados();
      const grade = grades.find(item => item.id === gradoNombreOrId || item.nombre === gradoNombreOrId);
      return list.filter(student =>
        student.grado === gradoNombreOrId ||
        student.grado === grade?.id ||
        student.grado === grade?.nombre
      );
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo estudiantes de Firestore (usando iniciales):", err?.message || err);
      const list = INITIAL_ESTUDIANTES;
      if (!gradoNombreOrId || gradoNombreOrId === 'todos') return list;
      const grade = INITIAL_GRADOS.find(item => item.id === gradoNombreOrId || item.nombre === gradoNombreOrId);
      return list.filter(student =>
        student.grado === gradoNombreOrId ||
        student.grado === grade?.id ||
        student.grado === grade?.nombre
      );
    }
  },

  async saveEstudiante(estudiante: Estudiante): Promise<{ success: boolean; error?: string }> {
    try {
      const existing = await getDocs(query(
        collection(db, 'estudiantes'),
        where('documento', '==', estudiante.documento)
      ));
      if (existing.docs.some(item => item.id !== estudiante.id)) {
        return { success: false, error: 'Ya existe un estudiante con ese documento.' };
      }
      await setDoc(doc(db, 'estudiantes', estudiante.id), cleanForFirestore(estudiante));
      return { success: true };
    } catch (err: any) {
      console.error('[ASISCR FIREBASE] Error guardando estudiante:', err);
      return { success: false, error: err?.message || 'Error guardando estudiante en Firestore.' };
    }
  },

  async deleteEstudiante(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const attendance = await getDocs(query(
        collection(db, 'asistencias'),
        where('estudiante_id', '==', id)
      ));
      if (!attendance.empty) {
        return { success: false, error: 'No se puede eliminar el estudiante porque tiene registros de asistencia.' };
      }
      await deleteDoc(doc(db, 'estudiantes', id));
      return { success: true };
    } catch (err: any) {
      console.error('[ASISCR FIREBASE] Error eliminando estudiante:', err);
      return { success: false, error: err?.message || 'Error eliminando estudiante de Firestore.' };
    }
  },

  // ================= ASISTENCIAS =================
  async getAsistencias(materiaId?: string, fecha?: string): Promise<Asistencia[]> {
    try {
      await this.seedInitialDataIfEmpty();
      // Single-field queries prevent composite index requirements
      let q = query(collection(db, 'asistencias'));
      if (fecha) {
        q = query(collection(db, 'asistencias'), where('fecha', '==', fecha));
      } else if (materiaId && materiaId !== 'todas') {
        q = query(collection(db, 'asistencias'), where('materia_id', '==', materiaId));
      }
      
      const snapshot = await getDocs(q);
      let list: Asistencia[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Asistencia);
      });

      // Filter in-memory for remaining condition if needed
      if (materiaId && materiaId !== 'todas') {
        list = list.filter(a => a.materia_id === materiaId);
      }
      if (fecha) {
        list = list.filter(a => a.fecha === fecha);
      }

      return list;
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso leyendo asistencias de Firestore:", err?.message || err);
      return [];
    }
  },

  async saveAsistencias(
    materiaId: string, 
    fecha: string, 
    registros: { estudiante_id: string; estado: AttendanceStatus; observaciones?: string }[], 
    registradoPor: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const batch = writeBatch(db);
      for (const r of registros) {
        const docId = `${materiaId}_${fecha}_${r.estudiante_id}`;
        const aRef = doc(db, 'asistencias', docId);
        
        const asistenciaRecord: Asistencia = {
          id: docId,
          estudiante_id: r.estudiante_id,
          materia_id: materiaId,
          fecha,
          estado: r.estado,
          registrado_por: registradoPor,
          observaciones: r.observaciones || ''
        };
        
        batch.set(aRef, cleanForFirestore(asistenciaRecord));
      }
      
      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso guardando asistencias en Firestore:", err?.message || err);
      return { 
        success: false, 
        error: err.message || 'Error de permisos o conexión al guardar en Firebase' 
      };
    }
  },

  async getExpedienteEstudiante(documento: string, year: number, month: number): Promise<{ estudiante: Estudiante; asistencias: Asistencia[] }> {
    try {
      await this.seedInitialDataIfEmpty();
      const estCol = collection(db, 'estudiantes');
      const qEst = query(estCol, where('documento', '==', documento));
      const estSnapshot = await getDocs(qEst);
      
      let student: Estudiante | null = null;
      if (!estSnapshot.empty) {
        estSnapshot.forEach(docSnap => {
          student = docSnap.data() as Estudiante;
        });
      }
      
      if (!student) {
        student = INITIAL_ESTUDIANTES.find(e => e.documento === documento) || INITIAL_ESTUDIANTES[0];
      }
      
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const startDate = `${year}-${monthStr}-01`;
      const endDate = `${year}-${monthStr}-31`;
      
      // CRITICAL FIX: Query ONLY by single-field 'estudiante_id'.
      // This completely avoids the composite index requirement error!
      const astCol = collection(db, 'asistencias');
      const qAst = query(
        astCol, 
        where('estudiante_id', '==', student.id)
      );
      
      const astSnapshot = await getDocs(qAst);
      const asistenciasList: Asistencia[] = [];
      astSnapshot.forEach(docSnap => {
        const data = docSnap.data() as Asistencia;
        if (data.fecha >= startDate && data.fecha <= endDate) {
          asistenciasList.push(data);
        }
      });
      
      return {
        estudiante: student,
        asistencias: asistenciasList
      };
    } catch (err: any) {
      console.warn("[ASISCR FIREBASE] Aviso obteniendo expediente de Firestore (usando fallback local):", err?.message || err);
      const fallback = INITIAL_ESTUDIANTES.find(e => e.documento === documento) || INITIAL_ESTUDIANTES[0];
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const datePrefix = `${year}-${monthStr}`;
      const astFallback = INITIAL_ASISTENCIAS.filter(a => a.estudiante_id === fallback.id && a.fecha.startsWith(datePrefix));
      return {
        estudiante: fallback,
        asistencias: astFallback
      };
    }
  },

  // ================= DATABASE ADMINISTRATION SUITE =================
  async getDatabaseOverview(): Promise<{
    status: 'connected' | 'error';
    counts: {
      usuarios: number;
      grados: number;
      materias: number;
      estudiantes: number;
      asistencias: number;
      horarios: number;
      avisos: number;
    };
    error?: string;
  }> {
    try {
      const results = await Promise.allSettled([
        getDocs(collection(db, 'usuarios')),
        getDocs(collection(db, 'grados')),
        getDocs(collection(db, 'materias')),
        getDocs(collection(db, 'estudiantes')),
        getDocs(collection(db, 'asistencias')),
        getDocs(collection(db, 'horarios')),
        getDocs(collection(db, 'avisos')),
      ]);

      const [uRes, gRes, mRes, eRes, aRes, hRes, avRes] = results;

      const getCount = (res: PromiseSettledResult<any>) => 
        res.status === 'fulfilled' ? res.value.size : 0;

      const hasAnySuccess = results.some(r => r.status === 'fulfilled');
      const hasErrors = results.some(r => r.status === 'rejected');

      return {
        status: hasAnySuccess ? 'connected' : 'error',
        counts: {
          usuarios: getCount(uRes),
          grados: getCount(gRes),
          materias: getCount(mRes),
          estudiantes: getCount(eRes),
          asistencias: getCount(aRes),
          horarios: getCount(hRes),
          avisos: getCount(avRes),
        },
        error: hasErrors ? 'Reglas incompletas en Firebase Console: verifica que horarios y avisos estén incluidos en tus reglas de Firestore.' : undefined
      };
    } catch (err: any) {
      return {
        status: 'error',
        counts: { usuarios: 0, grados: 0, materias: 0, estudiantes: 0, asistencias: 0, horarios: 0, avisos: 0 },
        error: err.message || 'No se pudo conectar a Firestore'
      };
    }
  },

  async exportFullDatabase(): Promise<Record<string, any[]>> {
    const collectionsToExport = ['usuarios', 'grados', 'materias', 'estudiantes', 'asistencias', 'horarios', 'avisos'];
    const exportData: Record<string, any[]> = {};

    for (const colName of collectionsToExport) {
      const snap = await getDocs(collection(db, colName));
      exportData[colName] = [];
      snap.forEach(d => exportData[colName].push(d.data()));
    }

    return exportData;
  },

  async importFullDatabase(backupData: Record<string, any[]>): Promise<{ success: boolean; message: string }> {
    try {
      const collections = Object.keys(backupData);
      let totalRecords = 0;

      for (const colName of collections) {
        const records = backupData[colName];
        if (Array.isArray(records)) {
          // Commit in batches of 300 to stay safely below Firestore 500 limit
          for (let i = 0; i < records.length; i += 300) {
            const chunk = records.slice(i, i + 300);
            const batch = writeBatch(db);
            for (const item of chunk) {
              const docId = item.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
              const docRef = doc(db, colName, docId);
              batch.set(docRef, cleanForFirestore(item), { merge: true });
              totalRecords++;
            }
            await batch.commit();
          }
        }
      }

      return { success: true, message: `Restauración exitosa: ${totalRecords} documentos importados.` };
    } catch (err: any) {
      console.error("[ASISCR FIREBASE] Error restaurando base de datos:", err);
      return { success: false, message: err.message || 'Error importando base de datos' };
    }
  }
};
