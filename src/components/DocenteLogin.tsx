import React, { useState } from 'react';
import { Shield, Lock, CreditCard, ArrowLeft, KeyRound } from 'lucide-react';

interface DocenteLoginProps {
  onLogin: (cedula: string, pass: string) => boolean;
  onBack: () => void;
  onQuickFillDemo: () => void;
}

export const DocenteLogin: React.FC<DocenteLoginProps> = ({
  onLogin,
  onBack,
  onQuickFillDemo,
}) => {
  const [cedula, setCedula] = useState('12345678');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cedula.trim() || !password.trim()) {
      setError('Por favor ingresa la cédula y la contraseña.');
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(cedula, password);
      if (!success) {
        setError('Credenciales no válidas para docentes/directivos. Intenta con Cédula: 12345678 y Clave: 123456');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] flex flex-col justify-between items-center py-8 px-4">
      
      {/* Back button */}
      <div className="w-full max-w-sm flex items-center justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78350f] hover:text-[#3b1406] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a selección de perfil</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#fffbeb] rounded-2xl p-8 shadow-sm border-2 border-[#fde68a] text-center my-auto">
        
        {/* Top Emblem Badge */}
        <div className="w-16 h-18 rounded-b-xl bg-[#3b1406] border-2 border-[#ca8a04] flex flex-col items-center justify-center mx-auto mb-4 shadow-md text-amber-300">
          <Shield className="w-6 h-6 fill-amber-400 text-[#3b1406]" />
          <span className="text-[7px] font-black uppercase text-amber-200 mt-0.5">CRISTO REY</span>
        </div>

        <h2 className="text-xl font-black text-[#3b1406] tracking-tight uppercase mb-1">
          ACCESO A DOCENTES
        </h2>
        <p className="text-xs font-medium text-[#78350f] mb-6">
          Institución Educativa Cristo Rey • ASISCR
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-medium text-rose-800 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Documento / Cédula
            </label>
            <div className="relative">
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="0000000000"
                className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition-all"
              />
              <CreditCard className="w-4 h-4 text-[#b45309] absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition-all"
              />
              <Lock className="w-4 h-4 text-[#b45309] absolute right-3 top-3" />
            </div>
          </div>

          {/* Entrar Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verificando Credenciales...</span>
              </>
            ) : (
              <span>Entrar al Portal</span>
            )}
          </button>
        </form>

        {/* Demo fill shortcut */}
        <div className="mt-6 pt-4 border-t border-[#fde68a]">
          <button
            type="button"
            onClick={onQuickFillDemo}
            className="w-full text-xs text-[#3b1406] hover:text-[#ea580c] flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Cargar Datos de Docente Demo</span>
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-[10px] text-[#78350f] uppercase tracking-widest font-mono font-bold">
          © 2024 INSTITUCIÓN EDUCATIVA CRISTO REY • DOSQUEBRADAS
        </p>
      </div>

    </div>
  );
};

