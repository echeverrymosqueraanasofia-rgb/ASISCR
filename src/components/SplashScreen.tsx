import React from 'react';
import { 
  UserCheck, 
  Users, 
  Shield, 
  ArrowRight, 
  Award, 
  DoorOpen, 
  Building2, 
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { EngineMode } from '../types';

interface SplashScreenProps {
  onSelectSuperProfile: () => void;
  onSelectDirectivoProfile: () => void;
  onSelectDocenteProfile: () => void;
  onSelectPorteriaProfile: () => void;
  onSelectEstudianteProfile: () => void;
  onQuickSuperDemo: () => void;
  onQuickDirectivoDemo: () => void;
  onQuickDocenteDemo: () => void;
  onQuickPorteriaDemo: () => void;
  onQuickEstudianteDemo: () => void;
  onQuickAcudienteDemo: () => void;
  engineMode: EngineMode;
  onSelectEngine: (mode: EngineMode) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onSelectSuperProfile,
  onSelectDirectivoProfile,
  onSelectDocenteProfile,
  onSelectPorteriaProfile,
  onSelectEstudianteProfile,
  onQuickSuperDemo,
  onQuickDirectivoDemo,
  onQuickDocenteDemo,
  onQuickPorteriaDemo,
  onQuickEstudianteDemo,
  onQuickAcudienteDemo,
  engineMode,
  onSelectEngine,
}) => {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      
      {/* Hero Header Section */}
      <div className="max-w-5xl mx-auto text-center pt-2 sm:pt-4">
        
        {/* Golden Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ea580c] text-white text-xs font-black uppercase tracking-wider mb-4 shadow-sm border border-amber-300/40">
          <Award className="w-4 h-4 text-amber-200" />
          <span>73 AÑOS DE EXCELENCIA EDUCATIVA • DOSQUEBRADAS, RISARALDA</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#3b1406] tracking-tight mb-3 uppercase leading-tight">
          ASISCR • SISTEMA DE CONTROL DE ASISTENCIA Y GESTIÓN ESCOLAR
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#78350f] max-w-3xl mx-auto font-medium leading-relaxed mb-6">
          Plataforma modular con roles independientes: Super Usuario, Directivos, Docentes, Portería, Estudiantes y Acudientes, respaldada en Cloud Firestore.
        </p>
      </div>

      {/* Main Profile Cards Grid - 5 Independent Access Portals */}
      <div className="max-w-6xl mx-auto w-full my-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: SUPER USUARIO */}
        <button
          onClick={onSelectSuperProfile}
          className="group relative bg-[#fffbeb] hover:bg-white border-2 border-amber-300 hover:border-amber-500 rounded-2xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 group-hover:bg-[#3b1406] group-hover:text-amber-300 transition-all duration-300">
              <Shield className="w-7 h-7 text-[#3b1406] group-hover:text-amber-300 transition-colors" />
            </div>

            <span className="text-[9px] uppercase tracking-widest text-amber-700 font-black block mb-1">
              ADMINISTRADOR TOTAL
            </span>

            <h2 className="text-sm font-black text-[#3b1406] mb-1 group-hover:text-amber-700 transition-colors">
              Super Usuario
            </h2>
            <p className="text-[10px] text-[#78350f] leading-snug font-medium mb-3">
              Administrar Base de Datos, Gestión de Usuarios y control de roles.
            </p>
          </div>

          <div className="w-full py-2 px-2.5 rounded-xl bg-[#ca8a04] group-hover:bg-[#a16207] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs">
            <span>Ingreso Super User</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 2: DIRECTIVOS (Separado de Docentes) */}
        <button
          onClick={onSelectDirectivoProfile}
          className="group relative bg-[#fffbeb] hover:bg-white border-2 border-purple-200 hover:border-purple-500 rounded-2xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border-2 border-purple-400 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 group-hover:bg-[#3b1406] group-hover:text-purple-300 transition-all duration-300">
              <Building2 className="w-7 h-7 text-purple-700 group-hover:text-purple-300 transition-colors" />
            </div>

            <span className="text-[9px] uppercase tracking-widest text-purple-700 font-black block mb-1">
              RECTORÍA & COORDINACIÓN
            </span>

            <h2 className="text-sm font-black text-[#3b1406] mb-1 group-hover:text-purple-700 transition-colors">
              Directivos
            </h2>
            <p className="text-[10px] text-[#78350f] leading-snug font-medium mb-3">
              Crear Horarios, Consulta de Asistencia y Avisos con Portería.
            </p>
          </div>

          <div className="w-full py-2 px-2.5 rounded-xl bg-purple-800 group-hover:bg-purple-900 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs">
            <span>Ingreso Directivo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 3: DOCENTES */}
        <button
          onClick={onSelectDocenteProfile}
          className="group relative bg-[#fffbeb] hover:bg-white border-2 border-[#fde68a] hover:border-[#ea580c] rounded-2xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#fde047] border-2 border-[#ca8a04] flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 group-hover:bg-[#3b1406] group-hover:text-amber-300 transition-all duration-300">
              <UserCheck className="w-7 h-7 text-[#3b1406] group-hover:text-amber-300 transition-colors" />
            </div>

            <span className="text-[9px] uppercase tracking-widest text-[#ea580c] font-black block mb-1">
              CUERPO DOCENTE
            </span>

            <h2 className="text-sm font-black text-[#3b1406] mb-1 group-hover:text-[#ea580c] transition-colors">
              Docentes
            </h2>
            <p className="text-[10px] text-[#78350f] leading-snug font-medium mb-3">
              Toma de Asistencia de clase, Consulta de Asistencia y Avisos Celador.
            </p>
          </div>

          <div className="w-full py-2 px-2.5 rounded-xl bg-[#ea580c] group-hover:bg-[#c2410c] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs">
            <span>Ingreso Docente</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 4: PORTERÍA / CELADORES */}
        <button
          onClick={onSelectPorteriaProfile}
          className="group relative bg-[#fffbeb] hover:bg-white border-2 border-orange-200 hover:border-orange-500 rounded-2xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-200 border-2 border-orange-400 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 group-hover:bg-[#3b1406] group-hover:text-orange-300 transition-all duration-300">
              <DoorOpen className="w-7 h-7 text-[#3b1406] group-hover:text-orange-300 transition-colors" />
            </div>

            <span className="text-[9px] uppercase tracking-widest text-orange-700 font-black block mb-1">
              GUARDIA & PUERTA
            </span>

            <h2 className="text-sm font-black text-[#3b1406] mb-1 group-hover:text-orange-700 transition-colors">
              Portería
            </h2>
            <p className="text-[10px] text-[#78350f] leading-snug font-medium mb-3">
              Llegadas tardías, acudientes en puerta y avisos inmediatos al aula.
            </p>
          </div>

          <div className="w-full py-2 px-2.5 rounded-xl bg-orange-700 group-hover:bg-orange-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs">
            <span>Ingreso Portería</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 5: ESTUDIANTES Y ACUDIENTES */}
        <button
          onClick={onSelectEstudianteProfile}
          className="group relative bg-[#fffbeb] hover:bg-white border-2 border-[#fde68a] hover:border-[#3b1406] rounded-2xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#fde047] border-2 border-[#ca8a04] flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 group-hover:bg-[#3b1406] group-hover:text-amber-300 transition-all duration-300">
              <GraduationCap className="w-7 h-7 text-[#3b1406] group-hover:text-amber-300 transition-colors" />
            </div>

            <span className="text-[9px] uppercase tracking-widest text-[#ea580c] font-black block mb-1">
              ESTUDIANTES & PADRES
            </span>

            <h2 className="text-sm font-black text-[#3b1406] mb-1 group-hover:text-[#ea580c] transition-colors">
              Comunidad
            </h2>
            <p className="text-[10px] text-[#78350f] leading-snug font-medium mb-3">
              Expediente escolar, historial mensual de inasistencias y horarios.
            </p>
          </div>

          <div className="w-full py-2 px-2.5 rounded-xl bg-[#3b1406] group-hover:bg-[#270c04] text-amber-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs">
            <span>Ver Expediente</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </button>

      </div>

      {/* Quick Demo Credentials Footer Bar with All Roles Displayed */}
      <div className="max-w-6xl mx-auto w-full bg-[#fef3c7] border border-[#fde68a] rounded-2xl p-4 text-center shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-left">
            <span className="font-black text-[#3b1406] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#ea580c]" />
              Credenciales Iniciales de Acceso (Modificables por cada usuario):
            </span>
            <p className="text-[11px] text-[#78350f]">
              Contraseña por defecto para todas las cuentas iniciales: <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[#3b1406]">123456</strong>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              onClick={onQuickSuperDemo}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              title="Super Usuario: jfcortez@unitecnica.net o 10001000 / 123456"
            >
              <span>🛡️ Super User (10001000)</span>
            </button>

            <button
              onClick={onQuickDirectivoDemo}
              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              title="Directivo: rectoria@cristorey.edu.co o 20002000 / 123456"
            >
              <span>🏛️ Directivo (20002000)</span>
            </button>

            <button
              onClick={onQuickDocenteDemo}
              className="px-2.5 py-1 bg-white hover:bg-[#3b1406] text-[#3b1406] hover:text-amber-300 rounded-lg font-bold text-[11px] border border-[#f59e0b]/40 shadow-2xs transition-all cursor-pointer"
              title="Docente: carlos.mendoza@cristorey.edu.co o 12345678 / 123456"
            >
              <span>👨‍🏫 Docente (12345678)</span>
            </button>

            <button
              onClick={onQuickPorteriaDemo}
              className="px-2.5 py-1 bg-white hover:bg-[#3b1406] text-[#3b1406] hover:text-amber-300 rounded-lg font-bold text-[11px] border border-[#f59e0b]/40 shadow-2xs transition-all cursor-pointer"
              title="Portería: porteria@cristorey.edu.co o 30003000 / 123456"
            >
              <span>🚪 Portería (30003000)</span>
            </button>

            <button
              onClick={onQuickEstudianteDemo}
              className="px-2.5 py-1 bg-white hover:bg-[#3b1406] text-[#3b1406] hover:text-amber-300 rounded-lg font-bold text-[11px] border border-[#f59e0b]/40 shadow-2xs transition-all cursor-pointer"
              title="Estudiante: ana.martinez@estudiantes.edu.co o 10987654 / 123456"
            >
              <span>🎓 Estudiante (10987654)</span>
            </button>

            <button
              onClick={onQuickAcudienteDemo}
              className="px-2.5 py-1 bg-white hover:bg-[#3b1406] text-[#3b1406] hover:text-amber-300 rounded-lg font-bold text-[11px] border border-[#f59e0b]/40 shadow-2xs transition-all cursor-pointer"
              title="Acudiente: marta.betancur@gmail.com o 40004000 / 123456"
            >
              <span>👨‍👩‍👧 Acudiente (40004000)</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
