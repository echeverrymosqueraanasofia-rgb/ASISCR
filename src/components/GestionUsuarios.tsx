import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock,
  Key,
  School,
  Phone,
  Mail,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Usuario, UserRole, AppModule, SYSTEM_MODULES, DEFAULT_ROLE_PERMISSIONS } from '../types';

interface GestionUsuariosProps {
  currentUser: Usuario;
  usuarios: Usuario[];
  onSaveUsuario: (user: Usuario) => Promise<{ success: boolean; error?: string }>;
  onDeleteUsuario: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  super_user: { label: 'Super Usuario', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-400' },
  directivo: { label: 'Directivo', bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
  docente: { label: 'Docente', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  porteria: { label: 'Portería / Celador', bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
  estudiantes: { label: 'Estudiante', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
  acudientes: { label: 'Acudiente', bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300' },
  estudiante: { label: 'Estudiante', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
  padre: { label: 'Acudiente', bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300' },
};

export const GestionUsuarios: React.FC<GestionUsuariosProps> = ({
  currentUser,
  usuarios,
  onSaveUsuario,
  onDeleteUsuario,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Usuario>>({
    id: '',
    nombre: '',
    email: '',
    tipo: 'docente',
    documento: '',
    contrasena: '123456',
    modulosPermitidos: DEFAULT_ROLE_PERMISSIONS.docente,
    grado: '11-A',
    telefono: '',
    activo: true,
  });

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nombre: '',
      email: '',
      tipo: 'docente',
      documento: '',
      contrasena: '123456',
      modulosPermitidos: [...DEFAULT_ROLE_PERMISSIONS.docente],
      grado: '11-A',
      telefono: '',
      activo: true,
      creadoEn: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setIsEditing(true);
    setFormData({
      ...user,
      modulosPermitidos: user.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[user.tipo] || []
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      tipo: newRole,
      modulosPermitidos: [...(DEFAULT_ROLE_PERMISSIONS[newRole] || [])]
    }));
  };

  const handleToggleModule = (moduleId: AppModule) => {
    setFormData(prev => {
      const current = prev.modulosPermitidos || [];
      if (current.includes(moduleId)) {
        return { ...prev, modulosPermitidos: current.filter(m => m !== moduleId) };
      } else {
        return { ...prev, modulosPermitidos: [...current, moduleId] };
      }
    });
  };

  const handleSelectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      modulosPermitidos: SYSTEM_MODULES.map(m => m.id)
    }));
  };

  const handleClearModules = () => {
    setFormData(prev => ({
      ...prev,
      modulosPermitidos: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim() || !formData.documento?.trim()) {
      showNotification('Por favor ingrese al menos el nombre y el número de documento', 'error');
      return;
    }

    const payload: Usuario = {
      id: formData.id || `usr_${Date.now()}`,
      nombre: formData.nombre.trim(),
      email: formData.email?.trim() || '',
      tipo: formData.tipo || 'docente',
      documento: formData.documento.trim(),
      contrasena: formData.contrasena?.trim() || '123456',
      modulosPermitidos: formData.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[formData.tipo || 'docente'],
      grado: formData.grado || '',
      telefono: formData.telefono || '',
      activo: formData.activo ?? true,
      creadoEn: formData.creadoEn || new Date().toISOString().split('T')[0]
    };

    const res = await onSaveUsuario(payload);
    if (res.success) {
      showNotification(`Usuario ${payload.nombre} ${isEditing ? 'actualizado' : 'creado'} exitosamente.`);
      setIsModalOpen(false);
      onRefresh();
    } else {
      showNotification(res.error || 'No se pudo guardar el usuario', 'error');
    }
  };

  const handleDelete = async (user: Usuario) => {
    if (user.id === currentUser.id) {
      showNotification('No puedes eliminar tu propio usuario de sesión activa', 'error');
      return;
    }
    const res = await onDeleteUsuario(user.id);
    if (res.success) {
      showNotification(`Usuario ${user.nombre} eliminado correctamente.`);
      onRefresh();
    } else {
      showNotification(res.error || 'Error al eliminar usuario', 'error');
    }
  };

  // Filter users
  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = 
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (roleFilter === 'todos') return matchesSearch;
    return matchesSearch && (u.tipo === roleFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Notifications */}
      {notification && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-md transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
            : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="font-semibold text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1.5 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              Super Usuario & RBAC
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Institución Cristo Rey
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Gestión de Usuarios y Restricción de Módulos
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Crea y administra directivos, docentes, estudiantes, acudientes y portería con control granular de módulos permitidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#fef9ee] p-4 rounded-2xl border border-amber-200/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-amber-700/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento o email..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-amber-300/80 text-xs text-[#3b1406] placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          />
        </div>

        {/* Role Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'super_user', label: 'Super User' },
            { id: 'directivo', label: 'Directivos' },
            { id: 'docente', label: 'Docentes' },
            { id: 'porteria', label: 'Portería' },
            { id: 'estudiantes', label: 'Estudiantes' },
            { id: 'acudientes', label: 'Acudientes' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === r.id
                  ? 'bg-[#3b1406] text-amber-300 shadow-sm'
                  : 'bg-white hover:bg-amber-100 text-[#78350f] border border-amber-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3b1406]">
            <thead className="bg-[#faf3e0] text-[#78350f] uppercase tracking-wider font-black text-[11px] border-b border-amber-200">
              <tr>
                <th className="py-3.5 px-4">Usuario / Nombre</th>
                <th className="py-3.5 px-4">Documento / Acceso</th>
                <th className="py-3.5 px-4">Rol en Sistema</th>
                <th className="py-3.5 px-4">Módulos Asignados</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-amber-800/60 font-medium">
                    No se encontraron usuarios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const roleCfg = ROLE_LABELS[user.tipo] || { label: user.tipo, bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
                  const userModules = user.modulosPermitidos || DEFAULT_ROLE_PERMISSIONS[user.tipo] || [];

                  return (
                    <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#3b1406] text-amber-300 font-black flex items-center justify-center text-sm shadow-2xs">
                            {user.nombre.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#3b1406] block">
                              {user.nombre}
                            </span>
                            {user.email && (
                              <span className="text-[11px] text-[#78350f] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-amber-700/60" />
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[#3b1406]">
                          {user.documento}
                        </span>
                        {user.grado && (
                          <span className="ml-2 text-[11px] font-semibold text-amber-900 bg-amber-100/60 px-1.5 py-0.5 rounded">
                            Grado {user.grado}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleCfg.bg} ${roleCfg.text} ${roleCfg.border}`}>
                          {user.tipo === 'super_user' && <Shield className="w-3 h-3 fill-amber-500 text-amber-800" />}
                          {roleCfg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {userModules.slice(0, 3).map(m => {
                            const modDef = SYSTEM_MODULES.find(sm => sm.id === m);
                            return (
                              <span key={m} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-700 truncate max-w-[110px]" title={modDef?.label || m}>
                                {modDef?.label || m}
                              </span>
                            );
                          })}
                          {userModules.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] font-bold text-amber-800">
                              +{userModules.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.activo !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#3b1406] transition-colors cursor-pointer"
                            title="Editar usuario y permisos"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center font-bold">
                  {isEditing ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#3b1406]">
                    {isEditing ? 'Editar Usuario y Permisos' : 'Crear Nuevo Usuario Institucional'}
                  </h3>
                  <p className="text-xs text-[#78350f]">
                    Configura credenciales de acceso, rol y restricción a módulos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Sandra Gómez"
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Documento de Identidad / Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="Ej. 12345678"
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] font-mono focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ej. docente@cristorey.edu.co"
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contrasena}
                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                    placeholder="Ej. 123456"
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] font-mono focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Rol Principal en la Institución *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/50 focus:ring-2 focus:ring-[#ea580c] focus:outline-none cursor-pointer"
                  >
                    <option value="super_user">🛡️ Super Usuario (Administrador Total)</option>
                    <option value="directivo">🏛️ Directivo / Coordinador</option>
                    <option value="docente">👨‍🏫 Docente</option>
                    <option value="porteria">🚪 Portería / Celador</option>
                    <option value="estudiantes">🎓 Estudiante</option>
                    <option value="acudientes">👨‍👩‍👧 Acudiente / Padre de Familia</option>
                  </select>
                </div>

                {/* Grado asignado (opcional) */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Grado Asignado (si aplica)
                  </label>
                  <input
                    type="text"
                    value={formData.grado}
                    onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                    placeholder="Ej. 11-A, 10-B"
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ea580c]"></div>
                </label>
                <span className="text-xs font-bold text-[#3b1406]">
                  Cuenta activa para inicio de sesión en plataforma
                </span>
              </div>

              {/* Modulos Permitidos (Restricciones a módulos) */}
              <div className="pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-[#3b1406] uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    Restricción de Módulos (Permisos de Acceso)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="text-[11px] font-bold text-[#ea580c] hover:underline"
                    >
                      Habilitar Todos
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleClearModules}
                      className="text-[11px] font-bold text-gray-500 hover:underline"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-amber-50/40 rounded-xl border border-amber-200">
                  {SYSTEM_MODULES.map(module => {
                    const isChecked = (formData.modulosPermitidos || []).includes(module.id);
                    return (
                      <div
                        key={module.id}
                        onClick={() => handleToggleModule(module.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked 
                            ? 'bg-white border-[#ea580c] shadow-xs ring-1 ring-[#ea580c]/30' 
                            : 'bg-white/60 border-amber-200/80 hover:bg-white text-gray-500'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-[#ea580c] border-[#ea580c] text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isChecked ? 'text-[#3b1406]' : 'text-gray-700'}`}>
                            {module.label}
                          </p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
