import React, { useState } from 'react';
import { Flame, Database, ShieldCheck, RefreshCw, CheckCircle2, Layers } from 'lucide-react';

export const FirebaseBackendInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'rules' | 'realtime'>('schema');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
              VERSIÓN 2 DEL DOCUMENTO DE REQUERIMIENTOS
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Backend NoSQL Firebase Firestore & Auth
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-2">
          Esta versión implementa almacenamiento NoSQL en tiempo real en la nube con sincronización instantánea entre el portal del docente y la consulta de estudiantes y padres de familia.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-2">
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Colecciones Firestore</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Reglas de Seguridad (firestore.rules)</span>
        </button>

        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'realtime'
              ? 'bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Estado de Sincronización</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        {activeTab === 'schema' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
              Estructura de Colecciones NoSQL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                <span className="font-mono font-bold text-sm text-amber-900 block mb-1">
                  collections/usuarios
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Documentos de perfil docente, directivo, estudiante y padre de familia.
                </p>
                <code className="text-[11px] block bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 font-mono">
                  &#123; id, nombre, tipo, documento, contrasenaHash &#125;
                </code>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                <span className="font-mono font-bold text-sm text-amber-900 block mb-1">
                  collections/asistencias
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Registro diario indexado por fecha, grado y estudiante_id.
                </p>
                <code className="text-[11px] block bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 font-mono">
                  &#123; estudiante_id, materia_id, fecha: "YYYY-MM-DD", estado: "Presente|Tarde|Ausente", registrado_por &#125;
                </code>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                <span className="font-mono font-bold text-sm text-amber-900 block mb-1">
                  collections/grados
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Grupos académicos (ej: 11-A, 10-A) y directores asignados.
                </p>
                <code className="text-[11px] block bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 font-mono">
                  &#123; id, nombre, director_grupo &#125;
                </code>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                <span className="font-mono font-bold text-sm text-amber-900 block mb-1">
                  collections/estudiantes
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Matrícula de alumnos vinculada a sus acudientes.
                </p>
                <code className="text-[11px] block bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 font-mono">
                  &#123; id, nombre, grado, documento, id_padre &#125;
                </code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
              Reglas de Seguridad Firestore (firestore.rules)
            </h3>
            <div className="bg-slate-900 text-amber-300 p-4 sm:p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regla RNF01 / RN01: Solo docentes autenticados pueden registrar asistencia
    match /asistencias/{asistenciaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'docente' || request.auth.token.role == 'directivo');
    }

    // Regla RNF06: Los estudiantes y padres solo ven sus propios datos
    match /estudiantes/{estudianteId} {
      allow read: if request.auth != null && 
        (request.auth.uid == estudianteId || request.auth.token.id_padre == request.auth.uid);
    }
  }
}`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
              Sincronización en Tiempo Real Activa
            </h3>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block text-sm">Estado de conexión: Conectado</span>
                <p className="mt-0.5 text-emerald-700">
                  Las modificaciones guardadas en la pantalla "Toma de Asistencia" se reflejan instantáneamente en el Expediente Académico del Estudiante sin necesidad de recargar la página (RNF05).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
