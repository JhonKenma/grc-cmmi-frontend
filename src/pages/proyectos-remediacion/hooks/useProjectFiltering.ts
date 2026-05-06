import { useState, useMemo, useCallback } from 'react';

interface ProjectFilter {
  estado: string;
  searchTerm: string;
}

interface ProjectWithStats {
  id: string;
  nombre: string;
  estado: string;
  [key: string]: any;
}

export const useProjectFiltering = <T extends ProjectWithStats>(
  projects: T[],
  statusMap?: Record<string, string>
) => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const proyectosFiltrados = useMemo(() => {
    return projects.filter((proyecto) => {
      const matchEstado = !filtroEstado || proyecto.estado === filtroEstado;
      const matchSearchTerm =
        !searchTerm ||
        proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchEstado && matchSearchTerm;
    });
  }, [projects, filtroEstado, searchTerm]);

  const handleFilterChange = useCallback((estado: string) => {
    setFiltroEstado(estado);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltroEstado('');
    setSearchTerm('');
  }, []);

  return {
    filtroEstado,
    searchTerm,
    proyectosFiltrados,
    handleFilterChange,
    handleSearchChange,
    clearFilters,
  };
};
