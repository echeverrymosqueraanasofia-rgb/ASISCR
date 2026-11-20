import React from 'react';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardCheck,
  Database,
  DoorOpen,
  FileSpreadsheet,
  GraduationCap,
  School,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import {
  AppModule,
  AppView,
  DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_MODULES,
  UserRole,
  Usuario,
} from '../types';

interface InicioUsuarioProps {
  currentUser: Usuario;
  onNavigate: (view: AppView) => void;
}

const MODULE_CARDS: Record<AppModule, { view: AppView; Icon: LucideIcon; color: string }> = {
  gestion_usuarios: { view: 'gestion_usuarios', Icon: Users, color: 'from-violet-500 to-indigo-600' },
  admin_base_datos: { view: 'admin_base_datos', Icon: Database, color: 'from-slate-600 to-slate-800' },
  consulta_asistencia: { view: 'consulta_asistencia', Icon: FileSpreadsheet, color: 'from-sky-500 to-blue-600' },
  toma_asistencia: { view: 'select_grado', Icon: ClipboardCheck, color: 'from-emerald-500 to-teal-600' },
  crear_horarios: { view: 'crear_horarios', Icon: CalendarDays, color: 'from-purple-500 to-fuchsia-600' },
  avisos_docente_celador: { view: 'avisos_docente_celador', Icon: Bell, color: 'from-amber-500 to-orange-600' },
  porteria_scanner: { view: 'porteria_scanner', Icon: DoorOpen, color: 'from-orange-500 to-rose-600' },
  expediente_estudiante: { view: 'expediente_estudiante', Icon: GraduationCap, color: 'from-pink-500 to-rose-600' },
  mi_horario: { view: 'mi_horario', Icon: CalendarDays, color: 'from-cyan-500 to-blue-600' },
  gestion_grupos: { view: 'gestion_grupos', Icon: School, color: 'from-indigo-500 to-violet-600' },
  gestion_estudiantes: { view: 'gestion_estudiantes', Icon: UserRound, color: 'from-teal-500 to-emerald-600' },
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_user: 'Super Usuario',
  directivo: 'Directivo',
  docente: 'Docente',
  porteria: 'Portería',
  estudiantes: 'Estudiante',
  acudientes: 'Acudiente',
  estudiante: 'Estudiante',
  padre: 'Acudiente',
};

export const InicioUsuario: React.FC<InicioUsuarioProps> = ({ currentUser, onNavigate }) => {
  const allowedModules = currentUser.tipo === 'super_user'
    ? SYSTEM_MODULES.map(module => module.id)
    : currentUser.modulosPermitidos ?? DEFAULT_ROLE_PERMISSIONS[currentUser.tipo] ?? [];
  const availableModules = SYSTEM_MODULES.filter(module => allowedModules.includes(module.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3b1406] via-[#5c230b] to-[#9a3412] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-amber-300/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">
            <GraduationCap className="h-4 w-4" />
            Inicio • ASISCR
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">
            ¡Bienvenido, {currentUser.nombre}!
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-amber-100/90">
            Estos son los accesos disponibles para tu perfil de {ROLE_LABELS[currentUser.tipo]}.
            Selecciona una opción para continuar.
          </p>
        </div>
      </section>

      <div className="mb-4 mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Tu espacio de trabajo</p>
          <h2 className="mt-1 text-xl font-black text-[#3b1406] sm:text-2xl">Opciones de tu perfil</h2>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          {availableModules.length} {availableModules.length === 1 ? 'opción' : 'opciones'}
        </span>
      </div>

      {availableModules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableModules.map(module => {
            const { view, Icon, color } = MODULE_CARDS[module.id];
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onNavigate(view)}
                className="group flex min-h-44 items-start gap-4 rounded-2xl border border-amber-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/60"
                aria-label={`Abrir ${module.label}`}
              >
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-transform group-hover:scale-105`}>
                  <Icon className="h-7 w-7" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base font-black leading-snug text-[#3b1406]">{module.label}</span>
                  <span className="mt-2 text-sm leading-relaxed text-[#78350f]">{module.description}</span>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-black uppercase tracking-wide text-orange-700">
                    Abrir opción
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-white p-6 text-sm font-medium text-[#78350f]">
          Tu perfil todavía no tiene opciones asignadas. Comunícate con un administrador.
        </div>
      )}
    </div>
  );
};
