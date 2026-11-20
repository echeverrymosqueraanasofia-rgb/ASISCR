import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  FileSpreadsheet,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { Estudiante, Grado } from '../types';
import { parseEstudiantesCsv } from './estudiantesCsv';

interface GestionEstudiantesProps {
  estudiantes: Estudiante[];
  grados: Grado[];
  onSaveEstudiante: (estudiante: Estudiante) => Promise<{ success: boolean; error?: string }>;
  onDeleteEstudiante: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

type StudentFormData = Omit<Estudiante, 'id'> & { id: string };

function createStudentId(): string {
  return `est_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const GestionEstudiantes: React.FC<GestionEstudiantesProps> = ({
  estudiantes,
  grados,
  onSaveEstudiante,
  onDeleteEstudiante,
  onRefresh,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; details?: string[] } | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    id: '',
    nombre: '',
    grado: '',
    documento: '',
    nombre_acudiente: '',
    telefono_acudiente: '',
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success', details?: string[]) => {
    setNotification({ message, type, details });
  };

  const openCreate = () => {
    if (grados.length === 0) {
      showNotification('Crea primero un grupo antes de registrar estudiantes.', 'error');
      return;
    }
    setIsEditing(false);
    setFormData({
      id: createStudentId(),
      nombre: '',
      grado: gradeFilter === 'todos' ? grados[0].nombre : gradeFilter,
      documento: '',
      nombre_acudiente: '',
      telefono_acudiente: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (estudiante: Estudiante) => {
    setIsEditing(true);
    setFormData({
      id: estudiante.id,
      nombre: estudiante.nombre,
      grado: estudiante.grado,
      documento: estudiante.documento,
      nombre_acudiente: estudiante.nombre_acudiente || '',
      telefono_acudiente: estudiante.telefono_acudiente || '',
      id_padre: estudiante.id_padre,
      avatarUrl: estudiante.avatarUrl,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Estudiante = {
      ...formData,
      nombre: formData.nombre.trim(),
      documento: formData.documento.trim(),
      grado: formData.grado.trim(),
      nombre_acudiente: formData.nombre_acudiente?.trim() || '',
      telefono_acudiente: formData.telefono_acudiente?.trim() || '',
    };
    if (!payload.nombre || !payload.documento || !payload.grado) {
      showNotification('Completa el nombre, documento y grupo del estudiante.', 'error');
      return;
    }
    if (estudiantes.some(item => item.id !== payload.id && item.documento.trim().toLocaleLowerCase() === payload.documento.toLocaleLowerCase())) {
      showNotification('Ya existe un estudiante con ese documento.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSaveEstudiante(payload);
      if (!result.success) {
        showNotification(result.error || 'No se pudo guardar el estudiante.', 'error');
        return;
      }
      setIsModalOpen(false);
      showNotification(`Estudiante ${isEditing ? 'actualizado' : 'registrado'} correctamente.`);
      onRefresh();
    } catch (error) {
      console.error('[ASISCR] Error guardando estudiante:', error);
      showNotification(error instanceof Error ? error.message : 'No se pudo guardar el estudiante.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (estudiante: Estudiante) => {
    if (!window.confirm(`¿Eliminar el registro de ${estudiante.nombre}? Los registros de asistencia se conservan y pueden impedir esta acción.`)) return;
    try {
      const result = await onDeleteEstudiante(estudiante.id);
      if (!result.success) {
        showNotification(result.error || 'No se pudo eliminar el estudiante.', 'error');
        return;
      }
      showNotification(`Estudiante ${estudiante.nombre} eliminado correctamente.`);
      onRefresh();
    } catch (error) {
      console.error('[ASISCR] Error eliminando estudiante:', error);
      showNotification(error instanceof Error ? error.message : 'No se pudo eliminar el estudiante.', 'error');
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportProgress('Leyendo archivo...');
    setNotification(null);

    try {
      if (grados.length === 0) {
        showNotification('Crea primero al menos un grupo para poder importar estudiantes.', 'error');
        return;
      }

      const parsed = parseEstudiantesCsv(await file.text());
      if (parsed.error) {
        showNotification(parsed.error, 'error');
        return;
      }
      if (parsed.rows.length === 0) {
        showNotification('El archivo no contiene estudiantes para importar.', 'error');
        return;
      }

      const knownDocuments = new Set(estudiantes.map(item => item.documento.trim().toLocaleLowerCase()));
      const fileDocuments = new Set<string>();
      const rowsToSave: Estudiante[] = [];
      const errors: string[] = [];
      for (const row of parsed.rows) {
        const document = row.documento.trim();
        const gradeValue = row.grado.trim().toLocaleLowerCase();
        const grade = grados.find(item =>
          item.nombre.trim().toLocaleLowerCase() === gradeValue ||
          item.id.trim().toLocaleLowerCase() === gradeValue
        );
        if (!row.nombre.trim() || !document || !grade) {
          errors.push(`Fila ${row.line}: ${!row.nombre.trim() ? 'falta el nombre' : !document ? 'falta el documento' : `no existe el grupo "${row.grado.trim()}"`}.`);
          continue;
        }

        const normalizedDocument = document.toLocaleLowerCase();
        if (knownDocuments.has(normalizedDocument) || fileDocuments.has(normalizedDocument)) {
          errors.push(`Fila ${row.line}: el documento ${document} ya está registrado o repetido en el archivo.`);
          continue;
        }

        fileDocuments.add(normalizedDocument);
        rowsToSave.push({
          id: createStudentId(),
          nombre: row.nombre.trim(),
          grado: grade.nombre,
          documento: document,
          nombre_acudiente: row.nombre_acudiente.trim(),
          telefono_acudiente: row.telefono_acudiente.trim(),
        });
      }

      let imported = 0;
      for (let index = 0; index < rowsToSave.length; index += 1) {
        const student = rowsToSave[index];
        setImportProgress(`Guardando ${index + 1} de ${rowsToSave.length}...`);
        try {
          const result = await onSaveEstudiante(student);
          if (result.success) {
            imported += 1;
            knownDocuments.add(student.documento.toLocaleLowerCase());
          } else {
            errors.push(`${student.documento}: ${result.error || 'no se pudo guardar'}.`);
          }
        } catch (error) {
          errors.push(`${student.documento}: ${error instanceof Error ? error.message : 'error inesperado al guardar'}.`);
        }
      }

      if (imported > 0) onRefresh();
      const details = errors.slice(0, 8);
      if (errors.length > details.length) details.push(`Y ${errors.length - details.length} error(es) más.`);
      const message = `Importación finalizada: ${imported} estudiante(s) importado(s), ${errors.length} fila(s) omitida(s).`;
      showNotification(message, errors.length > 0 ? 'error' : 'success', details);
    } catch (error) {
      console.error('[ASISCR] Error importando archivo CSV:', error);
      showNotification(error instanceof Error ? `No se pudo importar el archivo: ${error.message}` : 'No se pudo importar el archivo CSV.', 'error');
    } finally {
      setIsImporting(false);
      setImportProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredStudents = estudiantes.filter(student => {
    const matchesSearch = `${student.nombre} ${student.documento} ${student.nombre_acudiente || ''}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase());
    const matchesGrade = gradeFilter === 'todos' || student.grado === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {notification && (
        <div className={`mb-5 rounded-xl border p-4 ${
          notification.type === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-rose-300 bg-rose-50 text-rose-900'
        }`}>
          <div className="flex items-start gap-3 text-sm font-semibold">
            {notification.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div className="flex-1">
              <p>{notification.message}</p>
              {notification.details && notification.details.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs font-medium">
                  {notification.details.map((detail, index) => <li key={`${index}-${detail}`}>{detail}</li>)}
                </ul>
              )}
            </div>
            <button type="button" onClick={() => setNotification(null)} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-900">
            <GraduationCap className="h-4 w-4" /> Administración académica
          </span>
          <h1 className="mt-3 text-2xl font-black text-[#3b1406] sm:text-3xl">Gestión de Estudiantes</h1>
          <p className="mt-1 text-sm text-[#78350f]">Registra, actualiza, busca e importa estudiantes por archivo CSV.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b1406] px-5 py-3 text-sm font-bold text-amber-200 shadow-md transition hover:bg-[#5c230b]">
          <Plus className="h-4 w-4" /> Nuevo estudiante
        </button>
      </header>

      <section className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-teal-950">Importar desde CSV</h2>
              <p className="mt-1 text-xs leading-relaxed text-teal-900/80">
                Columnas obligatorias: <code>nombre, grado, documento</code>. Opcionales: <code>nombre_acudiente, telefono_acudiente</code>.
                Acepta coma o punto y coma; el grupo debe existir.
              </p>
              <a
                href="data:text/csv;charset=utf-8,%EF%BB%BFnombre%2Cgrado%2Cdocumento%2Cnombre_acudiente%2Ctelefono_acudiente%0AJuan%20P%C3%A9rez%2C11-A%2C10000001%2CMarta%20P%C3%A9rez%2C3001234567"
                download="plantilla_estudiantes.csv"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-800 underline decoration-teal-400 underline-offset-2"
              >
                <Download className="h-3.5 w-3.5" /> Descargar plantilla
              </a>
            </div>
          </div>
          <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow transition ${
            isImporting || grados.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-teal-700 hover:bg-teal-800'
          }`}>
            <Upload className="h-4 w-4" />
            {isImporting ? importProgress || 'Importando...' : 'Seleccionar CSV'}
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="sr-only" disabled={isImporting || grados.length === 0} onChange={handleCsvUpload} />
          </label>
        </div>
        {grados.length === 0 && <p className="mt-3 text-xs font-semibold text-rose-700">Crea al menos un grupo antes de importar estudiantes.</p>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-amber-100 bg-[#fef9ee] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-orange-700" />
            <h2 className="font-black text-[#3b1406]">Estudiantes registrados</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">{filteredStudents.length} / {estudiantes.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-800/60" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nombre o documento" className="w-full rounded-xl border border-amber-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 sm:w-64" />
            </label>
            <select value={gradeFilter} onChange={event => setGradeFilter(event.target.value)} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-[#3b1406] outline-none focus:ring-2 focus:ring-orange-400">
              <option value="todos">Todos los grupos</option>
              {grados.map(grado => <option key={grado.id} value={grado.nombre}>{grado.nombre}</option>)}
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No hay estudiantes que coincidan con la búsqueda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-amber-900">
                <tr>
                  <th className="px-5 py-3">Estudiante</th>
                  <th className="px-5 py-3">Documento</th>
                  <th className="px-5 py-3">Grupo</th>
                  <th className="px-5 py-3">Acudiente</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-amber-50/60">
                    <td className="px-5 py-4 font-bold text-[#3b1406]">{student.nombre}</td>
                    <td className="px-5 py-4 font-mono text-gray-700">{student.documento}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-900">{student.grado}</span></td>
                    <td className="px-5 py-4 text-gray-700">{student.nombre_acudiente || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{student.telefono_acudiente || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(student)} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50" title="Editar estudiante" aria-label={`Editar ${student.nombre}`}><Edit className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleDelete(student)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50" title="Eliminar estudiante" aria-label={`Eliminar ${student.nombre}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4 rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-amber-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#3b1406]">{isEditing ? 'Editar estudiante' : 'Registrar estudiante'}</h2>
                <p className="mt-1 text-sm text-gray-500">Los campos con * son obligatorios.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Cerrar formulario" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#3b1406] sm:col-span-2">
                Nombre completo *
                <input autoFocus required maxLength={150} value={formData.nombre} onChange={event => setFormData({ ...formData, nombre: event.target.value })} className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
              </label>
              <label className="text-sm font-bold text-[#3b1406]">
                Documento *
                <input required maxLength={50} value={formData.documento} onChange={event => setFormData({ ...formData, documento: event.target.value })} className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
              </label>
              <label className="text-sm font-bold text-[#3b1406]">
                Grupo *
                <select required value={formData.grado} onChange={event => setFormData({ ...formData, grado: event.target.value })} className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400">
                  {grados.map(grado => <option key={grado.id} value={grado.nombre}>{grado.nombre}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold text-[#3b1406]">
                Nombre del acudiente
                <input maxLength={150} value={formData.nombre_acudiente || ''} onChange={event => setFormData({ ...formData, nombre_acudiente: event.target.value })} className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
              </label>
              <label className="text-sm font-bold text-[#3b1406]">
                Teléfono del acudiente
                <input maxLength={50} value={formData.telefono_acudiente || ''} onChange={event => setFormData({ ...formData, telefono_acudiente: event.target.value })} className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-amber-100 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button type="submit" disabled={isSaving} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60">
                {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar estudiante'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
