import { useState, useCallback } from 'react';

interface DashboardFilters {
  fechaDesde: string;
  fechaHasta: string;
  estadoFiltro: string;
}

export const useDashboardFilters = (defaultFilters?: Partial<DashboardFilters>) => {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState<DashboardFilters>({
    fechaDesde: defaultFilters?.fechaDesde || lastMonth,
    fechaHasta: defaultFilters?.fechaHasta || today,
    estadoFiltro: defaultFilters?.estadoFiltro || '',
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const handleFilterChange = useCallback((key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleFiltros = useCallback(() => {
    setMostrarFiltros((prev) => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      fechaDesde: lastMonth,
      fechaHasta: today,
      estadoFiltro: '',
    });
  }, [lastMonth, today]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandidos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const validateDates = (): boolean => {
    if (new Date(filters.fechaDesde) > new Date(filters.fechaHasta)) {
      return false;
    }
    return true;
  };

  return {
    filters,
    mostrarFiltros,
    expandidos,
    handleFilterChange,
    toggleFiltros,
    resetFilters,
    toggleExpanded,
    validateDates,
  };
};
