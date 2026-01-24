// src/components/proyectos-remediacion/ModalEditarItem.tsx

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/common';
import {
  ProyectoRemediacionDetail,
  ItemProyecto,
  ActualizarItemFormData,
  EstadoItem,
} from '@/types/proyecto-remediacion.types';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { ESTADOS_ITEM_OPTIONS } from '@/types/proyecto-remediacion.types';
import toast from 'react-hot-toast';

interface ModalEditarItemProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: ProyectoRemediacionDetail;
  item: ItemProyecto;
  onSuccess?: () => void;
}

export const ModalEditarItem: React.FC<ModalEditarItemProps> = ({
  isOpen,
  onClose,
  proyecto,
  item,
  onSuccess,
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ActualizarItemFormData>({
    item_id: item.id,
    estado: item.estado,
    porcentaje_avance: item.porcentaje_avance,
    presupuesto_ejecutado: item.presupuesto_ejecutado,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.porcentaje_avance !== undefined) {
      if (formData.porcentaje_avance < 0 || formData.porcentaje_avance > 100) {
        newErrors.porcentaje_avance = 'El avance debe estar entre 0 y 100';
      }
    }
    
    if (formData.presupuesto_ejecutado !== undefined && formData.presupuesto_ejecutado < 0) {
      newErrors.presupuesto_ejecutado = 'El presupuesto no puede ser negativo';
    }
    
    if (formData.estado === 'completado' && formData.porcentaje_avance !== 100) {
      newErrors.porcentaje_avance = 'El avance debe ser 100% si el estado es completado';
    }
    
    if ((formData.estado === 'en_proceso' || formData.estado === 'completado') && !item.puede_iniciar) {
      newErrors.estado = 'Este ítem está bloqueado. Debe completarse primero su dependencia';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      await proyectosRemediacionApi.actualizarItem(proyecto.id, formData);
      
      toast.success('Ítem actualizado exitosamente');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error al actualizar ítem:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el ítem');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (field: keyof ActualizarItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Auto-ajustar porcentaje según estado
  const handleEstadoChange = (nuevoEstado: EstadoItem) => {
    let nuevoPorcentaje = formData.porcentaje_avance;
    
    if (nuevoEstado === 'completado') {
      nuevoPorcentaje = 100;
    } else if (nuevoEstado === 'pendiente') {
      nuevoPorcentaje = 0;
    }
    
    setFormData(prev => ({
      ...prev,
      estado: nuevoEstado,
      porcentaje_avance: nuevoPorcentaje,
    }));
    
    if (errors.estado) {
      setErrors(prev => ({ ...prev, estado: '' }));
    }
  };
  
  if (!isOpen) return null;
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Actualizar Ítem</h2>
            <p className="text-sm text-gray-600 mt-1">
              #{item.numero_item} - {item.nombre_item}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Info del Ítem */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Responsable</p>
              <p className="font-medium text-gray-900">{item.responsable_nombre}</p>
            </div>
            <div>
              <p className="text-gray-600">Presupuesto Planificado</p>
              <p className="font-medium text-gray-900">
                {item.presupuesto_planificado.toLocaleString()} {proyecto.moneda}
              </p>
            </div>
            {item.requiere_proveedor && (
              <div>
                <p className="text-gray-600">Proveedor</p>
                <p className="font-medium text-gray-900">{item.proveedor_nombre || 'N/A'}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Cronograma</p>
              <p className="font-medium text-gray-900">
                {new Date(item.fecha_inicio).toLocaleDateString()} - {new Date(item.fecha_fin).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Ítem
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleEstadoChange(e.target.value as EstadoItem)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.estado ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!item.puede_iniciar && (formData.estado === 'pendiente' || formData.estado === 'bloqueado')}
            >
              {ESTADOS_ITEM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="text-xs text-red-600 mt-1">{errors.estado}</p>
            )}
            {!item.puede_iniciar && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                ⚠️ Este ítem está bloqueado por una dependencia
              </p>
            )}
          </div>
          
          {/* Porcentaje de Avance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp size={16} className="inline mr-1" />
              Porcentaje de Avance
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.porcentaje_avance}
                onChange={(e) => handleChange('porcentaje_avance', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={formData.estado === 'completado' || formData.estado === 'bloqueado'}
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.porcentaje_avance}
                  onChange={(e) => handleChange('porcentaje_avance', Number(e.target.value))}
                  className={`w-20 px-3 py-1 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.porcentaje_avance ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={formData.estado === 'completado' || formData.estado === 'bloqueado'}
                />
                <span className="text-2xl font-bold text-blue-600">
                  {formData.porcentaje_avance}%
                </span>
              </div>
            </div>
            {errors.porcentaje_avance && (
              <p className="text-xs text-red-600 mt-1">{errors.porcentaje_avance}</p>
            )}
          </div>
          
          {/* Presupuesto Ejecutado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Presupuesto Ejecutado
            </label>
            <input
              type="number"
              value={formData.presupuesto_ejecutado}
              onChange={(e) => handleChange('presupuesto_ejecutado', Number(e.target.value))}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.presupuesto_ejecutado ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.presupuesto_ejecutado && (
              <p className="text-xs text-red-600 mt-1">{errors.presupuesto_ejecutado}</p>
            )}
            
            {/* Indicador de diferencia */}
            {formData.presupuesto_ejecutado !== undefined && formData.presupuesto_ejecutado > 0 && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Diferencia:</span>
                  <span className={`font-semibold ${
                    formData.presupuesto_ejecutado > item.presupuesto_planificado
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {formData.presupuesto_ejecutado > item.presupuesto_planificado ? '+' : ''}
                    {(formData.presupuesto_ejecutado - item.presupuesto_planificado).toLocaleString()} {proyecto.moneda}
                  </span>
                </div>
                {formData.presupuesto_ejecutado > item.presupuesto_planificado && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ El presupuesto ejecutado supera el planificado
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};