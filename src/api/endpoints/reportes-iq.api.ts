// src/api/endpoints/reportes-iq.api.ts

import api from '@/api/axios';
import type { ReporteEvaluacionIQ, AsignacionIQAuditada } from '@/types/reporte-iq.types';

const BASE = '/reportes';

const unwrap = <T>(res: any): T => res.data?.data ?? res.data;

export const reportesIQApi = {

  // Listar asignaciones IQ auditadas de la empresa (para el selector)
  listarEvaluaciones: async (): Promise<AsignacionIQAuditada[]> => {
    const res = await api.get(`${BASE}/listar_evaluaciones_iq/`);
    return unwrap<{ asignaciones: AsignacionIQAuditada[] }>(res).asignaciones;
  },

  // Reporte completo GAP de una asignación IQ
  getReporte: async (asignacionId: number): Promise<ReporteEvaluacionIQ> => {
    const res = await api.get(`${BASE}/gap_evaluacion_iq/`, {
      params: { asignacion_id: asignacionId },
    });
    return unwrap<ReporteEvaluacionIQ>(res);
  },

  exportarPDF: async (asignacionId: number): Promise<void> => {
    const res = await api.get(
      `${BASE}/export_pdf_evaluacion_iq/`,
      {
        params: { asignacion_id: asignacionId },
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_IQ_${asignacionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Exportar Excel
  exportarExcel: async (asignacionId: number): Promise<void> => {
    const res = await api.get(
      `${BASE}/export_excel_evaluacion_iq/`,
      {
        params: { asignacion_id: asignacionId },
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_IQ_${asignacionId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};