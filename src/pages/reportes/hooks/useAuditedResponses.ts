import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axios';

export interface RespuestaDetalle {
  id: string;
  pregunta: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  respuesta: string | null;
  justificacion: string;
  calificacion_auditor: string | null;
  calificacion_display: string;
  comentarios_auditor: string | null;
  recomendaciones_auditor: string | null;
  fecha_auditoria: string | null;
  auditado_por_nombre: string | null;
  nivel_madurez: number | null;
  estado: string;
  estado_display: string;
}

export const useAuditedResponses = (asignacionId: string) => {
  const [respuestas, setRespuestas] = useState<RespuestaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/respuestas/revision/', {
          params: { asignacion: asignacionId },
        });
        setRespuestas(response.data.results ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ?? 'Error al cargar las respuestas auditadas.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRespuestas();
  }, [asignacionId]);

  const conteo = useMemo(() => {
    return respuestas.reduce(
      (acc, r) => {
        const k = r.calificacion_auditor ?? 'sin_calificar';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [respuestas]);

  return { respuestas, loading, error, conteo };
};
