// src/pages/auditor/AuditorRevisionDetalleIQ.tsx
// Equivalente a AuditorRevisionDetalle.tsx pero para Evaluaciones Inteligentes (IQ)
// Reutiliza TablaRespuestasRevision directamente — misma UX, mismos endpoints de calificar

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, User, Calendar,
  AlertCircle, CheckCircle2, Send, BarChart3, Clock,
} from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { auditorIQApi, type AsignacionIQAuditor, type RespuestaIQAuditor } from '@/api/endpoints/auditor-iq.api';
import { TablaRespuestasRevision } from '@/pages/asignaciones/TablaRespuestasRevision';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';

export const AuditorRevisionDetalleIQ: React.FC = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading,             setLoading]             = useState(true);
  const [asignacion,          setAsignacion]          = useState<AsignacionIQAuditor | null>(null);
  const [respuestas,          setRespuestas]          = useState<RespuestaIQAuditor[]>([]);
  const [cerrando,            setCerrando]            = useState(false);
  const [mostrarModalCierre,  setMostrarModalCierre]  = useState(false);
  const [notasCierre,         setNotasCierre]         = useState('');
  const [resultadoCierre,     setResultadoCierre]     = useState<{
    gap_info: {
      nivel_deseado: number;
      nivel_actual: number;
      gap: number;
      clasificacion: string;
      porcentaje_cumplimiento: number;
      total_secciones: number;
      brechas_criticas: number;
      brechas_altas: number;
    } | null;
    pendientes_auto_nc: number;
  } | null>(null);

  useEffect(() => {
    if (asignacionId) cargarDatos();
  }, [asignacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [revisionesData, respuestasData] = await Promise.all([
        auditorIQApi.misRevisiones().then(data =>
          (data.results || []).find(a => String(a.id) === asignacionId) || null
        ),
        auditorIQApi.respuestasAsignacion(Number(asignacionId)).then(d =>
          Array.isArray(d) ? d : d?.results || []
        ),
      ]);
      setAsignacion(revisionesData);
      setRespuestas(respuestasData);
    } catch (error) {
      toast.error('Error al cargar la revisión IQ');
      navigate('/auditor/revisiones-iq');
    } finally {
      setLoading(false);
    }
  };

  // ── Cerrar revisión ───────────────────────────────────────────────────────
  const handleCerrarRevision = async () => {
    if (!asignacionId) return;

    const sinCalificar = respuestas.filter(
      r => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor
    );

    // Primera vez → mostrar modal de confirmación
    if (sinCalificar.length > 0 && !mostrarModalCierre) {
      setMostrarModalCierre(true);
      return;
    }

    try {
      setCerrando(true);
      const res = await auditorIQApi.cerrarRevision(Number(asignacionId), {
        notas_auditoria: notasCierre,
      });

      const innerData = (res as any).data || res;
      console.log('🔍 innerData:', JSON.stringify(innerData));
      setResultadoCierre({
        gap_info:           innerData?.gap_info || null,
        pendientes_auto_nc: innerData?.pendientes_auto_nc || 0,
      });
      setMostrarModalCierre(false);

      toast.success('Revisión cerrada. GAP calculado exitosamente.', { duration: 5000 });
      await cargarDatos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cerrar la revisión IQ');
    } finally {
      setCerrando(false);
    }
  };

  // ── Adaptar calificación al endpoint IQ ───────────────────────────────────
  // TablaRespuestasRevision llama a respuestasApi.auditor.calificar(id, data)
  // Necesitamos que llame al endpoint IQ (/auditor-iq/calificar/{id}/)
  // Lo hacemos sobreescribiendo el api localmente vía monkey-patch temporal
  // La forma más limpia: pasar un prop `onCalificar` a la tabla
  // Como TablaRespuestasRevision no acepta ese prop aún, usamos el mismo endpoint
  // porque el ViewSet IQ mapea al mismo path que auditor
  // → SOLUCIÓN: usamos el mismo respuestasApi.auditor.calificar pero
  //   apuntando al endpoint /auditor-iq/ mediante una función override local

  const calificarRespuestaIQ = async (
    respuestaId: string,
    data: Parameters<typeof respuestasApi.auditor.calificar>[1]
  ) => {
    return auditorIQApi.calificar(Number(respuestaId), data);
  };

  // ── Métricas ──────────────────────────────────────────────────────────────
  const totalCalificadas = respuestas.filter(
    r => r.calificacion_auditor || r.respuesta === 'NO_APLICA'
  ).length;
  const progresoRevision =
    respuestas.length > 0 ? (totalCalificadas / respuestas.length) * 100 : 0;

  const yaAuditada = asignacion?.estado === 'auditada' || asignacion?.estado === 'aprobada';

  const getColorGap = (clasificacion: string) => {
    switch (clasificacion?.toLowerCase()) {
      case 'crítico':
      case 'critico':  return 'text-red-600 bg-red-50 border-red-200';
      case 'alto':     return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medio':    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'bajo':     return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cumplido': return 'text-green-600 bg-green-50 border-green-200';
      default:         return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatFecha = (f: string | null | undefined) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  if (loading) return <LoadingScreen message="Cargando revisión IQ..." />;

  if (!asignacion) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No se encontró la asignación</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/auditor/revisiones-iq')}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/auditor/revisiones-iq')}>
          <ArrowLeft size={17} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{asignacion.evaluacion_nombre}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evaluación Inteligente (IQ)</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          yaAuditada
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {yaAuditada ? 'Revisión cerrada' : 'Pendiente de revisión'}
        </span>
      </div>

      {/* ── Info asignación ── */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Usuario</p>
            <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              {asignacion.usuario_nombre}
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

        {/* Barra progreso */}
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

      {/* ── Resultado GAP (si ya se cerró) ── */}
      {resultadoCierre?.gap_info && (
        <Card className="border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-800">Resultado del Análisis GAP — IQ</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              <p className="text-xs text-gray-500 mb-1">GAP Promedio</p>
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

          {/* Resumen de brechas */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              <strong>{resultadoCierre.gap_info.total_secciones}</strong> secciones evaluadas
            </span>
            {resultadoCierre.gap_info.brechas_criticas > 0 && (
              <span className="text-red-600 font-semibold">
                🔴 {resultadoCierre.gap_info.brechas_criticas} críticas
              </span>
            )}
            {resultadoCierre.gap_info.brechas_altas > 0 && (
              <span className="text-orange-600 font-semibold">
                🟠 {resultadoCierre.gap_info.brechas_altas} altas
              </span>
            )}
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
      {/* 
        Reutilizamos TablaRespuestasRevision directamente.
        La tabla llama a respuestasApi.auditor.calificar(respuestaId, data).
        Para redirigir al endpoint IQ necesitamos un pequeño patch:
        Pasamos las respuestas con un campo extra para que la tabla use el endpoint correcto.
        
        ALTERNATIVA LIMPIA: si quieres evitar el patch, agrega en urls.py del backend
        un alias /auditor/calificar/{id}/ que también acepte respuestas IQ.
        O mejor: modifica TablaRespuestasRevision para aceptar un prop onCalificar opcional.
      */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ShieldCheck size={17} className="text-primary-600" />
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
          <TablaRespuestasRevisionIQ
            respuestas={respuestas}
            asignacionId={String(asignacionId)}
            esAuditor={true}
            onRevisionActualizada={cargarDatos}
          />
        )}
      </div>

      {/* ── Botón cerrar revisión ── */}
      {!yaAuditada && (
        <Card className="border-primary-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Cerrar Revisión IQ</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Al cerrar, las respuestas sin calificar pasan a <strong>No Cumple</strong>{' '}
                automáticamente y se calcula el GAP por sección/framework.
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

      {/* ── Ya auditada ── */}
      {yaAuditada && !resultadoCierre && (
        <Card className="border-green-200 bg-green-50/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Revisión IQ completada</p>
              <p className="text-xs text-green-600 mt-0.5">
                Esta asignación ya fue auditada y el GAP fue calculado.
                Puedes ver el reporte completo en la sección de Reportes IQ.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Modal confirmación de cierre ── */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Confirmar cierre de revisión IQ
            </h3>

            {(() => {
              const sinCalificar = respuestas.filter(
                r => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor
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
                  Todas las respuestas están calificadas. Al cerrar se calculará el GAP
                  por sección y framework.
                </p>
              );
            })()}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notas de auditoría{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={notasCierre}
                onChange={e => setNotasCierre(e.target.value)}
                rows={3}
                placeholder="Observaciones generales de la auditoría IQ..."
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


// ─────────────────────────────────────────────────────────────────────────────
// TablaRespuestasRevisionIQ
// Wrapper de TablaRespuestasRevision que redirige calificar al endpoint IQ
// ─────────────────────────────────────────────────────────────────────────────

import { TablaRespuestasRevision as TablaBase } from '@/pages/asignaciones/TablaRespuestasRevision';
import { respuestasApi as _respuestasApiOriginal } from '@/api/endpoints/respuestas.api';

interface TablaIQProps {
  respuestas: RespuestaIQAuditor[];
  asignacionId: string;
  esAuditor: boolean;
  onRevisionActualizada: () => void;
}

/**
 * Wrapper que monkey-patches respuestasApi.auditor.calificar para usar
 * el endpoint IQ (/auditor-iq/calificar/{id}/) en lugar del de encuestas.
 *
 * ALTERNATIVA más limpia (recomendada a futuro):
 * Agrega un prop `onCalificar` a TablaRespuestasRevision para inyectar
 * la función de calificación desde afuera.
 */
const TablaRespuestasRevisionIQ: React.FC<TablaIQProps> = ({
  respuestas,
  asignacionId,
  esAuditor,
  onRevisionActualizada,
}) => {
  // Patch temporal: reemplaza la función de calificar
  const originalCalificar = _respuestasApiOriginal.auditor.calificar;

  useEffect(() => {
    _respuestasApiOriginal.auditor.calificar = async (respuestaId, data) => {
      return auditorIQApi.calificar(Number(respuestaId), data) as any;
    };
    return () => {
      // Restaurar al desmontar
      _respuestasApiOriginal.auditor.calificar = originalCalificar;
    };
  }, []);

  return (
    <TablaBase
      respuestas={respuestas as any}
      asignacionId={asignacionId}
      esAuditor={esAuditor}
      onRevisionActualizada={onRevisionActualizada}
    />
  );
};