// src/components/asignaciones/ModalRevisarAsignacion.tsx

import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { Asignacion } from '@/types';
import toast from 'react-hot-toast';

interface ModalRevisarAsignacionProps {
  asignacion: Asignacion;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>; // ⭐ Ahora retorna Promise
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

  if (!isOpen) return null;

  const usuarioNombre = asignacion.usuario_asignado_info?.nombre_completo || 
                        asignacion.usuario_asignado_nombre || 
                        'Sin nombre';
  
  const dimensionNombre = asignacion.dimension_info?.nombre || 
                         asignacion.dimension_nombre || 
                         'Sin dimensión';

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
      
      console.log('📤 Enviando revisión:', { accion, asignacionId: asignacion.id });

      const response = await asignacionesApi.revisar(asignacion.id, {
        accion,
        comentarios: comentarios.trim() || undefined,
      });
      
      console.log('✅ Respuesta del backend:', response);

      toast.success(
        accion === 'aprobar'
          ? '✅ Asignación aprobada exitosamente'
          : '❌ Asignación rechazada. El usuario deberá completarla nuevamente.'
      );

      console.log('🔄 Llamando a onSuccess...');
      await onSuccess();
      console.log('✅ onSuccess completado');
      
      console.log('🚪 Cerrando modal...');
      onClose();
      console.log('✅ Modal cerrado');
      
    } catch (error: any) {
      console.error('❌ Error en revisión:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al procesar la revisión';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Revisar Asignación</h2>
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
          {/* Información de la asignación */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-sm text-gray-600">Usuario:</span>
              <span className="ml-2 font-medium text-gray-900">
                {usuarioNombre}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Dimensión:</span>
              <span className="ml-2 font-medium text-gray-900">
                {dimensionNombre}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Progreso:</span>
              <span className="ml-2 font-medium text-gray-900">
                {asignacion.preguntas_respondidas} / {asignacion.total_preguntas} preguntas
                ({Number(asignacion.porcentaje_avance || 0).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar acción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Qué deseas hacer? <span className="text-red-500">*</span>
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
                  <p className="text-xs text-gray-600 mt-1">
                    Marcar como completada
                  </p>
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
                  <p className="text-xs text-gray-600 mt-1">
                    Solicitar correcciones
                  </p>
                </button>
              </div>
            </div>

            {/* Comentarios */}
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

            {/* Botones */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || !accion}
              >
                {submitting ? 'Procesando...' : 'Confirmar Revisión'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};