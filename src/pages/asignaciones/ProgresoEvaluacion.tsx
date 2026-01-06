// src/pages/asignaciones/ProgresoEvaluacion.tsx - CREAR NUEVO

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { ModalRevisarAsignacion } from '@/components/asignaciones/ModalRevisarAsignacion';
import { evaluacionesApi, asignacionesApi } from '@/api/endpoints';
import { Asignacion } from '@/types';
import toast from 'react-hot-toast';

export const ProgresoEvaluacion: React.FC = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<Asignacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (evaluacionId) {
      loadData();
    }
  }, [evaluacionId]);

    const loadData = async () => {
    if (!evaluacionId) return;

    try {
        setLoading(true);

        // 1. Cargar evaluación
        const evaluacionData = await evaluacionesApi.get(evaluacionId);
        setEvaluacion(evaluacionData);

        // 2. Cargar TODAS las asignaciones
        const asignacionesResponse = await asignacionesApi.list();
        
        // ⭐ SOLUCIÓN: Tipar explícitamente como 'any' para evitar el error
        const todasAsignaciones = Array.isArray(asignacionesResponse)
        ? asignacionesResponse
        : (asignacionesResponse as any).results || [];

        // 3. Filtrar solo las de esta evaluación
        const asignacionesFiltradas = todasAsignaciones.filter(
        (a: any) => a.evaluacion_empresa_id === evaluacionId
        );

        console.log('🔍 Total asignaciones:', todasAsignaciones.length);
        console.log('🔍 Filtradas para esta evaluación:', asignacionesFiltradas.length);
        console.log('🔍 evaluacionId buscado:', evaluacionId);
        console.log('🔍 Asignaciones filtradas:', asignacionesFiltradas);

        setAsignaciones(asignacionesFiltradas);
    } catch (error: any) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos');
        navigate('/asignaciones/mis-evaluaciones');
    } finally {
        setLoading(false);
    }
    };

  const handleRevisar = async (asignacionId: string) => {
    try {
      const asignacion = await asignacionesApi.get(asignacionId);
      setAsignacionSeleccionada(asignacion);
      setModalOpen(true);
    } catch (error: any) {
      toast.error('Error al cargar detalle de asignación');
    }
  };

  const handleSuccess = async () => {
    await loadData();
    toast.success('Asignación revisada exitosamente');
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { class: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      en_progreso: { class: 'bg-blue-100 text-blue-800', icon: <AlertCircle size={14} /> },
      completado: { class: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      pendiente_revision: { class: 'bg-purple-100 text-purple-800', icon: <Eye size={14} /> },
      rechazado: { class: 'bg-orange-100 text-orange-800', icon: <AlertCircle size={14} /> },
      vencido: { class: 'bg-red-100 text-red-800', icon: <AlertCircle size={14} /> },
    };

    return badges[estado as keyof typeof badges] || badges.pendiente;
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completado: 'Completado',
      pendiente_revision: 'Pendiente Revisión',
      rechazado: 'Rechazado',
      vencido: 'Vencido',
    };
    return labels[estado] || estado;
  };

  // Calcular estadísticas
  const stats = {
    total: asignaciones.length,
    pendientes: asignaciones.filter((a) => a.estado === 'pendiente').length,
    en_progreso: asignaciones.filter((a) => a.estado === 'en_progreso').length,
    completadas: asignaciones.filter((a) => a.estado === 'completado').length,
    pendientes_revision: asignaciones.filter((a) => a.estado === 'pendiente_revision').length,
    rechazadas: asignaciones.filter((a) => a.estado === 'rechazado').length,
  };

  if (loading) return <LoadingScreen message="Cargando progreso..." />;

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluación no encontrada</h3>
        <Button variant="secondary" onClick={() => navigate('/asignaciones/mis-evaluaciones')}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/asignaciones/mis-evaluaciones')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Progreso de Evaluación</h1>
          <p className="text-gray-600 mt-1">
            {evaluacion.encuesta_info?.nombre} - {evaluacion.empresa_info?.nombre}
          </p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Asignadas</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pendientes}</div>
            <div className="text-sm text-gray-600 mt-1">Pendientes</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.en_progreso}</div>
            <div className="text-sm text-gray-600 mt-1">En Progreso</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.pendientes_revision}</div>
            <div className="text-sm text-gray-600 mt-1">Por Revisar</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completadas}</div>
            <div className="text-sm text-gray-600 mt-1">Completadas</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.rechazadas}</div>
            <div className="text-sm text-gray-600 mt-1">Rechazadas</div>
          </div>
        </Card>
      </div>

      {/* Progreso Global */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Progreso Global</h3>
              <p className="text-sm text-gray-600">
                {evaluacion.dimensiones_completadas} de {evaluacion.total_dimensiones} dimensiones
                completadas
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay dimensiones asignadas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza asignando dimensiones a los usuarios de tu empresa
            </p>
            <Button
              variant="primary"
              onClick={() => navigate(`/evaluaciones/${evaluacionId}/asignar-dimensiones`)}
            >
              Asignar Dimensiones
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Asignaciones por Dimensión</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/evaluaciones/${evaluacionId}/asignar-dimensiones`)}
            >
              + Asignar Más Dimensiones
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dimensión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asignado A
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map((asignacion) => {
                  const estadoBadge = getEstadoBadge(asignacion.estado);

                  return (
                    <tr key={asignacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {asignacion.dimension_nombre}
                        </div>
                        <div className="text-xs text-gray-500">{asignacion.dimension_codigo}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {asignacion.usuario_asignado_nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {asignacion.usuario_asignado_email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${estadoBadge.class}`}
                        >
                          {estadoBadge.icon}
                          {getEstadoLabel(asignacion.estado)}
                        </span>
                        {asignacion.requiere_revision && (
                          <div className="text-xs text-blue-600 mt-1">📋 Requiere revisión</div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                asignacion.estado === 'completado'
                                  ? 'bg-green-600'
                                  : asignacion.estado === 'pendiente_revision'
                                  ? 'bg-purple-600'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${asignacion.porcentaje_avance}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                            {Number(asignacion.porcentaje_avance).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(asignacion.fecha_limite).toLocaleDateString('es-ES')}
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
                            ? `Vencida`
                            : `${asignacion.dias_restantes}d restantes`}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {asignacion.estado === 'pendiente_revision' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRevisar(asignacion.id)}
                          >
                            <Eye size={14} className="mr-1" />
                            Revisar
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRevisar(asignacion.id)}
                          >
                            <Eye size={14} className="mr-1" />
                            Ver Detalle
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