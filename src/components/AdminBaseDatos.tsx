import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Flame, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Server, 
  ShieldCheck, 
  Layers, 
  HardDrive,
  FileCode,
  FileJson,
  Check, 
  X, 
  Play,
  Copy
} from 'lucide-react';
import { API_BASE_URL, storageService } from '../services/storageService';

import { EngineMode } from '../types';

interface AdminBaseDatosProps {
  onDataChanged: () => void;
  engineMode?: EngineMode;
  onSelectEngine?: (mode: EngineMode) => void;
}

export const AdminBaseDatos: React.FC<AdminBaseDatosProps> = ({ 
  onDataChanged,
  engineMode = 'firebase',
  onSelectEngine,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [selectedCollection, setSelectedCollection] = useState<string>('usuarios');
  const [rawPreview, setRawPreview] = useState<any[]>([]);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const overview = await storageService.getDatabaseOverviewAsync();
      setStatus(overview.status);
      setCounts(overview.counts);
      updatePreview(selectedCollection);
    } catch (e: any) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = async (col: string) => {
    setSelectedCollection(col);
    try {
      if (col === 'usuarios') setRawPreview(await storageService.getUsuariosAsync());
      else if (col === 'grados') setRawPreview(await storageService.getGradosAsync());
      else if (col === 'materias') setRawPreview(await storageService.getMateriasAsync());
      else if (col === 'estudiantes') setRawPreview(await storageService.getEstudiantesAsync());
      else if (col === 'asistencias') setRawPreview(await storageService.getAsistenciasAsync());
      else if (col === 'horarios') setRawPreview(await storageService.getHorariosAsync());
      else if (col === 'avisos') setRawPreview(await storageService.getAvisosAsync());
    } catch {
      // fallback
      if (col === 'usuarios') setRawPreview(storageService.getUsuarios());
      else if (col === 'grados') setRawPreview(storageService.getGrados());
      else if (col === 'materias') setRawPreview(storageService.getMaterias());
      else if (col === 'estudiantes') setRawPreview(storageService.getEstudiantes());
      else if (col === 'asistencias') setRawPreview(storageService.getAsistencias());
      else if (col === 'horarios') setRawPreview(storageService.getHorarios());
      else if (col === 'avisos') setRawPreview(storageService.getAvisos());
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  // Export full JSON
  const handleExportJson = async () => {
    setLoading(true);
    try {
      const fullData = await storageService.exportDatabaseAsync();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(fullData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `asiscr_backup_completo_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification('Copia de seguridad JSON descargada exitosamente.');
    } catch (e: any) {
      showNotification('Error al exportar base de datos: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Import full JSON
  const handleImportJson = async () => {
    if (!importJsonText.trim()) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await storageService.importDatabaseAsync(parsed);
      if (res.success) {
        showNotification(res.message);
        setIsImportModalOpen(false);
        setImportJsonText('');
        await loadOverview();
        onDataChanged();
      } else {
        showNotification(res.message, 'error');
      }
    } catch (e: any) {
      showNotification('El archivo o texto ingresado no es un JSON válido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Seed demo data (sin window.confirm para compatibilidad en iframe)
  const handleSeedData = async () => {
    setLoading(true);
    try {
      const res = await storageService.seedDemoDataAsync();
      if (res.success) {
        showNotification(res.message);
      } else {
        showNotification(res.message, 'error');
      }
      await loadOverview();
      onDataChanged();
    } catch (e: any) {
      showNotification('Error al sembrar datos: ' + (e?.message || e), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live write and read test
  const handleValidateEngine = async () => {
    setLoading(true);
    try {
      const res = await storageService.validateWriteAndReadAsync();
      showNotification(res.message, res.success ? 'success' : 'error');
    } catch (e: any) {
      showNotification('Error en prueba de validación: ' + (e?.message || e), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Notification */}
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
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#d97706] text-white flex items-center gap-1.5 shadow-xs">
              <Database className="w-3.5 h-3.5" />
              Consola DBA • Firestore & Cloud
            </span>
            <span className="text-xs text-amber-900/60 font-semibold">
              Proyecto: asiscr (Cloud Firestore)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3b1406] tracking-tight">
            Administración de Base de Datos
          </h1>
          <p className="text-xs sm:text-sm text-[#78350f] mt-1">
            Control de réplicas en la nube, respaldo íntegro en JSON, restauración de colecciones y diagnóstico de latencia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Descargar copia de seguridad en JSON"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Backup JSON</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Subir o pegar archivo de respaldo"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar / Importar</span>
          </button>

          <button
            onClick={loadOverview}
            disabled={loading}
            className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#3b1406] transition-colors cursor-pointer"
            title="Refrescar estado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Engine Switcher & Health Banner */}
      <div className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#ea580c] block mb-0.5">
              CONMUTADOR DE MOTOR DE BASE DE DATOS
            </span>
            <h3 className="text-base font-black text-[#3b1406]">
              ¿Dónde deseas guardar y consultar los datos en este momento?
            </h3>
            <p className="text-xs text-[#78350f]">
              Alterna en tiempo real entre la nube de Google Firestore y tu servidor MySQL local (PHP).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSelectEngine) onSelectEngine('firebase');
                storageService.setEngineMode('firebase');
                setTimeout(() => loadOverview(), 100);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'firebase'
                  ? 'bg-[#ea580c] text-white shadow-md ring-2 ring-[#ea580c]/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-[#3b1406] border border-amber-300'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Nube: Firebase Firestore</span>
            </button>

            <button
              onClick={() => {
                if (onSelectEngine) onSelectEngine('php');
                storageService.setEngineMode('php');
                setTimeout(() => loadOverview(), 100);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'php'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-[#3b1406] border border-amber-300'
              }`}
            >
              <Database className="w-4 h-4 text-blue-300" />
              <span>Local: PHP / MySQL (Apache)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="text-xs">
              <span className="font-bold text-[#3b1406] block">
                Motor Activo: {engineMode === 'firebase' ? 'Google Cloud Firestore (Nube)' : 'PHP Backend MySQL (Local)'}
              </span>
              <span className="text-gray-500 font-mono text-[11px]">
                {engineMode === 'firebase' 
                  ? 'Proyecto ID: asiscr • Base: (default)' 
                  : `URL API: ${API_BASE_URL} • BD: asiscr`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Esquema de tablas y colecciones 100% sincronizado</span>
          </div>
        </div>

        {/* Warning if PHP mode selected on HTTPS (Cloud / Vercel / Netlify) */}
        {engineMode === 'php' && typeof window !== 'undefined' && window.location.protocol === 'https:' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-amber-900 mb-1">
                Aviso de Conectividad: Navegador en HTTPS vs Backend Local HTTP
              </strong>
              <p className="leading-relaxed text-amber-900/90">
                Por políticas de seguridad de todos los navegadores modernos (<em>Mixed Content Policy</em>), una página cargada bajo HTTPS (en la nube, Vercel o Netlify) <strong>no puede comunicarse directamente con un servidor no seguro</strong> (<code>{API_BASE_URL}</code>).
              </p>
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold text-amber-950">Opciones:</span>
                <button
                  onClick={() => {
                    if (onSelectEngine) onSelectEngine('firebase');
                    storageService.setEngineMode('firebase');
                    setTimeout(() => loadOverview(), 100);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Activar Modo Firebase (Guardar en la nube)</span>
                </button>
                <span className="text-[11px] text-amber-800">
                  O abre la app directamente en tu equipo en <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">http://localhost:3000</code>.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card: Seed / Emergency Reset */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-amber-800/70 font-bold block">
            Mantenimiento Institucional
          </span>
          <strong className="text-sm font-black text-[#3b1406] block">
            Sembrar Datos Demo Cristo Rey
          </strong>
          <span className="text-[10px] text-gray-500">
            Reinicializa usuarios, grados, materias, horarios y avisos iniciales
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleValidateEngine}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Realiza una prueba real de lectura y escritura"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Validar {engineMode === 'firebase' ? 'Firestore' : 'MySQL PHP'}</span>
          </button>

          <button
            onClick={handleSeedData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sembrar Datos Iniciales</span>
          </button>
        </div>
      </div>

      {/* Firestore Rules Helper Banner */}
      {engineMode === 'firebase' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">
                  Reglas de Seguridad Firestore
                </span>
                <span className="text-xs font-bold text-amber-900">
                  Importante para evitar que la BD quede vacía
                </span>
              </div>
              <p className="text-xs text-[#78350f] leading-relaxed">
                Tus reglas en la consola de Firebase deben incluir las <strong>7 colecciones</strong>: <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">usuarios</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">grados</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">estudiantes</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">materias</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">asistencias</code>, <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">horarios</code> y <code className="bg-amber-200/60 px-1 py-0.5 rounded text-[11px]">avisos</code>.
              </p>
            </div>
            <button
              onClick={() => {
                const completeRules = `rules_version = '2';\\nservice cloud.firestore {\\n  match /databases/{database}/documents {\\n    match /usuarios/{document} { allow read, write: if true; }\\n    match /grados/{document} { allow read, write: if true; }\\n    match /estudiantes/{document} { allow read, write: if true; }\\n    match /materias/{document} { allow read, write: if true; }\\n    match /asistencias/{document} { allow read, write: if true; }\\n    match /horarios/{document} { allow read, write: if true; }\\n    match /avisos/{document} { allow read, write: if true; }\\n  }\\n}`;
                navigator.clipboard.writeText(completeRules.replace(/\\\\n/g, '\\n'));
                showNotification('Reglas completas de Firebase copiadas al portapapeles. Pégalas en Firebase Console > Reglas');
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-[#ea580c] border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              title="Copiar las reglas oficiales completas"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Reglas Completas (7 Colecciones)</span>
            </button>
          </div>
        </div>
      )}

      {/* Collection Counters Grid */}
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#3b1406] mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#ea580c]" />
          Colecciones de la Base de Datos (Conteos en Vivo)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'usuarios', label: 'Usuarios', count: counts.usuarios ?? 0 },
            { id: 'grados', label: 'Grados', count: counts.grados ?? 0 },
            { id: 'materias', label: 'Materias', count: counts.materias ?? 0 },
            { id: 'estudiantes', label: 'Estudiantes', count: counts.estudiantes ?? 0 },
            { id: 'asistencias', label: 'Asistencias', count: counts.asistencias ?? 0 },
            { id: 'horarios', label: 'Horarios', count: counts.horarios ?? 0 },
            { id: 'avisos', label: 'Avisos', count: counts.avisos ?? 0 },
          ].map(col => (
            <button
              key={col.id}
              onClick={() => updatePreview(col.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedCollection === col.id
                  ? 'bg-[#3b1406] text-amber-300 border-[#ca8a04] shadow-md ring-2 ring-[#ea580c]'
                  : 'bg-white hover:bg-amber-50 text-[#3b1406] border-amber-200'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {col.label}
              </div>
              <div className="text-xl font-black mt-1">
                {col.count}
              </div>
              <div className="text-[10px] opacity-70 mt-0.5">
                docs registrados
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Collection Inspector */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#faf3e0] py-3 px-5 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#ea580c]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#3b1406]">
              Visor de Documentos: Colección "{selectedCollection}" ({rawPreview.length} registros)
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
            Formato JSON estructurado
          </span>
        </div>

        <div className="p-4 bg-gray-900 text-amber-300 font-mono text-xs max-h-96 overflow-y-auto rounded-b-2xl">
          <pre>{JSON.stringify(rawPreview, null, 2)}</pre>
        </div>
      </div>

      {/* Import / Restore Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h3 className="text-base font-black text-[#3b1406] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#ea580c]" />
                Restaurar Base de Datos desde Respaldo JSON
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Puedes cargar un archivo <code>.json</code> descargado previamente o pegar el contenido JSON directamente para restaurar todas las colecciones.
            </p>

            <div className="mb-3">
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                Seleccionar archivo JSON local:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3b1406] file:text-amber-300 hover:file:bg-[#270c04] cursor-pointer"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#3b1406] mb-1">
                O pegar contenido JSON directamente:
              </label>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{ "usuarios": [...], "asistencias": [...] }'
                className="w-full px-3 py-2 border border-amber-300 rounded-xl font-mono text-xs text-[#3b1406] focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJson}
                disabled={loading || !importJsonText.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Restaurar Datos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
