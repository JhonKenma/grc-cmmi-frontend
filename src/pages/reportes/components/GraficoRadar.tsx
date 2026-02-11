// src/pages/reportes/components/GraficoRadar.tsx

import React, { useState } from 'react';
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
import { ModalDetalleDimensiones } from './ModalDetalleDimensiones';

interface GraficoRadarProps {
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

export const GraficoRadar: React.FC<GraficoRadarProps> = ({ dimensiones }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const data = dimensiones.map((d) => ({
    dimension: d.dimension.codigo,
    dimensionId: d.dimension.id,
    dimensionNombre: d.dimension.nombre,
    'Nivel Deseado': d.nivel_deseado,
    'Nivel Actual': d.nivel_actual_promedio,
    fullData: d,
  }));

  // ⭐ Manejar clic en cualquier punto del radar
  const handleRadarClick = (data: any) => {
    console.log('🔍 Click en radar:', data);
    
    if (data && data.payload) {
      const dimensionId = data.payload.dimensionId;
      setSelectedDimension(dimensionId);
      setModalOpen(true);
    }
  };

  // ⭐ Filtrar la dimensión seleccionada
  const getSelectedDimension = () => {
    if (!selectedDimension) return [];
    return dimensiones.filter((dim) => dim.dimension.id === selectedDimension);
  };

  // ⭐ Tooltip personalizado para mostrar hint de interactividad
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">
            {payload[0].payload.dimensionNombre}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p
                key={index}
                className="text-sm"
                style={{ color: entry.color }}
              >
                {entry.name}: <span className="font-semibold">{entry.value.toFixed(1)}</span>
              </p>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-200 pt-2">
            💡 Haz clic para ver detalles
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
            Niveles de Madurez por Dimensión
          </h3>
          <p className="text-xs text-gray-500 italic">
            💡 Haz clic en un punto del gráfico para ver detalles
          </p>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 11 }} />
            
            {/* Radar de Nivel Deseado */}
            <Radar
              name="Nivel Deseado"
              dataKey="Nivel Deseado"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.25}
              strokeWidth={2}
              onClick={handleRadarClick}
              style={{ cursor: 'pointer' }}
            />
            
            {/* Radar de Nivel Actual */}
            <Radar
              name="Nivel Actual"
              dataKey="Nivel Actual"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
              onClick={handleRadarClick}
              style={{ cursor: 'pointer' }}
            />
            
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} iconType="circle" />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
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