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
  getReporteEvaluacion: async (evaluacionEmpresaId: string): Promise<ReporteEvaluacion> => {
    const response = await axiosInstance.get('/reportes/gap_evaluacion/', {
      params: { evaluacion_empresa_id: evaluacionEmpresaId },
    });
    return response.data.data;
  },
};