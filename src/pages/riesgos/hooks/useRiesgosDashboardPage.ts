import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { documentosApi } from '@/api/endpoints/documentos.api';
import { riesgosApi } from '@/api/endpoints/riesgos.api';
import { usuarioService } from '@/api/usuario.service';
import { useRiesgosDashboard, useRiesgosHeatmap } from '@/hooks/useRiesgosModule';
import { useAuth } from '@/context/AuthContext';
import type { RiesgoFilter } from '@/types';

type HeatmapTab = 'inherente' | 'residual';

export const useRiesgosDashboardPage = () => {
  const { user } = useAuth();
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
    (key) => localFilters[key as keyof RiesgoFilter] !== undefined,
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

  return {
    user,
    mapFilters,
    setMapFilters,
    tabActivo,
    setTabActivo,
    filterOpen,
    setFilterOpen,
    localFilters,
    setLocalFilters,
    detalleCelda,
    setDetalleCelda,
    effectiveFilters,
    dashboardQuery,
    heatmapInherenteQuery,
    heatmapResidualQuery,
    activeHeatmapQuery,
    procesosQuery,
    usuariosQuery,
    handleHeatmapCellClick,
    heatmapLookup,
    activeFilterCount,
    applyFilters,
    clearFilters,
    procesos,
    usuarios,
  } as const;
};
