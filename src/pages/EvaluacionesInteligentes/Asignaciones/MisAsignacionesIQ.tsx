// src/pages/EvaluacionesInteligentes/Asignaciones/MisAsignacionesIQ.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Clock, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionIQ, MisAsignacionesResponse } from '@/types/asignacion-iq.types';
import { getEstadoBadgeColor, getPrioridadColor } from '@/types/asignacion-iq.types';

export const MisAsignacionesIQ = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MisAsignacionesResponse | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    cargarAsignaciones();
  }, [filtroEstado]);

  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await asignacionIQApi.misAsignaciones(filtroEstado || undefined);
      setData(response);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
      toast.error('Error al cargar tus asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (asignacionId: number) => {
    try {
      await asignacionIQApi.iniciar(asignacionId);
      toast.success('✅ Evaluación iniciada');
      cargarAsignaciones();
      navigate(`/evaluaciones-iq/asignacion/${asignacionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar evaluación');
    }
  };

  const handleContinuar = (asignacionId: number) => {
    navigate(`/evaluaciones-iq/asignacion/${asignacionId}`);
  };

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
          Mis Evaluaciones Asignadas
        </h1>
        <p className="text-gray-600 mt-2">
          Evaluaciones que debes completar
        </p>
      </div>

      {/* Estadísticas */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.estadisticas.total}
            </p>
            <p className="text-sm text-gray-600">Total Asignadas</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.estadisticas.pendientes}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Play className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.estadisticas.en_progreso}
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
              {data.estadisticas.completadas}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroEstado('pendiente')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'pendiente'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltroEstado('en_progreso')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'en_progreso'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setFiltroEstado('completada')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filtroEstado === 'completada'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      {data && data.asignaciones.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay evaluaciones asignadas
          </h3>
          <p className="text-gray-600">
            Actualmente no tienes evaluaciones pendientes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.asignaciones.map((asignacion) => (
            <div
              key={asignacion.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {asignacion.evaluacion_nombre}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(asignacion.estado)}`}>
                      {asignacion.estado_display}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">📅 Asignado:</span> {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                    </div>
                    <div className={getPrioridadColor(asignacion.dias_restantes)}>
                      <span className="font-medium">⏰ Fecha límite:</span> {new Date(asignacion.fecha_limite).toLocaleDateString()}
                      {asignacion.esta_vencida ? (
                        <span className="ml-2 text-red-600 font-semibold">¡Vencida!</span>
                      ) : (
                        <span className="ml-2">({asignacion.dias_restantes} días)</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">❓ Preguntas:</span> {asignacion.total_preguntas}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Progreso</span>
                  <span className="font-semibold text-gray-900">
                    {asignacion.preguntas_respondidas}/{asignacion.total_preguntas} ({Number(asignacion.porcentaje_completado || 0).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
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

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3">
                {asignacion.estado === 'pendiente' && (
                  <button
                    onClick={() => handleIniciar(asignacion.id)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Play size={18} className="mr-2" />
                    Iniciar Evaluación
                  </button>
                )}

                {asignacion.estado === 'en_progreso' && (
                  <button
                    onClick={() => handleContinuar(asignacion.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continuar
                  </button>
                )}

                {['completada', 'revisada', 'aprobada', 'rechazada'].includes(asignacion.estado) && (
                  <button
                    onClick={() => navigate(`/evaluaciones-iq/asignacion/${asignacion.id}`)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Ver Resultados
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};