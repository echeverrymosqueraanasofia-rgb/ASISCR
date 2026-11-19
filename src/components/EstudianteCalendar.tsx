import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock, XCircle, Info, X, Shield } from 'lucide-react';
import { Estudiante, Asistencia, Materia } from '../types';

interface EstudianteCalendarProps {
  estudiante: Estudiante;
  asistencias: Asistencia[];
  materias: Materia[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const EstudianteCalendar: React.FC<EstudianteCalendarProps> = ({
  estudiante,
  asistencias,
  materias,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDayRecord, setSelectedDayRecord] = useState<{ dayNum: number; records: Asistencia[] } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Build grid days for school week (Lunes - Viernes) in selected month
  const getSchoolDaysInMonth = () => {
    const days = [];
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const monthStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

        const dayLogs = asistencias.filter(a => a.fecha === dateKey);

        days.push({
          dayNum: day,
          dateKey,
          dayOfWeek,
          logs: dayLogs
        });
      }
    }
    return days;
  };

  const schoolDays = getSchoolDaysInMonth();

  // Statistics calculation for RF15
  const totalLogsInMonth = asistencias.filter(a => {
    const monthStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    return a.fecha.startsWith(`${currentYear}-${monthStr}`);
  });

  const countPresente = totalLogsInMonth.filter(a => a.estado === 'Presente').length;
  const countTarde = totalLogsInMonth.filter(a => a.estado === 'Tarde').length;
  const countAusente = totalLogsInMonth.filter(a => a.estado === 'Ausente').length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#faf5e8] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b-2 border-[#fde68a]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ea580c] text-white rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
            <Shield className="w-3 h-3" />
            <span>EXPEDIENTE ACADÉMICO CRISTO REY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#3b1406] tracking-tight uppercase">
            {estudiante.nombre}
          </h1>
          <p className="text-xs font-bold text-[#78350f] mt-1">
            Grado: <span className="font-extrabold text-[#3b1406]">{estudiante.grado}</span> | Documento: <span className="font-mono text-[#3b1406]">{estudiante.documento}</span>
          </p>
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-3 bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl px-4 py-2 shadow-2xs self-start md:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-[#fef3c7] text-[#3b1406] transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-black text-base text-[#3b1406] min-w-[100px] text-center uppercase">
            {MONTH_NAMES[currentMonth].substring(0, 3)} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-[#fef3c7] text-[#3b1406] transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-4 text-center shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#047857] font-black mb-1 uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Asistencias</span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-[#3b1406]">
            {countPresente}
          </span>
        </div>

        <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-4 text-center shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#b45309] font-black mb-1 uppercase">
            <Clock className="w-4 h-4" />
            <span>Tardanzas</span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-[#3b1406]">
            {countTarde}
          </span>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-800 font-black mb-1 uppercase">
            <XCircle className="w-4 h-4 text-rose-700" />
            <span>Inasistencias</span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-rose-900">
            {countAusente}
          </span>
        </div>
      </div>

      {/* Calendar Table Container */}
      <div className="bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl overflow-hidden shadow-xs">
        
        {/* Table Day Headers */}
        <div className="grid grid-cols-5 bg-[#fef3c7] border-b-2 border-[#fde68a] text-center py-3 text-xs font-black uppercase tracking-wider text-[#3b1406]">
          <div>Lunes</div>
          <div>Martes</div>
          <div>Miércoles</div>
          <div>Jueves</div>
          <div>Viernes</div>
        </div>

        {/* Calendar Day Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-5 gap-2 sm:gap-4 min-h-[360px] bg-[#faf5e8]/50">
          {schoolDays.map(({ dayNum, dateKey, dayOfWeek, logs }) => {
            const hasAusente = logs.some(l => l.estado === 'Ausente');
            const hasTarde = logs.some(l => l.estado === 'Tarde');
            const hasPresente = logs.some(l => l.estado === 'Presente');

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDayRecord({ dayNum, records: logs })}
                className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  hasAusente
                    ? 'bg-rose-100/80 border-rose-400 hover:border-rose-500 shadow-2xs'
                    : hasTarde
                    ? 'bg-[#fef3c7] border-[#f59e0b] hover:border-[#ea580c]'
                    : hasPresente
                    ? 'bg-emerald-50 border-[#047857]/40 hover:border-[#047857]'
                    : 'bg-white border-[#fde68a] hover:border-[#ea580c]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm sm:text-base font-black font-mono ${
                    hasAusente ? 'text-rose-900' : 'text-[#3b1406]'
                  }`}>
                    {dayNum}
                  </span>

                  {/* Status Indicator Icon */}
                  {hasAusente && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" title="Inasistencia registrada" />
                  )}
                  {hasTarde && !hasAusente && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Llegada tarde" />
                  )}
                  {hasPresente && !hasAusente && !hasTarde && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" title="Asistencia normal" />
                  )}
                </div>

                {/* Badge */}
                <div className="mt-1">
                  {hasAusente ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider">
                      Falto
                    </span>
                  ) : hasTarde ? (
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#d97706] text-white text-[10px] font-bold">
                      Tarde
                    </span>
                  ) : hasPresente ? (
                    <span className="inline-block text-[10px] font-bold text-[#047857]">
                      ✓ Asistió
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#78350f]/60 font-medium">Sin registro</span>
                  )}
                </div>

                {/* Additional subject preview if available */}
                {logs.length > 0 && (
                  <div className="text-[9px] text-[#78350f] truncate pt-1 border-t border-[#fde68a]">
                    {materias.find(m => m.id === logs[0].materia_id)?.nombre || 'Matemáticas'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Detailed Day View Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3b1406]/60 backdrop-blur-xs">
          <div className="bg-[#fffbeb] rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-[#ca8a04] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#fde68a] mb-4">
              <div>
                <span className="text-xs text-[#ea580c] uppercase font-black tracking-wider">
                  Detalle de Jornada
                </span>
                <h3 className="text-xl font-black text-[#3b1406] mt-0.5">
                  {selectedDayRecord.dayNum} de {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="p-1.5 rounded-xl text-[#78350f] hover:text-[#3b1406] hover:bg-[#fef3c7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDayRecord.records.length === 0 ? (
              <p className="text-sm text-[#78350f] py-4 text-center font-medium">
                No hay registros de asistencia en esta fecha.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedDayRecord.records.map((rec) => {
                  const materia = materias.find(m => m.id === rec.materia_id);
                  return (
                    <div
                      key={rec.id}
                      className={`p-3.5 rounded-xl border-2 ${
                        rec.estado === 'Ausente'
                          ? 'bg-rose-50 border-rose-300'
                          : rec.estado === 'Tarde'
                          ? 'bg-[#fef3c7] border-[#f59e0b]'
                          : 'bg-emerald-50 border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-[#3b1406]">
                          {materia?.nombre || 'Matemáticas'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          rec.estado === 'Ausente'
                            ? 'bg-rose-700 text-white'
                            : rec.estado === 'Tarde'
                            ? 'bg-[#d97706] text-white'
                            : 'bg-[#047857] text-white'
                        }`}>
                          {rec.estado === 'Ausente' ? 'Falto (Ausente)' : rec.estado}
                        </span>
                      </div>
                      <p className="text-xs text-[#78350f]">
                        Registrado por: <span className="font-bold">{rec.registrado_por}</span>
                      </p>
                      {rec.observaciones && (
                        <p className="text-xs text-rose-900 italic mt-1 bg-white/90 p-2 rounded-lg border border-rose-200 font-medium">
                          Nota: {rec.observaciones}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-[#fde68a] text-right">
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer uppercase"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

