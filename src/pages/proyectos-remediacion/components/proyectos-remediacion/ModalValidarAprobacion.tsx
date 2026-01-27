// src/components/proyectos-remediacion/ModalValidarAprobacion.tsx

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/common';
import toast from 'react-hot-toast';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import type { AprobacionGAPDetail } from '@/types/proyecto-remediacion.types';
import { formatearFecha } from '@/types/proyecto-remediacion.types';

interface ModalValidarAprobacionProps {
  aprobacion: AprobacionGAPDetail;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalValidarAprobacion: React.FC<ModalValidarAprobacionProps> = ({
  aprobacion,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [observaciones, setObservaciones] = useState('');
  
  // ⭐ Extraer el proyecto para facilitar el acceso
  const proyecto = aprobacion.proyecto_info;
  
  const handleAprobar = async () => {
      try {
        setLoading(true);
        
        await proyectosRemediacionApi.aprobarCierreGAP(aprobacion.proyecto, {
          observaciones,
        });
        
      toast.success('GAP aprobado exitosamente');
      onSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('Error al aprobar:', err);
      
      // 1. Extraemos el mensaje detallado del backend si existe
      // A veces viene en err.response.data.detail o err.response.data.error
      const errorData = err.response?.data;
      const mensajeError = errorData?.detail || errorData?.error || errorData?.message || 'Error interno en el servidor';
      
      // 2. Mostramos el error específico en el toast
      toast.error(`Error: ${mensajeError}`, {
        duration: 5000, // Le damos más tiempo para que puedas leerlo
      });

      // 3. Tip: Si el error es 500, el backend probablemente se cayó.
      if (err.response?.status === 500) {
        console.warn('⚠️ El servidor tuvo un error crítico. Revisa los logs de Django.');
      }

    } finally {
      setLoading(false);
    }
  };
  
  const handleRechazar = async () => {
    if (!observaciones.trim()) {
      toast.error('Las observaciones son obligatorias al rechazar');
      return;
    }
    
    try {
      setLoading(true);
      
      await proyectosRemediacionApi.rechazarCierreGAP(aprobacion.proyecto, {
        observaciones,
      });
      
      toast.success('Solicitud rechazada. Se ha notificado al responsable.');
      onSuccess();
      onClose();
      
    } catch (err) {
      console.error('Error al rechazar:', err);
      toast.error('Error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Validar Cierre de GAP
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {/* ✅ CORREGIDO: Usar proyecto_info */}
              {proyecto.codigo_proyecto} - {proyecto.nombre_proyecto}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información del Solicitante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información de la Solicitud</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700">Solicitado por:</p>
                <p className="font-medium text-blue-900">{aprobacion.solicitado_por_info.nombre_completo}</p>
              </div>
              <div>
                <p className="text-blue-700">Fecha de solicitud:</p>
                <p className="font-medium text-blue-900">{formatearFecha(aprobacion.fecha_solicitud)}</p>
              </div>
            </div>
            
            {aprobacion.comentarios_solicitud && (
              <div className="mt-3">
                <p className="text-blue-700 text-sm">Comentarios:</p>
                <p className="text-blue-900 mt-1">{aprobacion.comentarios_solicitud}</p>
              </div>
            )}
          </div>
          
          {/* Métricas del Proyecto */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
              <p className="text-xs text-purple-700 font-medium">GAP Original</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{aprobacion.gap_original}</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-200">
              <p className="text-xs text-green-700 font-medium">Completitud</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {Math.round(aprobacion.porcentaje_completitud)}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                {aprobacion.items_completados}/{aprobacion.items_totales} ítems
              </p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">Presupuesto</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {Math.round(aprobacion.porcentaje_presupuesto_usado)}%
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {aprobacion.presupuesto_ejecutado} / {aprobacion.presupuesto_planificado}
              </p>
            </Card>
          </div>
          
          {/* Alerta si no está al 100% */}
          {aprobacion.porcentaje_completitud < 100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Advertencia</p>
                <p className="text-sm text-yellow-700 mt-1">
                  El proyecto no está completamente terminado. Verifica si esto es aceptable antes de aprobar.
                </p>
              </div>
            </div>
          )}
          
          {/* Decisión */}
          {!accion && (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">¿Qué deseas hacer con esta solicitud?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAccion('aprobar')}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all flex items-center gap-3"
                >
                  <CheckCircle size={24} className="text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-green-900">Aprobar</p>
                    <p className="text-xs text-green-700">Cerrar el GAP</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setAccion('rechazar')}
                  className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all flex items-center gap-3"
                >
                  <XCircle size={24} className="text-red-600" />
                  <div className="text-left">
                    <p className="font-semibold text-red-900">Rechazar</p>
                    <p className="text-xs text-red-700">Solicitar correcciones</p>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Formulario de Observaciones */}
          {accion && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {accion === 'aprobar' ? 'Aprobar Cierre de GAP' : 'Rechazar Solicitud'}
                </h3>
                <button
                  onClick={() => {
                    setAccion(null);
                    setObservaciones('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cambiar
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones {accion === 'rechazar' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    accion === 'aprobar'
                      ? 'Agrega comentarios sobre la aprobación (opcional)...'
                      : 'Explica por qué se rechaza y qué debe corregirse (obligatorio)...'
                  }
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          
          {accion === 'aprobar' && (
            <button
              onClick={handleAprobar}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {loading ? 'Aprobando...' : 'Aprobar Cierre'}
            </button>
          )}
          
          {accion === 'rechazar' && (
            <button
              onClick={handleRechazar}
              disabled={loading || !observaciones.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <XCircle size={18} />
              {loading ? 'Rechazando...' : 'Rechazar Solicitud'}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};