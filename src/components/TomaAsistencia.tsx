import React, { useState, useEffect } from 'react';
import { Save, Calendar, Users, CheckCircle, Clock, XCircle, ArrowLeft, AlertCircle, MessageSquare, Bell, Shield } from 'lucide-react';
import { Usuario, Grado, Materia, Estudiante, Asistencia, AttendanceStatus, EngineMode } from '../types';

interface TomaAsistenciaProps {
  user: Usuario;
  grados: Grado[];
  materias: Materia[];
  initialGradoId: string;
  initialMateriaId: string;
  estudiantes: Estudiante[];
  existingAsistencias: Asistencia[];
  engineMode: EngineMode;
  onSave: (
    materiaId: string, 
    fecha: string, 
    registros: { estudiante_id: string; estado: AttendanceStatus; observaciones?: string }[]
  ) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
}

export const TomaAsistencia: React.FC<TomaAsistenciaProps> = ({
  user,
  grados,
  materias,
  initialGradoId,
  initialMateriaId,
  estudiantes,
  existingAsistencias,
  engineMode,
  onSave,
  onBack,
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedGradoId, setSelectedGradoId] = useState(initialGradoId);
  const [selectedMateriaId, setSelectedMateriaId] = useState(initialMateriaId);
  const [fecha, setFecha] = useState(getTodayStr());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Map of student_id -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [openNoteStudentId, setOpenNoteStudentId] = useState<string | null>(null);

  const selectedGrado = grados.find(g => g.id === selectedGradoId) || grados[0];
  const selectedMateria = materias.find(m => m.id === selectedMateriaId) || materias[0];

  // Filter students by selected grade (matching either nombre or id)
  const currentEstudiantes = estudiantes.filter(e => 
    e.grado === selectedGrado?.nombre || 
    e.grado === selectedGrado?.id ||
    (selectedGrado?.nombre && e.grado?.toLowerCase() === selectedGrado.nombre.toLowerCase())
  );

  // Initialize or load existing attendance records for selected materia + fecha
  useEffect(() => {
    const existing = existingAsistencias.filter(
      a => a.materia_id === selectedMateriaId && a.fecha === fecha
    );

    const initialMap: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    currentEstudiantes.forEach((est, idx) => {
      const found = existing.find(a => a.estudiante_id === est.id);
      if (found) {
        initialMap[est.id] = found.estado;
        if (found.observaciones) initialNotes[est.id] = found.observaciones;
      } else {
        if (idx === 0) initialMap[est.id] = 'Presente';
        else if (idx === 1) initialMap[est.id] = 'Presente';
        else if (idx === 2) initialMap[est.id] = 'Tarde';
        else if (idx === 3) initialMap[est.id] = 'Ausente';
        else initialMap[est.id] = 'Presente';
      }
    });

    setAttendanceMap(initialMap);
    setNotesMap(initialNotes);
  }, [selectedMateriaId, fecha, selectedGradoId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const registros = currentEstudiantes.map(est => ({
        estudiante_id: est.id,
        estado: attendanceMap[est.id] || 'Presente',
        observaciones: notesMap[est.id] || undefined
      }));

      const result = await onSave(selectedMateriaId, fecha, registros);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 6000);
      } else {
        setSaveError(result.error || 'Error al guardar en la base de datos Cloud (Firebase)');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error de red al intentar conectar con la base de datos de Firebase');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for student initials badge
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Color map for avatar badges matching Screenshot 2
  const avatarColors = [
    'bg-[#3b1406] text-amber-300 border border-[#ca8a04]',
    'bg-[#7c2d12] text-white',
    'bg-[#ea580c] text-white',
    'bg-[#047857] text-white',
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78350f] hover:text-[#3b1406] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a selección de grado</span>
        </button>
      </div>

      {/* Main Header Card matching Screenshot 2 */}
      <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-6 mb-6 shadow-xs relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ea580c] text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
          <Bell className="w-3.5 h-3.5" />
          <span>CENTRO DE AVISOS & ALERTAS DE RETIRO EN TIEMPO REAL</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight uppercase">
          Panel para Docentes de Aula y Portería (Celadores)
        </h1>
        <p className="text-xs font-bold text-[#78350f] mt-1">
          Toma de asistencia y control de registro escolar del sistema ASISCR.
        </p>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold block text-sm">¡Asistencia registrada exitosamente!</span>
              <span className="text-[11px] text-emerald-800">
                Sincronización activa con Firebase Firestore Cloud Database.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error / Connection Alert Banner */}
      {saveError && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-bold block text-sm text-amber-950">No se pudo guardar la información en Firebase Firestore</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Razón del fallo:</strong> <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono text-xs">{saveError}</code>
              </p>
              
              <div className="pt-2 text-[11px] text-amber-900 space-y-2 bg-white/70 p-3 rounded-xl border border-amber-200">
                <span className="font-extrabold block text-[#3b1406] uppercase tracking-wider text-[10px]">¿Por qué sucede esto y cómo solucionarlo?</span>
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    <strong>Verifica tu conexión a Internet:</strong> 
                    Asegúrate de que tu dispositivo tenga acceso a la red para comunicarse con el servidor en la nube de Firebase.
                  </li>
                  <li>
                    <strong>Configuración de Reglas de Firestore:</strong> 
                    Verifica que las reglas de seguridad de Firestore permitan la escritura en la colección de asistencias.
                  </li>
                  <li>
                    <strong>Inicialización de Firebase:</strong> 
                    Confirma que las credenciales de tu proyecto en Firebase estén correctamente cargadas en el archivo de configuración.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Filter Panel */}
      <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-4 sm:p-6 mb-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          {/* Grado Selector */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1.5">
              Grado Seleccionado
            </label>
            <select
              value={selectedGradoId}
              onChange={(e) => setSelectedGradoId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
            >
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>

          {/* Asignatura Selector */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1.5">
              Asignatura / Materia
            </label>
            <select
              value={selectedMateriaId}
              onChange={(e) => setSelectedMateriaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
            >
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha Picker */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1.5">
              Fecha de Registro
            </label>
            <div className="relative">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
          </div>

          {/* Counter Badge */}
          <div className="flex items-center justify-center sm:justify-start bg-[#fef3c7] px-4 py-2.5 rounded-xl border border-[#fde68a]">
            <Users className="w-4 h-4 text-[#ea580c] mr-2" />
            <span className="text-xs font-black text-[#3b1406]">
              {currentEstudiantes.length} Alumnos En Lista
            </span>
          </div>

        </div>
      </div>

      {/* Students Table Section */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-[#3b1406] mb-4 tracking-tight uppercase">
          Listado de Estudiantes • {selectedGrado.nombre}
        </h2>

        {/* Table Container */}
        <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef3c7] border-b-2 border-[#fde68a] text-[11px] uppercase tracking-wider text-[#3b1406] font-black">
                  <th className="py-3.5 px-4 font-black min-w-[200px]">Nombre del Estudiante</th>
                  <th className="py-3.5 px-4 font-black text-center">Pre (Presente)</th>
                  <th className="py-3.5 px-4 font-black text-center">Tar (Tarde)</th>
                  <th className="py-3.5 px-4 font-black text-center">Aus (Ausente)</th>
                  <th className="py-3.5 px-4 font-black text-center min-w-[60px]">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#fde68a]/60 bg-white">
                {currentEstudiantes.map((est, idx) => {
                  const currentStatus = attendanceMap[est.id] || 'Presente';
                  const avatarColor = avatarColors[idx % avatarColors.length];
                  const hasNote = Boolean(notesMap[est.id]);

                  return (
                    <React.Fragment key={est.id}>
                      <tr className="hover:bg-[#fefce8] transition-colors">
                        
                        {/* Student Name & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-[10px] font-black shadow-2xs`}>
                              {getInitials(est.nombre)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#3b1406] block">
                                  {est.nombre}
                                </span>
                                <span className="px-1.5 py-0.5 bg-[#7c2d12] text-white text-[9px] font-bold rounded">
                                  {est.grado}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#78350f] font-mono font-medium">
                                Doc: {est.documento}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Pre (Presente) Radio */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2">
                            <input
                              type="radio"
                              name={`att_${est.id}`}
                              checked={currentStatus === 'Presente'}
                              onChange={() => handleStatusChange(est.id, 'Presente')}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              currentStatus === 'Presente'
                                ? 'border-[#047857] bg-white'
                                : 'border-[#d97706]/40 bg-transparent'
                            }`}>
                              {currentStatus === 'Presente' && (
                                <div className="w-3 h-3 rounded-full bg-[#047857]" />
                              )}
                            </div>
                          </label>
                        </td>

                        {/* Tar (Tarde) Radio */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2">
                            <input
                              type="radio"
                              name={`att_${est.id}`}
                              checked={currentStatus === 'Tarde'}
                              onChange={() => handleStatusChange(est.id, 'Tarde')}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              currentStatus === 'Tarde'
                                ? 'border-[#d97706] bg-white'
                                : 'border-[#d97706]/40 bg-transparent'
                            }`}>
                              {currentStatus === 'Tarde' && (
                                <div className="w-3 h-3 rounded-full bg-[#d97706]" />
                              )}
                            </div>
                          </label>
                        </td>

                        {/* Aus (Ausente) Radio */}
                        <td className="py-4 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2">
                            <input
                              type="radio"
                              name={`att_${est.id}`}
                              checked={currentStatus === 'Ausente'}
                              onChange={() => handleStatusChange(est.id, 'Ausente')}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              currentStatus === 'Ausente'
                                ? 'border-[#b91c1c] bg-white'
                                : 'border-[#d97706]/40 bg-transparent'
                            }`}>
                              {currentStatus === 'Ausente' && (
                                <div className="w-3 h-3 rounded-full bg-[#b91c1c]" />
                              )}
                            </div>
                          </label>
                        </td>

                        {/* Note toggle */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setOpenNoteStudentId(openNoteStudentId === est.id ? null : est.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              hasNote ? 'text-[#ea580c] bg-[#fef3c7]' : 'text-[#b45309] hover:bg-[#fef3c7]'
                            }`}
                            title="Añadir observaciones"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>

                      {/* Expandable note input field */}
                      {openNoteStudentId === est.id && (
                        <tr className="bg-[#fef3c7]/60">
                          <td colSpan={5} className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#3b1406] whitespace-nowrap">
                                Observación para {est.nombre}:
                              </span>
                              <input
                                type="text"
                                value={notesMap[est.id] || ''}
                                onChange={(e) => setNotesMap({ ...notesMap, [est.id]: e.target.value })}
                                placeholder="Ej: Retardo justificado por permiso médico de acudiente..."
                                className="flex-1 px-3 py-1.5 bg-white border border-[#f59e0b]/40 rounded-lg text-xs font-medium text-[#3b1406] focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Save Button matching Emerald CTA in Screenshot 2 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-3.5 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            isSaving 
              ? 'bg-[#047857]/60 cursor-not-allowed' 
              : 'bg-[#047857] hover:bg-[#065f46]'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando en base de datos...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Confirmar Asistencia Efectiva</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

