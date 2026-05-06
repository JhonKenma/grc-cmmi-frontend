import { useState, useEffect, useMemo } from 'react';
import { evaluacionesApi, reportesApi } from '@/api/endpoints';
import { ReporteEvaluacion } from '@/api/endpoints/reportes.api';
import toast from 'react-hot-toast';

export const useReporteEvaluacion = () => {
  const [loading,               setLoading]               = useState(true);
  const [evaluaciones,          setEvaluaciones]          = useState<any[]>([]);
  const [evaluacionSeleccionada,setEvaluacionSeleccionada]= useState<string>('');
  const [reporte,               setReporte]               = useState<ReporteEvaluacion | null>(null);
  const [loadingReporte,        setLoadingReporte]        = useState(false);
  const [modalGAPOpen,          setModalGAPOpen]          = useState(false);
  const [selectedGAP,           setSelectedGAP]           = useState<any>(null);

  useEffect(() => { loadEvaluaciones(); }, []);

  const loadEvaluaciones = async () => {
    try {
      setLoading(true);
      const data  = await evaluacionesApi.getMisEvaluaciones();
      const lista = data.results || [];
      setEvaluaciones(lista);
      if (lista.length > 0) {
        setEvaluacionSeleccionada(lista[0].id);
        loadReporte(lista[0].id);
      }
    } catch (error: any) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadReporte = async (evaluacionId: string) => {
    try {
      setLoadingReporte(true);
      const data = await reportesApi.getReporteEvaluacion(evaluacionId);
      setReporte(data);
    } catch (error: any) {
      console.error('Error al cargar reporte:', error);
      toast.error('Error al cargar reporte de evaluación');
    } finally {
      setLoadingReporte(false);
    }
  };

  const gapStats = useMemo(() => {
    if (!reporte?.clasificaciones_gap) return { criticos: 0, medios: 0, cumplidos: 0 };
    return {
      criticos:  (reporte.clasificaciones_gap.critico  || 0) + (reporte.clasificaciones_gap.alto     || 0),
      medios:    (reporte.clasificaciones_gap.medio    || 0) + (reporte.clasificaciones_gap.bajo     || 0),
      cumplidos: (reporte.clasificaciones_gap.cumplido || 0) + (reporte.clasificaciones_gap.superado || 0),
    };
  }, [reporte]);

  const handleCrearProyectoDesdeBrecha = (gapData: any) => {
    setSelectedGAP({
      calculoNivelId: gapData.calculoNivelId,
      asignacionId:   gapData.asignacionId,
      gapInfo:        { ...gapData },
    });
    setModalGAPOpen(true);
  };

  const handleChangeEvaluacion = (evaluacionId: string) => {
    setEvaluacionSeleccionada(evaluacionId);
    loadReporte(evaluacionId);
  };

  const closeModalGAP = () => {
    setModalGAPOpen(false);
    setSelectedGAP(null);
  };

  const onProyectoCreado = () => {
    loadReporte(evaluacionSeleccionada);
    closeModalGAP();
    toast.success('Proyecto creado exitosamente');
  };

  return {
    loading,
    evaluaciones,
    evaluacionSeleccionada,
    reporte,
    loadingReporte,
    modalGAPOpen,
    selectedGAP,
    gapStats,
    loadReporte,
    handleCrearProyectoDesdeBrecha,
    handleChangeEvaluacion,
    closeModalGAP,
    onProyectoCreado,
  };
};
