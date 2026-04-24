import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Brain, ChevronRight,
  ClipboardCheck, FileText, Filter, FlaskConical, FolderOpen,
  Package, Radar, RefreshCw, Settings,
  ShieldCheck, ShieldAlert, Siren, Tag, Wrench, X,
} from 'lucide-react';

import { Card } from '@/components/common';
import { HeatmapMatriz } from '@/components/riesgos/HeatmapMatriz';
import { ModalDetalleCeldaRiesgos } from '@/components/riesgos/ModalDetalleCeldaRiesgos';
import { HeatmapLeyenda } from '@/components/riesgos/HeatmapLeyenda';
import { documentosApi } from '@/api/endpoints/documentos.api';
import { riesgosApi } from '@/api/endpoints/riesgos.api';
import { usuarioService } from '@/api/usuario.service';
import { useRiesgosDashboard, useRiesgosHeatmap } from '@/hooks/useRiesgosModule';
import { useAuth } from '@/context/AuthContext';
import type { RiesgoFilter } from '@/types';

type HeatmapTab = 'inherente' | 'residual';

/* ─── Nav data ─────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    group: 'Gestión',
    items: [
      { label: 'Registro',      to: '/riesgos',                            icon: FileText,        accent: 'text-slate-600',   ring: 'ring-slate-200',   bg: 'bg-slate-100'  },
      { label: 'Controles',     to: '/riesgos/controles',                  icon: ShieldCheck,     accent: 'text-emerald-600', ring: 'ring-emerald-200', bg: 'bg-emerald-50' },
      { label: 'Planes',        to: '/riesgos/planes',                     icon: ClipboardCheck,  accent: 'text-blue-600',    ring: 'ring-blue-200',    bg: 'bg-blue-50'    },
      { label: 'KRIs',          to: '/riesgos/kris',                       icon: AlertTriangle,   accent: 'text-amber-600',   ring: 'ring-amber-200',   bg: 'bg-amber-50'   },
      { label: 'Monitoreo',     to: '/riesgos/monitoreo',                  icon: BarChart3,       accent: 'text-cyan-600',    ring: 'ring-cyan-200',    bg: 'bg-cyan-50'    },
    ],
  },
  {
    group: 'Activos',
    items: [
      { label: 'Activos',       to: '/riesgos/activos',                    icon: Package,         accent: 'text-indigo-600', ring: 'ring-indigo-200', bg: 'bg-indigo-50' },
      { label: 'Riesgo-Activo', to: '/riesgos/riesgo-activos',             icon: RefreshCw,       accent: 'text-pink-600',   ring: 'ring-pink-200',   bg: 'bg-pink-50'   },
      { label: 'Cuantitativas', to: '/riesgos/evaluaciones-cuantitativas', icon: Brain,           accent: 'text-purple-600', ring: 'ring-purple-200', bg: 'bg-purple-50' },
    ],
  },
  {
    group: 'Config',
    items: [
      { label: 'Categorías',    to: '/riesgos/categorias',                 icon: Tag,             accent: 'text-orange-600', ring: 'ring-orange-200', bg: 'bg-orange-50' },
      { label: 'Revisión',      to: '/riesgos/configuracion-revision',     icon: Settings,        accent: 'text-teal-600',   ring: 'ring-teal-200',   bg: 'bg-teal-50'   },
      { label: 'Fórmulas',      to: '/riesgos/config/formulas',            icon: FlaskConical,    accent: 'text-rose-600',   ring: 'ring-rose-200',   bg: 'bg-rose-50'   },
    ],
  },
];

/* ─── KPI data builder ─────────────────────────────────────────────────── */
function buildKpiCards(dashboard: Record<string, number> | undefined) {
  return [
    { titulo: 'Total Riesgos',   subtitulo: 'Activos en Registro',  valor: dashboard?.total_riesgos    ?? 0,   gradient: 'from-slate-700 to-slate-900',  iconBg: 'bg-white/10', icon: FolderOpen  },
    { titulo: 'Riesgo Crítico',  subtitulo: 'Fuera de Apetito',     valor: dashboard?.riesgos_critico  ?? 0,   gradient: 'from-rose-500 to-rose-700',    iconBg: 'bg-white/20', icon: ShieldAlert },
    { titulo: 'KRIs en Rojo',    subtitulo: 'Alertas Activas',      valor: dashboard?.kris_en_rojo     ?? 0,   gradient: 'from-amber-400 to-orange-600', iconBg: 'bg-white/20', icon: Siren       },
    { titulo: 'Planes Activos',  subtitulo: 'En Seguimiento',       valor: dashboard?.planes_activos   ?? 0,   gradient: 'from-sky-500 to-blue-700',     iconBg: 'bg-white/20', icon: Wrench      },
    { titulo: 'Cobertura',       subtitulo: 'Controles c/ Eval.',   valor: `${dashboard?.cobertura_controles ?? 0}%`, gradient: 'from-emerald-500 to-teal-700', iconBg: 'bg-white/20', icon: ShieldCheck },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════ */
export function RiesgosDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [mapFilters, setMapFilters] = useState<RiesgoFilter>({});
  const [tabActivo, setTabActivo] = useState<HeatmapTab>('inherente');
  const [filterOpen, setFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<RiesgoFilter>({});
  const [detalleCelda, setDetalleCelda] = useState<{ probabilidad: number; impacto: number; total: number } | null>(null);

  const effectiveFilters = useMemo(() => {
    const normalized: RiesgoFilter = { ...mapFilters };
    if (mapFilters.solo_mios && user?.id) normalized.propietario = user.id;
    return normalized;
  }, [mapFilters, user?.id]);

  const dashboardQuery = useRiesgosDashboard(effectiveFilters);
  const heatmapInherenteQuery = useRiesgosHeatmap(effectiveFilters);
  const heatmapResidualQuery = useQuery({
    queryKey: ['heatmap-residual', effectiveFilters],
    queryFn: () => riesgosApi.heatmapResidual(effectiveFilters),
    enabled: tabActivo === 'residual',
    placeholderData: keepPreviousData,
  });

  const activeHeatmapQuery = tabActivo === 'inherente' ? heatmapInherenteQuery : heatmapResidualQuery;

  const procesosQuery = useQuery({
    queryKey: ['riesgos-dashboard-procesos'],
    queryFn: () => documentosApi.getProcesos(),
  });

  const usuariosQuery = useQuery({
    queryKey: ['riesgos-dashboard-usuarios'],
    queryFn: () => usuarioService.getAll(),
  });

  const handleHeatmapCellClick = useCallback(
    ({ probabilidad, impacto, total }: { probabilidad: number; impacto: number; total: number }) =>
      setDetalleCelda({ probabilidad, impacto, total }),
    [],
  );

  const heatmapLookup = useMemo(() => {
    const matrix = new Map<string, number>();
    const entriesRaw = activeHeatmapQuery.data?.matriz;
    const entries = Array.isArray(entriesRaw) ? entriesRaw : [];
    entries.forEach((cell) => {
      if (!cell || typeof cell !== 'object') return;
      const probabilidad = (cell as { probabilidad?: unknown }).probabilidad;
      const impacto = (cell as { impacto?: unknown }).impacto;
      const total = (cell as { total?: unknown }).total;
      if (typeof probabilidad !== 'number' || typeof impacto !== 'number') return;
      matrix.set(`${probabilidad}-${impacto}`, typeof total === 'number' ? total : 0);
    });
    return matrix;
  }, [activeHeatmapQuery.data]);

  const activeFilterCount = Object.keys(localFilters).filter(
    (k) => localFilters[k as keyof RiesgoFilter] !== undefined,
  ).length;

  const applyFilters = () => {
    setMapFilters(localFilters);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    setMapFilters({});
  };

  const procesos = (procesosQuery.data ?? []).map((p: { id: string | number; nombre: string }) => ({
    id: String(p.id),
    nombre: p.nombre,
  }));
  const usuarios = (usuariosQuery.data ?? []).map(
    (u: { id: string | number; nombre_completo?: string; first_name?: string; last_name?: string; username?: string }) => ({
      id: u.id,
      nombre: u.nombre_completo || `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.username || `Usuario ${u.id}`,
    }),
  );

  const kpiCards = buildKpiCards(dashboardQuery.data?.resumen);

  const defaultClasificaciones = [
    { id: 'bajo', nombre: '🟢 Bajo' },
    { id: 'medio', nombre: '🟡 Medio' },
    { id: 'alto', nombre: '🟠 Alto' },
    { id: 'critico', nombre: '🔴 Crítico' },
  ];

  if (dashboardQuery.isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando dashboard…</div>;
  }

  if (dashboardQuery.isError) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">No se pudo cargar el dashboard.</div>;
  }

  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════════
          HEADER BANNER
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 px-7 py-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-24 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-300">
              <Radar size={10} /> Panel Ejecutivo
            </span>
            <h1 className="mt-2 text-xl font-bold tracking-tight">Gestión de Riesgos</h1>
            <p className="mt-0.5 text-xs text-slate-400">Resumen operativo de exposición, tratamiento y monitoreo.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          KPI STRIP
      ══════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.titulo}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/5 blur-xl" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">{card.titulo}</p>
                  <p className="mt-1.5 text-3xl font-extrabold leading-none">{card.valor}</p>
                  <p className="mt-1 text-[10px] text-white/50">{card.subtitulo}</p>
                </div>
                <div className={`shrink-0 rounded-xl ${card.iconBg} p-2`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT: SIDEBAR NAV + HEATMAP
      ══════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ── SIDEBAR NAV ── */}
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64 xl:w-72">
          <div className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.group}</h3>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          isActive ? `${item.bg} text-slate-900` : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`rounded-lg p-1.5 transition-colors ${
                            isActive ? item.accent : 'bg-slate-100 group-hover:bg-slate-200'
                          }`}
                        >
                          <Icon size={16} className={isActive ? item.accent : 'text-slate-500'} />
                        </div>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── HEATMAP SECTION ── */}
        <div className="min-w-0 flex-1">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {/* ── Heatmap card (3/4 width) ── */}
            <Card className="overflow-hidden rounded-2xl p-0 xl:col-span-3">
              {/* Card header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                    <Radar size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Mapa de Riesgos</h2>
                    <p className="text-[10px] text-slate-400">
                      {tabActivo === 'inherente' ? 'Sin controles aplicados' : 'Post-tratamiento residual'}
                    </p>
                  </div>
                </div>

                {/* Right controls: tab switcher + filter toggle */}
                <div className="flex items-center gap-2">
                  {/* Tab pill switcher */}
                  <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                    {(['inherente', 'residual'] as HeatmapTab[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTabActivo(t)}
                        className={`rounded-[10px] px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                          tabActivo === t
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t === 'inherente' ? 'Inherente' : 'Residual'}
                      </button>
                    ))}
                  </div>

                  {/* Filter toggle button */}
                  <button
                    type="button"
                    onClick={() => setFilterOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      activeFilterCount > 0
                        ? 'border-cyan-400 bg-cyan-600 text-white shadow-sm shadow-cyan-200 hover:bg-cyan-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Filter size={13} />
                    Filtros
                    {activeFilterCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/30 px-1 text-[9px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Inline filter drawer ── */}
              {filterOpen && (
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/40 px-5 py-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Proceso */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        📍 Proceso / Área
                      </label>
                      <div className="relative">
                        <select
                          value={String(localFilters.proceso ?? '')}
                          onChange={(e) =>
                            setLocalFilters({ ...localFilters, proceso: e.target.value || undefined })
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                        >
                          <option value="">Todos los procesos</option>
                          {procesos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronRight
                          size={12}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Propietario */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        👤 Propietario
                      </label>
                      <div className="relative">
                        <select
                          value={String(localFilters.propietario ?? '')}
                          onChange={(e) =>
                            setLocalFilters({ ...localFilters, propietario: e.target.value || undefined })
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                        >
                          <option value="">Todos los propietarios</option>
                          {usuarios.map((u) => (
                            <option key={String(u.id)} value={String(u.id)}>
                              {u.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronRight
                          size={12}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Clasificación */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        📊 Clasificación
                      </label>
                      <div className="relative">
                        <select
                          value={localFilters.clasificacion ?? ''}
                          onChange={(e) =>
                            setLocalFilters({ ...localFilters, clasificacion: (e.target.value as any) || undefined })
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        >
                          <option value="">Todas las clasificaciones</option>
                          {defaultClasificaciones.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronRight
                          size={12}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter footer */}
                  <div className="mt-4 flex items-center justify-between">
                    {/* Toggle solo mios */}
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={Boolean(localFilters.solo_mios)}
                          onChange={(e) =>
                            setLocalFilters({
                              ...localFilters,
                              solo_mios: e.target.checked || undefined,
                              propietario: e.target.checked ? undefined : localFilters.propietario,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-cyan-500 peer-checked:bg-cyan-500" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-300 shadow-sm transition-all peer-checked:translate-x-4 peer-checked:bg-white" />
                      </div>
                      Ver solo mis riesgos
                    </label>

                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <X size={11} /> Limpiar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-1.5 text-xs font-bold text-white shadow-sm shadow-cyan-200 transition-all hover:from-cyan-600 hover:to-cyan-700"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Heatmap body */}
              <div className="p-5">
                {activeHeatmapQuery.isLoading && !activeHeatmapQuery.data ? (
                  <div className="flex h-[400px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400">
                    Cargando mapa de riesgos…
                  </div>
                ) : (
                  <HeatmapMatriz data={heatmapLookup} onCellClick={handleHeatmapCellClick} />
                )}
              </div>
            </Card>

            {/* ── Leyenda (1/4 width) ── */}
            <HeatmapLeyenda />
          </section>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════════ */}
      <ModalDetalleCeldaRiesgos
        isOpen={detalleCelda !== null}
        onClose={() => setDetalleCelda(null)}
        probabilidad={detalleCelda?.probabilidad ?? 0}
        impacto={detalleCelda?.impacto ?? 0}
        total={detalleCelda?.total ?? 0}
        filters={effectiveFilters}
      />
    </div>
  );
}
