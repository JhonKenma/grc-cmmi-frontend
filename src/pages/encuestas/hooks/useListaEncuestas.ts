// src/pages/encuestas/hooks/useListaEncuestas.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { EncuestaListItem } from '@/types';
import { ROUTES } from '@/utils/constants';

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useListaEncuestas = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const loadEncuestas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await encuestasApi.list() as EncuestaListItem[] | { results: EncuestaListItem[] };
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];
      setEncuestas(lista);
    } catch (err: any) {
      showError(err?.message || 'Error al cargar las evaluaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEncuestas();
  }, [loadEncuestas]);

  // Filtrado derivado — no necesita estado propio
  const encuestasFiltradas = useMemo(
    () =>
      encuestas.filter((e) => {
        const matchSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = showInactive ? !e.activo : e.activo;
        return matchSearch && matchStatus;
      }),
    [encuestas, searchTerm, showInactive]
  );

  // Stats derivadas
  const stats = useMemo(
    () => ({
      totalEncuestas: encuestas.length,
      totalDimensiones: encuestas.reduce((sum, e) => sum + e.total_dimensiones, 0),
      totalPreguntas: encuestas.reduce((sum, e) => sum + e.total_preguntas, 0),
      encuestasActivas: encuestas.filter((e) => e.activo).length,
    }),
    [encuestas]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDuplicar = async (id: string) => {
    const encuesta = encuestas.find((e) => e.id === id);
    if (!encuesta) return;
    const nuevoNombre = prompt(
      'Ingresa el nombre para la evaluación duplicada:',
      `${encuesta.nombre} (Copia)`
    );
    if (!nuevoNombre) return;
    try {
      await encuestasApi.duplicar(id, nuevoNombre);
      success('Evaluación duplicada exitosamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.message || 'Error al duplicar la encuesta');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await encuestasApi.toggleEstado(id);
      success('Estado actualizado correctamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.response?.data?.message || err?.message || 'Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await encuestasApi.delete(id);
      success('Evaluación eliminada correctamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.message || 'Error al eliminar la evaluación');
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      const blob = await encuestasApi.descargarPlantilla();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_encuesta.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Plantilla descargada correctamente');
    } catch (err: any) {
      showError(err?.message || 'Error al descargar la plantilla');
    }
  };

  const goToCargar = () => navigate(ROUTES.ENCUESTA_CARGAR);

  return {
    // estado
    isLoading,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    // datos
    encuestasFiltradas,
    totalEncuestas: encuestas.length,
    stats,
    // handlers
    handleDuplicar,
    handleToggleStatus,
    handleDelete,
    handleDescargarPlantilla,
    goToCargar,
  };
};