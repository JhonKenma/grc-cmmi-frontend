import { useState } from 'react';
import { proyectosRemediacionApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

export const useApprovalValidation = (projectId: string) => {
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [observaciones, setObservaciones] = useState('');

  const handleAprobar = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await proyectosRemediacionApi.aprobarCierreGAP(projectId, {
        observaciones,
      });
      toast.success('Proyecto aprobado correctamente');
      return true;
    } catch (error: any) {
      console.error('Error al aprobar:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar el proyecto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async (): Promise<boolean> => {
    if (!observaciones.trim()) {
      toast.error('Debe proporcionar observaciones al rechazar');
      return false;
    }

    try {
      setLoading(true);
      await proyectosRemediacionApi.rechazarCierreGAP(projectId, {
        observaciones,
      });
      toast.success('Proyecto rechazado correctamente');
      return true;
    } catch (error: any) {
      console.error('Error al rechazar:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar el proyecto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAccion(null);
    setObservaciones('');
  };

  return {
    loading,
    accion,
    observaciones,
    setAccion,
    setObservaciones,
    handleAprobar,
    handleRechazar,
    reset,
  };
};
