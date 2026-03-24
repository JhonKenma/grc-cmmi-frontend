// src/pages/asignaciones/TablaRespuestasRevision.tsx

import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, FileText, ExternalLink,
  CheckCircle2, MinusCircle, XCircle, ClipboardCheck, AlertCircle, Ban,
} from 'lucide-react';
import { Button } from '@/components/common';
import { Respuesta, CalificacionAuditor } from '@/types';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';

interface TablaRespuestasRevisionProps {
  respuestas: Respuesta[];
  asignacionId: string;
  esAuditor?: boolean;
  onRevisionActualizada?: () => void;
}

const NIVELES_MADUREZ = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const CALIFICACIONES: { valor: CalificacionAuditor; label: string; color: string; icon: React.ReactNode }[] = [
  { valor: 'SI_CUMPLE',      label: 'Sí Cumple',     color: 'border-green-500 bg-green-50 text-green-700',   icon: <CheckCircle2 size={15} className="text-green-600" /> },
  { valor: 'CUMPLE_PARCIAL', label: 'Cumple Parcial', color: 'border-yellow-500 bg-yellow-50 text-yellow-700', icon: <MinusCircle  size={15} className="text-yellow-600" /> },
  { valor: 'NO_CUMPLE',      label: 'No Cumple',      color: 'border-red-500 bg-red-50 text-red-700',         icon: <XCircle      size={15} className="text-red-600" /> },
];

const getColorCalificacion = (cal: CalificacionAuditor | null | undefined) => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'bg-green-100 text-green-800 border-green-300';
    case 'CUMPLE_PARCIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'NO_CUMPLE':      return 'bg-red-100 text-red-800 border-red-300';
    default:               return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const getLabelCalificacion = (cal: CalificacionAuditor | null | undefined) => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'Sí Cumple';
    case 'CUMPLE_PARCIAL': return 'Cumple Parcial';
    case 'NO_CUMPLE':      return 'No Cumple';
    default:               return 'Sin calificar';
  }
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const getFileUrl = (url: string) =>
  url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : '#';

