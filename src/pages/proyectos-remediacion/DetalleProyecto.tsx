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
  ClipboardList 
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

  // ⭐ Usar el hook de React Query
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

        {/* ⭐ TAB: Presupuesto - ACTUALIZADO CON GESTIÓN DE ÍTEMS */}
        {activeTab === 'presupuesto' && (
          <div className="space-y-6">
            {/* Componente original de presupuesto */}
            <ProyectoPresupuesto proyecto={proyecto} />
            
            {/* ⭐ GESTIÓN DE ÍTEMS - Solo si modo='por_items' */}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Planificación y Estrategia
              </h3>

              {/* Alcance */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Alcance del Proyecto
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {proyecto.alcance_proyecto || 'No especificado'}
                </p>
              </div>

              {/* Objetivos Específicos */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Objetivos Específicos
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {proyecto.objetivos_especificos || 'No especificado'}
                </p>
              </div>

              {/* Criterios de Aceptación */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Criterios de Aceptación
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-green-50 p-4 rounded-lg">
                  {proyecto.criterios_aceptacion || 'No especificado'}
                </p>
              </div>

              {/* Riesgos */}
              {proyecto.riesgos_proyecto && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Riesgos Identificados
                  </h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-orange-50 p-4 rounded-lg">
                    {proyecto.riesgos_proyecto}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};