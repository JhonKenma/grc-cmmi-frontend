import axios, { AxiosError } from 'axios';
import { AI_API_URL } from '@/utils/constants';

interface CopilotEvaluationPlanResponse {
  empresa_id: number;
  framework: string;
  suggestion: string;
  context_used: {
    activos_previos_count: number;
    hallazgos_historicos_count: number;
    normativa_count: number;
  };
  model: string;
}

interface CopilotAskParams {
  empresaId: number;
  message: string;
  pageContext: string;
  framework?: string;
}

interface CopilotAskGenericParams {
  message: string;
  pageContext: string;
}

interface CompletionResponse {
  content: string;
  model: string;
  tokens_used?: number | null;
}

const aiAxios = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

aiAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function buildApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return 'No se pudo obtener respuesta del asistente.';
}

export const copilotChatApi = {
  ask: async ({
    empresaId,
    message,
    pageContext,
    framework = 'ISO 27001',
  }: CopilotAskParams): Promise<CopilotEvaluationPlanResponse> => {
    const instruction = [
      'Responde como chat empresarial en espanol claro y accionable.',
      `Contexto de navegacion actual: ${pageContext}`,
      `Consulta del usuario: ${message}`,
    ].join('\n');

    try {
      const { data } = await aiAxios.post<CopilotEvaluationPlanResponse>(
        '/copilot/evaluations/plan',
        {
          empresa_id: empresaId,
          framework,
          instruction,
        }
      );

      return data;
    } catch (error) {
      throw new Error(buildApiErrorMessage(error));
    }
  },

  askGeneric: async ({
    message,
    pageContext,
  }: CopilotAskGenericParams): Promise<CompletionResponse> => {
    const prompt = [
      'El usuario no tiene empresa asociada actualmente. Responde de forma general y orientativa.',
      `Contexto de navegacion actual: ${pageContext}`,
      `Consulta del usuario: ${message}`,
    ].join('\n');

    try {
      const { data } = await aiAxios.post<CompletionResponse>('/completion', {
        prompt,
        system_prompt:
          'Eres un asistente GRC. Responde en espanol claro, sin inventar datos empresariales especificos.',
      });
      return data;
    } catch (error) {
      throw new Error(buildApiErrorMessage(error));
    }
  },
};
