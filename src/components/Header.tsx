import React from 'react';
import { 
  Menu, 
  LogOut, 
  Flame, 
  Shield, 
  Phone, 
  Mail, 
  User, 
  Bell, 
  Users, 
  Database,
  CalendarDays,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  DoorOpen
} from 'lucide-react';
import { Usuario, EngineMode, AppView } from '../types';
import { API_BASE_URL } from '../services/storageService';

interface HeaderProps {
  currentUser: Usuario | null;
  engineMode: EngineMode;
  onToggleMenu: () => void;
  onSelectEngine: (mode: EngineMode) => void;
  onLogout: () => void;
  onOpenPhpInspector: () => void;
  onOpenFirebaseInspector: () => void;
  onNavigate?: (view: AppView) => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  engineMode,
  onToggleMenu,
  onSelectEngine,
  onLogout,
  onOpenPhpInspector,
  onOpenFirebaseInspector,
  onNavigate,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Dark Institutional Info Bar */}
      <div className="bg-[#3b1406] text-amber-100 text-xs py-1.5 px-4 border-b border-[#5c230b]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          
          {/* Contact & Session Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-amber-200">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Sesión: <strong className="text-white">{currentUser ? currentUser.nombre : 'Portal Público'}</strong>
                {currentUser && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-[#ea580c] text-white text-[10px] font-black uppercase">
                    {currentUser.tipo === 'super_user' ? 'Super Usuario' : currentUser.tipo}
                  </span>
                )}
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-amber-200/80">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>(+57) (601) 354 3271</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-amber-200/80">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>i.e.cristorey@dosquebradas.edu.co</span>
            </span>
          </div>

          {/* Action Navigation: Modules shown ONLY when logged in based on user role */}
          <div className="flex items-center gap-2">
            
            {/* SUPER USER LINKS */}
            {currentUser && currentUser.tipo === 'super_user' && onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('admin_base_datos')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-amber-900/80 text-amber-200 hover:bg-amber-800 border border-amber-500/40"
                  title="Administrar Base de Datos"
                >
                  <Database className="w-3 h-3 text-amber-400" />
                  <span>Admin BD</span>
                </button>
                <button
                  onClick={() => onNavigate('gestion_usuarios')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-amber-900/80 text-amber-200 hover:bg-amber-800 border border-amber-500/40"
                  title="Gestión de Usuarios y Roles"
                >
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>Usuarios</span>
                </button>
              </>
            )}

            {/* DIRECTIVO LINKS */}
            {currentUser && currentUser.tipo === 'directivo' && onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('crear_horarios')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-purple-900 text-purple-200 hover:bg-purple-800 border border-purple-500/40"
                  title="Crear Horarios"
                >
                  <CalendarDays className="w-3 h-3 text-purple-300" />
                  <span>Crear Horarios</span>
                </button>
                <button
                  onClick={() => onNavigate('consulta_asistencia')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-purple-900 text-purple-200 hover:bg-purple-800 border border-purple-500/40"
                  title="Consulta de Asistencia"
                >
                  <FileSpreadsheet className="w-3 h-3 text-purple-300" />
                  <span>Consulta Asistencia</span>
                </button>
                <button
                  onClick={() => onNavigate('avisos_docente_celador')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-purple-900 text-purple-200 hover:bg-purple-800 border border-purple-500/40"
                  title="Avisos Celador / Docente"
                >
                  <Bell className="w-3 h-3 text-purple-300" />
                  <span>Avisos</span>
                </button>
              </>
            )}

            {/* DOCENTE LINKS */}
            {currentUser && currentUser.tipo === 'docente' && onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('select_grado')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-emerald-900 text-emerald-200 hover:bg-emerald-800 border border-emerald-500/40"
                  title="Toma de Asistencia"
                >
                  <LayoutDashboard className="w-3 h-3 text-emerald-300" />
                  <span>Toma Asistencia</span>
                </button>
                <button
                  onClick={() => onNavigate('consulta_asistencia')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-emerald-900 text-emerald-200 hover:bg-emerald-800 border border-emerald-500/40"
                  title="Consulta de Asistencia"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
                  <span>Consulta Asistencia</span>
                </button>
                <button
                  onClick={() => onNavigate('avisos_docente_celador')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-emerald-900 text-emerald-200 hover:bg-emerald-800 border border-emerald-500/40"
                  title="Avisos Docente / Celador"
                >
                  <Bell className="w-3 h-3 text-emerald-300" />
                  <span>Avisos</span>
                </button>
              </>
            )}

            {/* PORTERÍA LINKS */}
            {currentUser && currentUser.tipo === 'porteria' && onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('porteria_scanner')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-orange-900 text-orange-200 hover:bg-orange-800 border border-orange-500/40"
                  title="Control de Portería"
                >
                  <DoorOpen className="w-3 h-3 text-orange-300" />
                  <span>Portería</span>
                </button>
                <button
                  onClick={() => onNavigate('avisos_docente_celador')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-orange-900 text-orange-200 hover:bg-orange-800 border border-orange-500/40"
                  title="Avisos Celador / Docente"
                >
                  <Bell className="w-3 h-3 text-orange-300" />
                  <span>Avisos</span>
                </button>
              </>
            )}

            {/* Conmutador de Motor de Base de Datos: Firebase vs PHP MySQL */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-amber-500/30 text-[11px] font-bold">
              <button
                onClick={() => onSelectEngine('firebase')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  engineMode === 'firebase'
                    ? 'bg-[#ea580c] text-white shadow-xs font-black'
                    : 'text-amber-200/70 hover:text-white'
                }`}
                title="Conectar a Firebase Firestore (Nube)"
              >
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Firebase</span>
              </button>
              <button
                onClick={() => onSelectEngine('php')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  engineMode === 'php'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-amber-200/70 hover:text-white'
                }`}
                title={`Conectar a PHP / MySQL Local (${API_BASE_URL})`}
              >
                <Database className="w-3 h-3 text-blue-200" />
                <span>PHP Local</span>
              </button>
            </div>

            {/* Base de Datos Cloud Inspector */}
            <button
              onClick={onOpenFirebaseInspector}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-amber-900/60 text-amber-200 hover:bg-amber-800 border border-amber-400/40"
              title="Consola de inspección Cloud Firestore"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Consola</span>
            </button>

            {/* USER PROFILE & LOGOUT */}
            {currentUser && (
              <>
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    className="px-2 py-0.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Editar mis datos y cambiar contraseña"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Mi Perfil</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="px-2.5 py-0.5 rounded-md bg-[#991b1b] hover:bg-[#7f1d1d] text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Salir</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Main Light Cream Institutional Header Bar */}
      <div className="bg-[#fdf6e2] border-b-2 border-[#f59e0b]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Menu Hamburger + Cristo Rey Shield Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMenu}
                className="p-2 rounded-xl bg-[#fef08a]/80 text-[#3b1406] hover:bg-[#fde047] hover:text-[#270c04] transition-colors focus:outline-none border border-[#f59e0b]/30 shadow-2xs cursor-pointer"
                title="Abrir Menú Principal"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-14 rounded-b-xl bg-[#3b1406] border-2 border-[#ca8a04] flex flex-col items-center justify-center text-amber-300 shadow-md">
                    <Shield className="w-5 h-5 fill-amber-400 text-[#3b1406]" />
                    <span className="text-[8px] font-black tracking-tight leading-none uppercase text-amber-200 mt-0.5">
                      CRISTO REY
                    </span>
                    <span className="text-[7px] font-bold text-amber-400 bg-[#783212] px-1 rounded mt-0.5">
                      73 AÑOS
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="text-base sm:text-lg font-black text-[#3b1406] leading-tight tracking-tight uppercase">
                    INSTITUCIÓN EDUCATIVA CRISTO REY
                  </h1>
                  <p className="text-[11px] font-bold text-[#b45309] tracking-normal">
                    Dosquebradas, Risaralda • <span className="font-semibold text-[#78350f]">Formando en Valores e Integridad</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User Profile Info */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div 
                  onClick={onOpenProfile}
                  className="flex items-center gap-3 pl-3 border-l border-[#fde68a] cursor-pointer group"
                  title="Haz clic para modificar tus datos o contraseña"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-[#3b1406] group-hover:text-[#ea580c] transition-colors truncate max-w-[170px]">
                      {currentUser.nombre}
                    </p>
                    <p className="text-[10px] font-bold text-[#b45309] uppercase tracking-wide">
                      {currentUser.tipo === 'super_user' ? 'Super Usuario' : currentUser.tipo}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#3b1406] text-amber-300 border-2 border-[#ca8a04] group-hover:border-[#ea580c] flex items-center justify-center font-black text-sm shadow-2xs transition-colors">
                    {currentUser.nombre.charAt(0)}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#fde047] text-[#3b1406] text-xs font-bold border border-[#f59e0b]/40 shadow-2xs">
                  Portal Institucional ASISCR
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
