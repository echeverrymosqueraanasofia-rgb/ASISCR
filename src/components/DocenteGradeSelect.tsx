import React, { useState } from 'react';
import { BookOpen, ChevronRight, Shield, Bell } from 'lucide-react';
import { Usuario, Grado, Materia } from '../types';

interface DocenteGradeSelectProps {
  user: Usuario;
  grados: Grado[];
  materias: Materia[];
  onContinue: (gradoId: string, materiaId: string) => void;
}

export const DocenteGradeSelect: React.FC<DocenteGradeSelectProps> = ({
  user,
  grados,
  materias,
  onContinue,
}) => {
  const [selectedGrado, setSelectedGrado] = useState(grados[0]?.id || 'gr_11a');
  const [selectedMateria, setSelectedMateria] = useState(materias[0]?.id || 'mat_mat_11a');

  // Filter materias for selected grado
  const filteredMaterias = materias.filter(m => m.grado_id === selectedGrado);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrado && selectedMateria) {
      onContinue(selectedGrado, selectedMateria);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] flex flex-col justify-between items-center py-8 px-4">
      
      {/* Container matching Screenshot 2 */}
      <div className="w-full max-w-lg bg-[#fffbeb] rounded-2xl p-6 sm:p-8 shadow-sm border-2 border-[#fde68a] my-auto text-center">
        
        {/* Top Active Role Bar from Screenshot 2 */}
        <div className="mb-6 p-3 bg-[#fef3c7] border border-[#fde68a] rounded-xl flex items-center justify-between text-xs font-bold text-[#3b1406]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
            Rol Activo:
          </span>
          <div className="flex gap-1">
            <span className="px-2.5 py-1 bg-[#5c1d06] text-white rounded-lg">Docente</span>
            <span className="px-2.5 py-1 bg-white/80 text-[#78350f] rounded-lg">Secretaría</span>
            <span className="px-2.5 py-1 bg-white/80 text-[#78350f] rounded-lg">Celador</span>
          </div>
        </div>

        {/* Header Greeting */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ea580c] text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
            <Bell className="w-3 h-3" />
            <span>CENTRO DE CONTROL ASISCR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3b1406] mt-1">
            Profesor(a) {user.nombre}
          </h2>
          <p className="text-xs font-medium text-[#78350f] mt-0.5">
            Institución Educativa Cristo Rey • Dosquebradas
          </p>
        </div>

        {/* Main Section Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#3b1406] tracking-tight mb-6 uppercase">
          Selección de Grado y Asignatura
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* Dropdown Grado */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1.5">
              Grado / Grupo
            </label>
            <select
              value={selectedGrado}
              onChange={(e) => {
                setSelectedGrado(e.target.value);
                const firstMat = materias.find(m => m.grado_id === e.target.value);
                if (firstMat) setSelectedMateria(firstMat.id);
              }}
              className="w-full px-4 py-3 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c] transition-all cursor-pointer shadow-2xs"
            >
              {grados.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} (Director: {g.director_grupo})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Materia */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1.5">
              Asignatura / Materia
            </label>
            <select
              value={selectedMateria}
              onChange={(e) => setSelectedMateria(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#f59e0b]/40 rounded-xl text-sm font-bold text-[#3b1406] focus:outline-none focus:ring-2 focus:ring-[#ea580c] transition-all cursor-pointer shadow-2xs"
            >
              {(filteredMaterias.length > 0 ? filteredMaterias : materias).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Continuar Button matching Screenshot 2 CTA style */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
          >
            <span>Ir a Toma de Asistencia</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        {/* Motivational Quote Box */}
        <div className="mt-8 bg-[#fef3c7] border border-[#fde68a] rounded-xl p-4 text-center relative overflow-hidden">
          <BookOpen className="w-6 h-6 text-[#b45309] mx-auto mb-1.5 opacity-80" />
          <p className="text-xs font-bold italic text-[#3b1406] leading-relaxed">
            "Formando en Valores e Integridad • 73 Años Educando a Dosquebradas"
          </p>
        </div>

      </div>

    </div>
  );
};

