// src/pages/asignaciones/PendientesRevision.tsx
import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { ModalRevisarAsignacion } from '@/components/asignaciones/ModalRevisarAsignacion';
import { usePendientesRevision } from './hooks';

export const PendientesRevision: React.FC = () => {
  const {
    loading, asignaciones,
    asignacionSeleccionada, modalOpen,
    handleRevisar, handleSuccess, handleCloseModal,
  } = usePendientesRevision();

  if (loading) return <LoadingScreen message="Cargando asignaciones..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pendientes de Revisión</h1>
        <p className="text-gray-600 mt-1">Asignaciones que requieren tu aprobación</p>
      </div>

      {asignaciones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay asignaciones pendientes de revisión
            </h3>
            <p className="text-gray-600">
              Cuando los usuarios completen asignaciones que requieran revisión, aparecerán aquí
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Usuario', 'Dimensión', 'Fecha Límite', 'Progreso', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {asignacion.usuario_asignado_nombre || 'Sin nombre'}
                      </div>
                      {asignacion.usuario_asignado_email && (
                        <div className="text-xs text-gray-500">{asignacion.usuario_asignado_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{asignacion.dimension_nombre || 'Sin dimensión'}</div>
                      {asignacion.dimension_codigo && (
                        <div className="text-xs text-gray-500">{asignacion.dimension_codigo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {asignacion.fecha_limite
                          ? new Date(asignacion.fecha_limite).toLocaleDateString('es-ES')
                          : 'Sin fecha'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${Number(asignacion.porcentaje_avance || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {Number(asignacion.porcentaje_avance || 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="primary" size="sm" onClick={() => handleRevisar(asignacion.id)}>
                        <Eye size={16} className="mr-2" /> Revisar
                      </Button>
                    </td>
                  </tr>
                ))}
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