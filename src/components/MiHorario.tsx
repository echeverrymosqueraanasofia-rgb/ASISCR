import React from 'react';
import { CalendarDays, Clock, User, School, BookOpen } from 'lucide-react';
import { HorarioClase, Usuario, DiaSemana } from '../types';

interface MiHorarioProps {
  currentUser: Usuario;
  horarios: HorarioClase[];
}

const DIAS_SEMANA: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const MiHorario: React.FC<MiHorarioProps> = ({ currentUser, horarios }) => {
  // If user has an assigned grade (e.g. 11-A), filter for it
  const userGrado = currentUser.grado || '11-A';
  const relevantHorarios = horarios.filter(h => {
    if (currentUser.tipo === 'docente') {
      return h.docente_nombre.toLowerCase().includes(currentUser.nombre.toLowerCase()) || h.grado_nombre === userGrado;
    }
    return h.grado_nombre === userGrado;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ea580c] text-white flex items-center gap-1.5 shadow-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              Horario Semanal
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Grado {userGrado}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Mi Horario de Clases
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Cronograma semanal de asignaturas, horas de clase y salones asignados para {currentUser.nombre}.
          </p>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DIAS_SEMANA.map(dia => {
          const diaClasses = relevantHorarios.filter(h => h.dia === dia)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

          return (
            <div key={dia} className="bg-white rounded-2xl border border-amber-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="bg-[#faf3e0] py-2.5 px-3 border-b border-amber-200 text-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#3b1406]">
                  {dia}
                </h3>
              </div>

              <div className="p-3 flex-1 space-y-2.5 min-h-[200px] bg-amber-50/20">
                {diaClasses.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 text-gray-400 text-xs italic">
                    Sin clases
                  </div>
                ) : (
                  diaClasses.map(h => (
                    <div 
                      key={h.id}
                      className="bg-white rounded-xl border border-amber-200 p-3 shadow-xs hover:border-[#ea580c] transition-all"
                    >
                      <div className="text-[11px] font-mono text-[#ea580c] font-black mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {h.hora_inicio} - {h.hora_fin}
                      </div>

                      <h4 className="text-xs font-black text-[#3b1406] line-clamp-1">
                        {h.materia_nombre}
                      </h4>

                      <div className="mt-2 pt-2 border-t border-amber-100 flex flex-col gap-1 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
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
    </div>
  );
};
