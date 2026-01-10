// src/pages/encuestas/components/EncuestaCard.tsx

import React from 'react';
import { Layers, CheckCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/common';
import { EncuestaActions } from './EncuestaActions';
import { EncuestaListItem } from '@/types';
import { formatDate } from '@/utils/helpers';

interface EncuestaCardProps {
  encuesta: EncuestaListItem;
  onDuplicar: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EncuestaCard: React.FC<EncuestaCardProps> = ({
  encuesta,
  onDuplicar,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {encuesta.nombre}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              v{encuesta.version}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {encuesta.activo ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activa
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactiva
              </span>
            )}
            {((encuesta as any).es_plantilla || (encuesta as any).esPlantilla) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Plantilla
              </span>
            )}
          </div>
        </div>

        {/* Menú de acciones */}
        <EncuestaActions
          encuestaId={encuesta.id}
          encuestaNombre={encuesta.nombre}
          activo={encuesta.activo}
          onDuplicar={onDuplicar}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">Dimensiones</p>
            <p className="text-sm font-semibold text-gray-900">
              {encuesta.total_dimensiones}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Preguntas</p>
            <p className="text-sm font-semibold text-gray-900">
              {encuesta.total_preguntas}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Creada</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(
                (encuesta as any).fecha_creacion ||
                (encuesta as any).fechaCreacion ||
                (encuesta as any).created_at ||
                (encuesta as any).createdAt
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};