import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  UserCheck, 
  Building2, 
  DoorOpen, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Check,
  X,
  User,
  GraduationCap
} from 'lucide-react';
import { 
  AvisoDocenteCelador, 
  AvisoCategoria, 
  Usuario, 
  UserRole 
} from '../types';

interface AvisosDocenteCeladorProps {
  currentUser: Usuario;
  avisos: AvisoDocenteCelador[];
  onSaveAviso: (aviso: AvisoDocenteCelador) => Promise<{ success: boolean; error?: string }>;
  onUpdateEstado: (id: string, estado: 'pendiente' | 'atendido' | 'resuelto', atendidoPor?: string, respuesta?: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const CATEGORY_CONFIG: Record<AvisoCategoria, { label: string; icon: any; color: string; bg: string }> = {
  autorizacion_salida: { 
    label: 'Autorización de Salida', 
    icon: DoorOpen, 
    color: 'text-amber-800', 
    bg: 'bg-amber-100 border-amber-300' 
  },
  llegada_acudiente: { 
    label: 'Llegada de Acudiente en Portería', 
    icon: UserCheck, 
    color: 'text-blue-800', 
    bg: 'bg-blue-100 border-blue-300' 
  },
  llegada_tardia: { 
    label: 'Llegada Tardía a Portería', 
    icon: Clock, 
    color: 'text-orange-800', 
    bg: 'bg-orange-100 border-orange-300' 
  },
  alerta_urgente: { 
    label: 'Alerta Urgente', 
    icon: ShieldAlert, 
    color: 'text-rose-800', 
    bg: 'bg-rose-100 border-rose-300' 
  },
  comunicado_general: { 
    label: 'Comunicado General', 
    icon: Building2, 
    color: 'text-purple-800', 
    bg: 'bg-purple-100 border-purple-300' 
  },
};

export const AvisosDocenteCelador: React.FC<AvisosDocenteCeladorProps> = ({
  currentUser,
  avisos,
  onSaveAviso,
  onUpdateEstado,
  onRefresh,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseModalAviso, setResponseModalAviso] = useState<AvisoDocenteCelador | null>(null);
  const [responseText, setResponseText] = useState('');

  // Form state for creating notice
  const [newAviso, setNewAviso] = useState<Partial<AvisoDocenteCelador>>({
    categoria: currentUser.tipo === 'porteria' ? 'llegada_acudiente' : 'autorizacion_salida',
    titulo: '',
    mensaje: '',
    destinatario_rol: currentUser.tipo === 'porteria' ? 'docente' : 'porteria',
    estudiante_nombre: '',
    grado: '11-A',
    prioridad: 'normal',
  });

  const handleCreateAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAviso.titulo?.trim() || !newAviso.mensaje?.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const aviso: AvisoDocenteCelador = {
      id: `av_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      categoria: newAviso.categoria as AvisoCategoria,
      titulo: newAviso.titulo.trim(),
      mensaje: newAviso.mensaje.trim(),
      emisor_id: currentUser.id,
      emisor_nombre: currentUser.nombre,
      emisor_rol: currentUser.tipo,
      destinatario_rol: newAviso.destinatario_rol as any,
      estudiante_nombre: newAviso.estudiante_nombre?.trim() || '',
      grado: newAviso.grado || '',
      prioridad: newAviso.prioridad as any || 'normal',
      estado: 'pendiente',
      fecha: formattedDate
    };

    const res = await onSaveAviso(aviso);
    if (res.success) {
      setIsModalOpen(false);
      setNewAviso({
        categoria: currentUser.tipo === 'porteria' ? 'llegada_acudiente' : 'autorizacion_salida',
        titulo: '',
        mensaje: '',
        destinatario_rol: currentUser.tipo === 'porteria' ? 'docente' : 'porteria',
        estudiante_nombre: '',
        grado: '11-A',
        prioridad: 'normal',
      });
      onRefresh();
    }
  };

  const handleQuickResolve = async (aviso: AvisoDocenteCelador, newStatus: 'atendido' | 'resuelto') => {
    await onUpdateEstado(aviso.id, newStatus, currentUser.nombre);
    onRefresh();
  };

  const handleSubmitResponse = async () => {
    if (!responseModalAviso || !responseText.trim()) return;
    await onUpdateEstado(responseModalAviso.id, 'resuelto', currentUser.nombre, responseText.trim());
    setResponseModalAviso(null);
    setResponseText('');
    onRefresh();
  };

  // Filtered notices
  const filteredAvisos = avisos.filter(a => {
    const matchesSearch = 
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.estudiante_nombre && a.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.emisor_nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'todos' || a.categoria === filterCategory;
    const matchesStatus = filterStatus === 'todos' || a.estado === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ea580c] text-white flex items-center gap-1.5 shadow-xs">
              <Bell className="w-3.5 h-3.5" />
              Canal de Comunicación Inmediata
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Docentes • Celadores • Directivos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Avisos Docente / Celador
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Coordinación de salidas anticipadas, visitas de acudientes en portería, control de retiros e ingresos tardíos en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#3b1406] hover:bg-[#230b04] text-amber-300 font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Nuevo Aviso</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#fef9ee] p-4 rounded-2xl border border-amber-200/60 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-amber-700/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por estudiante, emisor, contenido..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-amber-300/80 text-xs text-[#3b1406] placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">⏳ Solo Pendientes</option>
            <option value="atendido">👀 Atendidos</option>
            <option value="resuelto">✅ Resueltos</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          >
            <option value="todos">Todas las Categorías</option>
            <option value="autorizacion_salida">🚪 Autorizaciones de Salida</option>
            <option value="llegada_acudiente">👨‍👩‍👧 Llegada de Acudiente en Portería</option>
            <option value="llegada_tardia">⏰ Llegadas Tardías</option>
            <option value="alerta_urgente">🚨 Alertas Urgentes</option>
            <option value="comunicado_general">📢 Comunicados Generales</option>
          </select>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#3b1406] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredAvisos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-amber-200 p-12 text-center text-amber-800/60 font-medium">
            <Bell className="w-12 h-12 mx-auto text-amber-400 mb-3 opacity-60" />
            <p className="text-base font-bold text-[#3b1406]">No hay avisos registrados con los filtros seleccionados</p>
            <p className="text-xs text-amber-700/80 mt-1">
              Haz clic en "Emitir Nuevo Aviso" para notificar a la portería o al cuerpo docente.
            </p>
          </div>
        ) : (
          filteredAvisos.map(aviso => {
            const cat = CATEGORY_CONFIG[aviso.categoria] || CATEGORY_CONFIG.comunicado_general;
            const Icon = cat.icon;

            return (
              <div 
                key={aviso.id} 
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all hover:shadow-md ${
                  aviso.prioridad === 'urgente' 
                    ? 'border-rose-300 ring-2 ring-rose-200 bg-rose-50/20' 
                    : aviso.estado === 'pendiente' 
                      ? 'border-amber-300 ring-1 ring-amber-200' 
                      : 'border-amber-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.bg} ${cat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>

                    {aviso.prioridad === 'urgente' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                        Urgente
                      </span>
                    )}

                    {aviso.grado && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {aviso.grado}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-amber-900/70">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {aviso.fecha}
                    </span>
                    
                    {/* Status Pill */}
                    {aviso.estado === 'pendiente' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Pendiente
                      </span>
                    )}
                    {aviso.estado === 'atendido' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Atendido
                      </span>
                    )}
                    {aviso.estado === 'resuelto' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        Resuelto
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-black text-[#3b1406] mb-1.5">
                  {aviso.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
                  {aviso.mensaje}
                </p>

                {/* Student Tag if applicable */}
                {aviso.estudiante_nombre && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-[#3b1406] mb-4">
                    <GraduationCap className="w-4 h-4 text-[#ea580c]" />
                    <span>Estudiante involucrado: <strong>{aviso.estudiante_nombre}</strong></span>
                  </div>
                )}

                {/* Response / Resolution Box if available */}
                {aviso.respuesta && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 mb-4 text-xs">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Respuesta de {aviso.atendido_por || 'Docente/Celador'}:
                    </p>
                    <p className="text-emerald-800 italic">
                      "{aviso.respuesta}"
                    </p>
                  </div>
                )}

                {/* Footer metadata & Action buttons */}
                <div className="pt-3 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900/80">
                    <User className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>
                      Emitido por: <strong className="text-[#3b1406]">{aviso.emisor_nombre}</strong> ({aviso.emisor_rol}) 
                      → Dirigido a: <strong className="capitalize text-[#3b1406]">{aviso.destinatario_rol}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {aviso.estado === 'pendiente' && (
                      <button
                        onClick={() => handleQuickResolve(aviso, 'atendido')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                        <span>Marcar Atendido</span>
                      </button>
                    )}

                    {aviso.estado !== 'resuelto' && (
                      <button
                        onClick={() => setResponseModalAviso(aviso)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Responder / Resolver</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#3b1406]">
                    Emitir Aviso Inmediato
                  </h3>
                  <p className="text-xs text-[#78350f]">
                    Comunica novedades urgentes entre el aula y la portería.
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

            <form onSubmit={handleCreateAviso} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Tipo / Categoría del Aviso *
                </label>
                <select
                  value={newAviso.categoria}
                  onChange={(e) => setNewAviso({ ...newAviso, categoria: e.target.value as AvisoCategoria })}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none cursor-pointer"
                >
                  <option value="autorizacion_salida">🚪 Autorización de Salida de Estudiante</option>
                  <option value="llegada_acudiente">👨‍👩‍👧 Llegada de Acudiente en Portería</option>
                  <option value="llegada_tardia">⏰ Llegada Tardía de Alumno</option>
                  <option value="alerta_urgente">🚨 Alerta Urgente de Seguridad</option>
                  <option value="comunicado_general">📢 Comunicado General</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Título del Aviso *
                </label>
                <input
                  type="text"
                  required
                  value={newAviso.titulo}
                  onChange={(e) => setNewAviso({ ...newAviso, titulo: e.target.value })}
                  placeholder="Ej. Permiso de salida anticipada a las 10:30"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Detalle / Mensaje Completo *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newAviso.mensaje}
                  onChange={(e) => setNewAviso({ ...newAviso, mensaje: e.target.value })}
                  placeholder="Escribe el mensaje claro con indicaciones para el celador o docente..."
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Estudiante Involucrado */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Estudiante (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newAviso.estudiante_nombre}
                    onChange={(e) => setNewAviso({ ...newAviso, estudiante_nombre: e.target.value })}
                    placeholder="Ej. Ana Martínez"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Grado */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Grado
                  </label>
                  <select
                    value={newAviso.grado}
                    onChange={(e) => setNewAviso({ ...newAviso, grado: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  >
                    <option value="11-A">11-A</option>
                    <option value="11-B">11-B</option>
                    <option value="10-A">10-A</option>
                    <option value="10-B">10-B</option>
                    <option value="Todos">Todos</option>
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newAviso.prioridad}
                    onChange={(e) => setNewAviso({ ...newAviso, prioridad: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">🚨 Urgente</option>
                  </select>
                </div>
              </div>

              {/* Destinatario */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Destinatario Principal
                </label>
                <select
                  value={newAviso.destinatario_rol}
                  onChange={(e) => setNewAviso({ ...newAviso, destinatario_rol: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                >
                  <option value="porteria">🚪 Portería / Celador</option>
                  <option value="docente">👨‍🏫 Docentes de Aula</option>
                  <option value="directivo">🏛️ Rectoría / Coordinación</option>
                  <option value="todos">📢 Todos los Miembros</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Aviso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response / Resolution Modal */}
      {responseModalAviso && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-[#3b1406] mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Responder o Confirmar Gestión del Aviso
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Aviso: <strong>{responseModalAviso.titulo}</strong>
            </p>

            <textarea
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Ej. Estudiante retirado a las 10:35 con su acudiente / Enterado y recibido en portería."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-emerald-600 focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setResponseModalAviso(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitResponse}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar y Marcar Resuelto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
