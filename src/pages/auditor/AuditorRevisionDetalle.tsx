// src/pages/auditor/AuditorRevisionDetalle.tsx

// src/pages/auditor/AuditorRevisionDetalle.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  BarChart3,
} from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { respuestasApi } from '@/api/endpoints';
import { TablaRespuestasRevision } from '@/pages/asignaciones/TablaRespuestasRevision';
import { Respuesta } from '@/types';
import toast from 'react-hot-toast';

interface AsignacionDetalle {
  id: string;
  dimension_nombre: string;
  encuesta_nombre: string;
  usuario_asignado_nombre: string;
  empresa_nombre: string;
  fecha_completado: string;
  fecha_limite: string;
  total_preguntas: number;
  preguntas_respondidas: number;
  estado: string;
  evaluacion_empresa?: string;
}

export const AuditorRevisionDetalle: React.FC = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [asignacion, setAsignacion] = useState<AsignacionDetalle | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [cerrando, setCerrando] = useState(false);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [comentarioCierre, setComentarioCierre] = useState('');
  const [resultadoCierre, setResultadoCierre] = useState<{
    gap_info: {
      nivel_deseado: number;
      nivel_actual: number;
      gap: number;
      clasificacion: string;
      porcentaje_cumplimiento: number;
    } | null;
    pendientes_auto_nc: number;
  } | null>(null);

  useEffect(() => {
    if (asignacionId) loadData();
  }, [asignacionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [revisionData, respuestasData] = await Promise.all([
        // Cargamos la asignación desde mis_revisiones filtrando por id
        respuestasApi.auditor.misRevisiones().then((data: any) => {
          const list = Array.isArray(data) ? data : data?.results || [];
          return list.find((a: any) => a.id === asignacionId) || null;
        }),
        respuestasApi.listParaRevision(asignacionId!).then((data) => {
          return Array.isArray(data) ? data : data?.results || [];
        }),
      ]);

      setAsignacion(revisionData);
      setRespuestas(respuestasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la revisión');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarRevision = async () => {
    if (!asignacionId) return;

    // Verificar si hay respuestas sin calificar (excluyendo NO_APLICA)
    const sinCalificar = respuestas.filter(
      (r) => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor
    );

    if (sinCalificar.length > 0 && !mostrarModalCierre) {
      setMostrarModalCierre(true);
      return;
    }

    try {
      setCerrando(true);
      const res = await respuestasApi.auditor.cerrarRevision(asignacionId, {
        comentario_cierre: comentarioCierre,
      });
      console.log('Resultado cierre:', JSON.stringify(res));
      const data = (res as any).data || res;
      setResultadoCierre({
        gap_info: data?.gap_info || null,
        pendientes_auto_nc: data?.pendientes_auto_nc || 0,
      });
      setMostrarModalCierre(false);

      toast.success('Revisión cerrada. GAP calculado exitosamente.', { duration: 5000 });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cerrar la revisión');
    } finally {
      setCerrando(false);
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const totalCalificadas = respuestas.filter(
    (r) => r.calificacion_auditor || r.respuesta === 'NO_APLICA'
  ).length;
  const progresoRevision =
    respuestas.length > 0 ? (totalCalificadas / respuestas.length) * 100 : 0;
  const yaRevisada = asignacion?.estado === 'auditado' || asignacion?.estado === 'completado' && !!resultadoCierre;

  const getColorGap = (clasificacion: string) => {
    switch (clasificacion?.toLowerCase()) {
      case 'critico':  return 'text-red-600 bg-red-50 border-red-200';
      case 'alto':     return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medio':    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'bajo':     return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cumplido': return 'text-green-600 bg-green-50 border-green-200';
      case 'superado': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:         return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) return <LoadingScreen message="Cargando revisión..." />;

  if (!asignacion) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No se encontró la asignación</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/auditor/revisiones')}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/auditor/revisiones')}>
          <ArrowLeft size={17} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{asignacion.dimension_nombre}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{asignacion.encuesta_nombre}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          asignacion.estado === 'auditado'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {asignacion.estado === 'auditado' ? 'Revisión cerrada' : 'Pendiente de revisión'}
        </span>
      </div>

      {/* ── Info de la asignación ── */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Usuario</p>
            <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              {asignacion.usuario_asignado_nombre}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Completada</p>
            <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {formatFecha(asignacion.fecha_completado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Preguntas</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {asignacion.preguntas_respondidas} / {asignacion.total_preguntas}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tu progreso</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {totalCalificadas} / {respuestas.length} calificadas
            </p>
          </div>
        </div>

        {/* Barra de progreso de revisión */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progreso de tu revisión</span>
            <span className="text-xs font-semibold text-primary-600">
              {progresoRevision.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progresoRevision}%` }}
            />
          </div>
        </div>
      </Card>

      {/* ── Resultado del GAP (si ya se cerró) ── */}
      {resultadoCierre?.gap_info && (
        <Card className="border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-800">Resultado del Análisis GAP</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Nivel Deseado</p>
              <p className="text-2xl font-bold text-gray-700">
                {resultadoCierre.gap_info.nivel_deseado.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Nivel Actual</p>
              <p className="text-2xl font-bold text-primary-600">
                {resultadoCierre.gap_info.nivel_actual.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">GAP</p>
              <p className="text-2xl font-bold text-gray-700">
                {resultadoCierre.gap_info.gap.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Clasificación</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                getColorGap(resultadoCierre.gap_info.clasificacion)
              }`}>
                {resultadoCierre.gap_info.clasificacion}
              </span>
            </div>
          </div>
          {resultadoCierre.pendientes_auto_nc > 0 && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg p-2">
              ⚠️ {resultadoCierre.pendientes_auto_nc} respuesta(s) sin calificar fueron marcadas
              automáticamente como <strong>No Cumple</strong>.
            </p>
          )}
        </Card>
      )}

      {/* ── Tabla de respuestas ── */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ClipboardCheck size={17} className="text-primary-600" />
          Respuestas del Usuario
          <span className="text-xs text-gray-400 font-normal">
            — Revisa cada respuesta y asigna tu calificación
          </span>
        </h2>

        {respuestas.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay respuestas para revisar</p>
            </div>
          </Card>
        ) : (
          <TablaRespuestasRevision
            respuestas={respuestas}
            asignacionId={asignacionId!}
            esAuditor={true}
            onRevisionActualizada={loadData}
          />
        )}
      </div>

      {/* ── Botón cerrar revisión ── */}
      {asignacion.estado !== 'auditado' && (
        <Card className="border-primary-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Cerrar Revisión</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Al cerrar, las respuestas sin calificar pasan a <strong>No Cumple</strong> automáticamente
                y se calcula el GAP.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setMostrarModalCierre(true)}
              disabled={cerrando}
            >
              <Send size={15} className="mr-1.5" />
              {cerrando ? 'Cerrando...' : 'Cerrar Revisión'}
            </Button>
          </div>
        </Card>
      )}

      {/* ── Ya revisada ── */}
      {asignacion.estado === 'auditado' && !resultadoCierre && (
        <Card className="border-green-200 bg-green-50/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Revisión completada</p>
              <p className="text-xs text-green-600 mt-0.5">
                Esta asignación ya fue auditada y el GAP fue calculado.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Modal de confirmación de cierre ── */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmar cierre de revisión</h3>

            {(() => {
              const sinCalificar = respuestas.filter(
                (r) => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor
              ).length;
              return sinCalificar > 0 ? (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Tienes <strong>{sinCalificar} respuesta(s)</strong> sin calificar. Al cerrar,
                    se marcarán automáticamente como <strong>No Cumple</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  Todas las respuestas están calificadas. Al cerrar se calculará el GAP.
                </p>
              );
            })()}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Comentario de cierre <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={comentarioCierre}
                onChange={(e) => setComentarioCierre(e.target.value)}
                rows={3}
                placeholder="Observaciones generales de la auditoría..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setMostrarModalCierre(false)}
                disabled={cerrando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCerrarRevision}
                disabled={cerrando}
              >
                {cerrando ? 'Cerrando...' : 'Confirmar y Cerrar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};