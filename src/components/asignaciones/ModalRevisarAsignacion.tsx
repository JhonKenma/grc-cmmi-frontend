// src/components/asignaciones/ModalRevisarAsignacion.tsx - SIN validaciones de justificacion_madurez

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/common';
import { asignacionesApi, respuestasApi } from '@/api/endpoints';
import { Asignacion, Respuesta } from '@/types';
import { TablaRespuestasRevision } from '@/pages/asignaciones/TablaRespuestasRevision';
import toast from 'react-hot-toast';

interface ModalRevisarAsignacionProps {
  asignacion: Asignacion;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const ModalRevisarAsignacion: React.FC<ModalRevisarAsignacionProps> = ({
  asignacion,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(true);

  const usuarioNombre =
    asignacion.usuario_asignado_info?.nombre_completo ||
    asignacion.usuario_asignado_nombre ||
    'Sin nombre';

  const dimensionNombre =
    asignacion.dimension_info?.nombre || asignacion.dimension_nombre || 'Sin dimensión';

  useEffect(() => {
    if (isOpen) {
      cargarRespuestas();
    }
  }, [isOpen, asignacion.id]);

  const cargarRespuestas = async () => {
    try {
      setLoadingRespuestas(true);
      
      const data = await respuestasApi.listParaRevision(asignacion.id);
      
      console.log('🔍 Respuestas para revisión:', data);
      console.log('🔍 Primera respuesta:', data.results[0]);
      console.log('🔍 Evidencias primera:', data.results[0]?.evidencias);
      
      setRespuestas(data.results);
    } catch (error) {
      console.error('❌ Error al cargar respuestas:', error);
      toast.error('Error al cargar las respuestas');
    } finally {
      setLoadingRespuestas(false);
    }
  };

  // ⭐ ACTUALIZADO: Nivel de madurez sin justificacion_madurez obligatoria
  const handleEditarRespuesta = async (
    respuestaId: string,
    datos: { 
      respuesta: string; 
      justificacion: string;
      nivel_madurez: number;
      justificacion_madurez: string; // ⭐ Opcional
    }
  ) => {
    try {
      const payload: any = {
        respuesta: datos.respuesta,
        justificacion: datos.justificacion,
        nivel_madurez: datos.nivel_madurez,
        justificacion_madurez: datos.justificacion_madurez, // ⭐ Se envía pero es opcional
        motivo_modificacion: 'Modificado durante revisión por administrador',
      };

      await respuestasApi.modificarAdmin(respuestaId, payload);

      toast.success('Respuesta actualizada exitosamente');
      await cargarRespuestas();
    } catch (error: any) {
      console.error('Error al editar respuesta:', error);
      
      const errorMsg = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Error al actualizar la respuesta';
      
      toast.error(errorMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accion) {
      toast.error('Selecciona una acción');
      return;
    }

    if (accion === 'rechazar' && !comentarios.trim()) {
      toast.error('Debes proporcionar comentarios al rechazar');
      return;
    }

    try {
      setSubmitting(true);

      await asignacionesApi.revisar(asignacion.id, {
        accion,
        comentarios: comentarios.trim() || undefined,
      });

      toast.success(
        accion === 'aprobar'
          ? '✅ Asignación aprobada exitosamente'
          : '❌ Asignación rechazada. El usuario deberá completarla nuevamente.'
      );

      await onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al procesar la revisión';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Revisar Asignación</h2>
            <p className="text-sm text-gray-600 mt-1">
              {usuarioNombre} - {dimensionNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información resumida */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(asignacion.porcentaje_avance || 0).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Preguntas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asignacion.preguntas_respondidas} / {asignacion.total_preguntas}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Estado</p>
                <p className="text-sm font-semibold text-yellow-700 uppercase mt-1">
                  Pendiente Revisión
                </p>
              </div>
            </div>
          </div>

          {/* Tabs: Ver / Editar */}
          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setModoEdicion(false)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                !modoEdicion
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              Ver Respuestas
            </button>
            <button
              onClick={() => setModoEdicion(true)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                modoEdicion
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit size={16} className="inline mr-2" />
              Editar Respuestas
            </button>
          </div>

          {/* Lista de respuestas */}
          {loadingRespuestas ? (
            <LoadingScreen message="Cargando respuestas..." />
          ) : (
            <TablaRespuestasRevision
              respuestas={respuestas}
              modoEdicion={modoEdicion}
              onEditarRespuesta={handleEditarRespuesta}
            />
          )}

          {/* Formulario de decisión */}
          <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Decisión Final <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccion('aprobar')}
                  disabled={submitting}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    accion === 'aprobar'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CheckCircle
                    size={32}
                    className={`mx-auto mb-2 ${
                      accion === 'aprobar' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-medium text-gray-900">Aprobar</p>
                  <p className="text-xs text-gray-600 mt-1">Marcar como completada</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccion('rechazar')}
                  disabled={submitting}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    accion === 'rechazar'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <XCircle
                    size={32}
                    className={`mx-auto mb-2 ${
                      accion === 'rechazar' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-medium text-gray-900">Rechazar</p>
                  <p className="text-xs text-gray-600 mt-1">Solicitar correcciones</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios {accion === 'rechazar' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                disabled={submitting}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                placeholder={
                  accion === 'rechazar'
                    ? 'Explica qué debe corregir el usuario...'
                    : 'Comentarios opcionales sobre la revisión...'
                }
                required={accion === 'rechazar'}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" size="lg" disabled={submitting || !accion}>
                {submitting ? 'Procesando...' : 'Confirmar Revisión'}
              </Button>

              <Button type="button" variant="secondary" size="lg" onClick={onClose} disabled={submitting}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};