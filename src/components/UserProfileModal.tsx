import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  KeyRound, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff,
  Save,
  Check
} from 'lucide-react';
import { Usuario } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  onUpdateUser: (updatedUser: Usuario) => Promise<{ success: boolean; error?: string }>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');

  // Profile data
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [email, setEmail] = useState(currentUser.email || '');
  const [telefono, setTelefono] = useState(currentUser.telefono || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nombre.trim()) {
      setErrorMsg('El nombre no puede estar vacío.');
      return;
    }

    setLoading(true);
    try {
      const updated: Usuario = {
        ...currentUser,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
      };

      const res = await onUpdateUser(updated);
      if (res.success) {
        setSuccessMsg('Datos personales actualizados correctamente.');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(res.error || 'Error al actualizar los datos en Firebase.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validar que ingresó la contraseña anterior
    if (!oldPassword.trim()) {
      setErrorMsg('Debes ingresar tu contraseña actual para autorizar el cambio.');
      return;
    }

    // 2. Validar que la contraseña anterior coincida exactamente con la actual
    if (oldPassword.trim() !== currentUser.contrasena) {
      setErrorMsg('La contraseña actual es incorrecta. Por motivos de seguridad, no se puede cambiar la clave.');
      return;
    }

    // 3. Validar longitud de la nueva contraseña
    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 4. Validar confirmación
    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    // 5. Validar que no sea idéntica a la anterior
    if (newPassword === oldPassword) {
      setErrorMsg('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    setLoading(true);
    try {
      const updated: Usuario = {
        ...currentUser,
        contrasena: newPassword.trim(),
      };

      const res = await onUpdateUser(updated);
      if (res.success) {
        setSuccessMsg('¡Contraseña modificada con éxito! Guarda tu nueva clave.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'Error al actualizar la contraseña en Firebase.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3b1406] text-amber-300 flex items-center justify-center font-black border-2 border-amber-400 text-lg shadow-sm">
              {currentUser.nombre.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#3b1406]">
                Mi Cuenta y Seguridad
              </h3>
              <p className="text-xs text-[#78350f]">
                Modifica tus datos y cambia tu contraseña con validación previa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Chip */}
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 mb-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800/80 block">
              Documento / Usuario
            </span>
            <span className="font-mono font-bold text-[#3b1406]">{currentUser.documento}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800/80 block">
              Rol Asignado
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ea580c] text-white font-black text-[10px] uppercase">
              {currentUser.tipo === 'super_user' ? 'Super Usuario' : currentUser.tipo}
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-amber-200 mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('perfil'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'perfil'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-gray-500 hover:text-[#3b1406]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('seguridad'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'seguridad'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-gray-500 hover:text-[#3b1406]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Cambiar Contraseña</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Datos Personales */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <User className="w-4 h-4 text-amber-700/60 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@cristorey.edu.co"
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <Mail className="w-4 h-4 text-amber-700/60 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="300 000 0000"
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <Phone className="w-4 h-4 text-amber-700/60 absolute right-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Actualizar Datos'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Cambiar Contraseña */}
        {activeTab === 'seguridad' && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* Contraseña Actual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#3b1406]">
                  1. Contraseña Anterior / Actual *
                </label>
                <span className="text-[10px] text-amber-700 font-semibold">
                  (Validación obligatoria)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Digita tu contraseña actual"
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-3 text-amber-700/60 hover:text-amber-900"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                2. Nueva Contraseña * (Mínimo 6 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa la nueva clave"
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-3 text-amber-700/60 hover:text-amber-900"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                3. Confirmar Nueva Contraseña *
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva clave exactamente"
                className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-[#78350f]">
              🔒 <strong>Seguridad Institucional:</strong> El sistema validará que tu clave actual coincida con la registrada en Firestore antes de aplicar cualquier modificación.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#3b1406] hover:bg-[#270c04] text-amber-300 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Validando...' : 'Validar y Cambiar Contraseña'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
