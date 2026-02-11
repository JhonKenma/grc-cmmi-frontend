// src/pages/reportes/components/GraficoBarrasGap.tsx

import React, { useState } from 'react';
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
import { ModalDetalleDimensiones } from './ModalDetalleDimensiones';

interface GraficoBarrasGapProps {
  dimensiones: Array<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    clasificacion_gap?: string;
    porcentaje_cumplimiento_promedio: number;
  }>;
}

export const GraficoBarrasGap: React.FC<GraficoBarrasGapProps> = ({ dimensiones }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const data = dimensiones.map((d) => ({
    dimension: d.dimension.codigo,
    dimensionId: d.dimension.id,
    dimensionNombre: d.dimension.nombre,
    gap: Number(d.gap_promedio.toFixed(2)),
    fullData: d,
  }));

  const getColor = (gap: number) => {
    if (gap >= 2) return '#ef4444'; // red
    if (gap >= 1) return '#f59e0b'; // orange
    if (gap > 0) return '#fbbf24'; // yellow
    return '#10b981'; // green
  };

  // ⭐ Manejar clic en una barra
  const handleBarClick = (data: any) => {
    console.log('🔍 Click en barra:', data);
    
    if (data && data.dimensionId) {
      setSelectedDimension(data.dimensionId);
      setModalOpen(true);
    }
  };

  // ⭐ Obtener la dimensión seleccionada
  const getSelectedDimension = () => {
    if (!selectedDimension) return [];
    return dimensiones.filter((dim) => dim.dimension.id === selectedDimension);
  };

  // ⭐ Tooltip personalizado con hint de interactividad
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">
            {data.dimensionNombre}
          </p>
          <p className="text-sm text-gray-700">
            Brecha (GAP): <span className="font-bold" style={{ color: getColor(data.gap) }}>
              {data.gap.toFixed(1)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-200 pt-2">
            💡 Haz clic para ver detalles completos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Brecha (GAP) por Dimensión
          </h3>
          <p className="text-xs text-gray-500 italic">
            💡 Haz clic en una barra para ver detalles
          </p>
        </div>

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
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="gap" 
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.gap)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Modal */}
      <ModalDetalleDimensiones
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDimension(null);
        }}
        title={
          selectedDimension
            ? `Detalle de ${getSelectedDimension()[0]?.dimension.nombre || 'Dimensión'}`
            : 'Detalle de Dimensión'
        }
        dimensiones={getSelectedDimension()}
        tipo="nivel"
      />
    </>
  );
};