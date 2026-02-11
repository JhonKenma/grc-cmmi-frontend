// src/pages/reportes/components/GraficoPastelClasificacion.tsx

import React, { useState } from 'react';
import { Card } from '@/components/common';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ModalDetalleDimensiones } from './ModalDetalleDimensiones';

interface GraficoPastelClasificacionProps {
  clasificaciones: {
    critico: number;
    alto: number;
    medio: number;
    bajo: number;
    cumplido: number;
    superado: number;
  };
  dimensiones: Array<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    clasificacion_gap?: string;
  }>;
}

const COLORS = {
  critico: '#dc2626',
  alto: '#f59e0b',
  medio: '#fbbf24',
  bajo: '#3b82f6',
  cumplido: '#10b981',
  superado: '#8b5cf6',
};

const LABELS = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
  cumplido: 'Cumplido',
  superado: 'Superado',
};

export const GraficoPastelClasificacion: React.FC<GraficoPastelClasificacionProps> = ({
  clasificaciones,
  dimensiones,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClasificacion, setSelectedClasificacion] = useState<string | null>(null);

  const data = Object.entries(clasificaciones)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
      clasificacionKey: key, // ⭐ CAMBIO: Usamos la key original (critico, alto, etc.)
    }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // ⭐ CAMBIO: Manejar clic con la key correcta
  const handleClick = (data: any) => {
    console.log('🔍 Click en gráfico:', data); // Debug
    if (data && data.clasificacionKey) {
      setSelectedClasificacion(data.clasificacionKey);
      setModalOpen(true);
    }
  };

  // ⭐ CAMBIO: Filtrar con logs para debug
  const getDimensionesByClasificacion = () => {
    if (!selectedClasificacion) return [];
    
    console.log('🔍 Filtrando por clasificación:', selectedClasificacion);
    console.log('🔍 Total dimensiones:', dimensiones.length);
    
    const filtered = dimensiones.filter((dim) => {
      console.log(`  - ${dim.dimension.codigo}: clasificacion_gap = "${dim.clasificacion_gap}"`);
      return dim.clasificacion_gap === selectedClasificacion;
    });
    
    console.log('🔍 Dimensiones filtradas:', filtered.length);
    return filtered;
  };

  if (total === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación de Brechas</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Clasificación de Brechas</h3>
          <p className="text-xs text-gray-500 italic">
            💡 Haz clic en una sección para ver dimensiones
          </p>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                if (typeof percent === 'undefined') return '';
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
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
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {clasificaciones.critico + clasificaciones.alto}
            </p>
            <p className="text-xs text-gray-600">Críticos/Altos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {clasificaciones.medio + clasificaciones.bajo}
            </p>
            <p className="text-xs text-gray-600">Medios/Bajos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {clasificaciones.cumplido + clasificaciones.superado}
            </p>
            <p className="text-xs text-gray-600">Cumplidos</p>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <ModalDetalleDimensiones
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Dimensiones con Clasificación: ${
          selectedClasificacion ? LABELS[selectedClasificacion as keyof typeof LABELS] : ''
        }`}
        dimensiones={getDimensionesByClasificacion()}
        tipo="clasificacion"
      />
    </>
  );
};