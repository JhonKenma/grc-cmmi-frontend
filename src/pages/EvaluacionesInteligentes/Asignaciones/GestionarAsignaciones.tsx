// src/pages/EvaluacionesInteligentes/Asignaciones/GestionarAsignaciones.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Users, CheckCircle, Clock, AlertCircle,
  ChevronRight, BarChart3, Plus, Search,
  ChevronLeft, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionIQ, EstadisticasAsignaciones } from '@/types/asignacion-iq.types';

interface EvaluacionConStats {
  evaluacion_id:       number;
  evaluacion_nombre:   string;
  total:               number;
  pendientes:          number;
  en_progreso:         number;
  completadas:         number;
  vencidas:            number;
  suma_completado:     number; // ← acumulamos la suma, no el promedio
}

const POR_PAGINA = 10;

export const GestionarAsignaciones = () => {
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionEvaluacionIQ[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAsignaciones | null>(null);
  const [busqueda,     setBusqueda]     = useState('');
  const [pagina,       setPagina]       = useState(1);

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { setPagina(1); }, [busqueda]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [asignacionesData, statsData] = await Promise.all([
        asignacionIQApi.listar(),
        asignacionIQApi.estadisticas(),
      ]);
      const arr = Array.isArray(asignacionesData)
        ? asignacionesData
        : (asignacionesData as any)?.results || [];
      setAsignaciones(arr);
      setEstadisticas(statsData);
    } catch {
      toast.error('Error al cargar asignaciones');
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Agrupar por evaluación ────────────────────────────────────────────────
  const evaluacionesConStats = useMemo(() => {
    const mapa = new Map<number, EvaluacionConStats>();

    asignaciones.forEach(a => {
      const existe = mapa.get(a.evaluacion);
      if (!existe) {
        mapa.set(a.evaluacion, {
          evaluacion_id:     a.evaluacion,
          evaluacion_nombre: a.evaluacion_nombre,
          total:             1,
          pendientes:        a.estado === 'pendiente'   ? 1 : 0,
          en_progreso:       a.estado === 'en_progreso' ? 1 : 0,
          completadas:       a.estado === 'completada'  ? 1 : 0,
          vencidas:          a.esta_vencida             ? 1 : 0,
          suma_completado:   Number(a.porcentaje_completado) || 0,  // ← suma, no promedio
        });
      } else {
        existe.total++;
        if (a.estado === 'pendiente')   existe.pendientes++;
        if (a.estado === 'en_progreso') existe.en_progreso++;
        if (a.estado === 'completada')  existe.completadas++;
        if (a.esta_vencida)             existe.vencidas++;
        existe.suma_completado += Number(a.porcentaje_completado) || 0;  // ← solo sumar
      }
    });

    return Array.from(mapa.values());
  }, [asignaciones]);

  // ── Filtrar por búsqueda ──────────────────────────────────────────────────
  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return evaluacionesConStats;
    const t = busqueda.toLowerCase();
    return evaluacionesConStats.filter(ev =>
      ev.evaluacion_nombre.toLowerCase().includes(t)
    );
  }, [evaluacionesConStats, busqueda]);

  // ── Paginación ────────────────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas    = filtradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Asignaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitorea el progreso de las evaluaciones asignadas
          </p>
        </div>
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/asignar')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Nueva Asignación
        </button>
      </div>

      {/* ── Stats globales ── */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Asignaciones', value: estadisticas.total,                    color: 'bg-blue-100',   icon: <Users   size={18} className="text-blue-600"   /> },
            { label: 'En Progreso',        value: estadisticas.por_estado.en_progreso,   color: 'bg-yellow-100', icon: <Clock   size={18} className="text-yellow-600" /> },
            { label: 'Completadas',        value: estadisticas.por_estado.completadas,   color: 'bg-green-100',  icon: <CheckCircle size={18} className="text-green-600"  /> },
            { label: 'Vencidas',           value: estadisticas.vencidas_sin_completar,   color: 'bg-red-100',    icon: <AlertCircle size={18} className="text-red-600"    /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Búsqueda ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar evaluación..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {busqueda && (
          <p className="text-xs text-gray-500 mt-2">
            {filtradas.length} resultado(s) para "{busqueda}"
            <button
              onClick={() => setBusqueda('')}
              className="ml-2 text-primary-600 hover:underline"
            >
              Limpiar
            </button>
          </p>
        )}
      </div>

      {/* ── Lista de evaluaciones ── */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {busqueda ? 'No se encontraron evaluaciones' : 'No hay asignaciones'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {busqueda
              ? `No hay evaluaciones que coincidan con "${busqueda}"`
              : 'Aún no has asignado evaluaciones a tus usuarios'}
          </p>
          {!busqueda && (
            <button
              onClick={() => navigate('/evaluaciones-inteligentes/asignar')}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Asignar Evaluaciones
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {filtradas.length} evaluación(es)
            </h2>
            <p className="text-xs text-gray-400">
              Página {paginaActual} de {totalPaginas}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {paginadas.map((ev) => {
              // ← promedio calculado correctamente
              const promedio = ev.total > 0
                ? Math.round(ev.suma_completado / ev.total)
                : 0;

              return (
                <div
                  key={ev.evaluacion_id}
                  onClick={() => navigate(`/evaluaciones-inteligentes/gestionar-asignaciones/${ev.evaluacion_id}`)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  {/* Ícono */}
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={20} className="text-primary-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ev.evaluacion_nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ev.total} asignación(es)</p>
                  </div>

                  {/* Badges */}
                  <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                    {ev.pendientes > 0 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {ev.pendientes} pendiente{ev.pendientes > 1 ? 's' : ''}
                      </span>
                    )}
                    {ev.en_progreso > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {ev.en_progreso} en progreso
                      </span>
                    )}
                    {ev.completadas > 0 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        {ev.completadas} completada{ev.completadas > 1 ? 's' : ''}
                      </span>
                    )}
                    {ev.vencidas > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        {ev.vencidas} vencida{ev.vencidas > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="hidden lg:block w-32 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Promedio</span>
                      <span className="text-xs font-semibold text-gray-700">{promedio}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          promedio === 100 ? 'bg-green-500' : 'bg-primary-600'
                        }`}
                        style={{ width: `${promedio}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                </div>
              );
            })}
          </div>

          {/* ── Paginación ── */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–
                {Math.min(paginaActual * POR_PAGINA, filtradas.length)} de {filtradas.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagina(1)}
                  disabled={paginaActual === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft size={15} />
                </button>
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPagina(item as number)}
                        className={`min-w-[32px] h-8 rounded-lg border text-xs font-medium transition-all ${
                          paginaActual === item
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => setPagina(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};