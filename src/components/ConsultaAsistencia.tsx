import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  BookOpen, 
  GraduationCap,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { 
  Asistencia, 
  Estudiante, 
  Grado, 
  Materia, 
  AttendanceStatus 
} from '../types';

interface ConsultaAsistenciaProps {
  asistencias: Asistencia[];
  estudiantes: Estudiante[];
  grados: Grado[];
  materias: Materia[];
}

export const ConsultaAsistencia: React.FC<ConsultaAsistenciaProps> = ({
  asistencias,
  estudiantes,
  grados,
  materias,
}) => {
  // Filter States
  const [selectedGrado, setSelectedGrado] = useState<string>('todos');
  const [selectedMateria, setSelectedMateria] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Map students and subjects for fast lookups
  const studentsMap = useMemo(() => {
    const map = new Map<string, Estudiante>();
    estudiantes.forEach(e => map.set(e.id, e));
    return map;
  }, [estudiantes]);

  const materiasMap = useMemo(() => {
    const map = new Map<string, Materia>();
    materias.forEach(m => map.set(m.id, m));
    return map;
  }, [materias]);

  // Filtered dataset
  const filteredAsistencias = useMemo(() => {
    return asistencias.filter(a => {
      const student = studentsMap.get(a.estudiante_id);
      const materia = materiasMap.get(a.materia_id);

      // Filter by Grado
      if (selectedGrado !== 'todos') {
        const studentGrado = student?.grado;
        if (studentGrado !== selectedGrado) return false;
      }

      // Filter by Materia
      if (selectedMateria !== 'todas') {
        if (a.materia_id !== selectedMateria) return false;
      }

      // Filter by Status
      if (selectedStatus !== 'todos') {
        if (a.estado !== selectedStatus) return false;
      }

      // Filter by Date Range
      if (startDate && a.fecha < startDate) return false;
      if (endDate && a.fecha > endDate) return false;

      // Filter by Search term (student name or document)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const studentName = student?.nombre.toLowerCase() || '';
        const studentDoc = student?.documento.toLowerCase() || '';
        const obs = (a.observaciones || '').toLowerCase();
        if (!studentName.includes(term) && !studentDoc.includes(term) && !obs.includes(term)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [asistencias, studentsMap, materiasMap, selectedGrado, selectedMateria, selectedStatus, startDate, endDate, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredAsistencias.length;
    if (total === 0) return { total: 0, presentes: 0, tardes: 0, ausentes: 0, porcentaje: 0 };

    const presentes = filteredAsistencias.filter(a => a.estado === 'Presente').length;
    const tardes = filteredAsistencias.filter(a => a.estado === 'Tarde').length;
    const ausentes = filteredAsistencias.filter(a => a.estado === 'Ausente').length;
    const porcentaje = Math.round(((presentes + (tardes * 0.7)) / total) * 100);

    return { total, presentes, tardes, ausentes, porcentaje };
  }, [filteredAsistencias]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Estudiante', 'Documento', 'Grado', 'Materia', 'Estado', 'Registrado Por', 'Observaciones'];
    const rows = filteredAsistencias.map(a => {
      const student = studentsMap.get(a.estudiante_id);
      const materia = materiasMap.get(a.materia_id);
      return [
        a.fecha,
        `"${student?.nombre || 'Desconocido'}"`,
        `"${student?.documento || ''}"`,
        `"${student?.grado || ''}"`,
        `"${materia?.nombre || a.materia_id}"`,
        `"${a.estado}"`,
        `"${a.registrado_por || ''}"`,
        `"${(a.observaciones || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_asistencia_asiscr_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearFilters = () => {
    setSelectedGrado('todos');
    setSelectedMateria('todas');
    setSelectedStatus('todos');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ea580c] text-white flex items-center gap-1.5 shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Módulo de Auditoría y Reportes
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Institución Educativa Cristo Rey
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Consulta de Asistencia y Reportes
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Filtra por salón, asignatura, rango de fechas y estudiante con cálculo de métricas y descarga de reportes oficiales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Descargar archivo Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#3b1406] hover:bg-[#230b04] text-amber-300 font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Imprimir reporte oficial"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-amber-950">Total Registros</span>
            <Users className="w-4 h-4 text-[#ea580c]" />
          </div>
          <p className="text-2xl font-black text-[#3b1406]">{stats.total}</p>
          <span className="text-[11px] text-amber-800/70 font-medium">Llamados a lista</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-amber-950">% Asistencia</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.porcentaje}%</p>
          <span className="text-[11px] text-emerald-800/70 font-medium">Promedio ponderado</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-emerald-900">Presentes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">{stats.presentes}</p>
          <span className="text-[11px] text-emerald-700/80 font-medium">Asistencia completa</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-amber-900">Llegadas Tarde</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800">{stats.tardes}</p>
          <span className="text-[11px] text-amber-700/80 font-medium">Con retardo</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-rose-900">Inasistencias</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-800">{stats.ausentes}</p>
          <span className="text-[11px] text-rose-700/80 font-medium">Faltas acumuladas</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#fef9ee] p-5 rounded-2xl border border-amber-200/80 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Grado */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Grado / Salón
            </label>
            <select
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            >
              <option value="todos">Todos los Grados</option>
              {grados.map(g => (
                <option key={g.id} value={g.nombre}>{g.nombre} (Dir: {g.director_grupo})</option>
              ))}
            </select>
          </div>

          {/* Materia */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Asignatura
            </label>
            <select
              value={selectedMateria}
              onChange={(e) => setSelectedMateria(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            >
              <option value="todas">Todas las Materias</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Estado de Asistencia
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Presente">✅ Presente</option>
              <option value="Tarde">⏰ Tarde (Llegada Tardía)</option>
              <option value="Ausente">❌ Ausente (Inasistencia)</option>
            </select>
          </div>

          {/* Buscador Estudiante */}
          <div>
            <label className="block text-xs font-bold text-[#3b1406] mb-1">
              Buscar Estudiante / Cédula
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-amber-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o documento..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-amber-300 text-xs text-[#3b1406] placeholder-amber-800/40 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Date Range & Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#3b1406] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#ea580c]" />
              Rango de Fechas:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            />
            <span className="text-xs text-gray-500 font-bold">hasta</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#78350f] hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Filtros</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3b1406]">
            <thead className="bg-[#faf3e0] text-[#78350f] uppercase tracking-wider font-black text-[11px] border-b border-amber-200">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Grado</th>
                <th className="py-3.5 px-4">Materia</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Registrado Por</th>
                <th className="py-3.5 px-4">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredAsistencias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-amber-800/60 font-medium">
                    No se encontraron registros de asistencia que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAsistencias.map(a => {
                  const student = studentsMap.get(a.estudiante_id);
                  const materia = materiasMap.get(a.materia_id);

                  return (
                    <tr key={a.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-gray-700">
                        {a.fecha}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#3b1406]">
                          {student?.nombre || `Estudiante #${a.estudiante_id}`}
                        </div>
                        {student?.documento && (
                          <div className="text-[11px] font-mono text-gray-500">
                            Doc: {student.documento}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#ea580c]">
                        {student?.grado || '11-A'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {materia?.nombre || a.materia_id}
                      </td>

                      <td className="py-3.5 px-4">
                        {a.estado === 'Presente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Presente
                          </span>
                        )}
                        {a.estado === 'Tarde' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Tarde
                          </span>
                        )}
                        {a.estado === 'Ausente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Ausente
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-gray-600">
                        {a.registrado_por || 'Docente'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs truncate italic">
                        {a.observaciones || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
