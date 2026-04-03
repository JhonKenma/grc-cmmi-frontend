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
  context_gap_detected?: boolean;
  context_gap_message?: string | null;
  response_mode?: 'auto' | 'evaluation_plan' | 'context_summary' | 'risk_recommendations';
  model: string;
}

interface CopilotAskParams {
  empresaId: number;
  message: string;
  pageContext: string;
  framework?: string;
  responseMode?: 'auto' | 'evaluation_plan' | 'context_summary' | 'risk_recommendations';
}

interface CopilotAskGenericParams {
  message: string;
  pageContext: string;
}

interface CopilotSaveCompanyContextParams {
  empresaId: number;
  message: string;
  pageContext: string;
  framework?: string;
}

interface CopilotIngestionResponse {
  empresa_id: number;
  upserted: number;
}

interface CopilotUploadDocumentsParams {
  empresaId: number;
  files: File[];
  framework?: string;
  sourceType?: string;
  contextNote?: string;
}

interface CopilotUploadDocumentsResponse {
  empresa_id: number;
  upserted: number;
  processed_files: number;
  skipped_files: string[];
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
    framework = 'MULTI-FRAMEWORK',
    responseMode = 'auto',
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
          response_mode: responseMode,
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

  saveCompanyContext: async ({
    empresaId,
    message,
    pageContext,
    framework = 'MULTI-FRAMEWORK',
  }: CopilotSaveCompanyContextParams): Promise<CopilotIngestionResponse> => {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      throw new Error('Debes enviar informacion de la empresa para guardarla.');
    }

    const nowIso = new Date().toISOString();
    const sourceId = `chat-company-context-${Date.now()}`;
    const normalizedText = [
      'Contexto empresarial compartido por usuario en chat:',
      cleanMessage,
      '',
      `Contexto de navegacion: ${pageContext}`,
      `Registrado en: ${nowIso}`,
    ].join('\n');

    try {
      const { data } = await aiAxios.post<CopilotIngestionResponse>(
        '/copilot/ingestion/upsert',
        {
          empresa_id: empresaId,
          documents: [
            {
              source_type: 'activo_informacion',
              source_id: sourceId,
              framework,
              text: normalizedText,
              idioma: 'es',
              metadata: {
                source_channel: 'chat',
                page_context: pageContext,
              },
            },
          ],
        }
      );
      return data;
    } catch (error) {
      throw new Error(buildApiErrorMessage(error));
    }
  },

  uploadCompanyDocuments: async ({
    empresaId,
    files,
    framework = 'MULTI-FRAMEWORK',
    sourceType = 'activo_informacion',
    contextNote,
  }: CopilotUploadDocumentsParams): Promise<CopilotUploadDocumentsResponse> => {
    if (!files.length) {
      throw new Error('Debes seleccionar al menos un archivo para cargar.');
    }

    const formData = new FormData();
    formData.append('empresa_id', String(empresaId));
    formData.append('framework', framework);
    formData.append('source_type', sourceType);

    const normalizedContextNote = contextNote?.trim();
    if (normalizedContextNote) {
      formData.append('context_note', normalizedContextNote);
    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const { data } = await aiAxios.post<CopilotUploadDocumentsResponse>(
        '/copilot/ingestion/upload',
        formData
      );
      return data;
    } catch (error) {
      throw new Error(buildApiErrorMessage(error));
    }
  },
};
