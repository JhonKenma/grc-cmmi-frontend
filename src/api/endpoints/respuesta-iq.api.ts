// src/api/endpoints/respuesta-iq.api.ts

import api from '@/api/axios';
import type {
  RespuestaIQ,
  CrearRespuestaIQData,
  PreguntasAsignacionResponse,
} from '@/types/respuesta-iq.types';

const BASE = '/respuestas-iq';
const EVIDENCIAS = '/evidencias-iq';

// ── Helper para extraer data del ResponseMixin del backend ────────────────────
const unwrap = <T>(response: any): T => response.data?.data ?? response.data;

export const respuestaIQApi = {

  // ── Obtener preguntas + respuestas de una asignación ─────────────────────────
  obtenerPreguntasAsignacion: async (
    asignacionId: number
  ): Promise<PreguntasAsignacionResponse> => {
    const res = await api.get(`${BASE}/preguntas-asignacion/${asignacionId}/`);
    return unwrap<PreguntasAsignacionResponse>(res);
  },

  // ── Crear borrador ────────────────────────────────────────────────────────────
  crear: async (data: CrearRespuestaIQData): Promise<RespuestaIQ> => {
    const res = await api.post(`${BASE}/`, data);
    return unwrap<RespuestaIQ>(res);
  },

  // ── Actualizar borrador ───────────────────────────────────────────────────────
  actualizar: async (
    id: number,
    data: Partial<CrearRespuestaIQData>
  ): Promise<RespuestaIQ> => {
    const res = await api.patch(`${BASE}/${id}/`, data);
    return unwrap<RespuestaIQ>(res);
  },

  // ── Enviar (borrador → enviado) ───────────────────────────────────────────────
  // Llama a POST /respuestas-iq/{id}/enviar/
  // Si todas las preguntas quedan enviadas, el backend pasa la asignación
  // a 'completada' y notifica al auditor automáticamente.
  enviar: async (id: number): Promise<{
    success: boolean;
    message: string;
    respuesta: RespuestaIQ;
    asignacion_completa: boolean;
  }> => {
    const res = await api.post(`${BASE}/${id}/enviar/`);
    return unwrap(res);
  },

  // ── Subir evidencia para una respuesta en borrador ────────────────────────────
  subirEvidencia: async (
    respuestaIQId: number,
    archivo: File,
    meta?: {
      codigo_documento?: string;
      titulo_documento?: string;
      objetivo_documento?: string;
      tipo_documento_enum?: string;
    }
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('respuesta_iq_id', respuestaIQId.toString());
    formData.append(
      'codigo_documento',
      meta?.codigo_documento ?? `DOC-${respuestaIQId}-${Date.now()}`
    );
    formData.append('titulo_documento',    meta?.titulo_documento    ?? archivo.name);
    formData.append('objetivo_documento',  meta?.objetivo_documento  ?? 'Evidencia de cumplimiento');
    formData.append('tipo_documento_enum', meta?.tipo_documento_enum ?? 'otro');

    const res = await api.post(EVIDENCIAS + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  // ── Eliminar evidencia ────────────────────────────────────────────────────────
  eliminarEvidencia: async (evidenciaId: number): Promise<void> => {
    await api.delete(`${EVIDENCIAS}/${evidenciaId}/`);
  },
};