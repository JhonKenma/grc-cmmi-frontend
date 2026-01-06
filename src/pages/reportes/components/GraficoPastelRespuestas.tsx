// src/pages/reportes/components/GraficoPastelRespuestas.tsx

import React from 'react';
import { Card } from '@/components/common';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GraficoPastelRespuestasProps {
  distribucion: {
    si_cumple: number;
    cumple_parcial: number;
    no_cumple: number;
    no_aplica: number;
    total: number;
    porcentajes: {
      si_cumple: number;
      cumple_parcial: number;
      no_cumple: number;
      no_aplica: number;
    };
  };
}

const COLORS_RESPUESTAS = {
  si_cumple: '#10b981',
  cumple_parcial: '#3b82f6',
  no_cumple: '#ef4444',
  no_aplica: '#6b7280',
};

const LABELS_RESPUESTAS = {
  si_cumple: 'Sí Cumple',
  cumple_parcial: 'Cumple Parcial',
  no_cumple: 'No Cumple',
  no_aplica: 'No Aplica',
};

export const GraficoPastelRespuestas: React.FC<GraficoPastelRespuestasProps> = ({
  distribucion,
}) => {
  const data = [
    {
      name: LABELS_RESPUESTAS.si_cumple,
      value: distribucion.si_cumple,
      color: COLORS_RESPUESTAS.si_cumple,
    },
    {
      name: LABELS_RESPUESTAS.cumple_parcial,
      value: distribucion.cumple_parcial,
      color: COLORS_RESPUESTAS.cumple_parcial,
    },
    {
      name: LABELS_RESPUESTAS.no_cumple,
      value: distribucion.no_cumple,
      color: COLORS_RESPUESTAS.no_cumple,
    },
    {
      name: LABELS_RESPUESTAS.no_aplica,
      value: distribucion.no_aplica,
      color: COLORS_RESPUESTAS.no_aplica,
    },
  ].filter((item) => item.value > 0);

  if (distribucion.total === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución de Respuestas
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Respuestas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              // ✅ SOLUCIÓN: Validar que percent esté definido
              if (typeof percent === 'undefined') return '';
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '13px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Resumen numérico */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{distribucion.si_cumple}</p>
          <p className="text-xs text-gray-600">Sí Cumple</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{distribucion.cumple_parcial}</p>
          <p className="text-xs text-gray-600">Cumple Parcial</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{distribucion.no_cumple}</p>
          <p className="text-xs text-gray-600">No Cumple</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{distribucion.no_aplica}</p>
          <p className="text-xs text-gray-600">No Aplica</p>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Total de respuestas: <span className="font-semibold">{distribucion.total}</span>
        </p>
      </div>
    </Card>
  );
};