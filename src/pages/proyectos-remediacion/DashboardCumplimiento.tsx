// src/pages/proyectos-remediacion/DashboardCumplimiento.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, ArrowLeft, BarChart3, CheckCircle2,
  ChevronDown, ChevronRight, ChevronUp, Clock, DollarSign,
  Filter, FolderOpen, Layers, RefreshCw, Shield, TrendingDown,
  TrendingUp, XCircle, Zap,
} from 'lucide-react';
import { proyectosRemediacionApi, queryKeys } from '@/api/endpoints/proyectos-remediacion.api';
import {
  DashboardCumplimiento as DashboardData,
  DashboardFiltros,
  GAPDimension,
  EstadoProyecto,
  getClasificacionGapColor,
  getClasificacionGapBg,
  getEstadoColor,
  formatCurrency,
} from '@/types/proyecto-remediacion.types';

// ─── Helpers locales ──────────────────────────────────────────
const nivelLabel = (n: number) => n.toFixed(1);

const getPorcentajeColor = (pct: number) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const getBarColor = (pct: number) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

// ─── Props ────────────────────────────────────────────────────
interface DashboardCumplimientoProps {
  evaluacionId?: string; // si viene de otra página como prop
}

// ═════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════

export const DashboardCumplimiento: React.FC<DashboardCumplimientoProps> = ({
  evaluacionId: evaluacionIdProp,
}) => {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();

  // Prioridad: prop > query param
  const evaluacionId = evaluacionIdProp || params.get('evaluacion_id') || '';

  // ─── Filtros ──────────────────────────────────────────────
  const [fechaDesde,     setFechaDesde]     = useState('');
  const [fechaHasta,     setFechaHasta]     = useState('');
  const [estadoFiltro,   setEstadoFiltro]   = useState<EstadoProyecto | ''>('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [expandidos,     setExpandidos]     = useState<Set<string>>(new Set());

  const filtros: DashboardFiltros = {
    evaluacion_id:  evaluacionId,
    fecha_desde:    fechaDesde   || undefined,
    fecha_hasta:    fechaHasta   || undefined,
    estado_proyecto: estadoFiltro || undefined,
  };

  // ─── Query ────────────────────────────────────────────────
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', filtros],
    queryFn:  () => proyectosRemediacionApi.getDashboardCumplimiento(filtros),
    enabled:  !!evaluacionId,
  });

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ─── Sin evaluación ───────────────────────────────────────
  if (!evaluacionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={56} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Selecciona una evaluación
          </h3>
          <p className="text-gray-500 mb-6">
            Para ver el dashboard de cumplimiento debes acceder desde una evaluación específica.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            ← Regresar
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Calculando cumplimiento...</p>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-500 mb-6">No se pudo obtener la información de cumplimiento.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => refetch()}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2">
              <RefreshCw size={16} /> Reintentar
            </button>
            <button onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              ← Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { evaluacion, resumen, brechas, proyectos, presupuesto, gap_por_dimension, alertas } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── NAVEGACIÓN ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Regresar
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Cumplimiento</h1>
                <p className="text-gray-500 mt-0.5">{evaluacion.empresa} · {evaluacion.encuesta}</p>
                <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  evaluacion.estado === 'activa'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {evaluacion.estado}
                </span>
              </div>
            </div>

            {/* Porcentaje global */}
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Cumplimiento Global
              </p>
              <p className={`text-4xl font-black ${getPorcentajeColor(resumen.porcentaje_cumplimiento_global)}`}>
                {resumen.porcentaje_cumplimiento_global.toFixed(1)}%
              </p>
              <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden ml-auto">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(resumen.porcentaje_cumplimiento_global)}`}
                  style={{ width: `${resumen.porcentaje_cumplimiento_global}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── ALERTAS ── */}
        {alertas.length > 0 && (
          <div className="space-y-2">
            {alertas.map((alerta, i) => (
              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                alerta.tipo === 'critico'
                  ? 'bg-red-50 border-red-200'
                  : alerta.tipo === 'vencido'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {alerta.tipo === 'critico'
                  ? <Zap size={16} className="text-red-500 shrink-0" />
                  : alerta.tipo === 'vencido'
                  ? <Clock size={16} className="text-orange-500 shrink-0" />
                  : <AlertTriangle size={16} className="text-yellow-600 shrink-0" />}
                <p className={`text-sm font-medium ${
                  alerta.tipo === 'critico' ? 'text-red-700'
                  : alerta.tipo === 'vencido' ? 'text-orange-700'
                  : 'text-yellow-700'
                }`}>
                  {alerta.mensaje}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── KPIs PRINCIPALES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Nivel actual vs deseado */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-primary-600" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivel Promedio</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-gray-900">{nivelLabel(resumen.nivel_promedio_actual)}</p>
              <p className="text-sm text-gray-400 mb-1">/ {nivelLabel(resumen.nivel_promedio_deseado)}</p>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${Math.min((resumen.nivel_promedio_actual / resumen.nivel_promedio_deseado) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Actual vs Deseado</p>
          </div>

          {/* Brechas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={18} className="text-red-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brechas</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{brechas.abiertas}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {brechas.criticas > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                  {brechas.criticas} críticas
                </span>
              )}
              {brechas.altas > 0 && (
                <span className="text-xs font-semibold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                  {brechas.altas} altas
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{brechas.remediadas} remediadas · {brechas.cumplidas} cumplidas</p>
          </div>

          {/* Proyectos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen size={18} className="text-indigo-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proyectos</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{proyectos.total}</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <span className="text-xs text-yellow-700 bg-yellow-50 rounded px-1.5 py-0.5 text-center">
                {proyectos.en_ejecucion} en ejecución
              </span>
              <span className="text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5 text-center">
                {proyectos.cerrados} cerrados
              </span>
            </div>
            {proyectos.vencidos > 0 && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                ⚠ {proyectos.vencidos} vencidos
              </p>
            )}
          </div>

          {/* Presupuesto */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={18} className="text-emerald-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Presupuesto</p>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {formatCurrency(presupuesto.total_planificado, 'USD')}
            </p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(100 - presupuesto.porcentaje_gastado)}`}
                style={{ width: `${Math.min(presupuesto.porcentaje_gastado, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {presupuesto.porcentaje_gastado.toFixed(1)}% ejecutado
            </p>
          </div>
        </div>

        {/* ── DISTRIBUCIÓN DE BRECHAS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Por clasificación */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Layers size={16} className="text-gray-400" />
              Distribución de Brechas
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Críticas',   value: brechas.criticas,  bg: 'bg-red-500' },
                { label: 'Altas',      value: brechas.altas,     bg: 'bg-orange-500' },
                { label: 'Medias',     value: brechas.medias,    bg: 'bg-yellow-500' },
                { label: 'Bajas',      value: brechas.bajas,     bg: 'bg-blue-500' },
                { label: 'Cumplidas',  value: brechas.cumplidas, bg: 'bg-green-500' },
                { label: 'Remediadas', value: brechas.remediadas, bg: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 w-20 shrink-0">{item.label}</p>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.bg}`}
                      style={{ width: brechas.total > 0 ? `${(item.value / brechas.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-700 w-6 text-right">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Por estado de proyectos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" />
              Estado de Proyectos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Planificados',  value: proyectos.planificados,  color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'En Ejecución',  value: proyectos.en_ejecucion,  color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { label: 'En Validación', value: proyectos.en_validacion, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Cerrados',      value: proyectos.cerrados,      color: 'bg-green-50 text-green-700 border-green-200' },
              ].map(item => (
                <div key={item.label} className={`p-3 rounded-lg border ${item.color}`}>
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="text-xs font-medium mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            {proyectos.vencidos > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <Clock size={14} className="text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-700">
                  {proyectos.vencidos} proyecto(s) vencido(s) sin cerrar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              Filtros
              {(fechaDesde || fechaHasta || estadoFiltro) && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                  Activos
                </span>
              )}
            </span>
            {mostrarFiltros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {mostrarFiltros && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado de proyecto</label>
                <select
                  value={estadoFiltro}
                  onChange={e => setEstadoFiltro(e.target.value as EstadoProyecto | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="planificado">Planificado</option>
                  <option value="en_ejecucion">En Ejecución</option>
                  <option value="en_validacion">En Validación</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── GAP POR DIMENSIÓN ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              GAP por Dimensión
              <span className="ml-auto text-xs font-normal text-gray-400">
                {gap_por_dimension.length} dimensiones
              </span>
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {gap_por_dimension.map((item: GAPDimension) => {
              const expandida = expandidos.has(item.calculo_id);
              const tieneProyecto = !!item.proyecto;

              return (
                <div key={item.calculo_id}>
                  {/* ── Fila principal ── */}
                  <div
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleExpandir(item.calculo_id)}
                  >
                    {/* Indicador de clasificación */}
                    <div className={`w-1.5 h-10 rounded-full shrink-0 ${getClasificacionGapBg(item.clasificacion_gap)}`} />

                    {/* Dimensión */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.dimension_nombre}
                        </p>
                        <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {item.dimension_codigo}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getClasificacionGapColor(item.clasificacion_gap)}`}>
                          {item.clasificacion_gap_display}
                        </span>
                        {item.remediado && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Remediado
                          </span>
                        )}
                      </div>

                      {/* Barra de nivel */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getBarColor(item.porcentaje_cumplimiento)}`}
                            style={{ width: `${item.porcentaje_cumplimiento}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 shrink-0">
                          {item.porcentaje_cumplimiento.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Niveles */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-lg font-black text-gray-900">{item.nivel_actual.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">/ {nivelLabel(item.nivel_deseado)} deseado</p>
                    </div>

                    {/* GAP */}
                    <div className={`text-right shrink-0 hidden md:block w-16`}>
                      <p className={`text-lg font-black ${item.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.gap > 0 ? '+' : ''}{(item.nivel_deseado - item.nivel_actual).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">GAP</p>
                    </div>

                    {/* Proyecto badge */}
                    <div className="shrink-0">
                      {tieneProyecto ? (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${getEstadoColor(item.proyecto!.estado)}`}>
                          {item.proyecto!.estado.replace('_', ' ')}
                        </span>
                      ) : item.clasificacion_gap !== 'cumplido' && item.clasificacion_gap !== 'superado' && !item.remediado ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg border bg-gray-50 text-gray-500 border-gray-200">
                          Sin proyecto
                        </span>
                      ) : null}
                    </div>

                    {expandida ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </div>

                  {/* ── Detalle expandido ── */}
                  {expandida && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Respuestas */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Resumen de Respuestas ({item.respuestas.total} preguntas)
                          </p>
                          <div className="space-y-2">
                            {[
                              { label: 'Sí Cumple',      value: item.respuestas.si_cumple,      color: 'bg-green-500' },
                              { label: 'Cumple Parcial', value: item.respuestas.cumple_parcial,  color: 'bg-yellow-500' },
                              { label: 'No Cumple',      value: item.respuestas.no_cumple,       color: 'bg-red-500' },
                              { label: 'No Aplica',      value: item.respuestas.no_aplica,       color: 'bg-gray-300' },
                            ].map(r => (
                              <div key={r.label} className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 w-28 shrink-0">{r.label}</p>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${r.color}`}
                                    style={{ width: item.respuestas.total > 0 ? `${(r.value / item.respuestas.total) * 100}%` : '0%' }}
                                  />
                                </div>
                                <p className="text-xs font-bold text-gray-700 w-4 text-right">{r.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Proyecto asociado */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Proyecto de Remediación
                          </p>
                          {item.proyecto ? (
                            <div
                              className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all"
                              onClick={() => navigate(`/proyectos-remediacion/${item.proyecto!.id}`)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">
                                    {item.proyecto.nombre_proyecto}
                                  </p>
                                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                                    {item.proyecto.codigo_proyecto}
                                  </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 shrink-0 mt-0.5" />
                              </div>
                              {item.proyecto.porcentaje_avance_items > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between mb-1">
                                    <p className="text-xs text-gray-500">Avance de ítems</p>
                                    <p className="text-xs font-bold text-gray-700">
                                      {item.proyecto.porcentaje_avance_items.toFixed(0)}%
                                    </p>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary-500 rounded-full"
                                      style={{ width: `${item.proyecto.porcentaje_avance_items}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {item.proyecto.esta_vencido && (
                                <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                                  <Clock size={11} /> Proyecto vencido
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 text-center">
                              <p className="text-xs text-gray-400 mb-2">
                                {item.remediado
                                  ? 'Brecha remediada exitosamente'
                                  : item.clasificacion_gap === 'cumplido' || item.clasificacion_gap === 'superado'
                                  ? 'No requiere remediación'
                                  : 'No hay proyecto asignado'}
                              </p>
                              {!item.remediado && item.clasificacion_gap !== 'cumplido' && item.clasificacion_gap !== 'superado' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/proyectos-remediacion/nuevo?calculo_nivel_id=${item.calculo_id}`);
                                  }}
                                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                >
                                  + Crear proyecto
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PRESUPUESTO DETALLE ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            Resumen Presupuestal
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Planificado', value: formatCurrency(presupuesto.total_planificado, 'USD'), color: 'text-gray-900' },
              { label: 'Ejecutado',   value: formatCurrency(presupuesto.total_ejecutado,   'USD'), color: 'text-blue-700' },
              { label: 'Disponible',  value: formatCurrency(presupuesto.disponible,         'USD'), color: presupuesto.disponible >= 0 ? 'text-green-700' : 'text-red-700' },
              { label: '% Gastado',   value: `${presupuesto.porcentaje_gastado.toFixed(1)}%`,      color: getPorcentajeColor(100 - presupuesto.porcentaje_gastado) },
            ].map(item => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(100 - presupuesto.porcentaje_gastado)}`}
              style={{ width: `${Math.min(presupuesto.porcentaje_gastado, 100)}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardCumplimiento;