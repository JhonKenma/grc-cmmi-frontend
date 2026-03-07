// src/pages/EvaluacionesInteligentes/Asignaciones/DetalleAsignacion.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionDetail } from '@/types/asignacion-iq.types';
import { getEstadoBadgeColor, getPrioridadColor } from '@/types/asignacion-iq.types';

export const DetalleAsignacion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [asignacion, setAsignacion] = useState<AsignacionEvaluacionDetail | null>(null);

  useEffect(() => {
    if (id) {
      cargarAsignacion();
    }
  }, [id]);

  const cargarAsignacion = async () => {
    try {
      setLoading(true);
      const data = await asignacionIQApi.obtener(Number(id));
      setAsignacion(data);
    } catch (error) {
      console.error('Error al cargar asignación:', error);
      toast.error('Error al cargar la asignación');
      navigate('/evaluaciones-iq/mis-asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async () => {
    if (!asignacion) return;
    await asignacionIQApi.iniciar(asignacion.id);
    navigate(`/evaluaciones-iq/responder/${asignacion.id}`);  // ⭐ NUEVA RUTA
  };

  const handleContinuar = () => {
    if (!asignacion) return;
    navigate(`/evaluaciones-iq/responder/${asignacion.id}`);  // ⭐ NUEVA RUTA
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!asignacion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Asignación no encontrada
          </h2>
          <button
            onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Volver a Mis Asignaciones
          </button>
        </div>
      </div>
    );
  }

  const progreso = Number(asignacion.porcentaje_completado || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Mis Asignaciones
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {asignacion.evaluacion_detail.nombre}
            </h1>
            <p className="text-gray-600 mt-2">
              {asignacion.evaluacion_detail.descripcion}
            </p>
          </div>
          
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEstadoBadgeColor(asignacion.estado)}`}>
            {asignacion.estado_display}
          </span>
        </div>
      </div>

      {/* Información de la Evaluación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información General
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Frameworks</dt>
              <dd className="text-base font-medium text-gray-900">
                {asignacion.evaluacion_detail.frameworks.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Nivel Deseado</dt>
              <dd className="text-base font-medium text-gray-900">
                Nivel {asignacion.evaluacion_detail.nivel_deseado} - {asignacion.evaluacion_detail.nivel_deseado_display}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Total de Preguntas</dt>
              <dd className="text-base font-medium text-gray-900">
                {asignacion.total_preguntas} preguntas
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fechas y Plazos
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Asignado el</dt>
              <dd className="text-base font-medium text-gray-900">
                {new Date(asignacion.fecha_asignacion).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Fecha de Inicio</dt>
              <dd className="text-base font-medium text-gray-900">
                {new Date(asignacion.fecha_inicio).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Fecha Límite</dt>
              <dd className={`text-base font-medium ${getPrioridadColor(asignacion.dias_restantes)}`}>
                {new Date(asignacion.fecha_limite).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                {asignacion.esta_vencida ? (
                  <span className="ml-2 text-red-600 font-semibold">¡Vencida!</span>
                ) : (
                  <span className="ml-2 text-gray-600">({asignacion.dias_restantes} días restantes)</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notas de Asignación */}
      {asignacion.notas_asignacion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <AlertCircle className="text-blue-600 mr-2" size={20} />
            Notas del Administrador
          </h3>
          <p className="text-gray-700">{asignacion.notas_asignacion}</p>
        </div>
      )}

      {/* Progreso */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tu Progreso
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              Preguntas respondidas: {asignacion.preguntas_respondidas} de {asignacion.total_preguntas}
            </span>
            <span className="font-semibold text-gray-900">
              {progreso.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                progreso === 100
                  ? 'bg-green-500'
                  : progreso > 50
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {asignacion.fecha_inicio_real && (
          <p className="text-sm text-gray-600">
            <Clock className="inline mr-1" size={16} />
            Iniciada el {new Date(asignacion.fecha_inicio_real).toLocaleDateString('es-ES')}
          </p>
        )}
      </div>

      {/* Resultados (si está completada) */}
      {asignacion.estado === 'completada' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Evaluación Completada
              </h3>
              <p className="text-gray-700">
                Has completado todas las preguntas de esta evaluación. Tu administrador revisará tus respuestas pronto.
              </p>
              {asignacion.fecha_completado && (
                <p className="text-sm text-gray-600 mt-2">
                  Completada el {new Date(asignacion.fecha_completado).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resultado de Revisión */}
      {asignacion.estado === 'aprobada' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <CheckCircle className="text-emerald-600 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Evaluación Aprobada
              </h3>
              <p className="text-gray-700">
                Tu evaluación ha sido aprobada por {asignacion.revisado_por_nombre}.
              </p>
              {asignacion.notas_revision && (
                <div className="mt-3 p-3 bg-white rounded border border-emerald-200">
                  <p className="text-sm font-medium text-gray-700">Comentarios:</p>
                  <p className="text-sm text-gray-600 mt-1">{asignacion.notas_revision}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {asignacion.estado === 'rechazada' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚠️ Requiere Correcciones
              </h3>
              <p className="text-gray-700">
                Tu evaluación requiere correcciones. Por favor revisa los comentarios y realiza los ajustes necesarios.
              </p>
              {asignacion.notas_revision && (
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <p className="text-sm font-medium text-gray-700">Comentarios del revisor:</p>
                  <p className="text-sm text-gray-600 mt-1">{asignacion.notas_revision}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-4">
        {asignacion.estado === 'pendiente' && (
          <button
            onClick={handleIniciar}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-lg"
          >
            <Play size={20} className="mr-2" />
            Iniciar Evaluación
          </button>
        )}

        {asignacion.estado === 'en_progreso' && (
          <button
            onClick={handleContinuar}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Continuar Evaluación
          </button>
        )}

        {(asignacion.estado === 'rechazada' || asignacion.estado === 'en_progreso') && (
          <button
            onClick={handleContinuar}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ver Respuestas
          </button>
        )}
      </div>
    </div>
  );
};