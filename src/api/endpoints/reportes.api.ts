// src/api/endpoints/reportes.api.ts

import axiosInstance from '../axios';

export interface ReporteEvaluacion {
  evaluacion: {
    id: string;
    nombre: string;
    empresa: string;
    fecha_asignacion: string;
    fecha_limite: string;
    estado: string;
    porcentaje_avance: number;
  };
  resumen: {
    total_dimensiones: number;
    dimensiones_evaluadas: number;
    total_usuarios: number;
    nivel_deseado_promedio: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
  };
  por_dimension: Array<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
      orden: number;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    total_usuarios_evaluados: number;
    total_proyectos: number;
    usuarios: Array<{
      usuario_id: number;
      usuario_nombre: string;
      nivel_actual: number;
      gap: number;
      clasificacion_gap: string;
      clasificacion_gap_display: string;
      porcentaje_cumplimiento: number;
      total_preguntas: number;
      calculo_nivel_id?: string;
      respuestas: {
        si_cumple: number;
        cumple_parcial: number;
        no_cumple: number;
        no_aplica: number;
      };
      fecha_completado: string;
    }>;
  }>;
  por_usuario: Array<{
    usuario: {
      id: number;
      nombre_completo: string;
      email: string;
      cargo: string;
    };
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    total_dimensiones_evaluadas: number;
    dimensiones: Array<{
      dimension_id: string;
      dimension_codigo: string;
      dimension_nombre: string;
      nivel_deseado: number;
      nivel_actual: number;
      gap: number;
      clasificacion_gap: string;
      porcentaje_cumplimiento: number;
    }>;
  }>;
  clasificaciones_gap: {
    critico: number;
    alto: number;
    medio: number;
    bajo: number;
    cumplido: number;
    superado: number;
  };
  distribucion_respuestas: {
    si_cumple: number;
    cumple_parcial: number;
    no_cumple: number;
    no_aplica: number;
    total: number;
    porcentajes: {
      si_cumple: number;
      cumple_parcial: number;
      no_cumple: number;
      no_aplica: number;
    };
  };
}

export const reportesApi = {
  /**
   * Obtener reporte de evaluación (JSON)
   */
  getReporteEvaluacion: async (evaluacionEmpresaId: string): Promise<ReporteEvaluacion> => {
    const response = await axiosInstance.get('/reportes/gap_evaluacion/', {
      params: { evaluacion_empresa_id: evaluacionEmpresaId },
    });
    return response.data.data;
  },

  /**
   * Descargar reporte en Excel
   * GET /api/reportes/export_excel_completo/?evaluacion_empresa_id=xxx
   */
  downloadExcel: async (evaluacionEmpresaId: string): Promise<void> => {
    try {
      const response = await axiosInstance.get('/reportes/export_excel_completo/', {
        params: { evaluacion_empresa_id: evaluacionEmpresaId },
        responseType: 'blob', // ⭐ IMPORTANTE: Para recibir archivos binarios
      });

      // Crear URL temporal del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear link temporal y simular click
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Evaluacion_${evaluacionEmpresaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      throw error;
    }
  },

  /**
   * Descargar reporte en PDF
   * GET /api/reportes/export_pdf_evaluacion/?evaluacion_empresa_id=xxx
   */
  downloadPDF: async (evaluacionEmpresaId: string): Promise<void> => {
    try {
      const response = await axiosInstance.get('/reportes/export_pdf_evaluacion/', {
        params: { evaluacion_empresa_id: evaluacionEmpresaId },
        responseType: 'blob', // ⭐ IMPORTANTE: Para recibir archivos binarios
      });

      // Crear URL temporal del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear link temporal y simular click
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Evaluacion_${evaluacionEmpresaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  },
};
