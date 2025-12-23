// src/pages/encuestas/components/DimensionCard.tsx - VERSIÓN CORREGIDA

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers, FileText, Edit2 } from 'lucide-react';
import { Card } from '@/components/common';
import { PreguntaItem } from './PreguntaItem';
import { Dimension } from '@/types';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface DimensionCardProps {
  dimension: Dimension;
  numero: number;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  numero,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { isSuperuser } = usePermissions();

  const handleEditDimension = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/encuestas/${dimension.encuesta}/dimensiones/${dimension.id}/editar`);
  };

  return (
    <Card className="border-l-4 border-l-primary-500">
      {/* ⭐ SOLUCIÓN: Hacer todo un div en lugar de button */}
      <div className="w-full">
        {/* Header de la dimensión */}
        <div className="flex items-center justify-between">
          {/* Área clickeable para expandir/contraer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center gap-4 text-left"
          >
            {/* Número */}
            <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              {numero}
            </div>

            {/* Contenido */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <Layers size={18} className="text-primary-600" />
                <span className="text-sm font-mono text-gray-500">
                  {dimension.codigo}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {dimension.nombre}
              </h3>
              {dimension.descripcion && (
                <p className="text-sm text-gray-600 mt-1">
                  {dimension.descripcion}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText size={14} />
                  <span>{dimension.total_preguntas} preguntas</span>
                </div>
              </div>
            </div>
          </button>

          {/* ⭐ Iconos FUERA del botón de expandir */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botón de editar - SOLO PARA SUPERADMIN */}
            {isSuperuser && (
              <button
                onClick={handleEditDimension}
                className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                title="Editar dimensión"
              >
                <Edit2 size={18} className="text-primary-600" />
              </button>
            )}

            {/* Botón para expandir/contraer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={24} className="text-gray-400" />
              ) : (
                <ChevronRight size={24} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Preguntas (expandible) */}
        {isExpanded && (
          <div className="mt-6 space-y-4 pl-16">
            {dimension.preguntas
              .sort((a, b) => a.orden - b.orden)
              .map((pregunta, index) => (
                <PreguntaItem
                  key={pregunta.id}
                  pregunta={pregunta}
                  numero={index + 1}
                />
              ))}
          </div>
        )}
      </div>
    </Card>
  );
};