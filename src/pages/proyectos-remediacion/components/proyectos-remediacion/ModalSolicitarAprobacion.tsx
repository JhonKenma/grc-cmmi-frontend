// src/components/proyectos-remediacion/ModalSolicitarAprobacion.tsx

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Card } from '@/components/common';
import toast from 'react-hot-toast';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import type { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ModalSolicitarAprobacionProps {
  proyecto: ProyectoRemediacionDetail;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalSolicitarAprobacion: React.FC<ModalSolicitarAprobacionProps> = ({
  proyecto,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [comentarios, setComentarios] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Asegúrate de que 'comentarios' no sea null o vacío si el backend lo requiere
      const data = {
        comentarios: comentarios.trim() || "Solicitud de cierre enviada por el responsable."
      };

      await proyectosRemediacionApi.solicitarAprobacion(proyecto.id, data);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      // ⭐ TIP: Imprime el error específico del backend para no adivinar
      console.error("Detalle del error 400:", err.response?.data);
      alert(err.response?.data?.message || err.response?.data?.error || "Error en la solicitud");
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar si todos los ítems están completados
  const todosItemsCompletados = 
    proyecto.modo_presupuesto === 'global' || 
    proyecto.items_completados === proyecto.total_items;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Solicitar Aprobación de Cierre
              </h2>
              <p className="text-sm text-gray-600">
                {proyecto.codigo_proyecto}
              </p>
            </div>
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
          {/* Resumen del Proyecto */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Resumen del Proyecto</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Dimensión:</p>
                <p className="font-medium">{proyecto.dimension_nombre}</p>
              </div>
              
              <div>
                <p className="text-gray-600">GAP Original:</p>
                <p className="font-medium">{proyecto.gap_original}</p>
              </div>
              
              {proyecto.modo_presupuesto === 'por_items' && (
                <>
                  <div>
                    <p className="text-gray-600">Ítems Completados:</p>
                    <p className="font-medium">
                      {proyecto.items_completados} / {proyecto.total_items}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Avance:</p>
                    <p className="font-medium">{proyecto.porcentaje_avance_items}%</p>
                  </div>
                </>
              )}
              
              <div>
                <p className="text-gray-600">Presupuesto Ejecutado:</p>
                <p className="font-medium">
                  {proyecto.presupuesto_total_ejecutado} / {proyecto.presupuesto_total_planificado}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">% Presupuesto Gastado:</p>
                <p className="font-medium">{proyecto.porcentaje_presupuesto_gastado}%</p>
              </div>
            </div>
          </div>
          
          {/* Validación de Ítems */}
          {!todosItemsCompletados && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">No se puede solicitar aprobación</p>
                <p className="text-sm text-red-700 mt-1">
                  Aún hay {proyecto.total_items - proyecto.items_completados} ítem(s) pendiente(s) de completar.
                  Todos los ítems deben estar en estado "Completado" antes de solicitar la aprobación.
                </p>
              </div>
            </div>
          )}
          
          {todosItemsCompletados && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Proyecto listo para validación</p>
                <p className="text-sm text-green-700 mt-1">
                  Todos los ítems han sido completados. El validador revisará el proyecto
                  y decidirá si aprobar o rechazar el cierre del GAP.
                </p>
              </div>
            </div>
          )}
          
          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios Adicionales (Opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Agrega cualquier información relevante para el validador..."
              disabled={!todosItemsCompletados}
            />
          </div>
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
          <button
            onClick={handleSubmit}
            disabled={!todosItemsCompletados || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </Card>
    </div>
  );
};