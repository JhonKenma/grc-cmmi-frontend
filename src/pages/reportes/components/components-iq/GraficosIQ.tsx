// src/pages/reportes/components-iq/GraficosIQ.tsx
// Exporta: GraficoRadarIQ, GraficoBarrasIQ

import React from 'react';
import { Card } from '@/components/common';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import type { SeccionGAPData } from '@/types/reporte-iq.types';

// ── Colores por clasificación ─────────────────────────────────────────────────

const GAP_COLOR: Record<string, string> = {
  critico:  '#dc2626',
  alto:     '#f59e0b',
  medio:    '#fbbf24',
  bajo:     '#3b82f6',
  cumplido: '#10b981',
  superado: '#8b5cf6',
};

// ── Radar ─────────────────────────────────────────────────────────────────────

interface GraficoRadarIQProps {
  secciones: SeccionGAPData[];
}

export const GraficoRadarIQ: React.FC<GraficoRadarIQProps> = ({ secciones }) => {
  const data = secciones.map(s => ({
    subject:       s.seccion.nombre.length > 20
      ? s.seccion.nombre.substring(0, 18) + '…'
      : s.seccion.nombre,
    'Nivel Actual':  parseFloat(s.nivel_actual_promedio.toFixed(1)),
    'Nivel Deseado': parseFloat(s.nivel_deseado.toFixed(1)),
    fullName:        s.seccion.nombre,
    framework:       s.seccion.framework_nombre,
  }));

  if (data.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Radar de Madurez por Sección</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
          />
          <Radar
            name="Nivel Actual"
            dataKey="Nivel Actual"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Radar
            name="Nivel Deseado"
            dataKey="Nivel Deseado"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeDasharray="4 4"
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value, name, props: any) => [
              `${value} — ${props?.payload?.framework || ''}`,
              name,
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ── Barras ────────────────────────────────────────────────────────────────────

interface GraficoBarrasIQProps {
  secciones: SeccionGAPData[];
}

export const GraficoBarrasIQ: React.FC<GraficoBarrasIQProps> = ({ secciones }) => {
  const data = secciones.map(s => ({
    name:       s.seccion.nombre.length > 18
      ? s.seccion.nombre.substring(0, 16) + '…'
      : s.seccion.nombre,
    gap:        parseFloat(s.gap_promedio.toFixed(2)),
    cumplimiento: parseFloat(s.porcentaje_cumplimiento_promedio.toFixed(1)),
    clasificacion: s.clasificacion_gap,
    framework:  s.seccion.framework_nombre,
  }));

  if (data.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">GAP por Sección</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value, name, props: any) => [
              `${value} (${props?.payload?.framework || ''})`,
              name === 'gap' ? 'GAP' : name,
            ]}
          />
          <Bar dataKey="gap" name="GAP" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={GAP_COLOR[entry.clasificacion] || '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {[
          { key: 'critico', label: 'Crítico' },
          { key: 'alto',    label: 'Alto' },
          { key: 'medio',   label: 'Medio' },
          { key: 'bajo',    label: 'Bajo' },
          { key: 'cumplido', label: 'Cumplido' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: GAP_COLOR[key] }}
            />
            {label}
          </div>
        ))}
      </div>
    </Card>
  );
};