// src/pages/asignaciones/ListaAsignaciones.tsx
import React from 'react';
import { Plus, ClipboardList, Eye } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { useListaAsignaciones } from './hooks';

export const ListaAsignaciones: React.FC = () => {
  const {
    loading, asignaciones, estadisticas, isSuperAdmin,
    getEstadoBadge,
    goToAsignarEvaluacion, goToAsignarDimensiones, goToPendientesRevision,
  } = useListaAsignaciones();

  if (loading) return <LoadingScreen message="Cargando asignaciones..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? 'Gestiona las asignaciones de evaluaciones a administradores'
              : 'Asigna dimensiones a usuarios de tu empresa'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isSuperAdmin && (
            <Button variant="secondary" size="md" onClick={goToPendientesRevision}>
              <Eye size={18} className="mr-2" />
              Pendientes Revisión
              {estadisticas?.por_estado?.pendientes_revision > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {estadisticas.por_estado.pendientes_revision}
                </span>
              )}
            </Button>
          )}
          {isSuperAdmin ? (
            <Button variant="primary" size="md" onClick={goToAsignarEvaluacion}>
              <Plus size={18} className="mr-2" /> Asignar Evaluación
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={goToAsignarDimensiones}>
              <Plus size={18} className="mr-2" /> Asignar Dimensiones
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total',        value: estadisticas.total_asignaciones,               icon: '📋', color: 'bg-primary-100 text-primary-600' },
            { label: 'Pendientes',   value: estadisticas.por_estado.pendientes,             icon: '⏳', color: 'bg-yellow-100 text-yellow-600' },
            { label: 'En Progreso',  value: estadisticas.por_estado.en_progreso,            icon: '🔄', color: 'bg-blue-100 text-blue-600' },
            { label: 'En Revisión',  value: estadisticas.por_estado.pendientes_revision || 0, icon: '👁️', color: 'bg-purple-100 text-purple-600' },
            { label: 'Completadas',  value: estadisticas.por_estado.completadas,            icon: '✅', color: 'bg-green-100 text-green-600' },
            { label: 'Rechazadas',   value: estadisticas.por_estado.rechazadas || 0,        icon: '🔴', color: 'bg-orange-100 text-orange-600' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{icon}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className={`text-2xl font-bold`}>{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lista */}
      {asignaciones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</h3>
            <p className="text-gray-600 mb-6">
              {isSuperAdmin
                ? 'Comienza asignando evaluaciones a los administradores'
                : 'Comienza asignando dimensiones a tus usuarios'}
            </p>
            <Button
              variant="primary"
              onClick={isSuperAdmin ? goToAsignarEvaluacion : goToAsignarDimensiones}
            >
              <Plus size={18} className="mr-2" />
              {isSuperAdmin ? 'Asignar Evaluación' : 'Asignar Dimensión'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Evaluación', 'Dimensión', 'Asignado A', 'Fecha Límite', 'Estado', 'Progreso'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{asignacion.encuesta_nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {asignacion.dimension_nombre || <span className="text-primary-600 font-medium">Completa</span>}
                      </div>
                      {asignacion.requiere_revision && (
                        <span className="text-xs text-blue-600">📋 Req. Revisión</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{asignacion.usuario_asignado_nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(asignacion.fecha_limite).toLocaleDateString()}
                      </div>
                      <div className={`text-xs ${
                        asignacion.dias_restantes < 0 ? 'text-red-600' :
                        asignacion.dias_restantes <= 3 ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {asignacion.dias_restantes < 0
                          ? `Vencida hace ${Math.abs(asignacion.dias_restantes)} días`
                          : `${asignacion.dias_restantes} días restantes`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(asignacion.estado)}`}>
                        {asignacion.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${asignacion.porcentaje_avance}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {Number(asignacion.porcentaje_avance).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};