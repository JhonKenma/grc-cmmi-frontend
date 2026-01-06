// src/pages/reportes/components/GraficoRadar.tsx

import React from 'react';
import { Card } from '@/components/common';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GraficoRadarProps {
  dimensiones: Array<{
    dimension: {
      codigo: string;
      nombre: string;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
  }>;
}

export const GraficoRadar: React.FC<GraficoRadarProps> = ({ dimensiones }) => {
  const data = dimensiones.map((d) => ({
    dimension: d.dimension.codigo,
    'Nivel Deseado': d.nivel_deseado,
    'Nivel Actual': d.nivel_actual_promedio,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Niveles de Madurez por Dimensión
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 11 }} />
          <Radar
            name="Nivel Deseado"
            dataKey="Nivel Deseado"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Nivel Actual"
            dataKey="Nivel Actual"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};