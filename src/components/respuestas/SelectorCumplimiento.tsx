// src/components/respuestas/SelectorCumplimiento.tsx

import React from 'react';
import { CheckCircle, XCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { RespuestaTipo } from './types';

interface SelectorCumplimientoProps {
  valor: RespuestaTipo;
  onChange: (valor: RespuestaTipo) => void;
  disabled?: boolean;
}

export const SelectorCumplimiento: React.FC<SelectorCumplimientoProps> = ({
  valor,
  onChange,
  disabled = false
}) => {
  const opciones = [
    {
      value: 'SI_CUMPLE' as RespuestaTipo,
      label: 'Sí Cumple',
      descripcion: 'Cumplimiento completo',
      icon: CheckCircle,
      colorActivo: 'border-green-500 bg-green-50',
      colorInactivo: 'border-gray-200 hover:border-green-300 hover:bg-gray-50',
      colorIcono: 'text-green-600',
      colorTexto: 'text-green-900'
    },
    {
      value: 'CUMPLE_PARCIAL' as RespuestaTipo,
      label: 'Cumple Parcial',
      descripcion: 'Cumplimiento parcial',
      icon: AlertCircle,
      colorActivo: 'border-yellow-500 bg-yellow-50',
      colorInactivo: 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50',
      colorIcono: 'text-yellow-600',
      colorTexto: 'text-yellow-900'
    },
    {
      value: 'NO_CUMPLE' as RespuestaTipo,
      label: 'No Cumple',
      descripcion: 'Sin cumplimiento',
      icon: XCircle,
      colorActivo: 'border-red-500 bg-red-50',
      colorInactivo: 'border-gray-200 hover:border-red-300 hover:bg-gray-50',
      colorIcono: 'text-red-600',
      colorTexto: 'text-red-900'
    },
    {
      value: 'NO_APLICA' as RespuestaTipo,
      label: 'No Aplica',
      descripcion: 'Criterio no aplicable',
      icon: MinusCircle,
      colorActivo: 'border-gray-400 bg-gray-50',
      colorInactivo: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      colorIcono: 'text-gray-600',
      colorTexto: 'text-gray-900'
    }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Nivel de Cumplimiento <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {opciones.map((opcion) => {
          const Icon = opcion.icon;
          const isSelected = valor === opcion.value;

          return (
            <button
              key={opcion.value}
              onClick={() => !disabled && onChange(opcion.value)}
              disabled={disabled}
              type="button"
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected ? opcion.colorActivo + ' shadow-sm' : opcion.colorInactivo
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon
                size={24}
                className={isSelected ? opcion.colorIcono : 'text-gray-400'}
              />
              <div className="text-center">
                <span className={`text-sm font-semibold block ${
                  isSelected ? opcion.colorTexto : 'text-gray-700'
                }`}>
                  {opcion.label}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {opcion.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};