// src/components/respuestas/SelectorNivelMadurez.tsx

import React from 'react';
import { NIVELES_MADUREZ, getNivelInfo } from './types';
import { VistaPreviewNivelMadurez } from './VistaPreviewNivelMadurez';

interface SelectorNivelMadurezProps {
  nivelMadurez: number;
  onNivelChange: (nivel: number) => void;
  justificacion: string;
  onJustificacionChange: (texto: string) => void;
  modoLectura?: boolean;
}

export const SelectorNivelMadurez: React.FC<SelectorNivelMadurezProps> = ({
  nivelMadurez,
  onNivelChange,
  justificacion,
  onJustificacionChange,
  modoLectura = false
}) => {
  const info = getNivelInfo(nivelMadurez);

  // Modo solo lectura (Vista cuando ya está enviado o bloqueado)
  if (modoLectura && nivelMadurez > 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold px-3 py-1 rounded bg-white border ${info.color.replace('text-', 'border-').replace('text-', 'text-')}`}>
            {info.label}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Nivel de Madurez: <span className={info.color}>{info.descripcion}</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  nivelMadurez >= 4 ? 'bg-green-500' : nivelMadurez >= 2 ? 'bg-blue-500' : 'bg-orange-500'
                }`}
                style={{ width: `${(nivelMadurez / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo edición (Ajustado para no ser tan ancho)
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm max-w-3xl border-l-4 border-l-blue-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">Nivel de Madurez CMMI</h4>
          <p className="text-xs text-gray-500">Seleccione el grado de institucionalización del proceso</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Dropdown con ancho controlado */}
        <div className="relative max-w-md">
          <select
            value={nivelMadurez}
            onChange={(e) => onNivelChange(Number(e.target.value))}
            className="w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer font-medium"
          >
            {NIVELES_MADUREZ.map((nivel) => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label} - {nivel.descripcion}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Vista previa compacta */}
        {nivelMadurez > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <VistaPreviewNivelMadurez nivelMadurez={nivelMadurez} />
          </div>
        )}
      </div>
    </div>
  );
};