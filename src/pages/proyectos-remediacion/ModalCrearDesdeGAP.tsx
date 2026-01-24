// src/components/proyectos-remediacion/ModalCrearDesdeGAP.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  Save, 
  Loader2,
  FileText,
  ListChecks 
} from 'lucide-react';
import { Button } from '@/components/common';
import { useCrearProyectoDesdeGAP } from '@/hooks/useProyectosRemediacion';
import { usuariosApi } from '@/api/endpoints';
import { CrearDesdeGAPFormData, ModoPresupuesto } from '@/types/proyecto-remediacion.types';
import { Usuario } from '@/types';
import toast from 'react-hot-toast';

interface ModalCrearDesdeGAPProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  calculoNivelId: string;
  gapInfo: {
    dimension_nombre: string;
    dimension_codigo: string;
    gap: number;
    clasificacion_gap: string;
    nivel_actual: number;
    nivel_deseado: number;
  };
}

export const ModalCrearDesdeGAP: React.FC<ModalCrearDesdeGAPProps> = ({
  isOpen,
  onClose,
  onSuccess,
  calculoNivelId,
  gapInfo,
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  const [step, setStep] = useState<1 | 2>(1);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  const [formData, setFormData] = useState<CrearDesdeGAPFormData>({
    calculo_nivel_id: calculoNivelId,
    nombre_proyecto: `Remediación: ${gapInfo.dimension_nombre}`,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin_estimada: '',
    dueno_proyecto_id: 0,
    responsable_implementacion_id: 0,
    modo_presupuesto: 'global', // ⭐ NUEVO: Modo por defecto
    moneda: 'USD',
    presupuesto_global: 0, // ⭐ NUEVO: Solo si modo='global'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { mutate: crearProyecto, isPending } = useCrearProyectoDesdeGAP();
  
  // ═══════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (isOpen) {
      loadUsuarios();
      calcularFechaEstimada();
    }
  }, [isOpen]);
  
  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await usuariosApi.list();
      const lista = Array.isArray(response) ? response : (response as any)?.results || [];
      setUsuarios(lista);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };
  
  const calcularFechaEstimada = () => {
    const hoy = new Date();
    let diasEstimados = 90;
    
    switch (gapInfo.clasificacion_gap) {
      case 'critico':
        diasEstimados = 30;
        break;
      case 'alto':
        diasEstimados = 60;
        break;
      case 'medio':
        diasEstimados = 90;
        break;
      case 'bajo':
        diasEstimados = 120;
        break;
    }
    
    const fechaEstimada = new Date(hoy);
    fechaEstimada.setDate(fechaEstimada.getDate() + diasEstimados);
    
    setFormData(prev => ({
      ...prev,
      fecha_fin_estimada: fechaEstimada.toISOString().split('T')[0],
    }));
  };
  
  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════
  
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!(formData.nombre_proyecto ?? '').trim()) {
      newErrors.nombre_proyecto = 'El nombre es requerido';
    }
    
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fecha_fin_estimada) {
      newErrors.fecha_fin_estimada = 'La fecha de fin es requerida';
    }
    
    if (formData.fecha_inicio && formData.fecha_fin_estimada) {
      if (new Date(formData.fecha_fin_estimada) <= new Date(formData.fecha_inicio)) {
        newErrors.fecha_fin_estimada = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.dueno_proyecto_id) {
      newErrors.dueno_proyecto_id = 'Debes seleccionar un dueño del proyecto';
    }
    
    if (!formData.responsable_implementacion_id) {
      newErrors.responsable_implementacion_id = 'Debes seleccionar un responsable';
    }
    
    // ⭐ NUEVO: Validar presupuesto según modo
    if (formData.modo_presupuesto === 'global') {
      if (!formData.presupuesto_global || formData.presupuesto_global <= 0) {
        newErrors.presupuesto_global = 'Debe especificar un presupuesto mayor a 0 en modo global';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    crearProyecto(formData, {
      onSuccess: () => {
        toast.success(
          formData.modo_presupuesto === 'por_items'
            ? 'Proyecto creado. Ahora puedes agregar ítems individuales.'
            : 'Proyecto creado exitosamente desde GAP'
        );
        onClose();
        if (onSuccess) onSuccess();
      },
    });
  };
  
  const handleChange = (field: keyof CrearDesdeGAPFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // ⭐ NUEVO: Handler para cambio de modo de presupuesto
  const handleModoPresupuestoChange = (modo: ModoPresupuesto) => {
    setFormData(prev => ({
      ...prev,
      modo_presupuesto: modo,
      // Si cambia a por_items, resetear presupuesto_global
      ...(modo === 'por_items' && { presupuesto_global: 0 }),
    }));
    
    // Limpiar error de presupuesto al cambiar modo
    if (errors.presupuesto_global) {
      setErrors(prev => ({ ...prev, presupuesto_global: '' }));
    }
  };
  
  if (!isOpen) return null;
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ═══ HEADER ═══ */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Crear Proyecto de Remediación
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Desde GAP: {gapInfo.dimension_nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* ═══ INFORMACIÓN DEL GAP ═══ */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-orange-600" />
            <h3 className="font-semibold text-gray-900">Brecha Identificada</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-600">Dimensión</p>
              <p className="font-semibold text-gray-900">{gapInfo.dimension_codigo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">GAP</p>
              <p className="font-semibold text-red-600">{gapInfo.gap.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Clasificación</p>
              <p className={`font-semibold capitalize ${
                gapInfo.clasificacion_gap === 'critico' ? 'text-red-600' :
                gapInfo.clasificacion_gap === 'alto' ? 'text-orange-600' :
                gapInfo.clasificacion_gap === 'medio' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {gapInfo.clasificacion_gap}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Nivel Deseado</p>
              <p className="font-semibold text-blue-600">
                {gapInfo.nivel_actual} → {gapInfo.nivel_deseado}
              </p>
            </div>
          </div>
        </div>
        
        {/* ═══ WIZARD STEPS ═══ */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium text-sm">Información Básica</span>
            </div>
            
            <div className="h-px w-16 bg-gray-300" />
            
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium text-sm">Responsables y Presupuesto</span>
            </div>
          </div>
        </div>
        
        {/* ═══ FORM ═══ */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* STEP 1: Información Básica */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Nombre del Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_proyecto}
                  onChange={(e) => handleChange('nombre_proyecto', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre_proyecto ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Remediación de Seguridad de Red"
                />
                {errors.nombre_proyecto && (
                  <p className="text-xs text-red-600 mt-1">{errors.nombre_proyecto}</p>
                )}
              </div>
              
              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fecha_inicio && (
                    <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin Estimada <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.fecha_fin_estimada}
                      onChange={(e) => handleChange('fecha_fin_estimada', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fecha_fin_estimada ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fecha_fin_estimada && (
                    <p className="text-xs text-red-600 mt-1">{errors.fecha_fin_estimada}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Sugerido para GAP {gapInfo.clasificacion_gap}
                  </p>
                </div>
              </div>
              
              {/* Descripción Opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-gray-500 text-xs">(Opcional)</span>
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Proporcione detalles adicionales del proyecto..."
                />
              </div>
            </div>
          )}
          
          {/* STEP 2: Responsables y Presupuesto */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Dueño del Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Dueño del Proyecto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dueno_proyecto_id}
                  onChange={(e) => handleChange('dueno_proyecto_id', Number(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dueno_proyecto_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingUsuarios}
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre_completo} - {usuario.email}
                    </option>
                  ))}
                </select>
                {errors.dueno_proyecto_id && (
                  <p className="text-xs text-red-600 mt-1">{errors.dueno_proyecto_id}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Responsable general del éxito del proyecto
                </p>
              </div>
              
              {/* Responsable de Implementación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target size={16} className="inline mr-1" />
                  Responsable de Implementación <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.responsable_implementacion_id}
                  onChange={(e) => handleChange('responsable_implementacion_id', Number(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.responsable_implementacion_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingUsuarios}
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre_completo} - {usuario.email}
                    </option>
                  ))}
                </select>
                {errors.responsable_implementacion_id && (
                  <p className="text-xs text-red-600 mt-1">{errors.responsable_implementacion_id}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Quien ejecuta las tareas técnicas
                </p>
              </div>
              
              {/* ⭐ NUEVO: Modo de Presupuesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Modo de Presupuesto <span className="text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opción: Presupuesto Global */}
                  <button
                    type="button"
                    onClick={() => handleModoPresupuestoChange('global')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.modo_presupuesto === 'global'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${formData.modo_presupuesto === 'global' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Presupuesto Global</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Un monto único para todo el proyecto
                        </p>
                      </div>
                      {formData.modo_presupuesto === 'global' && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Opción: Presupuesto por Ítems */}
                  <button
                    type="button"
                    onClick={() => handleModoPresupuestoChange('por_items')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.modo_presupuesto === 'por_items'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${formData.modo_presupuesto === 'por_items' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <ListChecks size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Presupuesto por Ítems</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Desglosado en tareas individuales
                        </p>
                      </div>
                      {formData.modo_presupuesto === 'por_items' && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Info adicional según modo */}
                {formData.modo_presupuesto === 'por_items' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 Podrás agregar ítems individuales después de crear el proyecto
                    </p>
                  </div>
                )}
              </div>
              
              {/* Presupuesto - Solo mostrar si modo='global' */}
              {formData.modo_presupuesto === 'global' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Presupuesto Asignado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.presupuesto_global}
                      onChange={(e) => handleChange('presupuesto_global', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.presupuesto_global ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.presupuesto_global && (
                      <p className="text-xs text-red-600 mt-1">{errors.presupuesto_global}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PEN">PEN</option>
                      <option value="COP">COP</option>
                      <option value="MXN">MXN</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Moneda - Solo mostrar si modo='por_items' */}
              {formData.modo_presupuesto === 'por_items' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PEN">PEN</option>
                      <option value="COP">COP</option>
                      <option value="MXN">MXN</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Moneda para los ítems del proyecto
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* ═══ FOOTER BUTTONS ═══ */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t mt-6">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={isPending}
                >
                  Siguiente
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                  disabled={isPending}
                >
                  Anterior
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Crear Proyecto
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};