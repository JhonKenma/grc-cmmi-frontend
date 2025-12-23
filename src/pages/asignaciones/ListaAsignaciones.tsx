// src/pages/asignaciones/ListaAsignaciones.tsx - VERSIÓN ACTUALIZADA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plus, ClipboardList, Eye } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { AsignacionListItem } from '@/types';
import toast from 'react-hot-toast';

export const ListaAsignaciones: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionListItem[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const asignacionesData = await asignacionesApi.list();
      const lista = Array.isArray(asignacionesData)
        ? asignacionesData
        : (asignacionesData as any).results || [];
      setAsignaciones(lista);

      const stats = await asignacionesApi.getEstadisticas();
      setEstadisticas(stats);
    } catch (error: any) {
      toast.error('Error al cargar asignaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_progreso: 'bg-blue-100 text-blue-800',
      completado: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      pendiente_revision: 'bg-purple-100 text-purple-800',
      rechazado: 'bg-orange-100 text-orange-800',
    };

    return badges[estado as keyof typeof badges] || badges.pendiente;
  };

  if (loading) {
    return <LoadingScreen message="Cargando asignaciones..." />;
  }

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
          {/* Botón para ver pendientes de revisión (Admin) */}
          {!isSuperAdmin && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/asignaciones/pendientes-revision')}
            >
              <Eye size={18} className="mr-2" />
              Pendientes Revisión
              {estadisticas?.por_estado?.pendientes_revision > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {estadisticas.por_estado.pendientes_revision}
                </span>
              )}
            </Button>
          )}

          {/* ⭐ BOTÓN ACTUALIZADO: Asignar según rol */}
          {isSuperAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/asignaciones/asignar-evaluacion')}
            >
              <Plus size={18} className="mr-2" />
              Asignar Evaluación
            </Button>
          )}

          {!isSuperAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/asignaciones/asignar-dimensiones')} // ⭐ CAMBIO: plural
            >
              <Plus size={18} className="mr-2" />
              Asignar Dimensiones
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ClipboardList size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas.total_asignaciones}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticas.por_estado.pendientes}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticas.por_estado.en_progreso}
                </p>
              </div>
            </div>
          </Card>

          {/* ⭐ NUEVA CARD: Pendientes Revisión */}
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticas.por_estado.pendientes_revision || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas.por_estado.completadas}
                </p>
              </div>
            </div>
          </Card>

          {/* ⭐ NUEVA CARD: Rechazadas */}
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticas.por_estado.rechazadas || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Lista */}
      {asignaciones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay asignaciones
            </h3>
            <p className="text-gray-600 mb-6">
              {isSuperAdmin
                ? 'Comienza asignando evaluaciones a los administradores'
                : 'Comienza asignando dimensiones a tus usuarios'}
            </p>
            <Button
              variant="primary"
              onClick={() =>
                navigate(
                  isSuperAdmin
                    ? '/asignaciones/asignar-evaluacion'
                    : '/asignaciones/asignar-dimension'
                )
              }
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evaluación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dimensión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asignado A
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {asignacion.encuesta_nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {asignacion.dimension_nombre || (
                          <span className="text-primary-600 font-medium">Completa</span>
                        )}
                      </div>
                      {asignacion.requiere_revision && (
                        <span className="text-xs text-blue-600">📋 Req. Revisión</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {asignacion.usuario_asignado_nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(asignacion.fecha_limite).toLocaleDateString()}
                      </div>
                      <div
                        className={`text-xs ${
                          asignacion.dias_restantes < 0
                            ? 'text-red-600'
                            : asignacion.dias_restantes <= 3
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {asignacion.dias_restantes < 0
                          ? `Vencida hace ${Math.abs(asignacion.dias_restantes)} días`
                          : `${asignacion.dias_restantes} días restantes`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(
                          asignacion.estado
                        )}`}
                      >
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