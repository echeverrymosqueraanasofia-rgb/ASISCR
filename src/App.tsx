import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { UnifiedLogin } from './components/UnifiedLogin';
import { DocenteGradeSelect } from './components/DocenteGradeSelect';
import { TomaAsistencia } from './components/TomaAsistencia';
import { EstudianteCalendar } from './components/EstudianteCalendar';
import { ContactView } from './components/ContactView';
import { FirebaseBackendInspector } from './components/FirebaseBackendInspector';
import { UserProfileModal } from './components/UserProfileModal';

// Core Functional Modules
import { GestionUsuarios } from './components/GestionUsuarios';
import { GestionGrupos } from './components/GestionGrupos';
import { GestionEstudiantes } from './components/GestionEstudiantes';
import { AvisosDocenteCelador } from './components/AvisosDocenteCelador';
import { ConsultaAsistencia } from './components/ConsultaAsistencia';
import { CrearHorarios } from './components/CrearHorarios';
import { AdminBaseDatos } from './components/AdminBaseDatos';
import { PorteriaScanner } from './components/PorteriaScanner';
import { MiHorario } from './components/MiHorario';
import { InicioUsuario } from './components/InicioUsuario';

import { 
  AppView, 
  Usuario, 
  Grado, 
  Materia, 
  Estudiante, 
  Asistencia, 
  AttendanceStatus, 
  EngineMode,
  HorarioClase,
  AvisoDocenteCelador,
  DEFAULT_ROLE_PERMISSIONS
} from './types';
import { storageService } from './services/storageService';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [engineMode, setEngineMode] = useState<EngineMode>('firebase');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Loaded dataset
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [avisos, setAvisos] = useState<AvisoDocenteCelador[]>([]);

  // Selection state for Docente flow
  const [selectedGradoId, setSelectedGradoId] = useState<string>('gr_11a');
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('mat_mat_11a');

  // Load dataset asynchronously
  const reloadData = async (mode?: EngineMode) => {
    const activeMode = mode || storageService.getEngineMode();
    setEngineMode(activeMode);
    
    try {
      const [
        loadedUsuarios,
        loadedGrados,
        loadedMaterias,
        loadedEstudiantes,
        loadedAsistencias,
        loadedHorarios,
        loadedAvisos
      ] = await Promise.all([
        storageService.getUsuariosAsync(),
        storageService.getGradosAsync(),
        storageService.getMateriasAsync(),
        storageService.getEstudiantesAsync(),
        storageService.getAsistenciasAsync(),
        storageService.getHorariosAsync(),
        storageService.getAvisosAsync()
      ]);

      setUsuarios(loadedUsuarios);
      setGrados(loadedGrados);
      setMaterias(loadedMaterias);
      setEstudiantes(loadedEstudiantes);
      setAsistencias(loadedAsistencias);
      setHorarios(loadedHorarios);
      setAvisos(loadedAvisos);

      // Refresh current user if logged in
      if (currentUser) {
        const freshUser = loadedUsuarios.find(u => u.id === currentUser.id);
        if (freshUser) setCurrentUser(freshUser);
      }
    } catch (e) {
      console.error("[ASISCR] Error cargando datos de base de datos:", e);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSelectEngine = (mode: EngineMode) => {
    storageService.setEngineMode(mode);
    reloadData(mode);
  };

  const handleResetData = async () => {
    storageService.resetDemoData();
    await reloadData();
    setCurrentView('splash');
  };

  // Single Unified Auth Handler for all roles
  const handleUnifiedLogin = async (identificador: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await storageService.authenticateUserAsync(identificador, pass, false);
      if (user) {
        setCurrentUser(user);
        if (user.tipo === 'estudiantes' || user.tipo === 'acudientes') {
          try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const res = await storageService.getExpedienteEstudianteAsync(user.documento, currentYear, currentMonth);
            if (res && res.asistencias.length > 0) {
              const otherAsistencias = asistencias.filter(a => a.estudiante_id !== res.estudiante.id);
              setAsistencias([...otherAsistencias, ...res.asistencias]);
            }
          } catch (e) {
            console.warn("Could not preload live student attendance:", e);
          }
        }

        // Direct users to their primary module
        if (user.tipo === 'super_user') {
          setCurrentView('admin_base_datos');
        } else if (user.tipo === 'directivo') {
          setCurrentView('crear_horarios');
        } else if (user.tipo === 'docente') {
          setCurrentView('select_grado');
        } else if (user.tipo === 'porteria') {
          setCurrentView('porteria_scanner');
        } else {
          setCurrentView('expediente_estudiante');
        }
        return { success: true };
      }
      return { 
        success: false, 
        error: 'Credenciales inválidas. Verifica tu correo electrónico o documento y tu contraseña (por defecto: 123456).' 
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error al autenticar' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('splash');
  };

  // User Profile Update (including password change with validation)
  const handleUpdateCurrentUser = async (updatedUser: Usuario) => {
    const res = await storageService.saveUsuarioAsync(updatedUser);
    if (res.success) {
      setCurrentUser(updatedUser);
      const updatedList = await storageService.getUsuariosAsync();
      setUsuarios(updatedList);
    }
    return res;
  };

  // User CRUD Handlers
  const handleSaveUsuario = async (user: Usuario) => {
    const res = await storageService.saveUsuarioAsync(user);
    if (res.success) {
      const updated = await storageService.getUsuariosAsync();
      setUsuarios(updated);
    }
    return res;
  };

  const handleDeleteUsuario = async (id: string) => {
    const res = await storageService.deleteUsuarioAsync(id);
    if (res.success) {
      const updated = await storageService.getUsuariosAsync();
      setUsuarios(updated);
    }
    return res;
  };

  const handleSaveGrado = (grado: Grado) => storageService.saveGradoAsync(grado);

  const handleDeleteGrado = (id: string) => storageService.deleteGradoAsync(id);

  const handleSaveEstudiante = (estudiante: Estudiante) => storageService.saveEstudianteAsync(estudiante);

  const handleDeleteEstudiante = (id: string) => storageService.deleteEstudianteAsync(id);

  // Horarios CRUD Handlers
  const handleSaveHorario = async (horario: HorarioClase) => {
    const res = await storageService.saveHorarioAsync(horario);
    if (res.success) {
      const updated = await storageService.getHorariosAsync();
      setHorarios(updated);
    }
    return res;
  };

  const handleDeleteHorario = async (id: string) => {
    const res = await storageService.deleteHorarioAsync(id);
    if (res.success) {
      const updated = await storageService.getHorariosAsync();
      setHorarios(updated);
    }
    return res;
  };

  // Avisos Handlers
  const handleSaveAviso = async (aviso: AvisoDocenteCelador) => {
    const res = await storageService.saveAvisoAsync(aviso);
    if (res.success) {
      const updated = await storageService.getAvisosAsync();
      setAvisos(updated);
    }
    return res;
  };

  const handleUpdateAvisoEstado = async (
    id: string, 
    estado: 'pendiente' | 'atendido' | 'resuelto', 
    atendidoPor?: string, 
    respuesta?: string
  ) => {
    const res = await storageService.updateAvisoEstadoAsync(id, estado, atendidoPor, respuesta);
    if (res.success) {
      const updated = await storageService.getAvisosAsync();
      setAvisos(updated);
    }
    return res;
  };

  // Attendance Save Handler
  const handleSaveAttendance = async (
    materiaId: string, 
    fecha: string, 
    registros: { estudiante_id: string; estado: AttendanceStatus; observaciones?: string }[]
  ): Promise<{ success: boolean; error?: string }> => {
    const teacherName = currentUser ? currentUser.nombre : 'Carlos Mendoza';
    const result = await storageService.saveAsistenciasAsync(materiaId, fecha, registros, teacherName);
    const loadedAsistencias = await storageService.getAsistenciasAsync();
    setAsistencias(loadedAsistencias);
    return result;
  };

  // Active student for calendar
  const activeStudent: Estudiante = (currentUser && (currentUser.tipo === 'estudiantes' || currentUser.tipo === 'estudiante'))
    ? (estudiantes.find(e => e.documento === currentUser.documento) || estudiantes[0])
    : estudiantes[0];

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans text-[#2C332B] flex flex-col selection:bg-[#3D5245] selection:text-white">
      
      {/* Top Header Bar */}
      <Header
        currentUser={currentUser}
        engineMode={engineMode}
        onToggleMenu={() => setIsNavOpen(true)}
        onSelectEngine={handleSelectEngine}
        onLogout={handleLogout}
        onOpenPhpInspector={() => setCurrentView('php_inspector')}
        onOpenFirebaseInspector={() => setCurrentView('firebase_inspector')}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Navigation Drawer Menu */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        currentView={currentView}
        currentUser={currentUser}
        engineMode={engineMode}
        onNavigate={(view) => setCurrentView(view)}
        onSelectEngine={handleSelectEngine}
        onResetData={handleResetData}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* User Profile & Password Change Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateCurrentUser}
        />
      )}

      {/* Main Screen Router */}
      <main className="flex-1">
        {/* Acceso Único e Integrado para todos los roles de la institución */}
        {!currentUser && (
          <UnifiedLogin
            onLogin={handleUnifiedLogin}
            engineMode={engineMode}
            onSelectEngine={handleSelectEngine}
          />
        )}

        {currentUser && currentView === 'splash' && (
          <InicioUsuario
            currentUser={currentUser}
            onNavigate={setCurrentView}
          />
        )}

        {/* 6. Directivo / Super User: Crear y Gestionar Horarios */}
        {currentView === 'crear_horarios' && (
          <CrearHorarios
            currentUser={currentUser || { id: 'usr_dir_1', nombre: 'Dr. Roberto Silva', tipo: 'directivo', documento: '20002000', contrasena: '123456' }}
            horarios={horarios}
            grados={grados}
            materias={materias}
            onSaveHorario={handleSaveHorario}
            onDeleteHorario={handleDeleteHorario}
            onRefresh={() => reloadData()}
          />
        )}

        {/* 7. Directivo y Docente: Consulta de Asistencia */}
        {currentView === 'consulta_asistencia' && (
          <ConsultaAsistencia
            asistencias={asistencias}
            estudiantes={estudiantes}
            grados={grados}
            materias={materias}
          />
        )}

        {/* 8. Directivo y Docente: Avisos Docente / Celador */}
        {currentView === 'avisos_docente_celador' && (
          <AvisosDocenteCelador
            currentUser={currentUser || { id: 'usr_doc_1', nombre: 'Carlos Mendoza', tipo: 'docente', documento: '12345678', contrasena: '123456' }}
            avisos={avisos}
            onSaveAviso={handleSaveAviso}
            onUpdateEstado={handleUpdateAvisoEstado}
            onRefresh={() => reloadData()}
          />
        )}

        {/* 9. Super Usuario: Administrar Base de Datos */}
        {currentView === 'admin_base_datos' && (
          <AdminBaseDatos
            onDataChanged={() => reloadData()}
            engineMode={engineMode}
            onSelectEngine={handleSelectEngine}
          />
        )}

        {/* 10. Super Usuario: Gestión de Usuarios */}
        {currentView === 'gestion_usuarios' && (
          <GestionUsuarios
            currentUser={currentUser || { id: 'usr_super_1', nombre: 'Ing. J. F. Cortez', tipo: 'super_user', documento: '10001000', contrasena: '123456' }}
            usuarios={usuarios}
            onSaveUsuario={handleSaveUsuario}
            onDeleteUsuario={handleDeleteUsuario}
            onRefresh={() => reloadData()}
          />
        )}

        {currentView === 'gestion_grupos' && (
          <GestionGrupos
            grados={grados}
            onSaveGrado={handleSaveGrado}
            onDeleteGrado={handleDeleteGrado}
            onRefresh={() => reloadData()}
          />
        )}

        {currentView === 'gestion_estudiantes' && (
          <GestionEstudiantes
            estudiantes={estudiantes}
            grados={grados}
            onSaveEstudiante={handleSaveEstudiante}
            onDeleteEstudiante={handleDeleteEstudiante}
            onRefresh={() => reloadData()}
          />
        )}

        {/* 11. Docente: Selección de Grado para Asistencia */}
        {currentView === 'select_grado' && (
          <DocenteGradeSelect
            user={currentUser || { id: 'usr_doc_1', nombre: 'Carlos Mendoza', tipo: 'docente', documento: '12345678', contrasena: '123456' }}
            grados={grados}
            materias={materias}
            onContinue={(gId, mId) => {
              setSelectedGradoId(gId);
              setSelectedMateriaId(mId);
              setCurrentView('toma_asistencia');
            }}
          />
        )}

        {/* 12. Docente: Toma de Asistencia */}
        {currentView === 'toma_asistencia' && (
          <TomaAsistencia
            user={currentUser || { id: 'usr_doc_1', nombre: 'Carlos Mendoza', tipo: 'docente', documento: '12345678', contrasena: '123456' }}
            grados={grados}
            materias={materias}
            initialGradoId={selectedGradoId}
            initialMateriaId={selectedMateriaId}
            estudiantes={estudiantes}
            existingAsistencias={asistencias}
            engineMode={engineMode}
            onSave={handleSaveAttendance}
            onBack={() => setCurrentView('select_grado')}
          />
        )}

        {/* 13. Portería: Control de Puerta y Novedades */}
        {currentView === 'porteria_scanner' && (
          <PorteriaScanner
            currentUser={currentUser || { id: 'usr_por_1', nombre: 'José Quintero (Guardia)', tipo: 'porteria', documento: '30003000', contrasena: '123456' }}
            estudiantes={estudiantes}
            onEmitirAviso={handleSaveAviso}
            onRefresh={() => reloadData()}
          />
        )}

        {/* 14. Mi Horario Personal */}
        {currentView === 'mi_horario' && (
          <MiHorario
            currentUser={currentUser || { id: 'usr_doc_1', nombre: 'Carlos Mendoza', tipo: 'docente', documento: '12345678', contrasena: '123456', grado: '11-A' }}
            horarios={horarios}
          />
        )}

        {/* 15. Expediente Estudiantil */}
        {currentView === 'expediente_estudiante' && (
          <EstudianteCalendar
            estudiante={activeStudent}
            asistencias={asistencias}
            materias={materias}
          />
        )}

        {/* 16. Contacto */}
        {currentView === 'contact' && (
          <ContactView />
        )}

        {/* 17. Firebase Backend Inspector */}
        {currentView === 'firebase_inspector' && (
          <FirebaseBackendInspector />
        )}
      </main>

    </div>
  );
}
