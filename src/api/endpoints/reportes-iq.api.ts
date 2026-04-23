// src/api/endpoints/reportes-iq.api.ts

import api from '@/api/axios';
import type {
  ReporteEvaluacionIQ,
  EvaluacionIQAuditada,
} from '@/types/reporte-iq.types';

const BASE = '/reportes';

const unwrap = <T>(res: any): T => res.data?.data ?? res.data;

export const reportesIQApi = {

  // ── Listar evaluaciones IQ auditadas (selector) ───────────────────────────
  listarEvaluaciones: async (): Promise<EvaluacionIQAuditada[]> => {
    const res  = await api.get(`${BASE}/listar_evaluaciones_iq/`);
    const data = unwrap<{ evaluaciones: EvaluacionIQAuditada[] }>(res);
    return data?.evaluaciones ?? [];
  },

  // ── Reporte completo por evaluacion_id ────────────────────────────────────
  getReporte: async (evaluacionId: number): Promise<ReporteEvaluacionIQ> => {
    const res = await api.get(`${BASE}/gap_evaluacion_iq/`, {
      params: { evaluacion_id: evaluacionId },
    });
    return unwrap<ReporteEvaluacionIQ>(res);
  },

  // ── Exportar PDF ──────────────────────────────────────────────────────────
  exportarPDF: async (evaluacionId: number): Promise<void> => {
    const res = await api.get(`${BASE}/export_pdf_evaluacion_iq/`, {
      params:       { evaluacion_id: evaluacionId },
      responseType: 'blob',
    });
    _descargar(res.data, `Reporte_IQ_${evaluacionId}.pdf`);
  },

  // ── Exportar Excel ────────────────────────────────────────────────────────
  exportarExcel: async (evaluacionId: number): Promise<void> => {
    const res = await api.get(`${BASE}/export_excel_evaluacion_iq/`, {
      params:       { evaluacion_id: evaluacionId },
      responseType: 'blob',
    });
    _descargar(res.data, `Reporte_IQ_${evaluacionId}.xlsx`);
  },
};

// ── Helper interno ────────────────────────────────────────────────────────────
function _descargar(blob: Blob, filename: string) {
  const url  = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}