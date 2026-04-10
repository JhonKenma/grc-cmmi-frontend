// src/pages/reportes/ReporteEvaluacionIQ.tsx

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3, FileText, Target, Users, Activity,
  AlertTriangle, Download, ShieldCheck,
} from 'lucide-react';
import { Card, LoadingScreen } from '@/components/common';
import { reportesIQApi } from '@/api/endpoints/reportes-iq.api';
import toast from 'react-hot-toast';
import type { ReporteEvaluacionIQ as ReporteIQData, AsignacionIQAuditada, BrechaIQ } from '@/types/reporte-iq.types';
import { adaptarSeccionParaTabla } from '@/types/reporte-iq.types';

// ── Reutilizamos los mismos componentes de encuestas ──────────────────────────
const ResumenGeneral = lazy(() =>
  import('./components/ResumenGeneral').then(m => ({ default: m.ResumenGeneral }))
);
const GraficoRadar = lazy(() =>
  import('./components/GraficoRadar').then(m => ({ default: m.GraficoRadar }))
);
const GraficoBarrasGap = lazy(() =>
  import('./components/GraficoBarrasGap').then(m => ({ default: m.GraficoBarrasGap }))
);
const GraficoPastelClasificacion = lazy(() =>
  import('./components/GraficoPastelClasificacion').then(m => ({ default: m.GraficoPastelClasificacion }))
);
const GraficoPastelRespuestas = lazy(() =>
  import('./components/GraficoPastelRespuestas').then(m => ({ default: m.GraficoPastelRespuestas }))
);
const TablaDetalleDimensiones = lazy(() =>
  import('./components/TablaDetalleDimensiones').then(m => ({ default: m.TablaDetalleDimensiones }))
);
const ProgresoUsuarios = lazy(() =>
  import('./components/ProgresoUsuarios').then(m => ({ default: m.ProgresoUsuarios }))
);

// ── Tabs ──────────────────────────────────────────────────────────────────────

type TabType = 'resumen' | 'secciones' | 'brechas' | 'analisis';

const TABS = [
  { id: 'resumen'   as TabType, name: 'Resumen General',      icon: <BarChart3 size={18} /> },
  { id: 'secciones' as TabType, name: 'Análisis por Sección', icon: <Target size={18} />   },
  { id: 'brechas'   as TabType, name: 'Brechas a Remediar',   icon: <AlertTriangle size={18} /> },
  { id: 'analisis'  as TabType, name: 'Distribución',         icon: <Activity size={18} /> },
];

