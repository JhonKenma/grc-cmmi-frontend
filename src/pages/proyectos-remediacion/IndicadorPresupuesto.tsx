// src/components/proyectos-remediacion/IndicadorPresupuesto.tsx

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { 
  formatCurrency, 
  getEstadoPresupuestoColor, 
  getEstadoPresupuestoLabel,
  MonedaProyecto
} from '@/types/proyecto-remediacion.types';

interface IndicadorPresupuestoProps {
  presupuestoPlanificado: number;
  presupuestoEjecutado: number;
  presupuestoLimite: number;
  estadoPresupuesto: 'ok' | 'elasticidad' | 'excedido';
  moneda: MonedaProyecto;
  showDetails?: boolean;
}

export const IndicadorPresupuesto: React.FC<IndicadorPresupuestoProps> = ({
  presupuestoPlanificado,
  presupuestoEjecutado,
  presupuestoLimite,
  estadoPresupuesto,
  moneda,
  showDetails = false,
}) => {
  const porcentaje = (presupuestoEjecutado / presupuestoPlanificado) * 100;
  
  const getIcono = () => {
    switch (estadoPresupuesto) {
      case 'ok':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'elasticidad':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'excedido':
        return <XCircle size={16} className="text-red-600" />;
    }
  };
  
  const getBarColor = () => {
    switch (estadoPresupuesto) {
      case 'ok':
        return 'bg-green-500';
      case 'elasticidad':
        return 'bg-yellow-500';
      case 'excedido':
        return 'bg-red-500';
    }
  };
  
  return (
    <div className="space-y-2">
      {/* Barra de Progreso */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-300`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-gray-700 w-12 text-right">
          {Math.round(porcentaje)}%
        </span>
      </div>
      
      {/* Badge de Estado */}
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getEstadoPresupuestoColor(estadoPresupuesto)}`}>
        {getIcono()}
        <span>{getEstadoPresupuestoLabel(estadoPresupuesto)}</span>
      </div>
      
      {/* Detalles */}
      {showDetails && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Planificado:</span>
            <span className="font-medium">{formatCurrency(presupuestoPlanificado, moneda)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ejecutado:</span>
            <span className="font-medium">{formatCurrency(presupuestoEjecutado, moneda)}</span>
          </div>
          <div className="flex justify-between">
            <span>Límite (110%):</span>
            <span className="font-medium">{formatCurrency(presupuestoLimite, moneda)}</span>
          </div>
          
          {estadoPresupuesto === 'excedido' && (
            <div className="flex justify-between text-red-600 font-semibold">
              <span>Excedido:</span>
              <span>{formatCurrency(presupuestoEjecutado - presupuestoLimite, moneda)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};