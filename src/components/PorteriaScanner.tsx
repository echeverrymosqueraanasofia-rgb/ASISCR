import React, { useState } from 'react';
import { 
  DoorOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Send, 
  ShieldCheck, 
  User, 
  Phone,
  GraduationCap
} from 'lucide-react';
import { Estudiante, Usuario, AvisoDocenteCelador } from '../types';

interface PorteriaScannerProps {
  currentUser: Usuario;
  estudiantes: Estudiante[];
  onEmitirAviso: (aviso: AvisoDocenteCelador) => Promise<{ success: boolean }>;
  onRefresh: () => void;
}

export const PorteriaScanner: React.FC<PorteriaScannerProps> = ({
  currentUser,
  estudiantes,
  onEmitirAviso,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
  const [gateAction, setGateAction] = useState<'llegada_tardia' | 'llegada_acudiente' | 'salida_autorizada'>('llegada_tardia');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredEstudiantes = estudiantes.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.documento.includes(searchTerm) ||
    e.grado.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const handleRegisterGateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${timeStr}`;

    let title = '';
    let category: any = 'llegada_tardia';
    let priority: any = 'normal';

    if (gateAction === 'llegada_tardia') {
      title = `Llegada Tardía (${timeStr}): ${selectedStudent.nombre} (${selectedStudent.grado})`;
      category = 'llegada_tardia';
    } else if (gateAction === 'llegada_acudiente') {
      title = `Acudiente en Portería para ${selectedStudent.nombre} (${selectedStudent.grado})`;
      category = 'llegada_acudiente';
      priority = 'alta';
    } else {
      title = `Salida Registrada en Puerta: ${selectedStudent.nombre} (${selectedStudent.grado})`;
      category = 'autorizacion_salida';
    }

    const message = notes.trim() || `Registro efectuado en portería a las ${timeStr} por el guardia de turno.`;

    const aviso: AvisoDocenteCelador = {
      id: `av_por_${Date.now()}`,
      categoria: category,
      titulo: title,
      mensaje: message,
      emisor_id: currentUser.id,
      emisor_nombre: currentUser.nombre,
      emisor_rol: 'porteria',
      destinatario_rol: 'docente',
      estudiante_nombre: selectedStudent.nombre,
      grado: selectedStudent.grado,
      prioridad: priority,
      estado: 'pendiente',
      fecha: dateStr
    };

    const res = await onEmitirAviso(aviso);
    if (res.success) {
      setSuccessMsg(`Aviso enviado al cuerpo docente para ${selectedStudent.nombre} (${timeStr})`);
      setSelectedStudent(null);
      setNotes('');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Success banner */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-3 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white flex items-center gap-1.5 shadow-xs">
              <DoorOpen className="w-3.5 h-3.5" />
              Portería Principal & Guardia
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Control de Puerta Peatonal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Control de Ingreso y Salida en Portería
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Registra llegadas tardías, presencia de padres en puerta y notifica instantáneamente al director de grupo o coordinación.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-[#3b1406]">Guardia Activo: {currentUser.nombre}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Search & Selection */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm">
          <h2 className="text-sm font-black text-[#3b1406] mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#ea580c]" />
            1. Buscar Estudiante
          </h2>

          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, tarjeta o grado..."
              className="w-full pl-9 pr-3 py-2 border border-amber-300 rounded-xl text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEstudiantes.map(est => {
              const isSelected = selectedStudent?.id === est.id;
              return (
                <div
                  key={est.id}
                  onClick={() => setSelectedStudent(est)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-amber-100 border-[#ea580c] shadow-xs ring-1 ring-[#ea580c]' 
                      : 'bg-white hover:bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3b1406] text-amber-300 font-bold flex items-center justify-center text-xs">
                      {est.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#3b1406]">{est.nombre}</p>
                      <p className="text-[10px] text-gray-500 font-mono">Doc: {est.documento}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-[11px] font-black text-[#ea580c] border border-amber-200">
                    {est.grado}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Event Logger & Instant Notification */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm">
          <h2 className="text-sm font-black text-[#3b1406] mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#ea580c]" />
            2. Registrar y Notificar a Docentes
          </h2>

          {selectedStudent ? (
            <form onSubmit={handleRegisterGateEvent} className="space-y-4">
              {/* Selected Student Banner */}
              <div className="bg-[#fef9ee] p-4 rounded-xl border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#ea580c] block">
                    Estudiante Seleccionado
                  </span>
                  <p className="text-sm font-black text-[#3b1406]">{selectedStudent.nombre}</p>
                  <p className="text-xs text-gray-600">
                    Grado: <strong>{selectedStudent.grado}</strong> • Acudiente: <strong>{selectedStudent.nombre_acudiente || 'No registrado'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Cambiar
                </button>
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Tipo de Novedad en Portería:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGateAction('llegada_tardia')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      gateAction === 'llegada_tardia'
                        ? 'bg-[#ea580c] text-white border-[#ea580c] shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-gray-700 border-amber-200'
                    }`}
                  >
                    ⏰ Llegada Tardía
                  </button>

                  <button
                    type="button"
                    onClick={() => setGateAction('llegada_acudiente')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      gateAction === 'llegada_acudiente'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-gray-700 border-amber-200'
                    }`}
                  >
                    👨‍👩‍👧 Acudiente en Puerta
                  </button>

                  <button
                    type="button"
                    onClick={() => setGateAction('salida_autorizada')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      gateAction === 'salida_autorizada'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-gray-700 border-amber-200'
                    }`}
                  >
                    🚪 Salida en Puerta
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Observación de Portería (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Ingresó a las 07:22 AM por cita médica. / Acudiente presenta documento de retiro."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#3b1406] hover:bg-[#230b04] text-amber-300 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>Registrar y Emitir Aviso Inmediato</span>
              </button>
            </form>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-amber-200 rounded-xl text-gray-400">
              <User className="w-10 h-10 mb-2 opacity-50 text-amber-700" />
              <p className="text-xs font-bold text-[#3b1406]">Ningún estudiante seleccionado</p>
              <p className="text-[11px] text-gray-500 max-w-xs mt-1">
                Selecciona un estudiante de la columna izquierda para registrar su novedad de ingreso o salida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
