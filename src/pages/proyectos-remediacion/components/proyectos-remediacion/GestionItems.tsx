// src/components/proyectos-remediacion/GestionItems.tsx

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  DollarSign,
  Calendar,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common';
import { ItemProyecto, ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import toast from 'react-hot-toast';
import { ModalAgregarItem } from './ModalAgregarItem';
import { ModalEditarItem } from './ModalEditarItem';
import { getEstadoItemColor, formatCurrency } from '@/types/proyecto-remediacion.types';
import axios from 'axios';

interface GestionItemsProps {
  proyecto: ProyectoRemediacionDetail;
  onProyectoUpdate?: () => void;
}

export const GestionItems: React.FC<GestionItemsProps> = ({
  proyecto,
  onProyectoUpdate,
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  const [items, setItems] = useState<ItemProyecto[]>(proyecto.items || []);
  const [loading, setLoading] = useState(false);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemProyecto | null>(null);
  
  // ═══════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════
  
  useEffect(() => {
    setItems(proyecto.items || []);
  }, [proyecto.items]);
  
  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  const handleReloadItems = async () => {
    try {
      setLoading(true);
      const response = await proyectosRemediacionApi.listarItems(proyecto.id);
      setItems(response.data.items);
      if (onProyectoUpdate) onProyectoUpdate();
    } catch (error) {
      console.error('Error al recargar ítems:', error);
      toast.error('Error al recargar los ítems');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditarItem = (item: ItemProyecto) => {
    setItemSeleccionado(item);
    setShowModalEditar(true);
  };
  
  const handleEliminarItem = async (item: ItemProyecto) => {
    if (!confirm(`¿Estás seguro de eliminar el ítem "${item.nombre_item}"?`)) {
      return;
    }
    
    try {
      await proyectosRemediacionApi.eliminarItem(proyecto.id, item.id);
      toast.success('Ítem eliminado exitosamente');
      handleReloadItems();
    } catch (error: any) {
      console.error('Error al eliminar ítem:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el ítem');
    }
  };
  
  const handleCompletarItem = async (item: ItemProyecto) => {
    if (!item.puede_iniciar) {
      toast.error('Este ítem está bloqueado por una dependencia');
      return;
    }
    
    try {
      await proyectosRemediacionApi.actualizarItem(item.id, {
            estado: 'completado',
            porcentaje_avance: 100,
            presupuesto_ejecutado: item.presupuesto_planificado,
          });
      toast.success('Ítem completado exitosamente');
      handleReloadItems();
    } catch (error) {
      console.error('Error al completar ítem:', error);
      toast.error('Error al completar el ítem');
    }
  };
  
  const handleIniciarItem = async (item: ItemProyecto) => {
    if (!item.puede_iniciar) {
      toast.error('Este ítem está bloqueado por una dependencia');
      return;
    }

    try {
      // ⭐ LOG DE ENVÍO
      console.log('📤 Datos que se enviarán:', {
        item_id: item.id,
        estado: 'en_proceso',
        porcentaje_avance: 0,
      });

      await proyectosRemediacionApi.actualizarItem(item.id, {
        estado: 'en_proceso',
        porcentaje_avance: 0,
      });

      toast.success('Ítem iniciado');
      handleReloadItems();

    } catch (error: unknown) {
      console.error('Error al iniciar ítem:', error);

      // ✅ VALIDACIÓN SEGURA DEL ERROR
      if (axios.isAxiosError(error)) {
        console.error('📛 Detalles del error:', error.response?.data);

        toast.error(
          error.response?.data?.message ||
          'Error al iniciar el ítem'
        );
      } else {
        toast.error('Error inesperado al iniciar el ítem');
      }
    }
  };

    
  // ═══════════════════════════════════════════════════════════
  // CALCULOS
  // ═══════════════════════════════════════════════════════════
  
  const calcularResumen = () => {
    const total = items.length;
    const completados = items.filter(i => i.estado === 'completado').length;
    const enProceso = items.filter(i => i.estado === 'en_proceso').length;
    const pendientes = items.filter(i => i.estado === 'pendiente').length;
    const bloqueados = items.filter(i => i.estado === 'bloqueado').length;
    
    const presupuestoPlanificado = items.reduce((sum, i) => sum + i.presupuesto_planificado, 0);
    const presupuestoEjecutado = items.reduce((sum, i) => sum + i.presupuesto_ejecutado, 0);
    
    return {
      total,
      completados,
      enProceso,
      pendientes,
      bloqueados,
      porcentajeAvance: total > 0 ? Math.round((completados / total) * 100) : 0,
      presupuestoPlanificado,
      presupuestoEjecutado,
      diferencia: presupuestoEjecutado - presupuestoPlanificado,
    };
  };
  
  const resumen = calcularResumen();
  
  // ═══════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════
  
  const renderEstadoBadge = (item: ItemProyecto) => {
    const colors = {
      pendiente: 'bg-gray-100 text-gray-700',
      en_proceso: 'bg-blue-100 text-blue-700',
      completado: 'bg-green-100 text-green-700',
      bloqueado: 'bg-red-100 text-red-700',
    };
    
    const icons = {
      pendiente: <Clock size={14} />,
      en_proceso: <TrendingUp size={14} />,
      completado: <CheckCircle size={14} />,
      bloqueado: <Lock size={14} />,
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[item.estado]}`}>
        {icons[item.estado]}
        {item.estado_display}
      </span>
    );
  };
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  if (proyecto.modo_presupuesto !== 'por_items') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            Este proyecto está en modo "Presupuesto Global" y no soporta ítems individuales.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* ═══ HEADER CON RESUMEN ═══ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Gestión de Ítems del Proyecto</h3>
          <Button
            variant="primary"
            onClick={() => setShowModalAgregar(true)}
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Agregar Ítem
          </Button>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600">Total Ítems</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.total}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-600">Completados</p>
            <p className="text-2xl font-bold text-green-600">{resumen.completados}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600">En Proceso</p>
            <p className="text-2xl font-bold text-blue-600">{resumen.enProceso}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-gray-600">{resumen.pendientes}</p>
          </div>
          
          {resumen.bloqueados > 0 && (
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="text-xs text-gray-600">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{resumen.bloqueados}</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-3 border border-indigo-200">
            <p className="text-xs text-gray-600">Avance</p>
            <p className="text-2xl font-bold text-indigo-600">{resumen.porcentajeAvance}%</p>
          </div>
        </div>
        
        {/* Presupuesto */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">Presupuesto Planificado</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(resumen.presupuestoPlanificado, proyecto.moneda)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600">Presupuesto Ejecutado</p>
              <p className={`text-lg font-semibold ${
                resumen.diferencia > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(resumen.presupuestoEjecutado, proyecto.moneda)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Disponible</p>
              <p
                className={`text-lg font-semibold ${
                  resumen.diferencia < 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(
                  Math.abs(resumen.diferencia),
                  proyecto.moneda
                )}
              </p>

              {resumen.diferencia > 0 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  Sobrepresupuesto
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
      
      {/* ═══ LISTA DE ÍTEMS ═══ */}
      {items.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay ítems en este proyecto
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza agregando el primer ítem para desglosar las tareas del proyecto
          </p>
          <Button
            variant="primary"
            onClick={() => setShowModalAgregar(true)}
          >
            <Plus size={16} className="mr-2" />
            Agregar Primer Ítem
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                item.estado === 'bloqueado' ? 'border-red-300 bg-red-50' :
                item.estado === 'completado' ? 'border-green-300' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Información Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.numero_item}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-lg truncate">
                      {item.nombre_item}
                    </h4>
                    {renderEstadoBadge(item)}
                  </div>
                  
                  {item.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 ml-11">
                      {item.descripcion}
                    </p>
                  )}
                  
                  {/* Detalles en Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-11">
                    {/* Responsable */}
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={12} />
                        Responsable
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.responsable_nombre}
                      </p>
                    </div>
                    
                    {/* Proveedor */}
                    {item.requiere_proveedor && (
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Package size={12} />
                          Proveedor
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {item.proveedor_nombre || 'N/A'}
                        </p>
                      </div>
                    )}
                    
                    {/* Presupuesto */}
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <DollarSign size={12} />
                        Presupuesto
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.presupuesto_planificado, proyecto.moneda)}
                      </p>
                      {item.presupuesto_ejecutado > 0 && (
                        <p className="text-xs text-gray-500">
                          Ejecutado: {formatCurrency(item.presupuesto_ejecutado, proyecto.moneda)}
                        </p>
                      )}
                    </div>
                    
                    {/* Fechas */}
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Cronograma
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(item.fecha_inicio).toLocaleDateString()} - {new Date(item.fecha_fin).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.duracion_dias} día(s)
                      </p>
                    </div>
                  </div>
                  
                  {/* Dependencia */}
                  {item.tiene_dependencia && item.item_dependencia && (
                    <div className="ml-11 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="text-yellow-800">
                        <ArrowRight size={12} className="inline mr-1" />
                        Depende del ítem #{item.item_dependencia}
                        {!item.puede_iniciar && ' (Bloqueado hasta que se complete)'}
                      </p>
                    </div>
                  )}
                  
                  {/* Avance */}
                  {item.estado === 'en_proceso' && (
                    <div className="ml-11 mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Avance</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {item.porcentaje_avance}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.porcentaje_avance}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col gap-2">
                  {item.estado === 'pendiente' && item.puede_iniciar && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleIniciarItem(item)}
                    >
                      <TrendingUp size={14} className="mr-1" />
                      Iniciar
                    </Button>
                  )}
                  
                  {item.estado === 'en_proceso' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCompletarItem(item)}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Completar
                    </Button>
                  )}
                  
                  {item.estado !== 'completado' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditarItem(item)}
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                  )}
                  
                  {item.estado === 'pendiente' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminarItem(item)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* ═══ MODALES ═══ */}
      {showModalAgregar && (
        <ModalAgregarItem
          isOpen={showModalAgregar}
          onClose={() => setShowModalAgregar(false)}
          proyecto={proyecto}
          itemsExistentes={items}
          onSuccess={handleReloadItems}
        />
      )}
      
      {showModalEditar && itemSeleccionado && (
        <ModalEditarItem
          isOpen={showModalEditar}
          onClose={() => {
            setShowModalEditar(false);
            setItemSeleccionado(null);
          }}
          proyecto={proyecto}
          item={itemSeleccionado}
          onSuccess={handleReloadItems}
        />
      )}
    </div>
  );
};