// src/pages/reportes/ReporteEvaluacionIQ.tsx

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  BarChart3, Target, AlertTriangle, Activity,
  Download, ShieldCheck, Users, Layers, RefreshCw,
} from 'lucide-react';
import { Card, LoadingScreen } from '@/components/common';
import { reportesIQApi } from '@/api/endpoints/reportes-iq.api';
import toast from 'react-hot-toast';
import type {
  ReporteEvaluacionIQ as ReporteIQType,
  EvaluacionIQAuditada,
} from '@/types/reporte-iq.types';

// ── Componentes propios IQ ────────────────────────────────────────────────────
const ResumenIQ = lazy(() =>
  import('./components/components-iq/ResumenIQ').then(m => ({ default: m.ResumenIQ }))
);
const TablaSeccionesIQ = lazy(() =>
  import('./components/components-iq/TablaSeccionesIQ').then(m => ({ default: m.TablaSeccionesIQ }))
);
const TablaBrechasIQ = lazy(() =>
  import('./components/components-iq/TablaBrechasIQ').then(m => ({ default: m.TablaBrechasIQ }))
);
const GraficoRadarIQ = lazy(() =>
  import('./components/components-iq/GraficosIQ').then(m => ({ default: m.GraficoRadarIQ }))
);
const GraficoBarrasIQ = lazy(() =>
  import('./components/components-iq/GraficosIQ').then(m => ({ default: m.GraficoBarrasIQ }))
);
const GraficoPastelRespuestas = lazy(() =>
  import('./components/GraficoPastelRespuestas').then(m => ({ default: m.GraficoPastelRespuestas }))
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
type TabType = 'resumen' | 'secciones' | 'brechas' | 'analisis';

const TABS: { id: TabType; name: string; icon: React.ReactNode }[] = [
  { id: 'resumen',   name: 'Resumen',        icon: <BarChart3 size={17} />     },
  { id: 'secciones', name: 'Por Sección',     icon: <Target size={17} />        },
  { id: 'brechas',   name: 'Brechas',         icon: <AlertTriangle size={17} /> },
  { id: 'analisis',  name: 'Distribución',    icon: <Activity size={17} />      },
];

// ── Estilos estáticos para Tailwind (evitar clases dinámicas) ─────────────────
const CARD_STYLES = {
  red:    { card: 'p-5 bg-red-50 border-red-200',       label: 'text-sm font-medium text-red-800 mb-1',    value: 'text-3xl font-bold text-red-600',    sub: 'text-xs text-red-700 mt-1'    },
  orange: { card: 'p-5 bg-orange-50 border-orange-200', label: 'text-sm font-medium text-orange-800 mb-1', value: 'text-3xl font-bold text-orange-600', sub: 'text-xs text-orange-700 mt-1' },
  yellow: { card: 'p-5 bg-yellow-50 border-yellow-200', label: 'text-sm font-medium text-yellow-800 mb-1', value: 'text-3xl font-bold text-yellow-600', sub: 'text-xs text-yellow-700 mt-1' },
  blue:   { card: 'p-5 bg-blue-50 border-blue-200',     label: 'text-sm font-medium text-blue-800 mb-1',   value: 'text-3xl font-bold text-blue-600',   sub: 'text-xs text-blue-700 mt-1'   },
} as const;

const SectionLoader = () => (
  <div className="w-full h-64 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 animate-pulse">
    <span className="text-sm">Cargando visualización...</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const ReporteEvaluacionIQ: React.FC = () => {
  const [loading,        setLoading]        = useState(true);
  const [evaluaciones,   setEvaluaciones]   = useState<EvaluacionIQAuditada[]>([]);
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const [reporte,        setReporte]        = useState<ReporteIQType | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [activeTab,      setActiveTab]      = useState<TabType>('resumen');

  useEffect(() => { cargarEvaluaciones(); }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const lista = await reportesIQApi.listarEvaluaciones();
      setEvaluaciones(lista);
      if (lista.length > 0) {
        setSeleccionadaId(lista[0].evaluacion_id);
        cargarReporte(lista[0].evaluacion_id);
      }
    } catch {
      toast.error('Error al cargar evaluaciones IQ');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporte = async (evaluacionId: number) => {
    try {
      setLoadingReporte(true);
      const data = await reportesIQApi.getReporte(evaluacionId);
      setReporte(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar reporte IQ');
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleCambiar = (id: number) => {
    setSeleccionadaId(id);
    setActiveTab('resumen');
    cargarReporte(id);
  };

  // ── Stats para tarjetas de análisis ──────────────────────────────────────
  const gapStats = useMemo(() => {
    if (!reporte?.clasificaciones_gap) return { criticos: 0, medios: 0, cumplidos: 0 };
    const c = reporte.clasificaciones_gap;
    return {
      criticos:  (c.critico  || 0) + (c.alto    || 0),
      medios:    (c.medio    || 0) + (c.bajo    || 0),
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
              Las evaluaciones deben tener al menos un usuario auditado para generar reportes.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Título + controles */}
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Reporte — Evaluación Inteligente IQ
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Análisis GAP por secciones · Múltiples frameworks · Múltiples usuarios
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Selector de evaluación */}
              <select
                value={seleccionadaId ?? ''}
                onChange={e => handleCambiar(Number(e.target.value))}
                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 cursor-pointer max-w-[300px]"
              >
                {evaluaciones.map(ev => (
                  <option key={ev.evaluacion_id} value={ev.evaluacion_id}>
                    {ev.evaluacion_nombre}
                    {ev.total_usuarios > 1 ? ` (${ev.total_usuarios} usuarios)` : ''}
                  </option>
                ))}
              </select>

              {/* Actualizar */}
              <button
                onClick={cargarEvaluaciones}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw size={16} />
              </button>

              {/* Exportar */}
              {seleccionadaId && (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try { await reportesIQApi.exportarPDF(seleccionadaId); }
                      catch { toast.error('Error al exportar PDF'); }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download size={15} /> PDF
                  </button>
                  <button
                    onClick={async () => {
                      try { await reportesIQApi.exportarExcel(seleccionadaId); }
                      catch { toast.error('Error al exportar Excel'); }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={15} /> Excel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Métricas de cabecera */}
          {reporte && (
            <div className="flex items-center gap-6 pb-5 border-b border-gray-200 flex-wrap">

              {/* Nombre evaluación */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Evaluación</p>
                  <p className="text-sm font-bold text-gray-900 max-w-[200px] truncate">
                    {reporte.evaluacion.nombre}
                  </p>
                </div>
              </div>

              {/* Usuarios */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-purple-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Usuarios</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Users size={13} className="text-purple-500" />
                    {reporte.evaluacion.total_usuarios} evaluados
                  </p>
                </div>
              </div>

              {/* Frameworks */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Frameworks</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {reporte.evaluacion.frameworks.map(fw => (
                      <span
                        key={fw.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded"
                      >
                        <Layers size={9} /> {fw.codigo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nivel deseado */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-blue-400 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Nivel Deseado</p>
                  <p className="text-sm font-bold text-blue-600">
                    {reporte.evaluacion.nivel_deseado_display}
                  </p>
                </div>
              </div>

              {/* GAP Promedio */}
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${
                  reporte.resumen.gap_promedio >= 2 ? 'bg-red-500' :
                  reporte.resumen.gap_promedio >= 1 ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">GAP Promedio</p>
                  <p className={`text-sm font-bold ${
                    reporte.resumen.gap_promedio >= 2 ? 'text-red-600' :
                    reporte.resumen.gap_promedio >= 1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {reporte.resumen.gap_promedio.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Brechas */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-amber-500 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Brechas</p>
                  <p className="text-sm font-bold text-amber-600">
                    {reporte.brechas_identificadas.length} secciones
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-6 mt-5">
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
                {tab.id === 'brechas' && reporte && reporte.brechas_identificadas.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {reporte.brechas_identificadas.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {loadingReporte ? (
            <div className="flex items-center justify-center py-32">
              <LoadingScreen message="Generando reporte IQ..." />
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
                  <ResumenIQ
                    resumen={reporte.resumen}
                    evaluacion={reporte.evaluacion}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadarIQ secciones={reporte.por_seccion} />
                    <GraficoBarrasIQ secciones={reporte.por_seccion} />
                  </div>
                </div>
              )}

              {/* ── POR SECCIÓN ── */}
              {activeTab === 'secciones' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GraficoRadarIQ secciones={reporte.por_seccion} />
                    <GraficoBarrasIQ secciones={reporte.por_seccion} />
                  </div>
                  <TablaSeccionesIQ secciones={reporte.por_seccion} />
                </div>
              )}

              {/* ── BRECHAS ── */}
              {activeTab === 'brechas' && (
                <div className="space-y-6">
                  {/* Tarjetas de clasificación con clases estáticas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {([
                      { label: 'Críticas',  count: reporte.clasificaciones_gap.critico, s: CARD_STYLES.red    },
                      { label: 'Altas',     count: reporte.clasificaciones_gap.alto,    s: CARD_STYLES.orange },
                      { label: 'Medias',    count: reporte.clasificaciones_gap.medio,   s: CARD_STYLES.yellow },
                      { label: 'Bajas',     count: reporte.clasificaciones_gap.bajo,    s: CARD_STYLES.blue   },
                    ] as const).map(({ label, count, s }) => (
                      <Card key={label} className={s.card}>
                        <p className={s.label}>{label}</p>
                        <p className={s.value}>{count}</p>
                        <p className={s.sub}>secciones</p>
                      </Card>
                    ))}
                  </div>
                  <TablaBrechasIQ brechas={reporte.brechas_identificadas} />
                </div>
              )}

              {/* ── DISTRIBUCIÓN ── */}
              {activeTab === 'analisis' && (
                <div className="space-y-6">

                  {/* Tarjetas resumen GAP */}
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
                      <p className="text-xs text-green-700 mt-2">Sin brecha</p>
                    </Card>
                  </div>

                  {/* Distribución de respuestas */}
                  <GraficoPastelRespuestas distribucion={reporte.distribucion_respuestas} />

                  {/* Resumen por usuario */}
                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Users size={18} className="text-primary-600" />
                        Resumen por Usuario
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {reporte.por_usuario.map(u => (
                        <div
                          key={u.usuario.id}
                          className="px-6 py-4 flex items-center gap-6 flex-wrap hover:bg-gray-50 transition-colors"
                        >
                          {/* Info usuario */}
                          <div className="flex-1 min-w-[140px]">
                            <p className="text-sm font-semibold text-gray-900">
                              {u.usuario.nombre_completo}
                            </p>
                            <p className="text-xs text-gray-400">{u.usuario.email}</p>
                            {u.usuario.cargo && (
                              <p className="text-xs text-gray-500 mt-0.5">{u.usuario.cargo}</p>
                            )}
                          </div>

                          {/* Nivel actual */}
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Nivel actual</p>
                            <p className="text-sm font-bold text-green-600">
                              {u.nivel_actual_promedio.toFixed(1)}
                            </p>
                          </div>

                          {/* GAP */}
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">GAP</p>
                            <p className={`text-sm font-bold ${
                              u.gap_promedio >= 2 ? 'text-red-600' :
                              u.gap_promedio >= 1 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {u.gap_promedio.toFixed(1)}
                            </p>
                          </div>

                          {/* Cumplimiento */}
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Cumplimiento</p>
                            <p className="text-sm font-bold text-blue-600">
                              {u.porcentaje_cumplimiento_promedio.toFixed(0)}%
                            </p>
                          </div>

                          {/* Barra */}
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-primary-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${u.porcentaje_cumplimiento_promedio}%` }}
                              />
                            </div>
                          </div>

                          {/* Secciones */}
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Secciones</p>
                            <p className="text-sm font-bold text-gray-700">
                              {u.total_dimensiones_evaluadas}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};