// src/pages/encuestas/components/EncuestaStats.tsx

import React from 'react';
import { FileText, Layers, CheckCircle, Activity } from 'lucide-react';
import { Card } from '@/components/common';

interface EncuestaStatsProps {
  totalEncuestas: number;
  totalDimensiones: number;
  totalPreguntas: number;
  encuestasActivas: number;
}

export const EncuestaStats: React.FC<EncuestaStatsProps> = ({
  totalEncuestas,
  totalDimensiones,
  totalPreguntas,
  encuestasActivas,
}) => {
  const stats = [
    {
      name: 'Total evaluaciones',
      value: totalEncuestas,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Dimensiones',
      value: totalDimensiones,
      icon: Layers,
      color: 'bg-purple-500',
    },
    {
      name: 'Preguntas',
      value: totalPreguntas,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Activas',
      value: encuestasActivas,
      icon: Activity,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};