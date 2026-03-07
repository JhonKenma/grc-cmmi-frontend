// src/pages/EvaluacionesInteligentes/DetalleAsignacionAdmin.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle, User, Clock } from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionDetail } from '@/types/asignacion-iq.types';
import { getEstadoBadgeColor, getPrioridadColor } from '@/types/asignacion-iq.types';

export const DetalleAsignacionAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [asignacion, setAsignacion] = useState<AsignacionEvaluacionDetail | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notasRevision, setNotasRevision] = useState('');

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
      navigate('/evaluaciones-inteligentes/gestionar-asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!asignacion) return;
    
    try {
      setSubmitting(true);
      await asignacionIQApi.aprobar(asignacion.id, notasRevision);
      toast.success('✅ Evaluación aprobada');
      setShowApprovalModal(false);
      cargarAsignacion();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al aprobar evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!asignacion) return;
    
    if (!notasRevision.trim()) {
      toast.error('Debes proporcionar comentarios al rechazar');
      return;
    }
    
    try {
      setSubmitting(true);
      await asignacionIQApi.rechazar(asignacion.id, notasRevision);
      toast.success('Evaluación rechazada. El usuario fue notificado.');
      setShowRejectModal(false);
      cargarAsignacion();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al rechazar evaluación');
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate('/evaluaciones-inteligentes/gestionar-asignaciones')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Volver a Gestionar Asignaciones
          </button>
        </div>
      </div>
    );
  }

  const progreso = Number(asignacion.porcentaje_completado || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/gestionar-asignaciones')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Gestionar Asignaciones
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Revisión de Evaluación
            </h1>
            <p className="text-gray-600 mt-2">
              {asignacion.evaluacion_detail.nombre}
            </p>
          </div>
          
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEstadoBadgeColor(asignacion.estado)}`}>
            {asignacion.estado_display}
          </span>
        </div>
      </div>

      {/* Info del Usuario y Evaluación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Usuario Asignado */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Usuario Asignado
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Nombre</dt>
              <dd className="text-base font-medium text-gray-900">
                {asignacion.usuario_detail.nombre}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Email</dt>
              <dd className="text-base font-medium text-gray-900">
                {asignacion.usuario_detail.email}
              </dd>
            </div>
            {asignacion.usuario_detail.cargo && (
              <div>
                <dt className="text-sm text-gray-600">Cargo</dt>
                <dd className="text-base font-medium text-gray-900">
                  {asignacion.usuario_detail.cargo}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Información de la Evaluación */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de la Evaluación
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
                Nivel {asignacion.evaluacion_detail.nivel_deseado}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Total Preguntas</dt>
              <dd className="text-base font-medium text-gray-900">
                {asignacion.total_preguntas}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Fechas y Tiempos */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cronología
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Asignado</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(asignacion.fecha_asignacion).toLocaleDateString('es-ES')}
            </p>
          </div>
          
          {asignacion.fecha_inicio_real && (
            <div>
              <p className="text-sm text-gray-600">Iniciado</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(asignacion.fecha_inicio_real).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
          
          {asignacion.fecha_completado && (
            <div>
              <p className="text-sm text-gray-600">Completado</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(asignacion.fecha_completado).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600">Fecha Límite</p>
            <p className={`text-base font-medium ${getPrioridadColor(asignacion.dias_restantes)}`}>
              {new Date(asignacion.fecha_limite).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        {asignacion.tiempo_usado && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <Clock className="inline mr-1" size={16} />
              Tiempo usado: {asignacion.tiempo_usado.toFixed(1)} horas
            </p>
          </div>
        )}
      </div>

      {/* Progreso */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progreso de Respuesta
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
      </div>

      {/* Notas */}
      {asignacion.notas_asignacion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notas de Asignación
          </h3>
          <p className="text-gray-700">{asignacion.notas_asignacion}</p>
        </div>
      )}

      {/* Notas de Revisión (si existen) */}
      {asignacion.notas_revision && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Comentarios de Revisión
          </h3>
          <p className="text-gray-700">{asignacion.notas_revision}</p>
          {asignacion.revisado_por_nombre && (
            <p className="text-sm text-gray-600 mt-2">
              Por: {asignacion.revisado_por_nombre}
            </p>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-4">
        {asignacion.estado === 'completada' && (
          <>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
            >
              <XCircle size={20} className="mr-2" />
              Rechazar
            </button>
            
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle size={20} className="mr-2" />
              Aprobar Evaluación
            </button>
          </>
        )}

        <button
          onClick={() => navigate(`/evaluaciones/${asignacion.evaluacion}/responder`)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Ver Respuestas
        </button>
      </div>

      {/* Modal de Aprobación */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Aprobar Evaluación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas aprobar esta evaluación?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                value={notasRevision}
                onChange={(e) => setNotasRevision(e.target.value)}
                rows={4}
                placeholder="Añade comentarios para el usuario..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprobar}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Aprobando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Rechazar Evaluación
            </h3>
            <p className="text-gray-600 mb-6">
              Proporciona comentarios explicando por qué se rechaza esta evaluación.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios de Revisión *
              </label>
              <textarea
                value={notasRevision}
                onChange={(e) => setNotasRevision(e.target.value)}
                rows={4}
                placeholder="Explica qué debe corregirse..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={submitting || !notasRevision.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};