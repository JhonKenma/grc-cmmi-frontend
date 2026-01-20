// src/pages/reportes/ReporteEvaluacion.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Download, 
  BarChart3, 
  FileText, 
  Target,
  Users,
  Activity,
} from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { evaluacionesApi, reportesApi } from '@/api/endpoints';
import { ReporteEvaluacion as ReporteEvaluacionType } from '@/api/endpoints/reportes.api';
import toast from 'react-hot-toast';

// Componentes modulares
import { ResumenGeneral } from './components/ResumenGeneral';
import { GraficoRadar } from './components/GraficoRadar';
import { GraficoBarrasGap } from './components/GraficoBarrasGap';
import { GraficoPastelClasificacion } from './components/GraficoPastelClasificacion';
import { GraficoPastelRespuestas } from './components/GraficoPastelRespuestas';
import { TablaDetalleDimensiones } from './components/TablaDetalleDimensiones';
import { ProgresoUsuarios } from './components/ProgresoUsuarios';
import { ExportButtons } from './components/ExportButtons'; 

// Importar el Modal de GAP
import { ModalCrearDesdeGAP } from '@/pages/proyectos-remediacion/ModalCrearDesdeGAP';

type TabType = 'resumen' | 'dimensiones' | 'usuarios' | 'analisis';

interface Tab {
  id: TabType;
  name: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'resumen', name: 'Resumen General', icon: <BarChart3 size={18} /> },
  { id: 'dimensiones', name: 'Análisis de Dimensiones', icon: <Target size={18} /> },
  { id: 'usuarios', name: 'Progreso por Usuario', icon: <Users size={18} /> },
  { id: 'analisis', name: 'Análisis de Brechas', icon: <Activity size={18} /> },
];

