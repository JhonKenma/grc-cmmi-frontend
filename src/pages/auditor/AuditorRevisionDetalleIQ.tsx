// src/pages/auditor/AuditorRevisionDetalleIQ.tsx
import React, { useEffect } from 'react';
import {
  ArrowLeft, ShieldCheck, User, Calendar,
  AlertCircle, CheckCircle2, Send, BarChart3,
} from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { TablaRespuestasRevision } from '@/pages/asignaciones/TablaRespuestasRevision';
import { auditorIQApi, type RespuestaIQAuditor } from '@/api/endpoints/auditor-iq.api';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import { useAuditorRevisionDetalleIQ, formatFechaIQ, getColorGap } from './hooks';

// ── Wrapper que redirige calificar al endpoint IQ ────────────────────────────

interface TablaIQProps {
  respuestas: RespuestaIQAuditor[];
  asignacionId: string;
  esAuditor: boolean;
  onRevisionActualizada: () => void;
}

const TablaRespuestasRevisionIQ: React.FC<TablaIQProps> = ({
  respuestas, asignacionId, esAuditor, onRevisionActualizada,
}) => {
  const originalCalificar = respuestasApi.auditor.calificar;

  useEffect(() => {
    respuestasApi.auditor.calificar = async (respuestaId, data) =>
      auditorIQApi.calificar(Number(respuestaId), data) as any;
    return () => {
      respuestasApi.auditor.calificar = originalCalificar;
    };
  }, []);

  return (
    <TablaRespuestasRevision
      respuestas={respuestas as any}
      asignacionId={asignacionId}
      esAuditor={esAuditor}
      onRevisionActualizada={onRevisionActualizada}
    />
  );
};

// ── Componente principal ─────────────────────────────────────────────────────

export const AuditorRevisionDetalleIQ: React.FC = () => {
  const {
    asignacionId, asignacion, respuestas, loading,
    cerrando, mostrarModalCierre, setMostrarModalCierre,
    notasCierre, setNotasCierre,
    resultadoCierre,
    totalCalificadas, progresoRevision, sinCalificarCount, yaAuditada,
    cargarDatos, handleCerrarRevision, goToLista,
  } = useAuditorRevisionDetalleIQ();

  if (loading) return <LoadingScreen message="Cargando revisión IQ..." />;

  if (!asignacion) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No se encontró la asignación</p>
        <Button variant="secondary" className="mt-4" onClick={goToLista}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={goToLista}>
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

      {/* Info asignación */}
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
              {formatFechaIQ(asignacion.fecha_completado)}
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
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progreso de tu revisión</span>
            <span className="text-xs font-semibold text-primary-600">{progresoRevision.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progresoRevision}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Resultado GAP IQ */}
      {resultadoCierre?.gap_info && (
        <Card className="border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-800">Resultado del Análisis GAP — IQ</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Nivel Deseado</p>
              <p className="text-2xl font-bold text-gray-700">{resultadoCierre.gap_info.nivel_deseado.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Nivel Actual</p>
              <p className="text-2xl font-bold text-primary-600">{resultadoCierre.gap_info.nivel_actual.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">GAP Promedio</p>
              <p className="text-2xl font-bold text-gray-700">{resultadoCierre.gap_info.gap.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Clasificación</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getColorGap(resultadoCierre.gap_info.clasificacion)}`}>
                {resultadoCierre.gap_info.clasificacion}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              <strong>{resultadoCierre.gap_info.total_secciones}</strong> secciones evaluadas
            </span>
            {resultadoCierre.gap_info.brechas_criticas > 0 && (
              <span className="text-red-600 font-semibold">🔴 {resultadoCierre.gap_info.brechas_criticas} críticas</span>
            )}
            {resultadoCierre.gap_info.brechas_altas > 0 && (
              <span className="text-orange-600 font-semibold">🟠 {resultadoCierre.gap_info.brechas_altas} altas</span>
            )}
          </div>
          {resultadoCierre.pendientes_auto_nc > 0 && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg p-2">
              ⚠️ {resultadoCierre.pendientes_auto_nc} respuesta(s) sin calificar fueron marcadas automáticamente como <strong>No Cumple</strong>.
            </p>
          )}
        </Card>
      )}

      {/* Tabla respuestas */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ShieldCheck size={17} className="text-primary-600" />
          Respuestas del Usuario
          <span className="text-xs text-gray-400 font-normal">— Revisa cada respuesta y asigna tu calificación</span>
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

      {/* Botón cerrar revisión */}
      {!yaAuditada && (
        <Card className="border-primary-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Cerrar Revisión IQ</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Al cerrar, las respuestas sin calificar pasan a <strong>No Cumple</strong> automáticamente y se calcula el GAP por sección/framework.
              </p>
            </div>
            <Button variant="primary" onClick={() => setMostrarModalCierre(true)} disabled={cerrando}>
              <Send size={15} className="mr-1.5" />
              {cerrando ? 'Cerrando...' : 'Cerrar Revisión'}
            </Button>
          </div>
        </Card>
      )}

      {/* Ya auditada */}
      {yaAuditada && !resultadoCierre && (
        <Card className="border-green-200 bg-green-50/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Revisión IQ completada</p>
              <p className="text-xs text-green-600 mt-0.5">
                Esta asignación ya fue auditada y el GAP fue calculado. Puedes ver el reporte completo en la sección de Reportes IQ.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modal confirmación de cierre */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmar cierre de revisión IQ</h3>
            {sinCalificarCount > 0 ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Tienes <strong>{sinCalificarCount} respuesta(s)</strong> sin calificar. Al cerrar, se marcarán automáticamente como <strong>No Cumple</strong>.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Todas las respuestas están calificadas. Al cerrar se calculará el GAP por sección y framework.
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notas de auditoría <span className="text-gray-400 font-normal">(opcional)</span>
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
              <Button variant="secondary" className="flex-1" onClick={() => setMostrarModalCierre(false)} disabled={cerrando}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleCerrarRevision} disabled={cerrando}>
                {cerrando ? 'Cerrando...' : 'Confirmar y Cerrar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};