// src/pages/EvaluacionesInteligentes/Asignaciones/VerRespuestasAdmin.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, User, Calendar,
  CheckCircle2, Clock, BarChart3, ChevronDown, ChevronUp,
  FileText, ExternalLink, Ban, XCircle, Shield,
} from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import { auditorIQApi } from '@/api/endpoints/auditor-iq.api';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionDetail } from '@/types/asignacion-iq.types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const getFileUrl = (url: string) =>
  url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : '#';

const getColorCalificacion = (cal: string | null | undefined) => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'bg-green-100 text-green-800 border-green-300';
    case 'CUMPLE_PARCIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'NO_CUMPLE':      return 'bg-red-100 text-red-800 border-red-300';
    default:               return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const getLabelCalificacion = (cal: string | null | undefined) => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'Sí Cumple';
    case 'CUMPLE_PARCIAL': return 'Cumple Parcial';
    case 'NO_CUMPLE':      return 'No Cumple';
    default:               return 'Sin calificar';
  }
};

export const VerRespuestasAdmin = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [asignacion,  setAsignacion]  = useState<AsignacionEvaluacionDetail | null>(null);
  const [respuestas,  setRespuestas]  = useState<any[]>([]);
  const [expandidas,  setExpandidas]  = useState<Set<number>>(new Set());

  useEffect(() => {
    if (asignacionId) cargarDatos();
  }, [asignacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asignacionData, respuestasData] = await Promise.all([
        asignacionIQApi.obtener(Number(asignacionId)),
        auditorIQApi.respuestasAsignacion(Number(asignacionId))
          .then(d => Array.isArray(d) ? d : d?.results || []),
      ]);
      setAsignacion(asignacionData);
      setRespuestas(respuestasData);
    } catch (error) {
      toast.error('Error al cargar las respuestas');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (id: number) => {
    setExpandidas(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const formatFecha = (f: string | null | undefined) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // Stats
  const totalCalificadas  = respuestas.filter(r => r.calificacion_auditor || r.respuesta === 'NO_APLICA').length;
  const progresoRevision  = respuestas.length > 0 ? (totalCalificadas / respuestas.length) * 100 : 0;
  const progresoCumplimiento = asignacion
    ? (Number(asignacion.porcentaje_completado) || 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!asignacion) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No se encontró la asignación</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {asignacion.evaluacion_detail.nombre}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Respuestas de {asignacion.usuario_detail.nombre}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
          asignacion.estado === 'revisada' || asignacion.estado === 'aprobada'
            ? 'bg-green-100 text-green-700 border-green-200'
            : asignacion.estado === 'completada'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {asignacion.estado_display}
        </span>
      </div>

      {/* ── Info ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Usuario</p>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <User size={13} className="text-gray-400" />
              {asignacion.usuario_detail.nombre}
            </p>
            <p className="text-xs text-gray-500">{asignacion.usuario_detail.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Frameworks</p>
            <p className="text-sm font-semibold text-gray-800">
              {asignacion.evaluacion_detail.frameworks.join(', ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Preguntas</p>
            <p className="text-sm font-semibold text-gray-800">
              {asignacion.preguntas_respondidas} / {asignacion.total_preguntas} respondidas
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Revisión auditor</p>
            <p className="text-sm font-semibold text-gray-800">
              {totalCalificadas} / {respuestas.length} calificadas
            </p>
          </div>
        </div>

        {/* Barras de progreso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso del usuario</span>
              <span className="font-semibold text-primary-600">{progresoCumplimiento.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progresoCumplimiento}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Revisión del auditor</span>
              <span className="font-semibold text-green-600">{progresoRevision.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progresoRevision}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Lista de respuestas (solo lectura) ── */}
      {respuestas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            {asignacion.estado === 'pendiente' || asignacion.estado === 'en_progreso'
              ? 'El usuario aún no ha respondido ninguna pregunta'
              : 'No hay respuestas disponibles'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {respuestas.map((respuesta, index) => {
            const expandida   = expandidas.has(respuesta.id);
            const esNoAplica  = respuesta.respuesta === 'NO_APLICA';
            const esNoCumple  = respuesta.respuesta === 'NO_CUMPLE';
            const calificada  = !!respuesta.calificacion_auditor || esNoAplica;

            return (
              <div
                key={respuesta.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Header fila */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpandir(respuesta.id)}
                >
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>

                  <p className="text-sm font-medium text-gray-900 flex-1 truncate">
                    {respuesta.pregunta_codigo} — {respuesta.pregunta_texto}
                  </p>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Badge respuesta del usuario */}
                    {esNoAplica ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                        <Ban size={10} /> No Aplica
                      </span>
                    ) : esNoCumple ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                        <XCircle size={10} /> No
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Con evidencias
                      </span>
                    )}

                    {/* Badge calificación auditor */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColorCalificacion(respuesta.calificacion_auditor)}`}>
                      {getLabelCalificacion(respuesta.calificacion_auditor)}
                    </span>

                    {/* Nivel de madurez */}
                    {respuesta.nivel_madurez > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                        Nv. {respuesta.nivel_madurez}
                      </span>
                    )}
                  </div>

                  {expandida ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </div>

                {/* Cuerpo expandido */}
                {expandida && (
                  <div className="px-5 py-4 border-t border-gray-100 space-y-4">

                    {/* Justificación */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Justificación del Usuario
                      </p>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                        {respuesta.justificacion || <span className="text-gray-400 italic">Sin justificación</span>}
                      </p>
                    </div>

                    {/* Comentarios adicionales */}
                    {respuesta.comentarios_adicionales && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Comentarios adicionales
                        </p>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                          {respuesta.comentarios_adicionales}
                        </p>
                      </div>
                    )}

                    {/* Evidencias */}
                    {respuesta.evidencias?.filter((e: any) => e.activo).length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Evidencias ({respuesta.evidencias.filter((e: any) => e.activo).length})
                        </p>
                        <div className="space-y-2">
                          {respuesta.evidencias.filter((e: any) => e.activo).map((ev: any) => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <FileText size={15} className="text-primary-500 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {ev.codigo_documento || ev.codigo_documento_maestro} — {ev.titulo_documento || ev.nombre_documento_maestro}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {ev.tipo_documento_enum}
                                    {ev.nombre_archivo_original ? ` · ${ev.nombre_archivo_original}` : ''}
                                    {ev.tamanio_mb ? ` (${Number(ev.tamanio_mb).toFixed(2)} MB)` : ''}
                                  </p>
                                </div>
                              </div>
                              {ev.url_archivo && (
                                <a
                                  href={getFileUrl(ev.url_archivo)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Calificación del auditor (solo lectura) */}
                    {respuesta.calificacion_auditor && (
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield size={14} className="text-primary-600" />
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Calificación del Auditor
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColorCalificacion(respuesta.calificacion_auditor)}`}>
                              {getLabelCalificacion(respuesta.calificacion_auditor)}
                            </span>
                            {respuesta.nivel_madurez > 0 && (
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">
                                Nivel de Madurez: {respuesta.nivel_madurez}
                              </span>
                            )}
                          </div>
                          {respuesta.comentarios_auditor && (
                            <p className="text-sm text-gray-700 bg-white rounded-lg p-2.5 border border-gray-100">
                              <span className="block text-xs text-gray-400 uppercase font-semibold mb-1">Comentarios</span>
                              {respuesta.comentarios_auditor}
                            </p>
                          )}
                          {respuesta.recomendaciones_auditor && (
                            <p className="text-sm text-gray-700 bg-white rounded-lg p-2.5 border border-gray-100">
                              <span className="block text-xs text-gray-400 uppercase font-semibold mb-1">Recomendaciones</span>
                              {respuesta.recomendaciones_auditor}
                            </p>
                          )}
                          {respuesta.auditado_por_nombre && (
                            <p className="text-xs text-gray-400">
                              Auditado por {respuesta.auditado_por_nombre}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sin calificar aún */}
                    {!respuesta.calificacion_auditor && !esNoAplica && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Clock size={14} className="text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          Esta respuesta aún no ha sido calificada por el auditor
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mensaje si aún no hay respuestas pero la evaluación está en progreso */}
      {respuestas.length > 0 && (
        <p className="text-xs text-center text-gray-400 pb-4">
          {respuestas.length} respuesta(s) cargadas · Vista de solo lectura para administrador
        </p>
      )}
    </div>
  );
};