export const ReporteEvaluacion: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>('');
  const [reporte, setReporte] = useState<ReporteEvaluacionType | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('resumen');

  // ═══════════════════════════════════════════════════════════════
  // ESTADOS PARA EL MODAL DE PROYECTOS GAP
  // ═══════════════════════════════════════════════════════════════
  const [modalGAPOpen, setModalGAPOpen] = useState(false);
  const [selectedGAP, setSelectedGAP] = useState<any>(null);

  useEffect(() => {
    loadEvaluaciones();
  }, []);

  const loadEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesApi.getMisEvaluaciones();
      const lista = data.results || [];
      setEvaluaciones(lista);

      if (lista.length > 0) {
        setEvaluacionSeleccionada(lista[0].id);
        await loadReporte(lista[0].id);
      }
    } catch (error: any) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadReporte = async (evaluacionId: string) => {
    try {
      setLoadingReporte(true);
      const data = await reportesApi.getReporteEvaluacion(evaluacionId);
      setReporte(data);
    } catch (error: any) {
      console.error('Error al cargar reporte:', error);
      toast.error('Error al cargar reporte de evaluación');
    } finally {
      setLoadingReporte(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // FUNCIÓN PARA ABRIR MODAL DE PROYECTO DESDE LA BRECHA
  // ═══════════════════════════════════════════════════════════════
  const handleCrearProyectoDesdeBrecha = (gapData: {
    calculoNivelId: string;
    dimension_nombre: string;
    dimension_codigo: string;
    gap: number;
    clasificacion_gap: string;
    nivel_actual: number;
    nivel_deseado: number;
  }) => {
    setSelectedGAP({
      calculoNivelId: gapData.calculoNivelId,
      gapInfo: {
        dimension_nombre: gapData.dimension_nombre,
        dimension_codigo: gapData.dimension_codigo,
        gap: gapData.gap,
        clasificacion_gap: gapData.clasificacion_gap,
        nivel_actual: gapData.nivel_actual,
        nivel_deseado: gapData.nivel_deseado,
      }
    });
    setModalGAPOpen(true);
  };

  const handleChangeEvaluacion = (evaluacionId: string) => {
    setEvaluacionSeleccionada(evaluacionId);
    loadReporte(evaluacionId);
  };

  if (loading) return <LoadingScreen message="Cargando evaluaciones..." />;

  if (evaluaciones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center py-12 px-6">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay evaluaciones disponibles
            </h3>
            <p className="text-gray-600">
              Aún no tienes evaluaciones asignadas para generar reportes
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* HEADER PROFESIONAL */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard de Evaluación CMMI
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Análisis de madurez y brechas de mejora
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={evaluacionSeleccionada}
                onChange={(e) => handleChangeEvaluacion(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {evaluaciones.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.encuesta_info?.nombre}
                  </option>
                ))}
              </select>

              {evaluacionSeleccionada && (
                <ExportButtons evaluacionId={evaluacionSeleccionada} />
              )}
            </div>
          </div>

          {/* MÉTRICAS EN LÍNEA */}
          {reporte && (
            <div className="flex items-center gap-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Empresa</p>
                  <p className="text-sm font-bold text-gray-900">{reporte.evaluacion.empresa}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-purple-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Estado</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {reporte.evaluacion.estado.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-12 bg-green-600 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1.5">Progreso</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${reporte.evaluacion.porcentaje_avance}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-green-600 min-w-[3rem]">
                      {reporte.evaluacion.porcentaje_avance.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABS DE NAVEGACIÓN */}
          <div className="flex gap-8 mt-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-3 font-medium text-sm transition-all relative
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

      {/* CONTENIDO DE CADA TAB */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loadingReporte ? (
            <div className="flex items-center justify-center py-32">
              <LoadingScreen message="Generando reporte..." />
            </div>
          ) : !reporte ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600">No hay datos disponibles</p>
              </div>
            </Card>
          ) : (
            <>
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  <ResumenGeneral resumen={reporte.resumen} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadar dimensiones={reporte.por_dimension} />
                    <GraficoPastelClasificacion clasificaciones={reporte.clasificaciones_gap} />
                  </div>
                </div>
              )}

              {activeTab === 'dimensiones' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadar dimensiones={reporte.por_dimension} />
                    <GraficoBarrasGap dimensiones={reporte.por_dimension} />
                  </div>
                  
                  {/* ✅ USAMOS LOS DATOS REALES SIN SOBRESCRIBIR total_proyectos */}
                  <TablaDetalleDimensiones 
                    dimensiones={reporte.por_dimension}
                    onCrearProyecto={handleCrearProyectoDesdeBrecha}
                  />
                </div>
              )}

              {activeTab === 'usuarios' && (
                <div className="space-y-6">
                  <ProgresoUsuarios usuarios={reporte.por_usuario} />
                </div>
              )}

              {activeTab === 'analisis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoPastelClasificacion clasificaciones={reporte.clasificaciones_gap} />
                    <GraficoBarrasGap dimensiones={reporte.por_dimension} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <h3 className="text-sm font-medium text-red-800 mb-2">Críticos/Altos</h3>
                      <p className="text-4xl font-bold text-red-600">
                        {(reporte.clasificaciones_gap.critico || 0) + (reporte.clasificaciones_gap.alto || 0)}
                      </p>
                      <p className="text-xs text-red-700 mt-2">Atención inmediata</p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-800 mb-2">Medios/Bajos</h3>
                      <p className="text-4xl font-bold text-yellow-600">
                        {(reporte.clasificaciones_gap.medio || 0) + (reporte.clasificaciones_gap.bajo || 0)}
                      </p>
                      <p className="text-xs text-yellow-700 mt-2">En mejora</p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Cumplidos</h3>
                      <p className="text-4xl font-bold text-green-600">
                        {(reporte.clasificaciones_gap.cumplido || 0) + (reporte.clasificaciones_gap.superado || 0)}
                      </p>
                      <p className="text-xs text-green-700 mt-2">Objetivos logrados</p>
                    </Card>
                  </div>
                  <GraficoPastelRespuestas distribucion={reporte.distribucion_respuestas} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAL DE CREACIÓN DE PROYECTO DESDE GAP
      ═══════════════════════════════════════════════════════════════ */}
      {selectedGAP && (
        <ModalCrearDesdeGAP
          isOpen={modalGAPOpen}
          onClose={() => {
            setModalGAPOpen(false);
            setSelectedGAP(null);
          }}
          onSuccess={() => {
            // ✅ RECARGAR EL REPORTE PARA ACTUALIZAR CONTADORES DE PROYECTOS
            loadReporte(evaluacionSeleccionada);
            setModalGAPOpen(false);
            setSelectedGAP(null);
            toast.success('Proyecto creado exitosamente');
          }}
          calculoNivelId={selectedGAP.calculoNivelId}
          gapInfo={selectedGAP.gapInfo}
        />
      )}
    </div>
  );
};