// src/pages/proyectos-remediacion/DetalleProyecto.tsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen, Card } from '@/components/common';
import { useProyecto } from '@/hooks/useProyectosRemediacion';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  ClipboardList, 
  CheckCircle
} from 'lucide-react';

// ⭐ Importar componentes modulares
import { ProyectoHeader } from './components/ProyectoHeader';
import { ProyectoGAPInfo } from './components/ProyectoGAPInfo';
import { ProyectoTimeline } from './components/ProyectoTimeline';
import { ProyectoResponsables } from './components/ProyectoResponsables';
import { ProyectoPresupuesto } from './components/ProyectoPresupuesto';
import { ProyectoInfoGeneral } from './components/ProyectoInfoGeneral';
// ⭐ NUEVO: Importar gestión de ítems
import { GestionItems } from './components/proyectos-remediacion/GestionItems';
import { ModalSolicitarAprobacion } from './components/proyectos-remediacion/ModalSolicitarAprobacion';

type TabType = 'general' | 'gap' | 'responsables' | 'presupuesto' | 'timeline' | 'planificacion';

interface Tab {
  id: TabType;
  name: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'general', name: 'Información General', icon: <FileText size={18} /> },
  { id: 'gap', name: 'Brecha (GAP)', icon: <AlertTriangle size={18} /> },
  { id: 'timeline', name: 'Timeline', icon: <Calendar size={18} /> },
  { id: 'responsables', name: 'Responsables', icon: <Users size={18} /> },
  { id: 'presupuesto', name: 'Presupuesto', icon: <DollarSign size={18} /> },
  { id: 'planificacion', name: 'Planificación', icon: <ClipboardList size={18} /> },
];

export const DetalleProyecto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showModalAprobacion, setShowModalAprobacion] = useState(false);
  const { data: proyecto, isLoading, isError, error, refetch } = useProyecto(id!);

  // ═══════════════════════════════════════════════════════════
  // ESTADOS DE CARGA Y ERROR
  // ═══════════════════════════════════════════════════════════

  if (isLoading) {
    return <LoadingScreen message="Cargando proyecto..." />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center py-12 px-6">
            <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar el proyecto
            </h3>
            <p className="text-gray-600">
              {(error as any)?.response?.data?.message || 'No se pudo cargar la información del proyecto'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center py-12 px-6">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Proyecto no encontrado
            </h3>
            <p className="text-gray-600">
              El proyecto que buscas no existe o no tienes permisos para verlo
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════

  // ⭐ LÓGICA DE VISIBILIDAD DEL BANNER
  // Se muestra solo si:
  // 1. Hay ítems (total > 0)
  // 2. Están todos terminados
  // 3. NO se ha cerrado aún (fecha_fin_real es null)
  // 4. NO está ya en proceso de validación (estado !== 'en_validacion')
  const mostrarBannerCierre = 
    proyecto.total_items > 0 && 
    proyecto.items_completados === proyecto.total_items && 
    !proyecto.fecha_fin_real && 
    proyecto.estado !== 'en_validacion';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ HEADER ═══ */}
      <ProyectoHeader proyecto={proyecto} />

      {/* ═══ NAVEGACIÓN DE TABS ═══ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-4 pt-4 font-medium text-sm transition-all relative whitespace-nowrap
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ⭐ Banner de Acción de Cierre - CORREGIDO PARA DESAPARECER TRAS SOLICITAR */}
      {mostrarBannerCierre && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-blue-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} />
              <div>
                <p className="font-bold">¡Proyecto Completado!</p>
                <p className="text-blue-100 text-sm">Ya puedes solicitar la validación del cierre de este GAP.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModalAprobacion(true)}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Solicitar Aprobación
            </button>
          </div>
        </div>
      )}

      {/* ⭐ Banner Informativo de Estado Pendiente de Validación */}
      {proyecto.estado === 'en_validacion' && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-amber-500 rounded-xl p-4 flex items-center gap-3 text-white shadow-lg shadow-amber-100">
            <ClipboardList size={24} />
            <div>
              <p className="font-bold">Solicitud en revisión</p>
              <p className="text-amber-50 text-sm">El validador interno está revisando el cumplimiento de este proyecto.</p>
            </div>
          </div>
        </div>
      )}


      {/* ═══ CONTENIDO PRINCIPAL ═══ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB: Información General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <ProyectoInfoGeneral proyecto={proyecto} />
          </div>
        )}

        {/* TAB: Brecha (GAP) */}
        {activeTab === 'gap' && (
          <div className="space-y-6">
            <ProyectoGAPInfo proyecto={proyecto} />
          </div>
        )}

        {/* TAB: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <ProyectoTimeline proyecto={proyecto} />
          </div>
        )}

        {/* TAB: Responsables */}
        {activeTab === 'responsables' && (
          <div className="space-y-6">
            <ProyectoResponsables proyecto={proyecto} />
          </div>
        )}

        {/* TAB: Presupuesto */}
        {activeTab === 'presupuesto' && (
          <div className="space-y-6">
            <ProyectoPresupuesto proyecto={proyecto} />
            {proyecto.modo_presupuesto === 'por_items' && (
              <Card>
                <GestionItems 
                  proyecto={proyecto} 
                  onProyectoUpdate={refetch}
                />
              </Card>
            )}
          </div>
        )}

        {/* TAB: Planificación */}
        {activeTab === 'planificacion' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Planificación y Estrategia</h3>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Alcance del Proyecto</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {proyecto.alcance_proyecto || 'No especificado'}
                </p>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Objetivos Específicos</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {proyecto.objetivos_especificos || 'No especificado'}
                </p>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Criterios de Aceptación</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-green-50 p-4 rounded-lg">
                  {proyecto.criterios_aceptacion || 'No especificado'}
                </p>
              </div>
              {proyecto.riesgos_proyecto && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Riesgos Identificados</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-orange-50 p-4 rounded-lg">
                    {proyecto.riesgos_proyecto}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ⭐ MODAL DE SOLICITUD */}
      {showModalAprobacion && proyecto && (
        <ModalSolicitarAprobacion
          proyecto={proyecto}
          onClose={() => setShowModalAprobacion(false)}
          onSuccess={() => {
            refetch(); // Esto actualizará el estado a 'en_validacion' y ocultará el banner azul
          }}
        />
      )}
    </div>
  );
};