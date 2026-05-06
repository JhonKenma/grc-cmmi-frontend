import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import toast from 'react-hot-toast';

interface RespuestaAuditada {
  id: string;
  pregunta_texto: string;
  calificacion_auditor: string | null;
  comentarios_auditor: string | null;
  recomendaciones_auditor: string | null;
  [key: string]: any;
}

export const useAuditoriaLoad = (asignacionId: string | undefined) => {
  const [respuestasAuditadas, setRespuestasAuditadas] = useState<RespuestaAuditada[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(false);
  const [auditoriAbierta, setAuditoriAbierta] = useState(false);

  useEffect(() => {
    if (!asignacionId || !auditoriAbierta) return;
    loadAuditoria();
  }, [asignacionId, auditoriAbierta]);

  const loadAuditoria = async () => {
    if (!asignacionId) return;
    try {
      setLoadingAuditoria(true);
      const response = await axiosInstance.get('/respuestas/revision/', {
        params: { asignacion: asignacionId },
      });
      setRespuestasAuditadas(response.data.results ?? []);
    } catch (error: any) {
      console.error('Error al cargar auditoría:', error);
      toast.error('Error al cargar respuestas auditadas');
    } finally {
      setLoadingAuditoria(false);
    }
  };

  const toggleAuditoria = () => {
    setAuditoriAbierta((prev) => !prev);
  };

  const closeAuditoria = () => {
    setAuditoriAbierta(false);
  };

  return {
    respuestasAuditadas,
    loadingAuditoria,
    auditoriAbierta,
    toggleAuditoria,
    closeAuditoria,
  };
};
