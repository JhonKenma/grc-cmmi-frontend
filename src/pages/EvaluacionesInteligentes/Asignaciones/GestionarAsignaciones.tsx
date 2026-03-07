// src/pages/EvaluacionesInteligentes/Asignaciones/GestionarAsignaciones.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionIQ, EstadisticasAsignaciones } from '@/types/asignacion-iq.types';
import { getEstadoBadgeColor, getPrioridadColor } from '@/types/asignacion-iq.types';

export const GestionarAsignaciones = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionEvaluacionIQ[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAsignaciones | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asignacionesData, statsData] = await Promise.all([
        asignacionIQApi.listar(),
        asignacionIQApi.estadisticas(),
      ]);
      
      // Manejar si viene paginado o directo
      const asignacionesArray = Array.isArray(asignacionesData) 
        ? asignacionesData 
        : (asignacionesData as any)?.results || [];
      
      setAsignaciones(asignacionesArray);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar asignaciones');
      setAsignaciones([]); // Asegurar que sea array en caso de error
    } finally {
      setLoading(false);
    }
  };

  const asignacionesFiltradas = filtroEstado
    ? (asignaciones || []).filter(a => a.estado === filtroEstado)
    : (asignaciones || []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestionar Asignaciones
        </h1>
        <p className="text-gray-600 mt-2">
          Monitorea el progreso de las evaluaciones asignadas
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.total}
            </p>
            <p className="text-sm text-gray-600">Total Asignaciones</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.por_estado.en_progreso}
            </p>
            <p className="text-sm text-gray-600">En Progreso</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.por_estado.completadas}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.vencidas_sin_completar}
            </p>
            <p className="text-sm text-gray-600">Vencidas</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({asignaciones?.length || 0})
          </button>
          <button
            onClick={() => setFiltroEstado('pendiente')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'pendiente'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({estadisticas?.por_estado.pendientes || 0})
          </button>
          <button
            onClick={() => setFiltroEstado('en_progreso')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'en_progreso'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Progreso ({estadisticas?.por_estado.en_progreso || 0})
          </button>
          <button
            onClick={() => setFiltroEstado('completada')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'completada'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completadas ({estadisticas?.por_estado.completadas || 0})
          </button>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      {asignacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay asignaciones
          </h3>
          <p className="text-gray-600 mb-6">
            Aún no has asignado evaluaciones a tus usuarios
          </p>
          <button
            onClick={() => navigate('/evaluaciones-inteligentes/asignar')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Asignar Evaluaciones
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Evaluación
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
              {asignacionesFiltradas.map((asignacion) => (
                <tr key={asignacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {asignacion.usuario_nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {asignacion.usuario_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {asignacion.evaluacion_nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {asignacion.total_preguntas} preguntas
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(asignacion.estado)}`}>
                      {asignacion.estado_display}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {asignacion.preguntas_respondidas}/{asignacion.total_preguntas}
                        </span>
                        <span className="font-semibold">
                          {Number(asignacion.porcentaje_completado || 0).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            Number(asignacion.porcentaje_completado) === 100
                              ? 'bg-green-500'
                              : Number(asignacion.porcentaje_completado) > 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${asignacion.porcentaje_completado}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${getPrioridadColor(asignacion.dias_restantes)}`}>
                    <p className="text-sm font-medium">
                      {new Date(asignacion.fecha_limite).toLocaleDateString()}
                    </p>
                    <p className="text-xs">
                      {asignacion.esta_vencida ? (
                        <span className="text-red-600 font-semibold">¡Vencida!</span>
                      ) : (
                        <span>{asignacion.dias_restantes} días restantes</span>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                    onClick={() => navigate(`/evaluaciones-iq/asignacion/${asignacion.id}/admin`)}
                    className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                    <Eye size={16} />
                    Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};