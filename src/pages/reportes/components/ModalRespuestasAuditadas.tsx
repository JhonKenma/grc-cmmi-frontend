// src/pages/reportes/components/ModalRespuestasAuditadas.tsx

import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  User,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import axiosInstance from '@/api/axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RespuestaDetalle {
  id: string;
  pregunta: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  respuesta: string | null;
  justificacion: string;
  calificacion_auditor: string | null;
  calificacion_display: string;
  comentarios_auditor: string | null;
  recomendaciones_auditor: string | null;
  fecha_auditoria: string | null;
  auditado_por_nombre: string | null;
  nivel_madurez: number | null;
  estado: string;
  estado_display: string;
}

interface ModalRespuestasAuditadasProps {
  /** ID de la asignación a consultar */
  asignacionId: string;
  /** Nombre del usuario evaluado */
  usuarioNombre: string;
  /** Nombre de la dimensión */
  dimensionNombre: string;
  onClose: () => void;
}

// ─── Helpers visuales ────────────────────────────────────────────────────────

const calificacionConfig: Record<
  string,
  { label: string; icon: React.ReactNode; badge: string; border: string; bg: string }
> = {
  SI_CUMPLE: {
    label: 'Cumple',
    icon: <CheckCircle size={15} />,
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  CUMPLE_PARCIAL: {
    label: 'Cumple Parcial',
    icon: <MinusCircle size={15} />,
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  NO_CUMPLE: {
    label: 'No Cumple',
    icon: <XCircle size={15} />,
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  NO_APLICA: {
    label: 'No Aplica',
    icon: <MinusCircle size={15} />,
    badge: 'bg-gray-100 text-gray-500',
    border: 'border-gray-200',
    bg: 'bg-gray-50',
  },
};

const getConfig = (calificacion: string | null) =>
  calificacion && calificacionConfig[calificacion]
    ? calificacionConfig[calificacion]
    : {
        label: 'Sin calificar',
        icon: <AlertCircle size={15} />,
        badge: 'bg-gray-100 text-gray-400',
        border: 'border-gray-200',
        bg: 'bg-gray-50',
      };

// ─── Componente ───────────────────────────────────────────────────────────────

export const ModalRespuestasAuditadas: React.FC<ModalRespuestasAuditadasProps> = ({
  asignacionId,
  usuarioNombre,
  dimensionNombre,
  onClose,
}) => {
  const [respuestas, setRespuestas] = useState<RespuestaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/respuestas/revision/', {
          params: { asignacion: asignacionId },
        });
        setRespuestas(response.data.results ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ?? 'Error al cargar las respuestas auditadas.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRespuestas();
  }, [asignacionId]);

  // Conteo rápido de calificaciones
  const conteo = respuestas.reduce(
    (acc, r) => {
      const k = r.calificacion_auditor ?? 'sin_calificar';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ClipboardList size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Revisión Auditada
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{dimensionNombre}</span>
                {' · '}
                <span className="inline-flex items-center gap-1">
                  <User size={11} />
                  {usuarioNombre}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Barra de resumen ── */}
        {!loading && !error && respuestas.length > 0 && (
          <div className="flex gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50 flex-wrap">
            {[
              { key: 'SI_CUMPLE', label: 'Cumple' },
              { key: 'CUMPLE_PARCIAL', label: 'Parcial' },
              { key: 'NO_CUMPLE', label: 'No Cumple' },
              { key: 'NO_APLICA', label: 'No Aplica' },
            ].map(({ key, label }) =>
              conteo[key] ? (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getConfig(key).badge}`}
                >
                  {getConfig(key).icon}
                  {conteo[key]} {label}
                </span>
              ) : null
            )}
          </div>
        )}

        {/* ── Contenido ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm">Cargando respuestas…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Vacío */}
          {!loading && !error && respuestas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No hay respuestas registradas para esta asignación.</p>
            </div>
          )}

          {/* Lista de respuestas */}
          {!loading &&
            !error &&
            respuestas.map((resp, idx) => {
              const cfg = getConfig(resp.calificacion_auditor);
              return (
                <div
                  key={resp.id}
                  className={`rounded-xl border ${cfg.border} overflow-hidden`}
                >
                  {/* Cabecera de la pregunta */}
                  <div className={`flex items-start justify-between px-4 py-3 ${cfg.bg}`}>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="shrink-0 text-xs font-mono font-semibold text-gray-400 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          {resp.pregunta_codigo}
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">
                          {resp.pregunta_texto}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div className="px-4 py-3 bg-white space-y-3">

                    {/* Justificación del usuario */}
                    {resp.justificacion && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                          Justificación del usuario
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {resp.justificacion}
                        </p>
                      </div>
                    )}

                    {/* Comentarios del auditor */}
                    {resp.comentarios_auditor && (
                      <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <MessageSquare size={15} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-1">
                            Comentario del auditor
                          </p>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            {resp.comentarios_auditor}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Recomendaciones del auditor */}
                    {resp.recomendaciones_auditor && (
                      <div className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-1">
                            Recomendaciones
                          </p>
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {resp.recomendaciones_auditor}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Nivel de madurez + auditor */}
                    {(resp.nivel_madurez !== null || resp.auditado_por_nombre) && (
                      <div className="flex items-center gap-4 pt-1">
                        {resp.nivel_madurez !== null && (
                          <span className="text-xs text-gray-500">
                            Nivel de madurez:{' '}
                            <span className="font-semibold text-gray-700">
                              {resp.nivel_madurez}
                            </span>
                          </span>
                        )}
                        {resp.auditado_por_nombre && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={11} />
                            {resp.auditado_por_nombre}
                            {resp.fecha_auditoria && (
                              <span>
                                · {new Date(resp.fecha_auditoria).toLocaleDateString('es-PE')}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Sin calificación aún */}
                    {!resp.calificacion_auditor && (
                      <p className="text-xs text-gray-400 italic">
                        Esta respuesta aún no ha sido calificada por el auditor.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};