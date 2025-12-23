// src/pages/encuestas/components/EncuestaActions.tsx

import React, { useState } from 'react';
import { MoreVertical, Eye, Copy, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface EncuestaActionsProps {
  encuestaId: string;
  encuestaNombre: string;
  activo: boolean;
  onDuplicar: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EncuestaActions: React.FC<EncuestaActionsProps> = ({
  encuestaId,
  encuestaNombre,
  activo,
  onDuplicar,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { isSuperuser } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const handleView = () => {
    navigate(`/encuestas/${encuestaId}`);
    setIsOpen(false);
  };

  const handleEdit = () => {
    navigate(`/encuestas/${encuestaId}/editar`);
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicar(encuestaId);
    setIsOpen(false);
  };

  const handleToggleStatus = () => {
    const accion = activo ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${accion} la evaluación "${encuestaNombre}"?`)) {
      onToggleStatus(encuestaId);
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar la evaluación "${encuestaNombre}"?\n\nEsta acción no se puede deshacer.`)) {
      onDelete(encuestaId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Más opciones"
      >
        <MoreVertical size={18} className="text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menú dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* Ver detalle */}
            <button
              onClick={handleView}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Eye size={16} />
              Ver Detalle
            </button>

            {/* Solo SuperAdmin puede editar, duplicar, activar/desactivar, eliminar */}
            {isSuperuser && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </button>

                <button
                  onClick={handleDuplicate}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Copy size={16} />
                  Duplicar
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={handleToggleStatus}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                    activo ? 'text-orange-600' : 'text-green-600'
                  }`}
                >
                  {activo ? <PowerOff size={16} /> : <Power size={16} />}
                  {activo ? 'Desactivar' : 'Activar'}
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};