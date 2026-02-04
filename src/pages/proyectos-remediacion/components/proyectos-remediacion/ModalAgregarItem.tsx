// src/components/proyectos-remediacion/ModalAgregarItem.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Package,
  Users,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/common';
import {
  ProyectoRemediacionDetail,
  ItemProyecto,
  CrearItemFormData,
} from '@/types/proyecto-remediacion.types';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { usuariosApi } from '@/api/endpoints';
import axiosInstance from '@/api/axios';
import toast from 'react-hot-toast';
import { Usuario } from '@/types';
import axios from 'axios';

interface ModalAgregarItemProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: ProyectoRemediacionDetail;
  itemsExistentes: ItemProyecto[];
  onSuccess?: () => void;
}

export const ModalAgregarItem: React.FC<ModalAgregarItemProps> = ({
  isOpen,
  onClose,
  proyecto,
  itemsExistentes,
  onSuccess,
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<CrearItemFormData>({
    nombre_item: '',
    descripcion: '',
    requiere_proveedor: false,
    responsable_ejecucion_id: '',
    presupuesto_planificado: 0,
    fecha_inicio: proyecto.fecha_inicio,
    duracion_dias: 5,
    tiene_dependencia: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // ═══════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (isOpen) {
      loadUsuarios();
      loadProveedores();
    }
  }, [isOpen]);
  
  const loadUsuarios = async () => {
    try {
      const response = await usuariosApi.list();
      const lista = Array.isArray(response) ? response : (response as any)?.results || [];
      setUsuarios(lista);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };
  
  const loadProveedores = async () => {
    try {
      // Cargar proveedores desde la API
      const response = await axiosInstance.get('/proveedores/', {
        params: { activo: true }
      });
      const lista = Array.isArray(response.data) 
        ? response.data 
        : response.data?.results || [];
      setProveedores(lista);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('No se pudieron cargar los proveedores');
      setProveedores([]);
    }
  };
  
  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre_item.trim()) {
      newErrors.nombre_item = 'El nombre del ítem es requerido';
    }
    
    if (!formData.responsable_ejecucion_id) {
      newErrors.responsable_ejecucion_id = 'Debe seleccionar un responsable';
    }
    
    if (formData.requiere_proveedor && !formData.proveedor_id) {
      newErrors.proveedor_id = 'Debe seleccionar un proveedor';
    }
    
    if (formData.presupuesto_planificado < 0) {
      newErrors.presupuesto_planificado = 'El presupuesto no puede ser negativo';
    }
    
    if (formData.duracion_dias <= 0) {
      newErrors.duracion_dias = 'La duración debe ser mayor a 0';
    }
    
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    
    // Validar que fecha esté dentro del rango del proyecto
    if (formData.fecha_inicio) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const proyectoInicio = new Date(proyecto.fecha_inicio);
      const proyectoFin = new Date(proyecto.fecha_fin_estimada);
      
      if (fechaInicio < proyectoInicio) {
        newErrors.fecha_inicio = 'No puede ser anterior al inicio del proyecto';
      }
      
      // Calcular fecha fin del ítem
      const fechaFinItem = new Date(fechaInicio);
      fechaFinItem.setDate(fechaFinItem.getDate() + formData.duracion_dias);
      
      if (fechaFinItem > proyectoFin) {
        newErrors.duracion_dias = 'El ítem terminaría después del proyecto';
      }
    }
    
    if (formData.tiene_dependencia && !formData.item_dependencia_id) {
      newErrors.item_dependencia_id = 'Debe seleccionar el ítem del que depende';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    setLoading(true);

    try {
      // 📤 Log de envío
      console.log('📤 Datos que se enviarán:', formData);

      const response = await proyectosRemediacionApi.agregarItem(
        proyecto.id,
        formData
      );

      // ✅ Log de respuesta
      console.log('✅ Respuesta del servidor:', response);

      toast.success('Ítem agregado exitosamente');
      onSuccess?.();
      onClose(); // ✅ cerrar modal correctamente

    } catch (error: unknown) {
      console.error('Error al agregar ítem:', error);

      if (axios.isAxiosError(error)) {
        // 📛 Error proveniente del backend
        console.error('📛 Error completo:', error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          'Error al agregar el ítem';

        toast.error(errorMessage);
      } else {
        // ❓ Error inesperado
        toast.error('Ocurrió un error inesperado');
      }

    } finally {
      setLoading(false);
    }
  };

  
  const handleChange = (field: keyof CrearItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  if (!isOpen) return null;
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Agregar Ítem al Proyecto</h2>
            <p className="text-sm text-gray-600 mt-1">
              Proyecto: {proyecto.nombre_proyecto}
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
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Nombre del Ítem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Ítem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_item}
              onChange={(e) => handleChange('nombre_item', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.nombre_item ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Adquisición de Licencia Antivirus"
            />
            {errors.nombre_item && (
              <p className="text-xs text-red-600 mt-1">{errors.nombre_item}</p>
            )}
          </div>
          
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-gray-500 text-xs">(Opcional)</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales del ítem..."
            />
          </div>
          
          {/* Requiere Proveedor */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiere_proveedor}
                onChange={(e) => handleChange('requiere_proveedor', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <Package size={16} className="inline mr-1" />
                ¿Requiere Proveedor Externo?
              </span>
            </label>
          </div>
          
          {/* Proveedor (condicional) */}
          {formData.requiere_proveedor && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.proveedor_id || ''}
                  onChange={(e) => handleChange('proveedor_id', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.proveedor_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.razon_social}
                    </option>
                  ))}
                </select>
                {errors.proveedor_id && (
                  <p className="text-xs text-red-600 mt-1">{errors.proveedor_id}</p>
                )}
                {proveedores.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No hay proveedores disponibles. Agrega proveedores primero.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable del Proveedor
                </label>
                <input
                  type="text"
                  value={formData.nombre_responsable_proveedor || ''}
                  onChange={(e) => handleChange('nombre_responsable_proveedor', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Responsable de Compras"
                />
              </div>
            </>
          )}
          
          {/* Responsable de Ejecución */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Responsable de Ejecución <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.responsable_ejecucion_id}
              onChange={(e) => handleChange('responsable_ejecucion_id', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.responsable_ejecucion_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar responsable</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre_completo}
                </option>
              ))}
            </select>
            {errors.responsable_ejecucion_id && (
              <p className="text-xs text-red-600 mt-1">{errors.responsable_ejecucion_id}</p>
            )}
          </div>
          
          {/* Presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Presupuesto Planificado
            </label>
            <input
              type="number"
              value={formData.presupuesto_planificado}
              onChange={(e) => handleChange('presupuesto_planificado', Number(e.target.value))}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.presupuesto_planificado ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.presupuesto_planificado && (
              <p className="text-xs text-red-600 mt-1">{errors.presupuesto_planificado}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Moneda: {proyecto.moneda}
            </p>
          </div>
          
          {/* Cronograma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                min={proyecto.fecha_inicio}
                max={proyecto.fecha_fin_estimada}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_inicio && (
                <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (días) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duracion_dias}
                onChange={(e) => handleChange('duracion_dias', Number(e.target.value))}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.duracion_dias ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duracion_dias && (
                <p className="text-xs text-red-600 mt-1">{errors.duracion_dias}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Fecha fin: {formData.fecha_inicio && formData.duracion_dias > 0
                  ? new Date(new Date(formData.fecha_inicio).getTime() + formData.duracion_dias * 86400000).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Tiene Dependencia */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tiene_dependencia}
                onChange={(e) => handleChange('tiene_dependencia', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <LinkIcon size={16} className="inline mr-1" />
                ¿Tiene Dependencia de Otro Ítem?
              </span>
            </label>
          </div>
          
          {/* Ítem Dependencia (condicional) */}
          {formData.tiene_dependencia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ítem del que Depende <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.item_dependencia_id || ''}
                onChange={(e) => handleChange('item_dependencia_id', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.item_dependencia_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar ítem...</option>
                {itemsExistentes.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.numero_item} - {item.nombre_item}
                  </option>
                ))}
              </select>
              {errors.item_dependencia_id && (
                <p className="text-xs text-red-600 mt-1">{errors.item_dependencia_id}</p>
              )}
              {itemsExistentes.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  No hay ítems anteriores. Este será el primer ítem.
                </p>
              )}
            </div>
          )}
          
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
                  Agregar Ítem
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};