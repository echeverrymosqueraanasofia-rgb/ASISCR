import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Award, 
  Flame, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Users,
  Building2,
  UserCheck,
  DoorOpen,
  GraduationCap
} from 'lucide-react';
import { EngineMode } from '../types';

interface UnifiedLoginProps {
  onLogin: (identificador: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  engineMode: EngineMode;
  onSelectEngine: (mode: EngineMode) => void;
}

export const UnifiedLogin: React.FC<UnifiedLoginProps> = ({
  onLogin,
  engineMode,
  onSelectEngine,
}) => {
  const [identificador, setIdentificador] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQuickAccounts, setShowQuickAccounts] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const idClean = identificador.trim();
    const passClean = contrasena.trim();

    if (!idClean) {
      setErrorMsg('Por favor ingresa tu correo electrónico institucional o número de documento.');
      return;
    }
    if (!passClean) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await onLogin(idClean, passClean);
      if (!res.success) {
        setErrorMsg(res.error || 'Credenciales inválidas. Verifica tu correo/documento y contraseña.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (emailOrDoc: string, pass = '123456') => {
    setIdentificador(emailOrDoc);
    setContrasena(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="max-w-xl w-full">
        
        {/* Institutional Pill Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ea580c] text-white text-xs font-black uppercase tracking-wider mb-3 shadow-xs border border-amber-300/40">
            <Award className="w-4 h-4 text-amber-200" />
            <span>INSTITUCIÓN EDUCATIVA CRISTO REY • 73 AÑOS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight uppercase">
            Ingreso Unificado ASISCR
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1 font-medium">
            Acceso institucional único para Super Usuario, Directivos, Docentes, Portería, Estudiantes y Acudientes.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="bg-white rounded-2xl p-3 border border-amber-200 shadow-xs mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#ea580c] block">
              Motor de Base de Datos Activo
            </span>
            <span className="text-xs font-bold text-[#3b1406]">
              {engineMode === 'firebase' ? 'Google Cloud Firestore (Nube)' : 'PHP Backend MySQL (Local)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onSelectEngine('firebase')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'firebase'
                  ? 'bg-[#ea580c] text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-[#3b1406] border border-amber-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Firebase</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectEngine('php')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'php'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-[#3b1406] border border-amber-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>PHP / MySQL</span>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identificador */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#3b1406] mb-1.5">
                Correo Electrónico o Documento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="ej. jfcortez@unitecnica.net o 123456"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#ea580c] focus:outline-hidden text-sm font-semibold text-[#3b1406] placeholder-amber-900/40 bg-amber-50/30 transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#3b1406]">
                  Contraseña
                </label>
                <span className="text-[11px] text-amber-800/70 font-semibold">
                  Inicial por defecto: <strong className="text-[#ea580c]">123456</strong>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Tu contraseña (123456)"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#ea580c] focus:outline-hidden text-sm font-semibold text-[#3b1406] placeholder-amber-900/40 bg-amber-50/30 transition-colors"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-700 hover:text-[#ea580c] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión en ASISCR</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Pill Selector */}
          <div className="mt-6 pt-5 border-t border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider font-black text-[#3b1406] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
                Credenciales Oficiales (Clic para autocompletar)
              </span>
              <button
                type="button"
                onClick={() => setShowQuickAccounts(!showQuickAccounts)}
                className="text-[11px] font-bold text-[#ea580c] hover:underline cursor-pointer"
              >
                {showQuickAccounts ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showQuickAccounts && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('jfcortez@unitecnica.net')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-[#ea580c] bg-amber-50/60 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 group-hover:text-[#ea580c]">
                    <Shield className="w-3 h-3 text-[#ea580c]" />
                    <span>Super User</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    jfcortez@unitecnica.net
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 10001000 • 123456
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('rectoria@cristorey.edu.co')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-purple-600 bg-purple-50/40 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-800">
                    <Building2 className="w-3 h-3 text-purple-600" />
                    <span>Directivo</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    rectoria@cristorey.edu.co
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 20002000 • 123456
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('carlos.mendoza@cristorey.edu.co')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>Docente</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    carlos.mendoza@...
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 12345678 • 123456
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('porteria@cristorey.edu.co')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-orange-600 bg-orange-50/40 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-800">
                    <DoorOpen className="w-3 h-3 text-orange-600" />
                    <span>Portería</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    porteria@cristorey...
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 30003000 • 123456
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('ana.martinez@estudiantes.edu.co')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-blue-600 bg-blue-50/40 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-800">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    <span>Estudiante</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    ana.martinez@...
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 10987654 • 123456
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('marta.betancur@gmail.com')}
                  className="p-2.5 rounded-xl border border-amber-300 hover:border-teal-600 bg-teal-50/40 hover:bg-white text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-teal-800">
                    <Users className="w-3 h-3 text-teal-600" />
                    <span>Acudiente</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#3b1406] truncate">
                    marta.betancur@...
                  </div>
                  <div className="text-[10px] text-gray-500">
                    doc: 40004000 • 123456
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-amber-900/60 font-semibold mt-4">
          Una vez adentro, puedes modificar tus datos personales y contraseña desde el menú de perfil superior.
        </p>

      </div>
    </div>
  );
};
