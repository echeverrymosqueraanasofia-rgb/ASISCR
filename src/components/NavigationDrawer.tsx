import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Mail, 
  Flame, 
  RotateCcw, 
  X, 
  Shield, 
  Users, 
  Bell, 
  FileSpreadsheet, 
  CalendarDays, 
  Database, 
  DoorOpen, 
  GraduationCap,
  Calendar,
  KeyRound,
  Building2,
  School,
  UserRound
} from 'lucide-react';
import { AppView, Usuario, EngineMode, AppModule } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  currentUser: Usuario | null;
  engineMode: EngineMode;
  onNavigate: (view: AppView) => void;
  onSelectEngine: (mode: EngineMode) => void;
  onResetData: () => void;
  onOpenProfile?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  currentUser,
  engineMode,
  onNavigate,
  onSelectEngine,
  onResetData,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  // Helper to check if current user has permission for a module
  const hasModule = (mod: AppModule): boolean => {
    if (!currentUser) return false;
    if (currentUser.tipo === 'super_user') return true;
    if (currentUser.modulosPermitidos && currentUser.modulosPermitidos.includes(mod)) return true;
    return false;
  };

  const navItem = (view: AppView, label: string, Icon: any, highlight = false) => (
    <button
      onClick={() => {
        onNavigate(view);
        onClose();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
        currentView === view
          ? 'bg-[#ea580c] text-white shadow-md'
          : 'text-amber-100 hover:bg-[#5c230b] hover:text-amber-300'
      } ${highlight ? 'border border-amber-500/40' : ''}`}
    >
      <Icon className="w-4 h-4 text-amber-300 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#3b1406] shadow-2xl flex flex-col z-50 border-r border-[#5c230b] text-amber-100">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#5c230b] flex items-center justify-between bg-[#2d0e04]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-11 rounded-b-lg bg-[#3b1406] border-2 border-[#ca8a04] flex flex-col items-center justify-center text-amber-300">
              <Shield className="w-4 h-4 fill-amber-400 text-[#3b1406]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block leading-none mb-1">
                INSTITUCIÓN EDUCATIVA
              </span>
              <h2 className="text-sm font-black text-white tracking-tight uppercase">
                CRISTO REY
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-300 hover:text-white hover:bg-[#5c230b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session Info Pill */}
        {currentUser && (
          <div className="px-4 py-3 bg-[#491a08] border-b border-[#5c230b] text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-amber-400 font-bold block">
                  Sesión Activa
                </span>
                <p className="font-bold text-white truncate max-w-[170px]">{currentUser.nombre}</p>
              </div>
              {onOpenProfile && (
                <button
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors cursor-pointer"
                  title="Cambiar contraseña y datos"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[#ea580c] text-[10px] font-black uppercase tracking-wider text-white">
              {currentUser.tipo === 'super_user' ? 'Super Usuario' : currentUser.tipo}
            </span>
          </div>
        )}

        {/* Conmutador de Motor de Base de Datos */}
        <div className="px-4 py-2.5 bg-[#2d0e04] border-b border-[#5c230b]">
          <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1.5">
            Motor de Base de Datos Activo:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectEngine('firebase')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                engineMode === 'firebase'
                  ? 'bg-[#ea580c] text-white shadow-xs'
                  : 'bg-[#3b1406] text-amber-200/70 hover:bg-[#491a08]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Firebase</span>
            </button>
            <button
              onClick={() => onSelectEngine('php')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                engineMode === 'php'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#3b1406] text-amber-200/70 hover:bg-[#491a08]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-300" />
              <span>PHP Local</span>
            </button>
          </div>
          <span className="text-[9px] text-amber-400/70 mt-1 block font-mono">
            {engineMode === 'firebase' ? '• Conectado a Firestore Cloud' : '• Conectado a MySQL (localhost)'}
          </span>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* General */}
          {navItem('splash', 'Inicio', Home)}

          {/* SUPER USER ONLY */}
          {currentUser?.tipo === 'super_user' && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-amber-400">
                Super Usuario (DBA)
              </div>
              {navItem('admin_base_datos', 'Administrar Base de Datos', Database, true)}
              {navItem('gestion_usuarios', 'Gestión de Usuarios y Roles', Users, true)}
              {navItem('gestion_grupos', 'Gestión de Grupos', School, true)}
              {navItem('gestion_estudiantes', 'Gestión de Estudiantes', UserRound, true)}
            </>
          )}

          {/* DIRECTIVO MODULES */}
          {(currentUser?.tipo === 'directivo' || (currentUser?.tipo === 'super_user')) && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                Módulo Directivos
              </div>
              {hasModule('crear_horarios') && navItem('crear_horarios', 'Crear y Gestionar Horarios', CalendarDays)}
              {hasModule('consulta_asistencia') && navItem('consulta_asistencia', 'Consulta de Asistencia', FileSpreadsheet)}
              {hasModule('avisos_docente_celador') && navItem('avisos_docente_celador', 'Avisos Celador / Docente', Bell)}
            </>
          )}

          {/* DOCENTE MODULES */}
          {(currentUser?.tipo === 'docente' || (currentUser?.tipo === 'super_user')) && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Módulo Docentes
              </div>
              {hasModule('toma_asistencia') && navItem('select_grado', 'Toma de Asistencia', LayoutDashboard)}
              {hasModule('consulta_asistencia') && currentUser?.tipo === 'docente' && navItem('consulta_asistencia', 'Consulta de Asistencia', FileSpreadsheet)}
              {hasModule('avisos_docente_celador') && currentUser?.tipo === 'docente' && navItem('avisos_docente_celador', 'Avisos Docente / Celador', Bell)}
              {hasModule('mi_horario') && navItem('mi_horario', 'Mi Horario de Clases', Calendar)}
            </>
          )}

          {/* PORTERÍA MODULES */}
          {(currentUser?.tipo === 'porteria' || (currentUser?.tipo === 'super_user')) && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-orange-300">
                Módulo Portería
              </div>
              {hasModule('porteria_scanner') && navItem('porteria_scanner', 'Control de Portería', DoorOpen)}
              {hasModule('avisos_docente_celador') && currentUser?.tipo === 'porteria' && navItem('avisos_docente_celador', 'Avisos Portería / Celador', Bell)}
            </>
          )}

          {/* ESTUDIANTES & ACUDIENTES */}
          {(currentUser?.tipo === 'estudiantes' || currentUser?.tipo === 'acudientes' || currentUser?.tipo === 'estudiante' || currentUser?.tipo === 'padre') && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-amber-300">
                Módulo Estudiantil
              </div>
              {hasModule('expediente_estudiante') && navItem('expediente_estudiante', 'Expediente Estudiantil', GraduationCap)}
              {hasModule('mi_horario') && navItem('mi_horario', 'Horario de Clases', Calendar)}
            </>
          )}

          {currentUser?.tipo !== 'super_user' && (hasModule('gestion_grupos') || hasModule('gestion_estudiantes')) && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                Administración Académica
              </div>
              {hasModule('gestion_grupos') && navItem('gestion_grupos', 'Gestión de Grupos', School)}
              {hasModule('gestion_estudiantes') && navItem('gestion_estudiantes', 'Gestión de Estudiantes', UserRound)}
            </>
          )}

          <div className="my-2 border-t border-[#5c230b]" />

          {/* Contáctanos */}
          {navItem('contact', 'Contáctanos', Mail)}

          {/* Cloud Console */}
          {navItem('firebase_inspector', 'Consola Cloud Firebase', Flame)}

          <div className="my-2 border-t border-[#5c230b]" />

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 transition-colors font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Restablecer Datos Demo</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#5c230b] bg-[#2d0e04] text-center">
          <p className="text-[9px] text-amber-300/80 uppercase tracking-widest font-mono font-bold">
            © 2026 ASISCR • CRISTO REY DOSQUEBRADAS
          </p>
        </div>
      </div>
    </div>
  );
};
