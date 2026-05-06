import { useState, useEffect, useMemo } from 'react';
import { reportesIQApi } from '@/api/endpoints/reportes-iq.api';
import toast from 'react-hot-toast';
import type {
  ReporteEvaluacionIQ,
  EvaluacionIQAuditada,
} from '@/types/reporte-iq.types';

export const useReporteEvaluacionIQ = () => {
  const [loading,        setLoading]        = useState(true);
  const [evaluaciones,   setEvaluaciones]   = useState<EvaluacionIQAuditada[]>([]);
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const [reporte,        setReporte]        = useState<ReporteEvaluacionIQ | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  useEffect(() => { cargarEvaluaciones(); }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const lista = await reportesIQApi.listarEvaluaciones();
      setEvaluaciones(lista);
      if (lista.length > 0) {
        setSeleccionadaId(lista[0].evaluacion_id);
        cargarReporte(lista[0].evaluacion_id);
      }
    } catch {
      toast.error('Error al cargar evaluaciones IQ');
    } finally {
      setLoading(false);
    }
  };

  const cargarReporte = async (evaluacionId: number) => {
    try {
      setLoadingReporte(true);
      const data = await reportesIQApi.getReporte(evaluacionId);
      setReporte(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar reporte IQ');
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleCambiar = (id: number) => {
    setSeleccionadaId(id);
    cargarReporte(id);
  };

  const gapStats = useMemo(() => {
    if (!reporte?.clasificaciones_gap) return { criticos: 0, medios: 0, cumplidos: 0 };
    const c = reporte.clasificaciones_gap;
    return {
      criticos:  (c.critico  || 0) + (c.alto    || 0),
      medios:    (c.medio    || 0) + (c.bajo    || 0),
      cumplidos: (c.cumplido || 0) + (c.superado || 0),
    };
  }, [reporte]);

  return {
    loading,
    evaluaciones,
    seleccionadaId,
    reporte,
    loadingReporte,
    gapStats,
    cargarEvaluaciones,
    handleCambiar,
  };
};