export const TablaRespuestasRevision: React.FC<TablaRespuestasRevisionProps> = ({
  respuestas,
  asignacionId,
  esAuditor = false,
  onRevisionActualizada,
}) => {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [calificaciones, setCalificaciones] = useState<
    Record<string, {
      calificacion_auditor: CalificacionAuditor | '';
      nivel_madurez: number;
      comentarios_auditor: string;
      recomendaciones_auditor: string;
      saving: boolean;
    }>
  >({});

  // ⭐ Estado para el modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    abierto: boolean;
    respuesta: Respuesta | null;
  }>({ abierto: false, respuesta: null });

  const getCalState = (r: Respuesta) =>
    calificaciones[r.id] ?? {
      calificacion_auditor: r.calificacion_auditor ??
        (r.respuesta === 'NO_CUMPLE' ? 'NO_CUMPLE' : ''),
      nivel_madurez:           r.nivel_madurez ?? 0,
      comentarios_auditor:     r.comentarios_auditor ?? '',
      recomendaciones_auditor: r.recomendaciones_auditor ?? '',
      saving: false,
    };

  const updateCal = (id: string, patch: Partial<ReturnType<typeof getCalState>>) => {
    setCalificaciones(prev => ({
      ...prev,
      [id]: { ...getCalState({ id } as Respuesta), ...patch },
    }));
  };

  const toggleExpandir = (id: string) => {
    setExpandidas(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ⭐ Abre el modal de confirmación antes de guardar
  const handleSolicitarConfirmacion = (respuesta: Respuesta) => {
    const cal = getCalState(respuesta);
    if (!cal.calificacion_auditor) {
      toast.error('Selecciona una calificación primero');
      return;
    }
    if (cal.calificacion_auditor !== 'NO_CUMPLE' && cal.nivel_madurez === 0) {
      toast.error('Indica un nivel de madurez mayor a 0');
      return;
    }
    setModalConfirmacion({ abierto: true, respuesta });
  };

  // ⭐ Ejecuta el guardado real tras confirmar en el modal
  const handleConfirmarYGuardar = async () => {
    const respuesta = modalConfirmacion.respuesta;
    if (!respuesta) return;

    setModalConfirmacion({ abierto: false, respuesta: null });

    const cal = getCalState(respuesta);
    updateCal(respuesta.id, { saving: true });
    try {
      await respuestasApi.auditor.calificar(respuesta.id, {
        calificacion_auditor:    cal.calificacion_auditor as CalificacionAuditor,
        nivel_madurez:           cal.nivel_madurez,
        comentarios_auditor:     cal.comentarios_auditor,
        recomendaciones_auditor: cal.recomendaciones_auditor,
      });
      toast.success('Calificación guardada. Ya no podrá ser modificada.');
      onRevisionActualizada?.();
    } catch (error: any) {
      console.error('Error detalle:', JSON.stringify(error.response?.data));
      toast.error(error.response?.data?.message || 'Error al guardar calificación');
    } finally {
      updateCal(respuesta.id, { saving: false });
    }
  };

  return (
    <>
      <div className="space-y-3">
        {respuestas.map((respuesta, index) => {
          const expandida    = expandidas.has(respuesta.id);
          const cal          = getCalState(respuesta);
          // ⭐ yaCalificada = ya guardada en el backend → solo lectura
          const yaCalificada = respuesta.estado === 'auditado' && !!respuesta.calificacion_auditor;
          const esNoAplica   = respuesta.respuesta === 'NO_APLICA';
          const esNoCumpleUsuario = respuesta.respuesta === 'NO_CUMPLE' && !respuesta.calificacion_auditor;

          return (
            <div
              key={respuesta.id}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              {/* ── Header ── */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpandir(respuesta.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {respuesta.pregunta_codigo} — {respuesta.pregunta_texto}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge: respuesta del usuario */}
                    {esNoAplica ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                        <Ban size={11} /> No Aplica
                      </span>
                    ) : respuesta.respuesta === 'NO_CUMPLE' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                        <XCircle size={11} /> Usuario: No
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Con evidencias
                      </span>
                    )}
                    {/* Badge: calificación del auditor */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColorCalificacion(respuesta.calificacion_auditor)}`}>
                      {getLabelCalificacion(respuesta.calificacion_auditor)}
                    </span>
                    {/* ⭐ Nivel de madurez visible en el header */}
                    {respuesta.nivel_madurez > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                        Nv. {respuesta.nivel_madurez}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 text-gray-400">
                  {expandida ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* ── Cuerpo expandido ── */}
              {expandida && (
                <div className="p-5 border-t border-gray-100 space-y-5">

                  {/* Respuesta del usuario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Justificación del Usuario
                      </p>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                        {respuesta.justificacion || <span className="text-gray-400 italic">Sin justificación</span>}
                      </p>
                    </div>
                    {respuesta.comentarios_adicionales && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Comentarios del Usuario
                        </p>
                        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                          {respuesta.comentarios_adicionales}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Evidencias */}
                  {respuesta.evidencias && respuesta.evidencias.filter(e => e.activo).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Evidencias Adjuntas ({respuesta.evidencias.filter(e => e.activo).length})
                      </p>
                      <div className="space-y-2">
                        {respuesta.evidencias.filter(e => e.activo).map(ev => (
                          <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <FileText size={16} className="text-primary-500 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{ev.titulo_documento}</p>
                                <p className="text-xs text-gray-500">
                                  {ev.codigo_documento} · {ev.tipo_documento_display}
                                </p>
                              </div>
                            </div>
                            {ev.url_archivo && (
                              <a
                                href={getFileUrl(ev.url_archivo)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Panel de calificación (auditor, no NO_APLICA) ── */}
                  {esAuditor && !esNoAplica && (
                    <div className="border-t border-gray-100 pt-5">
                      <div className="flex items-center gap-2 mb-4">
                        <ClipboardCheck size={16} className="text-primary-600" />
                        <p className="text-sm font-bold text-gray-700">Calificación del Auditor</p>
                        {yaCalificada && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Guardada — solo lectura
                          </span>
                        )}
                      </div>

                      {/* ⭐ Si ya está calificada → vista solo lectura, sin formulario ni botón */}
                      {yaCalificada ? (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColorCalificacion(respuesta.calificacion_auditor)}`}>
                              {getLabelCalificacion(respuesta.calificacion_auditor)}
                            </span>
                            {/* ⭐ Fix: mostrar nivel de madurez en vista solo lectura */}
                            {respuesta.nivel_madurez > 0 && (
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">
                                Nivel de Madurez: {respuesta.nivel_madurez}
                              </span>
                            )}
                          </div>
                          {respuesta.comentarios_auditor && (
                            <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide block mb-1">Comentarios</span>
                              {respuesta.comentarios_auditor}
                            </p>
                          )}
                          {respuesta.recomendaciones_auditor && (
                            <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide block mb-1">Recomendaciones</span>
                              {respuesta.recomendaciones_auditor}
                            </p>
                          )}
                          {respuesta.auditado_por_nombre && (
                            <p className="text-xs text-gray-400 mt-1">
                              Auditado por {respuesta.auditado_por_nombre}
                              {respuesta.fecha_auditoria && ` · ${new Date(respuesta.fecha_auditoria).toLocaleDateString('es-PE')}`}
                            </p>
                          )}
                          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-2">
                            🔒 Esta calificación ya fue guardada y no puede ser modificada.
                          </p>
                        </div>
                      ) : (
                        /* ── Formulario de calificación (solo si aún no está guardada) ── */
                        <>
                          {/* Aviso cuando el usuario respondió "No" */}
                          {esNoCumpleUsuario && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-700">
                                El usuario respondió <strong>No</strong> a esta pregunta.
                                Está pre-calificada como <strong>No Cumple</strong>.
                                Puedes cambiar la calificación si consideras que hay mérito para ello.
                              </p>
                            </div>
                          )}

                          {/* Selector de calificación */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {CALIFICACIONES.map(op => (
                              <button
                                key={op.valor}
                                type="button"
                                onClick={() => updateCal(respuesta.id, {
                                  calificacion_auditor: op.valor,
                                  nivel_madurez: op.valor === 'NO_CUMPLE' ? 0 : cal.nivel_madurez,
                                })}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                                  cal.calificacion_auditor === op.valor
                                    ? op.color + ' border-current'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                {op.icon}
                                {op.label}
                              </button>
                            ))}
                          </div>

                          {/* Nivel de madurez */}
                          {cal.calificacion_auditor && cal.calificacion_auditor !== 'NO_CUMPLE' && (
                            <div className="mb-4">
                              <label className="block text-xs font-semibold text-gray-600 mb-2">
                                Nivel de Madurez <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {NIVELES_MADUREZ.map(n => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => updateCal(respuesta.id, { nivel_madurez: n })}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                      cal.nivel_madurez === n
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                                    }`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Comentarios y recomendaciones */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Comentarios</label>
                              <textarea
                                value={cal.comentarios_auditor}
                                onChange={e => updateCal(respuesta.id, { comentarios_auditor: e.target.value })}
                                rows={3}
                                placeholder="Observaciones sobre esta respuesta..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Recomendaciones</label>
                              <textarea
                                value={cal.recomendaciones_auditor}
                                onChange={e => updateCal(respuesta.id, { recomendaciones_auditor: e.target.value })}
                                rows={3}
                                placeholder="Qué debe mejorar la organización..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              />
                            </div>
                          </div>

                          {/* ⭐ Aviso antes de guardar */}
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                              Una vez guardada, la calificación <strong>no podrá ser modificada</strong>. Revisa bien antes de confirmar.
                            </p>
                          </div>

                          {/* ⭐ Solo botón "Guardar" — sin "Actualizar" */}
                          <Button
                            size="sm"
                            onClick={() => handleSolicitarConfirmacion(respuesta)}
                            disabled={cal.saving || !cal.calificacion_auditor}
                          >
                            <ClipboardCheck size={14} className="mr-1.5" />
                            {cal.saving ? 'Guardando...' : 'Guardar Calificación'}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Vista calificación existente (no auditor) ── */}
                  {!esAuditor && respuesta.calificacion_auditor && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Calificación del Auditor
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColorCalificacion(respuesta.calificacion_auditor)}`}>
                            {getLabelCalificacion(respuesta.calificacion_auditor)}
                          </span>
                          {/* ⭐ Fix nivel de madurez en vista usuario */}
                          {respuesta.nivel_madurez > 0 && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">
                              Nivel de Madurez: {respuesta.nivel_madurez}
                            </span>
                          )}
                        </div>
                        {respuesta.comentarios_auditor && (
                          <p className="text-sm text-gray-700 bg-green-50 rounded p-2">
                            <span className="font-medium">Comentarios: </span>
                            {respuesta.comentarios_auditor}
                          </p>
                        )}
                        {respuesta.recomendaciones_auditor && (
                          <p className="text-sm text-gray-700 bg-blue-50 rounded p-2">
                            <span className="font-medium">Recomendaciones: </span>
                            {respuesta.recomendaciones_auditor}
                          </p>
                        )}
                        {respuesta.auditado_por_nombre && (
                          <p className="text-xs text-gray-500">
                            Auditado por {respuesta.auditado_por_nombre}
                            {respuesta.fecha_auditoria && ` · ${new Date(respuesta.fecha_auditoria).toLocaleDateString('es-PE')}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aviso NO_APLICA */}
                  {esAuditor && esNoAplica && (
                    <div className="border-t border-gray-100 pt-4 flex items-center gap-2 text-gray-500">
                      <Ban size={15} />
                      <p className="text-xs">
                        Esta pregunta fue marcada como <strong>No Aplica</strong> por el usuario. No requiere calificación y está excluida del cálculo GAP.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ⭐ Modal de confirmación antes de guardar */}
      {modalConfirmacion.abierto && modalConfirmacion.respuesta && (() => {
        const r = modalConfirmacion.respuesta!;
        const cal = getCalState(r);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertCircle size={22} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar calificación</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Estás a punto de guardar la calificación para:
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium">{r.pregunta_codigo}</p>
                <p className="text-sm font-semibold text-gray-800">{r.pregunta_texto}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColorCalificacion(cal.calificacion_auditor as CalificacionAuditor)}`}>
                    {getLabelCalificacion(cal.calificacion_auditor as CalificacionAuditor)}
                  </span>
                  {cal.nivel_madurez > 0 && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">
                      Nivel: {cal.nivel_madurez}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-5">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  <strong>Esta acción es irreversible.</strong> Una vez guardada, la calificación no podrá ser modificada.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setModalConfirmacion({ abierto: false, respuesta: null })}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirmarYGuardar}
                >
                  <ClipboardCheck size={14} className="mr-1.5" />
                  Sí, guardar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};