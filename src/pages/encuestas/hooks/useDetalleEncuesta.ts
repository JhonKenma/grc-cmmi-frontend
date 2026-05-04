// src/pages/encuestas/hooks/useDetalleEncuesta.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { Encuesta } from '@/types';
import { ROUTES } from '@/utils/constants';

export const useDetalleEncuesta = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEncuesta = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await encuestasApi.get(id);
      setEncuesta(data);
    } catch (err: any) {
      showError(err?.message || 'Error al cargar la encuesta');
      navigate(ROUTES.ENCUESTAS);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEncuesta();
  }, [loadEncuesta]);

  const handleDuplicar = async () => {
    if (!encuesta) return;
    const nuevoNombre = prompt(
      'Ingresa el nombre para la encuesta duplicada:',
      `${encuesta.nombre} (Copia)`
    );
    if (!nuevoNombre) return;
    try {
      await encuestasApi.duplicar(encuesta.id, nuevoNombre);
      success('Encuesta duplicada exitosamente');
      navigate(ROUTES.ENCUESTAS);
    } catch (err: any) {
      showError(err?.message || 'Error al duplicar la encuesta');
    }
  };

  const handleToggleEstado = async () => {
    if (!encuesta) return;
    const accion = encuesta.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de ${accion} esta evaluación?`)) return;
    try {
      await encuestasApi.toggleEstado(encuesta.id);
      success(`Evaluación ${accion}da exitosamente`);
      loadEncuesta();
    } catch (err: any) {
      showError(err?.message || `Error al ${accion} la evaluación`);
    }
  };

  const handleExportarExcel = async () => {
    // TODO: Implementar exportar a Excel
    success('Función disponible próximamente');
  };

  const goToEditar = () => {
    if (encuesta) navigate(`/encuestas/${encuesta.id}/editar`);
  };

  const goToLista = () => navigate(ROUTES.ENCUESTAS);

  return {
    encuesta,
    isLoading,
    handleDuplicar,
    handleToggleEstado,
    handleExportarExcel,
    goToEditar,
    goToLista,
  };
};