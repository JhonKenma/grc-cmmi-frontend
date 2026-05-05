// src/pages/asignaciones/ProgresoEvaluacion.tsx
import React from 'react';
import { ArrowLeft, Eye, Users } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { ModalRevisarAsignacion } from '@/components/asignaciones/ModalRevisarAsignacion';
import { useProgresoEvaluacion, getEstadoBadge, getEstadoLabel, getBarColor } from './hooks';

export const ProgresoEvaluacion: React.FC = () => {
  const {
    evaluacionId, evaluacion, loading,
    asignaciones, stats,
    asignacionSeleccionada, modalOpen,
    handleRevisar, handleSuccess, handleCloseModal,
    goToLista, goToAsignarDimensiones,
  } = useProgresoEvaluacion();

  if (loading) return <LoadingScreen message="Cargando progreso..." />;

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluación no encontrada</h3>
        <Button variant="secondary" onClick={goToLista}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={goToLista}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Progreso de Evaluación</h1>
          <p className="text-gray-600 mt-1">
            {evaluacion.encuesta_info?.nombre} — {evaluacion.empresa_info?.nombre}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total',       value: stats.total,               color: 'text-gray-900' },
          { label: 'Pendientes',  value: stats.pendientes,           color: 'text-yellow-600' },
          { label: 'En Progreso', value: stats.en_progreso,          color: 'text-blue-600' },
          { label: 'Completadas', value: stats.completadas,          color: 'text-green-600' },
          { label: 'En Auditoría',value: stats.pendiente_auditoria,  color: 'text-purple-600' },
          { label: 'Auditadas',   value: stats.auditadas,            color: 'text-emerald-600' },
          { label: 'Por Revisar', value: stats.pendientes_revision,  color: 'text-indigo-600' },
          { label: 'Rechazadas',  value: stats.rechazadas,           color: 'text-orange-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <div className="text-center py-1">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progreso Global */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Progreso Global</h3>
              <p className="text-sm text-gray-600">
                {evaluacion.dimensiones_completadas} de {evaluacion.total_dimensiones} dimensiones completadas
              </p>
            </div>
            <div className="text-3xl font-bold text-primary-600">
              {Number(evaluacion.porcentaje_avance).toFixed(0)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all"
              style={{ width: `${evaluacion.porcentaje_avance}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Lista de Asignaciones */}
      {asignaciones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay dimensiones asignadas</h3>
            <p className="text-gray-600 mb-6">Comienza asignando dimensiones a los usuarios de tu empresa</p>
            <Button variant="primary" onClick={goToAsignarDimensiones}>
              Asignar Dimensiones
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Asignaciones por Dimensión</h3>
            <Button variant="secondary" size="sm" onClick={goToAsignarDimensiones}>
              + Asignar Más Dimensiones
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Dimensión', 'Asignado A', 'Estado', 'Progreso', 'Fecha Límite', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {asignaciones.map(asignacion => {
                  const badge = getEstadoBadge(asignacion.estado);
                  return (
                    <tr key={asignacion.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900">{asignacion.dimension_nombre}</div>
                        <div className="text-xs text-gray-400">{asignacion.dimension_codigo}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{asignacion.usuario_asignado_nombre}</div>
                        <div className="text-xs text-gray-400">{asignacion.usuario_asignado_email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.class}`}>
                          {badge.icon}
                          {getEstadoLabel(asignacion.estado)}
                        </span>
                        {asignacion.requiere_revision && (
                          <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                            <Eye size={11} /> Requiere revisión
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[70px]">
                            <div
                              className={`h-2 rounded-full transition-all ${getBarColor(asignacion.estado)}`}
                              style={{ width: `${asignacion.porcentaje_avance}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[35px]">
                            {Number(asignacion.porcentaje_avance).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(asignacion.fecha_limite).toLocaleDateString('es-PE')}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          asignacion.dias_restantes < 0 ? 'text-red-600 font-medium' :
                          asignacion.dias_restantes <= 3 ? 'text-orange-600 font-medium' : 'text-gray-400'
                        }`}>
                          {asignacion.dias_restantes < 0 ? 'Vencida' : `${asignacion.dias_restantes}d restantes`}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {asignacion.estado === 'pendiente_revision' ? (
                          <Button variant="primary" size="sm" onClick={() => handleRevisar(asignacion.id)}>
                            <Eye size={14} className="mr-1" /> Revisar
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleRevisar(asignacion.id)}>
                            <Eye size={14} className="mr-1" /> Ver Detalle
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {asignacionSeleccionada && (
        <ModalRevisarAsignacion
          asignacion={asignacionSeleccionada}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};