// src/pages/asignaciones/PendientesRevision.tsx

import React, { useState, useEffect } from 'react';
import { Eye, Clock } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { ModalRevisarAsignacion } from '@/components/asignaciones/ModalRevisarAsignacion';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { Asignacion, AsignacionListItem } from '@/types';
import toast from 'react-hot-toast';

export const PendientesRevision: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionListItem[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<Asignacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadPendientes();
  }, []);

  const loadPendientes = async () => {
    try {
      console.log('🔄 Iniciando recarga de pendientes...');
      setLoading(true);
      
      const data = await asignacionesApi.getPendientesRevision();
      
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Total pendientes:', data.count);
      console.log('📋 Asignaciones:', data.results);
      
      setAsignaciones(data.results);
    } catch (error: any) {
      console.error('❌ Error al cargar:', error);
      toast.error('Error al cargar asignaciones pendientes');
    } finally {
      setLoading(false);
      console.log('🏁 Recarga completada');
    }
  };


  const handleRevisar = async (id: string) => {
    try {
      const asignacion = await asignacionesApi.get(id);
      setAsignacionSeleccionada(asignacion);
      setModalOpen(true);
    } catch (error: any) {
      toast.error('Error al cargar detalle de asignación');
    }
  };

  const handleSuccess = async () => {
    console.log('🎯 handleSuccess llamado');
    await loadPendientes();
    console.log('✅ handleSuccess completado');
  };

  if (loading) {
    return <LoadingScreen message="Cargando asignaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pendientes de Revisión</h1>
        <p className="text-gray-600 mt-1">
          Asignaciones que requieren tu aprobación
        </p>
      </div>

      {/* Lista */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dimensión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
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
                        <div className="text-xs text-gray-500">
                          {asignacion.usuario_asignado_email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {asignacion.dimension_nombre || 'Sin dimensión'}
                      </div>
                      {asignacion.dimension_codigo && (
                        <div className="text-xs text-gray-500">
                          {asignacion.dimension_codigo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {asignacion.fecha_limite 
                          ? new Date(asignacion.fecha_limite).toLocaleDateString('es-ES')
                          : 'Sin fecha'
                        }
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
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRevisar(asignacion.id)}
                      >
                        <Eye size={16} className="mr-2" />
                        Revisar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de Revisión */}
      {asignacionSeleccionada && (
        <ModalRevisarAsignacion
          asignacion={asignacionSeleccionada}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setAsignacionSeleccionada(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};