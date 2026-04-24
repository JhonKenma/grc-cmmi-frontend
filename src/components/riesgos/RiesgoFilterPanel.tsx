import { useState } from 'react';
import { Filter, MapPin, User, BarChart2, X, SlidersHorizontal } from 'lucide-react';
import type { RiesgoFilter, Id } from '@/types';

interface RiesgoFilterPanelProps {
  onFilterChange: (filters: RiesgoFilter) => void;
  procesos: Array<{ id: string; nombre: string }>;
  usuarios: Array<{ id: Id; nombre: string }>;
  clasificaciones?: Array<{ id: string; nombre: string }>;
  showSoloMiosToggle?: boolean;
}

export function RiesgoFilterPanel({
  onFilterChange,
  procesos,
  usuarios,
  clasificaciones = [],
  showSoloMiosToggle = true,
}: RiesgoFilterPanelProps) {
  const [filters, setFilters] = useState<RiesgoFilter>({});
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = (newFilters: RiesgoFilter) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = Object.keys(filters).filter(
    (k) => filters[k as keyof RiesgoFilter] !== undefined,
  ).length;

  const defaultClasificaciones = [
    { id: 'bajo', nombre: '🟢 Bajo' },
    { id: 'medio', nombre: '🟡 Medio' },
    { id: 'alto', nombre: '🟠 Alto' },
    { id: 'critico', nombre: '🔴 Crítico' },
  ];
  const clasifToShow = clasificaciones.length > 0 ? clasificaciones : defaultClasificaciones;

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        type="button"
        id="btn-toggle-filtros"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
          activeCount > 0
            ? 'border-cyan-400 bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <SlidersHorizontal size={15} />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/30 px-1.5 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Filter panel ── */}
      {isOpen && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/60 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-100 p-1.5 text-cyan-600">
                <Filter size={14} />
              </div>
              <span className="text-sm font-semibold text-slate-800">Filtrar Mapa de Riesgos</span>
              {activeCount > 0 && (
                <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {activeCount} activo{activeCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {/* Proceso */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <MapPin size={11} className="text-cyan-500" />
                Proceso / Área
              </label>
              <div className="relative">
                <select
                  id="filter-proceso"
                  value={String(filters.proceso ?? '')}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, proceso: e.target.value || undefined })
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm text-slate-800 transition focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Todos los procesos</option>
                  {procesos.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Propietario */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <User size={11} className="text-violet-500" />
                Propietario
              </label>
              <div className="relative">
                <select
                  id="filter-propietario"
                  value={String(filters.propietario ?? '')}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      propietario: e.target.value ? e.target.value : undefined,
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm text-slate-800 transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">Todos los propietarios</option>
                  {usuarios.map((u) => (
                    <option key={String(u.id)} value={String(u.id)}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <BarChart2 size={11} className="text-amber-500" />
                Clasificación
              </label>
              <div className="relative">
                <select
                  id="filter-clasificacion"
                  value={filters.clasificacion ?? ''}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, clasificacion: e.target.value || undefined })
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-9 text-sm text-slate-800 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Todas las clasificaciones</option>
                  {clasifToShow.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            {/* Solo mis riesgos */}
            {showSoloMiosToggle && (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-600">
                <div className="relative">
                  <input
                    id="filter-solo-mios"
                    type="checkbox"
                    checked={Boolean(filters.solo_mios)}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        solo_mios: e.target.checked || undefined,
                        propietario: e.target.checked ? undefined : filters.propietario,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-cyan-500 peer-checked:bg-cyan-500" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-slate-300 shadow transition-all peer-checked:translate-x-4 peer-checked:bg-white" />
                </div>
                Ver solo mis riesgos
              </label>
            )}

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  id="btn-limpiar-filtros"
                  onClick={() => {
                    setFilters({});
                    onFilterChange({});
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                id="btn-aplicar-filtros"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-cyan-200 transition-all duration-200 hover:from-cyan-600 hover:to-cyan-700 hover:shadow-md"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
