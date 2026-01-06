// src/pages/reportes/components/GraficoBarrasGap.tsx

import React from 'react';
import { Card } from '@/components/common';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface GraficoBarrasGapProps {
  dimensiones: Array<{
    dimension: {
      codigo: string;
      nombre: string;
    };
    gap_promedio: number;
  }>;
}

export const GraficoBarrasGap: React.FC<GraficoBarrasGapProps> = ({ dimensiones }) => {
  const data = dimensiones.map((d) => ({
    dimension: d.dimension.codigo,
    gap: Number(d.gap_promedio.toFixed(2)),
  }));

  const getColor = (gap: number) => {
    if (gap >= 2) return '#ef4444'; // red
    if (gap >= 1) return '#f59e0b'; // orange
    if (gap > 0) return '#fbbf24'; // yellow
    return '#10b981'; // green
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Brecha (GAP) por Dimensión</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 5]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="gap" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.gap)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};