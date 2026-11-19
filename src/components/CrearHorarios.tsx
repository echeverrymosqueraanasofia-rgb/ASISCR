import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  BookOpen, 
  User, 
  School, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { HorarioClase, Grado, Materia, Usuario, DiaSemana } from '../types';

interface CrearHorariosProps {
  currentUser: Usuario;
  horarios: HorarioClase[];
  grados: Grado[];
  materias: Materia[];
  onSaveHorario: (horario: HorarioClase) => Promise<{ success: boolean; error?: string }>;
  onDeleteHorario: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

const DIAS_SEMANA: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const CrearHorarios: React.FC<CrearHorariosProps> = ({
  currentUser,
  horarios,
  grados,
  materias,
  onSaveHorario,
  onDeleteHorario,
  onRefresh,
}) => {
  const [selectedGrado, setSelectedGrado] = useState<string>('gr_11a');
  const [selectedDiaFilter, setSelectedDiaFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<HorarioClase>>({
    id: '',
    grado_id: 'gr_11a',
    grado_nombre: '11-A',
    dia: 'Lunes',
    hora_inicio: '07:00',
    hora_fin: '08:30',
    materia_nombre: 'Matemáticas',
    docente_nombre: 'Carlos Mendoza',
    aula: 'Salón 201'
  });

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    const defaultGrado = grados.find(g => g.id === selectedGrado) || grados[0];
    setFormData({
      id: `hor_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      grado_id: defaultGrado?.id || 'gr_11a',
      grado_nombre: defaultGrado?.nombre || '11-A',
      dia: 'Lunes',
      hora_inicio: '07:00',
      hora_fin: '08:30',
      materia_nombre: materias[0]?.nombre || 'Matemáticas',
      docente_nombre: currentUser.nombre || 'Docente Asignado',
      aula: 'Salón 201'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: HorarioClase) => {
    setIsEditing(true);
    setFormData({ ...h });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formData.materia_nombre?.trim() || !formData.docente_nombre?.trim()) {
      showNotification('Por favor complete la materia y docente', 'error');
      return;
    }

    const targetGrado = grados.find(g => g.id === formData.grado_id);

    const payload: HorarioClase = {
      id: formData.id || `hor_${Date.now()}`,
      grado_id: formData.grado_id || 'gr_11a',
      grado_nombre: targetGrado ? targetGrado.nombre : (formData.grado_nombre || '11-A'),
      dia: formData.dia as DiaSemana || 'Lunes',
      hora_inicio: formData.hora_inicio || '07:00',
      hora_fin: formData.hora_fin || '08:30',
      materia_nombre: formData.materia_nombre.trim(),
      docente_nombre: formData.docente_nombre.trim(),
      aula: formData.aula?.trim() || 'Aula General'
    };

    setIsSaving(true);
    try {
      const res = await onSaveHorario(payload);
      if (res.success) {
        showNotification(`Bloque horario ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
        setIsModalOpen(false);
        onRefresh();
      } else {
        showNotification(res.error || 'Error al guardar horario', 'error');
      }
    } catch (error) {
      console.error('[ASISCR] Error guardando bloque horario:', error);
      showNotification(
        error instanceof Error ? `No se pudo guardar el horario: ${error.message}` : 'No se pudo guardar el horario.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (h: HorarioClase) => {
    const res = await onDeleteHorario(h.id);
    if (res.success) {
      showNotification(`Clase de ${h.materia_nombre} (${h.dia}) eliminada exitosamente.`);
      onRefresh();
    } else {
      showNotification(res.error || 'Error al eliminar horario', 'error');
    }
  };

  // Filter schedules for the selected grade
  const gradeHorarios = horarios.filter(h => {
    const matchesGrado = h.grado_id === selectedGrado || h.grado_nombre === selectedGrado;
    if (selectedDiaFilter === 'todos') return matchesGrado;
    return matchesGrado && h.dia === selectedDiaFilter;
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
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ea580c] text-white flex items-center gap-1.5 shadow-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              Planificación Curricular
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Jornada Académica 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Crear y Administrar Horarios
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Diseña los bloques de clase semanales por grado, asigna docentes titulares y especifica las aulas correspondientes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-[#3b1406] hover:bg-[#230b04] text-amber-300 font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Bloque de Clase</span>
        </button>
      </div>

      {/* Selector & Filters */}
      <div className="bg-[#fef9ee] p-4 rounded-2xl border border-amber-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#3b1406]">Seleccionar Grado:</span>
          {grados.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGrado(g.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGrado === g.id
                  ? 'bg-[#ea580c] text-white shadow-sm'
                  : 'bg-white hover:bg-amber-100 text-[#78350f] border border-amber-200'
              }`}
            >
              Grado {g.nombre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#3b1406]">Filtrar Día:</span>
          <select
            value={selectedDiaFilter}
            onChange={(e) => setSelectedDiaFilter(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          >
            <option value="todos">Toda la Semana</option>
            {DIAS_SEMANA.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Visual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DIAS_SEMANA.filter(d => selectedDiaFilter === 'todos' || selectedDiaFilter === d).map(dia => {
          const diaHorarios = gradeHorarios.filter(h => h.dia === dia)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

          return (
            <div key={dia} className="bg-white rounded-2xl border border-amber-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="bg-[#faf3e0] py-2.5 px-3 border-b border-amber-200 text-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#3b1406]">
                  {dia}
                </h3>
                <span className="text-[10px] text-amber-800 font-semibold">
                  {diaHorarios.length} clases
                </span>
              </div>

              <div className="p-3 flex-1 space-y-2.5 min-h-[220px] bg-amber-50/20">
                {diaHorarios.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 text-gray-400 text-xs italic">
                    Sin clases asignadas
                  </div>
                ) : (
                  diaHorarios.map(h => (
                    <div 
                      key={h.id}
                      className="bg-white rounded-xl border border-amber-200 p-3 shadow-xs hover:border-[#ea580c] transition-all group relative"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#ea580c] font-black mb-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {h.hora_inicio} - {h.hora_fin}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="p-1 rounded text-gray-400 hover:text-amber-800 cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(h)}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-[#3b1406] line-clamp-1">
                        {h.materia_nombre}
                      </h4>

                      <div className="mt-2 pt-2 border-t border-amber-100 flex flex-col gap-1 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1 truncate" title={h.docente_nombre}>
                          <User className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{h.docente_nombre}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <School className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{h.aula}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#3b1406]">
                    {isEditing ? 'Editar Bloque de Horario' : 'Crear Bloque de Horario'}
                  </h3>
                  <p className="text-xs text-[#78350f]">
                    Configura la asignatura, horas y profesor a cargo.
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
              <div className="grid grid-cols-2 gap-3">
                {/* Grado */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Grado
                  </label>
                  <select
                    value={formData.grado_id}
                    onChange={(e) => setFormData({ ...formData, grado_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  >
                    {grados.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Día */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={formData.dia}
                    onChange={(e) => setFormData({ ...formData, dia: e.target.value as DiaSemana })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] bg-amber-50/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  >
                    {DIAS_SEMANA.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Hora Inicio */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>

                {/* Hora Fin */}
                <div>
                  <label className="block text-xs font-bold text-[#3b1406] mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Materia */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Nombre de la Asignatura / Materia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.materia_nombre}
                  onChange={(e) => setFormData({ ...formData, materia_nombre: e.target.value })}
                  placeholder="Ej. Matemáticas, Biología, Filosofía..."
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              {/* Docente */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Docente Titular Asignado *
                </label>
                <input
                  type="text"
                  required
                  value={formData.docente_nombre}
                  onChange={(e) => setFormData({ ...formData, docente_nombre: e.target.value })}
                  placeholder="Ej. Prof. Carlos Mendoza"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              {/* Aula */}
              <div>
                <label className="block text-xs font-bold text-[#3b1406] mb-1">
                  Salón o Espacio Académico
                </label>
                <input
                  type="text"
                  value={formData.aula}
                  onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                  placeholder="Ej. Salón 201, Laboratorio de Química, Coliseo..."
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : isEditing ? 'Actualizar Horario' : 'Guardar Horario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
