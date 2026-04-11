// src/api/endpoints/evaluaciones.api.ts

import axiosInstance from '@/api/axios';
import type {
  Framework,
  PreguntaEvaluacionList,
  PreguntaEvaluacionDetail,
  EvaluacionList,
  EvaluacionDetail,
  CrearEvaluacionData,
  AgregarPreguntasData,
  ReordenarPreguntasData,
  PreguntasSeleccionadasResponse,
  ImportarFrameworkResponse,
  AgregarPreguntasResponse,
  QuitarPreguntasResponse,
  SugerirPreguntasIAData,
  SugerirPreguntasIAResponse,
  EstadisticasGeneralesResponse,
  PaginatedResponse,
  FiltrosPregunta,
} from '@/types/iqevaluaciones.types';

const BASE_URL = '/evaluaciones';

// ============================================================================
// FRAMEWORKS
// ============================================================================

export const frameworksApi = {
  /**
   * Listar todos los frameworks disponibles
   */
  listar: async (): Promise<Framework[]> => {
    const { data } = await axiosInstance.get<PaginatedResponse<Framework>>(
      `${BASE_URL}/frameworks/`
    );
    return data.results;
  },

  /**
   * Obtener detalle de un framework
   */
  obtener: async (id: number): Promise<Framework> => {
    const { data } = await axiosInstance.get<Framework>(
      `${BASE_URL}/frameworks/${id}/`
    );
    return data;
  },

  /**
   * Importar frameworks desde Excel (SOLO SUPERADMIN)
   */
  importarExcel: async (file: File): Promise<ImportarFrameworkResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post<ImportarFrameworkResponse>(
      `${BASE_URL}/frameworks/importar-excel/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Obtener estadísticas generales de frameworks (SOLO SUPERADMIN)
   */
  estadisticas: async (): Promise<EstadisticasGeneralesResponse> => {
    const { data } = await axiosInstance.get<EstadisticasGeneralesResponse>(
      `${BASE_URL}/frameworks/estadisticas/`
    );
    return data;
  },
};

// ============================================================================
// PREGUNTAS
// ============================================================================

export const preguntasApi = {
  /**
   * Listar preguntas con filtros
   */
  listar: async (
    filtros?: FiltrosPregunta
  ): Promise<PaginatedResponse<PreguntaEvaluacionList>> => {
    const params = new URLSearchParams();
    
    if (filtros?.framework) params.append('framework', filtros.framework);
    if (filtros?.nivel_madurez) params.append('nivel_madurez', filtros.nivel_madurez.toString());
    if (filtros?.seccion) params.append('seccion', filtros.seccion);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.search) params.append('search', filtros.search);

    const { data } = await axiosInstance.get<PaginatedResponse<PreguntaEvaluacionList>>(
      `${BASE_URL}/preguntas/?${params.toString()}`
    );
    return data;
  },

  /**
   * Obtener detalle de una pregunta
   */
  obtener: async (id: number): Promise<PreguntaEvaluacionDetail> => {
    const { data } = await axiosInstance.get<PreguntaEvaluacionDetail>(
      `${BASE_URL}/preguntas/${id}/`
    );
    return data;
  },

  /**
   * Listar preguntas de un framework específico
   */
  porFramework: async (
    codigoFramework: string,
    correlativo?: number
  ): Promise<PaginatedResponse<PreguntaEvaluacionDetail>> => {
    const url = correlativo
      ? `${BASE_URL}/preguntas/por-framework/${codigoFramework}/?correlativo=${correlativo}`
      : `${BASE_URL}/preguntas/por-framework/${codigoFramework}/`;

    const { data } = await axiosInstance.get<PaginatedResponse<PreguntaEvaluacionDetail>>(url);
    return data;
  },
};

// ============================================================================
// EVALUACIONES
// ============================================================================

export const evaluacionesApi = {
  /**
   * Listar todas las evaluaciones
   */
  listar: async (): Promise<EvaluacionList[]> => {
    const { data } = await axiosInstance.get<PaginatedResponse<EvaluacionList>>(
      `${BASE_URL}/evaluaciones/`
    );
    return data.results;
  },

  /**
   * Obtener detalle de una evaluación
   */
  obtener: async (id: number): Promise<EvaluacionDetail> => {
    const { data } = await axiosInstance.get<EvaluacionDetail>(
      `${BASE_URL}/evaluaciones/${id}/`
    );
    return data;
  },

  /**
   * Crear nueva evaluación
   */
  crear: async (datosEvaluacion: CrearEvaluacionData): Promise<EvaluacionDetail> => {
    const { data } = await axiosInstance.post<EvaluacionDetail>(
      `${BASE_URL}/evaluaciones/`,
      datosEvaluacion
    );
    return data;
  },

  /**
   * Actualizar evaluación
   */
  actualizar: async (
    id: number,
    datosEvaluacion: Partial<CrearEvaluacionData>
  ): Promise<EvaluacionDetail> => {
    const { data } = await axiosInstance.patch<EvaluacionDetail>(
      `${BASE_URL}/evaluaciones/${id}/`,
      datosEvaluacion
    );
    return data;
  },

  /**
   * Eliminar evaluación
   */
  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/evaluaciones/${id}/`);
  },

  /**
   * Agregar preguntas a evaluación (solo si usar_todas_preguntas=false)
   */
  agregarPreguntas: async (
    id: number,
    preguntas: AgregarPreguntasData
  ): Promise<AgregarPreguntasResponse> => {
    const { data } = await axiosInstance.post<AgregarPreguntasResponse>(
      `${BASE_URL}/evaluaciones/${id}/agregar-preguntas/`,
      preguntas
    );
    return data;
  },

  /**
   * Quitar preguntas de evaluación
   */
  quitarPreguntas: async (
    id: number,
    preguntas: AgregarPreguntasData
  ): Promise<QuitarPreguntasResponse> => {
    const { data } = await axiosInstance.delete<QuitarPreguntasResponse>(
      `${BASE_URL}/evaluaciones/${id}/quitar-preguntas/`,
      { data: preguntas }
    );
    return data;
  },

  /**
   * Ver preguntas seleccionadas de una evaluación
   */
  preguntasSeleccionadas: async (
    id: number
  ): Promise<PreguntasSeleccionadasResponse> => {
    const { data } = await axiosInstance.get<PreguntasSeleccionadasResponse>(
      `${BASE_URL}/evaluaciones/${id}/preguntas-seleccionadas/`
    );
    return data;
  },

  /**
   * Reordenar preguntas de una evaluación
   */
  reordenarPreguntas: async (
    id: number,
    orden: ReordenarPreguntasData
  ): Promise<{ success: boolean; total_preguntas: number }> => {
    const { data } = await axiosInstance.put(
      `${BASE_URL}/evaluaciones/${id}/reordenar-preguntas/`,
      orden
    );
    return data;
  },

  /**
   * Solicita sugerencias de preguntas con IA para una evaluacion
   */
  sugerirPreguntasIA: async (
    id: number,
    payload: SugerirPreguntasIAData
  ): Promise<SugerirPreguntasIAResponse> => {
    const { data } = await axiosInstance.post<SugerirPreguntasIAResponse>(
      `${BASE_URL}/evaluaciones/${id}/sugerir-preguntas-ia/`,
      payload
    );
    return data;
  },
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

export const evaluacionesInteligentesApi = {
  frameworks: frameworksApi,
  preguntas: preguntasApi,
  evaluaciones: evaluacionesApi,
};

export default evaluacionesInteligentesApi;