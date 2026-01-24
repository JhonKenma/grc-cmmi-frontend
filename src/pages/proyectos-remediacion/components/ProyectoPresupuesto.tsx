// src/pages/proyectos-remediacion/components/ProyectoPresupuesto.tsx

import React from 'react';
import { Card } from '@/components/common';
import { DollarSign, Package, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ProyectoRemediacionDetail, formatCurrency } from '@/types/proyecto-remediacion.types';

interface ProyectoPresupuestoProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoPresupuesto: React.FC<ProyectoPresupuestoProps> = ({ proyecto }) => {
  // Cálculos base
  const presupuestoDisponible = proyecto.presupuesto_disponible ?? 0;
  const presupuestoTotal = proyecto.presupuesto_total_planificado ?? 0;
  const presupuestoEjecutado = proyecto.presupuesto_total_ejecutado ?? 0;
  const porcentajeGastado = proyecto.porcentaje_presupuesto_gastado ?? 0;

  return (
    <Card>
      {/* Header con modo de presupuesto */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Presupuesto</h3>
            <p className="text-[10px] text-gray-500 font-medium">RESUMEN FINANCIERO</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">
          <Package size={14} className="text-gray-500" />
          <span className="text-[10px] font-bold text-gray-700 uppercase">
            {proyecto.modo_presupuesto_display}
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Planificado */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Planificado</p>
          <p className="text-xl font-black text-gray-900 leading-none">
            {formatCurrency(
              proyecto.modo_presupuesto === 'global' ? (proyecto.presupuesto_global ?? 0) : presupuestoTotal, 
              proyecto.moneda
            )}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold">
            <Layers size={10} />
            {proyecto.modo_presupuesto === 'por_items' ? `${proyecto.total_items} ítems registrados` : 'Monto global único'}
          </div>
        </div>

        {/* Ejecutado */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Ejecutado</p>
          <p className="text-xl font-black text-orange-600 leading-none">
            {formatCurrency(
              proyecto.modo_presupuesto === 'global' ? (proyecto.presupuesto_global_gastado ?? 0) : presupuestoEjecutado, 
              proyecto.moneda
            )}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-500 font-bold">
            <ArrowUpRight size={10} />
            {porcentajeGastado.toFixed(1)}% del total
          </div>
        </div>

        {/* Disponible / Saldo */}
        <div className={`p-4 border rounded-xl shadow-sm ${
          presupuestoDisponible < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Saldo Disponible</p>
          <p className={`text-xl font-black leading-none ${
            presupuestoDisponible < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(presupuestoDisponible, proyecto.moneda)}
          </p>
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${
            presupuestoDisponible < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {presupuestoDisponible < 0 ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
            {presupuestoDisponible < 0 ? 'Exceso detectado' : 'Dentro del límite'}
          </div>
        </div>
      </div>

      {/* Barra de progreso simple y elegante */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-bold text-gray-600 uppercase">Uso de Presupuesto</span>
          <span className="text-sm font-black text-gray-900">{porcentajeGastado.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              porcentajeGastado > 90 ? 'bg-red-500' : 
              porcentajeGastado > 75 ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};