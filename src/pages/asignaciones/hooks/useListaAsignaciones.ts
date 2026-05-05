// src/pages/asignaciones/hooks/useListaAsignaciones.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { AsignacionListItem } from '@/types';
import { ESTADO_BADGE_CLASSES } from './asignacionesConstants';
import toast from 'react-hot-toast';

export const useListaAsignaciones = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionListItem[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await asignacionesApi.list();
      const lista = Array.isArray(data) ? data : (data as any).results || [];
      setAsignaciones(lista);

      const stats = await asignacionesApi.getEstadisticas();
      setEstadisticas(stats);
    } catch (error: any) {
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string): string =>
    ESTADO_BADGE_CLASSES[estado] ?? ESTADO_BADGE_CLASSES.pendiente;

  const goToAsignarEvaluacion  = () => navigate('/asignaciones/asignar-evaluacion');
  const goToAsignarDimensiones = () => navigate('/asignaciones/asignar-dimensiones');
  const goToPendientesRevision = () => navigate('/asignaciones/pendientes-revision');

  return {
    loading, asignaciones, estadisticas, isSuperAdmin,
    getEstadoBadge,
    goToAsignarEvaluacion, goToAsignarDimensiones, goToPendientesRevision,
  };
};