// src/api/endpoints/auditor-iq.api.ts

import api from '@/api/axios';
import type { Respuesta, AuditorCalificacion } from '@/types';

const BASE = '/auditor-iq';

// Shape de una AsignacionIQ en el listado del auditor
export interface AsignacionIQAuditor {
  id: number;
  evaluacion: number;
  evaluacion_nombre: string;
  usuario_asignado: number;
  usuario_nombre: string;
  usuario_email: string;
  estado: string;
  estado_display: string;
  fecha_asignacion: string;
  fecha_inicio: string;
  fecha_limite: string;
  fecha_completado: string | null;
  fecha_auditada: string | null;
  total_preguntas: number;
  preguntas_respondidas: number;
  porcentaje_completado: number;
  esta_vencida: boolean;
  dias_restantes: number;
  // Enriquecido por el backend
  total_respuestas: number;
  respuestas_calificadas: number;
  progreso_revision: number;
}

export interface RespuestaIQAuditor extends Respuesta {
  // Hereda todo de Respuesta (misma forma que TablaRespuestasRevision espera)
  // Campos extra de IQ:
  pregunta_codigo: string;
  pregunta_texto: string;
}

export interface CierreRevisionIQResult {
  asignacion_id: number;
  estado: string;
  gap_info: {
    nivel_deseado: number;
    nivel_actual: number;
    gap: number;
    clasificacion: string;
    porcentaje_cumplimiento: number;
    total_secciones: number;
    brechas_criticas: number;
    brechas_altas: number;
  } | null;
  pendientes_auto_nc: number;
}

const unwrap = <T>(res: any): T => res.data?.data ?? res.data;

export const auditorIQApi = {

  // Lista asignaciones IQ completadas (pendientes de auditar) y ya auditadas
  misRevisiones: async (evaluacionId?: number): Promise<{
    count: number;
    results: AsignacionIQAuditor[];
  }> => {
    const res = await api.get(`${BASE}/mis_revisiones/`, {
      params: evaluacionId ? { evaluacion_id: evaluacionId } : {},
    });
    return res.data;
  },

  // Respuestas de una asignación para revisar (shape compatible con TablaRespuestasRevision)
  respuestasAsignacion: async (asignacionId: number): Promise<{
    count: number;
    results: RespuestaIQAuditor[];
  }> => {
    const res = await api.get(`${BASE}/respuestas/${asignacionId}/`);
    return res.data;
  },

  // Calificar una respuesta IQ
  calificar: async (
    respuestaId: number,
    data: AuditorCalificacion
  ): Promise<any> => {
    const res = await api.post(`${BASE}/calificar/${respuestaId}/`, data);
    return unwrap(res);
  },

  // Cerrar revisión → calcula GAP automáticamente
  cerrarRevision: async (
    asignacionId: number,
    data?: { notas_auditoria?: string }
  ): Promise<{ data: CierreRevisionIQResult }> => {
    const res = await api.post(`${BASE}/cerrar_revision/${asignacionId}/`, data || {});
    return res.data;
  },

  // Historial de asignaciones ya auditadas
  historial: async (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<{ count: number; results: AsignacionIQAuditor[] }> => {
    const res = await api.get(`${BASE}/historial/`, { params });
    return res.data;
  },
};