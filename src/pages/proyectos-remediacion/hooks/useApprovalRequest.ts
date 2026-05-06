import { useState } from 'react';
import { proyectosRemediacionApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

export const useApprovalRequest = (projectId: string) => {
  const [loading, setLoading] = useState(false);
  const [comentarios, setComentarios] = useState('');

  const submitApprovalRequest = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await proyectosRemediacionApi.solicitarAprobacion(projectId, {
        comentarios,
      });
      toast.success('Solicitud de aprobación enviada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error al solicitar aprobación:', error);
      toast.error(error.response?.data?.message || 'Error al enviar solicitud de aprobación');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setComentarios('');
  };

  return {
    loading,
    comentarios,
    setComentarios,
    submitApprovalRequest,
    reset,
  };
};