const SectionLoader = () => (
  <div className="w-full h-64 bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 animate-pulse">
    <Activity className="mb-2 opacity-20" size={32} />
    <span className="text-sm">Cargando visualización...</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Tabla de brechas para remediación
// ─────────────────────────────────────────────────────────────────────────────

const TablaBrechas: React.FC<{ brechas: BrechaIQ[] }> = ({ brechas }) => {
  const COLORES: Record<string, string> = {
    critico: 'bg-red-100 text-red-800 border-red-200',
    alto:    'bg-orange-100 text-orange-800 border-orange-200',
    medio:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    bajo:    'bg-blue-100 text-blue-800 border-blue-200',
  };
  const ICONOS: Record<string, string> = {
    critico: '🔴', alto: '🟠', medio: '🟡', bajo: '🔵',
  };

  if (brechas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShieldCheck size={48} className="mx-auto text-green-500 mb-3" />
        <p className="text-lg font-semibold text-gray-800">¡Sin brechas significativas!</p>
        <p className="text-sm text-gray-500 mt-1">
          Todos los controles cumplen o superan el nivel deseado.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Brechas Identificadas</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {brechas.length} secciones requieren atención — ordenadas por prioridad
          </p>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {brechas.filter(b => b.clasificacion_gap === 'critico').length} críticas ·{' '}
          {brechas.filter(b => b.clasificacion_gap === 'alto').length} altas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Prioridad', 'Sección', 'Framework', 'Nivel Deseado', 'Nivel Actual', 'GAP', '% Cumpl.', 'No Cumple'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {brechas.map((brecha, idx) => (
              <tr key={brecha.calculo_nivel_iq_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${COLORES[brecha.clasificacion_gap] || 'bg-gray-100 text-gray-700'}`}>
                    {ICONOS[brecha.clasificacion_gap]} {brecha.clasificacion_gap_display}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={brecha.seccion}>
                    {brecha.seccion}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{brecha.framework_nombre}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                    {brecha.nivel_deseado.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                    {brecha.nivel_actual.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-7 rounded-full text-sm font-semibold ${
                    brecha.gap >= 2 ? 'bg-red-100 text-red-800' :
                    brecha.gap >= 1 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {brecha.gap.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${brecha.porcentaje_cumplimiento}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[36px]">
                      {brecha.porcentaje_cumplimiento.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-red-600">
                    {brecha.respuestas_no_cumple}
                    <span className="text-gray-400 font-normal"> / {brecha.total_preguntas}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const ReporteEvaluacionIQ: React.FC = () => {
  const { user } = useAuth();

  const [loading,               setLoading]               = useState(true);
  const [evaluaciones,          setEvaluaciones]          = useState<AsignacionIQAuditada[]>([]);
  const [seleccionadaId,        setSeleccionadaId]        = useState<number | null>(null);
  const [reporte,               setReporte]               = useState<ReporteIQData | null>(null);
  const [loadingReporte,        setLoadingReporte]        = useState(false);
  const [activeTab,             setActiveTab]             = useState<TabType>('resumen');

  // ── Cargar selector ────────────────────────────────────────────────────────
  useEffect(() => {
    cargarEvaluaciones();
    console.log('🔍 ReporteEvaluacionIQ montado');
    console.log('🔍 user:', user);
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      // Ya no necesita empresa_id — el backend lo toma del token
      console.log('🔍 llamando listarEvaluaciones...');
      const lista = await reportesIQApi.listarEvaluaciones();
      console.log('🔍 lista evaluaciones IQ:', lista);
      console.log('🔍 lista:', lista);
      setEvaluaciones(lista);

      if (lista.length > 0) {
        setSeleccionadaId(lista[0].asignacion_id);
        cargarReporte(lista[0].asignacion_id);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error al cargar evaluaciones IQ');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporte = async (asignacionId: number) => {
    try {
      setLoadingReporte(true);
      console.log('🔍 cargando reporte para asignacion:', asignacionId);
      const data = await reportesIQApi.getReporte(asignacionId);
      console.log('🔍 reporte recibido:', data);
      setReporte(data);
    } catch (error: any) {
      console.error('❌ Error reporte:', error.response?.data || error);
      const msg = error.response?.data?.message || 'Error al cargar reporte IQ';
      toast.error(msg);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleCambiarEvaluacion = (id: number) => {
    setSeleccionadaId(id);
    cargarReporte(id);
  };

  // ── Datos adaptados para los componentes reutilizados ─────────────────────
  const seccionesAdaptadas = useMemo(() => {
    if (!reporte) return [];
    return reporte.por_seccion.map(adaptarSeccionParaTabla);
  }, [reporte]);

  // Para GraficoRadar y GraficoBarrasGap — shape de encuestas
  const dimensionesParaGraficos = useMemo(() => {
    if (!reporte) return [];
    return reporte.por_seccion.map(s => ({
      dimension: {
        id:     s.seccion.id,
        codigo: s.seccion.codigo,
        nombre: s.seccion.nombre,
        orden:  s.seccion.orden,
      },
      nivel_deseado:                    s.nivel_deseado,
      nivel_actual_promedio:            s.nivel_actual_promedio,
      gap_promedio:                     s.gap_promedio,
      porcentaje_cumplimiento_promedio: s.porcentaje_cumplimiento_promedio,
      clasificacion_gap:                s.clasificacion_gap,
    }));
  }, [reporte]);

  // Para ProgresoUsuarios — shape de encuestas
    const usuariosAdaptados = useMemo(() => {
    if (!reporte) return [];
    return reporte.por_usuario.map(u => ({
        usuario: {
        id:              u.usuario.id,
        nombre_completo: u.usuario.nombre_completo,
        email:           u.usuario.email,
        cargo:           u.usuario.cargo ?? '',  // ← fix
        },
        nivel_actual_promedio:            u.nivel_actual_promedio,
        gap_promedio:                     u.gap_promedio,
        porcentaje_cumplimiento_promedio: u.porcentaje_cumplimiento_promedio,
        total_dimensiones_evaluadas:      u.total_dimensiones_evaluadas,
        dimensiones: u.dimensiones.map(d => ({
        dimension_id:           `${d.framework_nombre}__${d.seccion_nombre}`,
        dimension_codigo:       d.seccion_nombre.substring(0, 8).toUpperCase(),
        dimension_nombre:       `${d.seccion_nombre} (${d.framework_nombre})`,
        nivel_deseado:          d.nivel_deseado,
        nivel_actual:           d.nivel_actual,
        gap:                    d.gap,
        clasificacion_gap:      d.clasificacion_gap,
        porcentaje_cumplimiento: d.porcentaje_cumplimiento,
        })),
    }));
    }, [reporte]);

  const gapStats = useMemo(() => {
    if (!reporte?.clasificaciones_gap) return { criticos: 0, medios: 0, cumplidos: 0 };
    const c = reporte.clasificaciones_gap;
    return {
      criticos:  (c.critico || 0) + (c.alto || 0),
      medios:    (c.medio   || 0) + (c.bajo || 0),
      cumplidos: (c.cumplido || 0) + (c.superado || 0),
    };
  }, [reporte]);

  // ── Estados vacíos ────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Cargando evaluaciones IQ..." />;

  if (evaluaciones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center py-12 px-6">
            <ShieldCheck size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay evaluaciones IQ auditadas
            </h3>
            <p className="text-gray-500 text-sm">
              Las evaluaciones deben estar auditadas para generar reportes.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const evaluacionActual = evaluaciones.find(e => e.asignacion_id === seleccionadaId);

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Título + controles */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Dashboard Evaluación Inteligente
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Análisis GAP por secciones y frameworks · Identificación de brechas
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de evaluación */}
              <select
                value={seleccionadaId ?? ''}
                onChange={e => handleCambiarEvaluacion(Number(e.target.value))}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer max-w-[280px]"
              >
                {evaluaciones.map(ev => (
                  <option key={ev.asignacion_id} value={ev.asignacion_id}>
                    {ev.evaluacion_nombre} — {ev.usuario}
                  </option>
                ))}
              </select>

              {/* Exportar */}
              {seleccionadaId && (
                <div className="flex gap-2">
                <button
                  onClick={async () => await reportesIQApi.exportarPDF(seleccionadaId!)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  <Download size={16} /> PDF
                </button>
                <button
                  onClick={async () => await reportesIQApi.exportarExcel(seleccionadaId!)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Download size={16} /> Excel
                </button>
                </div>
              )}
            </div>
          </div>

          {/* Métricas inline */}
          {reporte && (
            <div className="flex items-center gap-8 pb-6 border-b border-gray-200 flex-wrap">

              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Empresa</p>
                  <p className="text-sm font-bold text-gray-900">{reporte.asignacion.empresa}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-purple-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Evaluado</p>
                  <p className="text-sm font-bold text-gray-900">{reporte.asignacion.usuario}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-indigo-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Frameworks</p>
                  <p className="text-sm font-bold text-gray-900">
                    {reporte.asignacion.frameworks.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-2 h-12 rounded-full ${
                  reporte.resumen.gap_promedio >= 2 ? 'bg-red-500' :
                  reporte.resumen.gap_promedio >= 1 ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">GAP Promedio</p>
                  <p className={`text-sm font-bold ${
                    reporte.resumen.gap_promedio >= 2 ? 'text-red-600' :
                    reporte.resumen.gap_promedio >= 1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {reporte.resumen.gap_promedio.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-amber-500 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Brechas</p>
                  <p className="text-sm font-bold text-amber-600">
                    {reporte.brechas_identificadas.length} secciones
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-8 mt-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 font-medium text-sm transition-all relative ${
                  activeTab === tab.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
                {/* Badge brechas */}
                {tab.id === 'brechas' && reporte && reporte.brechas_identificadas.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {reporte.brechas_identificadas.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {loadingReporte ? (
            <div className="flex items-center justify-center py-32">
              <LoadingScreen message="Generando reporte..." />
            </div>
          ) : !reporte ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">No hay datos disponibles</p>
              </div>
            </Card>
          ) : (
            <Suspense fallback={<SectionLoader />}>

              {/* ── RESUMEN ── */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  <ResumenGeneral resumen={reporte.resumen} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadar dimensiones={dimensionesParaGraficos} />
                    <GraficoPastelClasificacion
                      clasificaciones={reporte.clasificaciones_gap}
                      dimensiones={dimensionesParaGraficos}
                    />
                  </div>
                </div>
              )}

              {/* ── SECCIONES ── */}
              {activeTab === 'secciones' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadar dimensiones={dimensionesParaGraficos} />
                    <GraficoBarrasGap dimensiones={dimensionesParaGraficos} />
                  </div>
                  {/* TablaDetalleDimensiones reutilizada con datos adaptados */}
                  <TablaDetalleDimensiones
                    dimensiones={seccionesAdaptadas}
                    onCrearProyecto={undefined}  // Se habilitará cuando exista remediación IQ
                  />
                </div>
              )}

              {/* ── BRECHAS ── */}
              {activeTab === 'brechas' && (
                <div className="space-y-6">

                  {/* Tarjetas resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Críticas',  count: reporte.clasificaciones_gap.critico,  color: 'red'    },
                      { label: 'Altas',     count: reporte.clasificaciones_gap.alto,     color: 'orange' },
                      { label: 'Medias',    count: reporte.clasificaciones_gap.medio,    color: 'yellow' },
                      { label: 'Bajas',     count: reporte.clasificaciones_gap.bajo,     color: 'blue'   },
                    ].map(({ label, count, color }) => (
                      <Card key={label} className={`p-5 bg-${color}-50 border-${color}-200`}>
                        <p className={`text-sm font-medium text-${color}-800 mb-1`}>{label}</p>
                        <p className={`text-3xl font-bold text-${color}-600`}>{count}</p>
                        <p className={`text-xs text-${color}-700 mt-1`}>secciones</p>
                      </Card>
                    ))}
                  </div>

                  <TablaBrechas brechas={reporte.brechas_identificadas} />
                </div>
              )}

              {/* ── ANÁLISIS ── */}
              {activeTab === 'analisis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoPastelClasificacion
                      clasificaciones={reporte.clasificaciones_gap}
                      dimensiones={dimensionesParaGraficos}
                    />
                    <GraficoBarrasGap dimensiones={dimensionesParaGraficos} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <h3 className="text-sm font-medium text-red-800 mb-2">Críticos / Altos</h3>
                      <p className="text-4xl font-bold text-red-600">{gapStats.criticos}</p>
                      <p className="text-xs text-red-700 mt-2">Atención inmediata</p>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-800 mb-2">Medios / Bajos</h3>
                      <p className="text-4xl font-bold text-yellow-600">{gapStats.medios}</p>
                      <p className="text-xs text-yellow-700 mt-2">En seguimiento</p>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Cumplidos</h3>
                      <p className="text-4xl font-bold text-green-600">{gapStats.cumplidos}</p>
                      <p className="text-xs text-green-700 mt-2">Objetivos logrados</p>
                    </Card>
                  </div>

                  <GraficoPastelRespuestas distribucion={reporte.distribucion_respuestas} />

                  <ProgresoUsuarios usuarios={usuariosAdaptados} />
                </div>
              )}

            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};