// src/pages/proyectos-remediacion/components/ProyectoPresupuesto.tsx

import React from 'react';
import { Card } from '@/components/common';
import { DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoPresupuestoProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoPresupuesto: React.FC<ProyectoPresupuestoProps> = ({ proyecto }) => {
  const formatearMoneda = (valor: number, moneda: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const porcentajeGastado = proyecto.porcentaje_presupuesto_gastado;
  const estaEnRiesgo = porcentajeGastado > 80 && proyecto.porcentaje_tiempo_transcurrido < 80;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={20} className="text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Presupuesto y Recursos</h3>
      </div>

      {/* Alerta de presupuesto */}
      {estaEnRiesgo && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-900">Alerta de Presupuesto</p>
            <p className="text-xs text-orange-700">
              El presupuesto gastado ({porcentajeGastado.toFixed(0)}%) es mayor al progreso del tiempo ({proyecto.porcentaje_tiempo_transcurrido.toFixed(0)}%)
            </p>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Presupuesto Asignado</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatearMoneda(proyecto.presupuesto_asignado, proyecto.moneda)}
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Presupuesto Gastado</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatearMoneda(proyecto.presupuesto_gastado, proyecto.moneda)}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Presupuesto Disponible</p>
          <p className="text-2xl font-bold text-green-600">
            {formatearMoneda(proyecto.presupuesto_disponible, proyecto.moneda)}
          </p>
        </div>
      </div>

      {/* Barra de progreso presupuestal */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Ejecución Presupuestal</span>
          <span className={`text-sm font-semibold ${
            porcentajeGastado > 90 ? 'text-red-600' : 
            porcentajeGastado > 75 ? 'text-orange-600' : 
            'text-green-600'
          }`}>
            {porcentajeGastado.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all ${
              porcentajeGastado > 90 ? 'bg-red-600' : 
              porcentajeGastado > 75 ? 'bg-orange-600' : 
              'bg-green-600'
            }`}
            style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
          />
        </div>
      </div>

      {/* Recursos Humanos */}
      {proyecto.recursos_humanos_asignados > 0 && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Recursos Humanos Asignados</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {proyecto.recursos_humanos_asignados.toFixed(1)} horas
              </p>
              <p className="text-xs text-gray-600 mt-1">Horas-persona estimadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Recursos Técnicos */}
      {proyecto.recursos_tecnicos && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">Recursos Técnicos Requeridos</p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{proyecto.recursos_tecnicos}</p>
        </div>
      )}

      {/* Comparativa Tiempo vs Presupuesto */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-900 mb-3">Comparativa: Tiempo vs Presupuesto</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Progreso de Tiempo</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(proyecto.porcentaje_tiempo_transcurrido, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-600">
                {proyecto.porcentaje_tiempo_transcurrido.toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Progreso de Presupuesto</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-green-600">
                {porcentajeGastado.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};