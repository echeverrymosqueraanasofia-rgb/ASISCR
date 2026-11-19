import React, { useState } from 'react';
import { Shield, Lock, CreditCard, ArrowLeft, KeyRound, Mail } from 'lucide-react';

interface SuperLoginProps {
  onLogin: (docOrEmail: string, pass: string) => Promise<boolean>;
  onBack: () => void;
  onQuickFillDemo: () => void;
}

export const SuperLogin: React.FC<SuperLoginProps> = ({
  onLogin,
  onBack,
  onQuickFillDemo,
}) => {
  const [identificador, setIdentificador] = useState('jfcortez@unitecnica.net');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identificador.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo institucional/documento y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(identificador, password);
      if (!success) {
        setError('Credenciales no válidas para Super Usuario. Usa jfcortez@unitecnica.net o 10001000 con clave 123456.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con Firebase.');
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
          <span>Volver al menú de bienvenida</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-400 text-center my-auto ring-4 ring-amber-400/20">
        
        {/* Top Gold Shield */}
        <div className="w-16 h-18 rounded-b-xl bg-[#3b1406] border-2 border-amber-400 flex flex-col items-center justify-center mx-auto mb-4 shadow-md text-amber-300">
          <Shield className="w-7 h-7 fill-amber-400 text-[#3b1406]" />
          <span className="text-[7px] font-black uppercase text-amber-200 mt-0.5">SUPER USER</span>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-0.5 rounded-full inline-block mb-1">
          Acceso Administrador Total
        </span>

        <h2 className="text-xl font-black text-[#3b1406] tracking-tight uppercase mb-1">
          CONSOLA SUPER USUARIO
        </h2>
        <p className="text-xs font-medium text-[#78350f] mb-6">
          Gestión de roles, restricción a módulos y base de datos
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-medium text-rose-800 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Correo Institucional o Documento
            </label>
            <div className="relative">
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="jfcortez@unitecnica.net o 10001000"
                className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
              <Mail className="w-4 h-4 text-amber-600 absolute right-3 top-2.5" />
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
                className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
              <Lock className="w-4 h-4 text-amber-600 absolute right-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#3b1406] hover:bg-[#230b04] text-amber-300 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Validando en Firestore...</span>
            ) : (
              <span>Ingresar como Super Usuario</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-amber-200">
          <button
            type="button"
            onClick={onQuickFillDemo}
            className="w-full text-xs text-[#ea580c] hover:underline flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Autocompletar Ing. J. F. Cortez</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-[10px] text-[#78350f] uppercase tracking-widest font-mono font-bold">
          © 2026 ASISCR • INSTITUCIÓN CRISTO REY
        </p>
      </div>
    </div>
  );
};
