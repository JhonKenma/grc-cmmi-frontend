// src/pages/proyectos-remediacion/components/ProyectoAcciones.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Button } from '@/components/common';
import { Edit, Trash2, CheckCircle, Pause, XCircle } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';
import { useNavigate } from 'react-router-dom';

interface ProyectoAccionesProps {
  proyecto: ProyectoRemediacionDetail;
  onEliminar?: () => void;
  onCambiarEstado?: (nuevoEstado: string) => void;
}

export const ProyectoAcciones: React.FC<ProyectoAccionesProps> = ({ 
  proyecto,
  onEliminar,
  onCambiarEstado 
}) => {
  const navigate = useNavigate();

  const puedeEditar = proyecto.estado !== 'cerrado' && proyecto.estado !== 'cancelado';
  const puedeEliminar = proyecto.estado === 'planificado';

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones del Proyecto</h3>

      <div className="space-y-3">
        {/* Editar Proyecto */}
        {puedeEditar && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/proyectos-remediacion/${proyecto.id}/editar`)}
            className="w-full justify-center"
          >
            <Edit size={18} className="mr-2" />
            Editar Proyecto
          </Button>
        )}

        {/* Cambios de Estado */}
        {proyecto.estado === 'planificado' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onCambiarEstado?.('en_ejecucion')}
            className="w-full justify-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Iniciar Ejecución
          </Button>
        )}

        {proyecto.estado === 'en_ejecucion' && (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => onCambiarEstado?.('en_validacion')}
              className="w-full justify-center"
            >
              <CheckCircle size={18} className="mr-2" />
              Enviar a Validación
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onCambiarEstado?.('suspendido')}
              className="w-full justify-center"
            >
              <Pause size={18} className="mr-2" />
              Suspender Proyecto
            </Button>
          </>
        )}

        {proyecto.estado === 'en_validacion' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onCambiarEstado?.('cerrado')}
            className="w-full justify-center bg-green-600 hover:bg-green-700"
          >
            <CheckCircle size={18} className="mr-2" />
            Cerrar Proyecto
          </Button>
        )}

        {proyecto.estado === 'suspendido' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onCambiarEstado?.('en_ejecucion')}
            className="w-full justify-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Reanudar Proyecto
          </Button>
        )}

        {/* Eliminar */}
        {puedeEliminar && (
          <Button
            variant="secondary"
            size="md"
            onClick={onEliminar}
            className="w-full justify-center text-red-600 hover:bg-red-50"
          >
            <Trash2 size={18} className="mr-2" />
            Eliminar Proyecto
          </Button>
        )}

        {/* Información de versión */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Versión del proyecto:</span>
            <span className="font-semibold">{proyecto.version}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Creado por:</span>
            <span>{proyecto.creado_por_info?.nombre_completo || 'Sistema'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Última actualización:</span>
            <span>{new Date(proyecto.fecha_actualizacion).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};