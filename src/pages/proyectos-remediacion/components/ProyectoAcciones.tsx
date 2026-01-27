// src/pages/proyectos-remediacion/components/ProyectoAcciones.tsx

import React from 'react';
import { Card, Button } from '@/components/common';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Pause, 
  Play, 
  Send, 
  Archive,
  User,
  History
} from 'lucide-react';
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
    <Card className="sticky top-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
        Panel de Control
      </h3>

      <div className="space-y-3">
        {/* --- ACCIONES DE FLUJO PRINCIPAL (CAMBIOS DE ESTADO) --- */}
        
        {proyecto.estado === 'planificado' && (
          <Button
            variant="primary"
            className="w-full justify-center shadow-md bg-blue-600 hover:bg-blue-700 h-11"
            onClick={() => onCambiarEstado?.('en_ejecucion')}
          >
            <Play size={18} className="mr-2 fill-current" />
            Iniciar Ejecución
          </Button>
        )}

        {proyecto.estado === 'en_ejecucion' && (
          <>
            <Button
              variant="primary"
              className="w-full justify-center shadow-md bg-indigo-600 hover:bg-indigo-700 h-11"
              onClick={() => onCambiarEstado?.('en_validacion')}
            >
              <Send size={18} className="mr-2" />
              Enviar a Validación
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-center border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => onCambiarEstado?.('suspendido')}
            >
              <Pause size={18} className="mr-2" />
              Pausar Proyecto
            </Button>
          </>
        )}

        {proyecto.estado === 'en_validacion' && (
          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 mb-2">
              <p className="text-[10px] text-indigo-600 font-bold uppercase text-center">Esperando Aprobación</p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center bg-green-600 hover:bg-green-700 h-11 shadow-lg"
              onClick={() => onCambiarEstado?.('cerrado')}
            >
              <CheckCircle size={18} className="mr-2" />
              Aprobar y Cerrar
            </Button>
          </div>
        )}

        {proyecto.estado === 'suspendido' && (
          <Button
            variant="primary"
            className="w-full justify-center bg-blue-600 hover:bg-blue-700"
            onClick={() => onCambiarEstado?.('en_ejecucion')}
          >
            <Play size={18} className="mr-2" />
            Reanudar Proyecto
          </Button>
        )}

        {/* --- ACCIONES SECUNDARIAS --- */}
        <div className="pt-4 space-y-2">
          {puedeEditar && (
            <Button
              variant="secondary"
              className="w-full justify-center text-gray-700 border-gray-300"
              onClick={() => navigate(`/proyectos-remediacion/${proyecto.id}/editar`)}
            >
              <Edit size={16} className="mr-2" />
              Editar Planificación
            </Button>
          )}

          {puedeEliminar && (
            <Button
              variant="secondary"
              className="w-full justify-center text-red-600 border-transparent hover:bg-red-50 hover:text-red-700 transition-colors"
              onClick={onEliminar}
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar Definitivamente
            </Button>
          )}
        </div>

        {/* --- METADATOS DEL PROYECTO --- */}
        <div className="mt-6 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 px-6 pb-2 rounded-b-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between group">
              <div className="flex items-center text-gray-500 gap-1.5">
                <User size={13} />
                <span className="text-[11px] font-medium">Líder:</span>
              </div>
              <span className="text-[11px] font-bold text-gray-700">
                {proyecto.creado_por_info?.nombre_completo.split(' ')[0] || 'Sistema'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-500 gap-1.5">
                <Archive size={13} />
                <span className="text-[11px] font-medium">Versión:</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-white px-1.5 border rounded text-blue-600">
                v{proyecto.version}.0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-500 gap-1.5">
                <History size={13} />
                <span className="text-[11px] font-medium">Sincronización:</span>
              </div>
              <span className="text-[11px] text-gray-600 font-medium">
                {new Date(proyecto.fecha_actualizacion).toLocaleDateString('es-PE', {
                   day: '2-digit', month: 'short'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};