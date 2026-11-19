import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Edit, Plus, School, Trash2, X } from 'lucide-react';
import { Grado } from '../types';

interface GestionGruposProps {
  grados: Grado[];
  onSaveGrado: (grado: Grado) => Promise<{ success: boolean; error?: string }>;
  onDeleteGrado: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh: () => void;
}

export const GestionGrupos: React.FC<GestionGruposProps> = ({
  grados,
  onSaveGrado,
  onDeleteGrado,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Grado>({ id: '', nombre: '', director_grupo: '' });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const openCreate = () => {
    setIsEditing(false);
    setFormData({
      id: `gr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      nombre: '',
      director_grupo: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (grado: Grado) => {
    setIsEditing(true);
    setFormData({ ...grado });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nombre = formData.nombre.trim();
    const director = formData.director_grupo.trim();
    if (!nombre || !director) {
      showNotification('Completa el nombre del grupo y el director de grupo.', 'error');
      return;
    }
    if (grados.some(grado => grado.id !== formData.id && grado.nombre.trim().toLocaleLowerCase() === nombre.toLocaleLowerCase())) {
      showNotification('Ya existe un grupo con ese nombre.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSaveGrado({ ...formData, nombre, director_grupo: director });
      if (!result.success) {
        showNotification(result.error || 'No se pudo guardar el grupo.', 'error');
        return;
      }
      setIsModalOpen(false);
      showNotification(`Grupo ${isEditing ? 'actualizado' : 'creado'} correctamente.`);
      onRefresh();
    } catch (error) {
      console.error('[ASISCR] Error guardando grupo:', error);
      showNotification(error instanceof Error ? error.message : 'No se pudo guardar el grupo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (grado: Grado) => {
    if (!window.confirm(`¿Eliminar el grupo ${grado.nombre}? Solo se eliminará si no tiene registros relacionados.`)) return;
    try {
      const result = await onDeleteGrado(grado.id);
      if (!result.success) {
        showNotification(result.error || 'No se pudo eliminar el grupo.', 'error');
        return;
      }
      showNotification(`Grupo ${grado.nombre} eliminado correctamente.`);
      onRefresh();
    } catch (error) {
      console.error('[ASISCR] Error eliminando grupo:', error);
      showNotification(error instanceof Error ? error.message : 'No se pudo eliminar el grupo.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {notification && (
        <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${
          notification.type === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-rose-300 bg-rose-50 text-rose-900'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="flex-1">{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button>
        </div>
      )}

      <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-900">
            <School className="h-4 w-4" /> Administración académica
          </span>
          <h1 className="mt-3 text-2xl font-black text-[#3b1406] sm:text-3xl">Gestión de Grupos</h1>
          <p className="mt-1 text-sm text-[#78350f]">Crea y actualiza grupos y sus directores. Los grupos con registros asociados no se pueden eliminar.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b1406] px-5 py-3 text-sm font-bold text-amber-200 shadow-md transition hover:bg-[#5c230b]">
          <Plus className="h-4 w-4" /> Nuevo grupo
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-amber-100 bg-[#fef9ee] px-5 py-4">
          <h2 className="font-black text-[#3b1406]">Grupos registrados</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{grados.length} grupos</span>
        </div>
        {grados.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">Aún no hay grupos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-amber-900">
                <tr>
                  <th className="px-5 py-3">Grupo</th>
                  <th className="px-5 py-3">Director de grupo</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {grados.map(grado => (
                  <tr key={grado.id} className="hover:bg-amber-50/60">
                    <td className="px-5 py-4 font-black text-[#3b1406]">{grado.nombre}</td>
                    <td className="px-5 py-4 text-gray-700">{grado.director_grupo}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(grado)} className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50" title="Editar grupo" aria-label={`Editar ${grado.nombre}`}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(grado)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50" title="Eliminar grupo" aria-label={`Eliminar ${grado.nombre}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
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
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-amber-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#3b1406]">{isEditing ? 'Editar grupo' : 'Crear grupo'}</h2>
                <p className="mt-1 text-sm text-gray-500">Ingresa el nombre y el director responsable.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Cerrar formulario" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <label className="block text-sm font-bold text-[#3b1406]">
              Nombre del grupo
              <input autoFocus required maxLength={50} value={formData.nombre} onChange={event => setFormData({ ...formData, nombre: event.target.value })} placeholder="Ej. 7-A" className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
            </label>
            <label className="block text-sm font-bold text-[#3b1406]">
              Director de grupo
              <input required maxLength={150} value={formData.director_grupo} onChange={event => setFormData({ ...formData, director_grupo: event.target.value })} placeholder="Nombre del docente" className="mt-1 w-full rounded-xl border border-amber-300 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-orange-400" />
            </label>
            <div className="flex justify-end gap-3 border-t border-amber-100 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button type="submit" disabled={isSaving} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60">
                {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear grupo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
