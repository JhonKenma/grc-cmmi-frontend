import axios, { AxiosError } from 'axios';

import axiosInstance from '../axios';
import type {
  ActionResponse,
  ActivoInformacion,
  ActivoPlan,
  ActivoInformacionFilter,
  ApiPaginatedResponse,
  ApiWrappedResponse,
  CausaRiesgo,
  CategoriaRiesgo,
  CategoriaRiesgoFilter,
  ConfiguracionRevision,
  ConfiguracionFormulas,
  CreateActivoInformacionPayload,
  CreateControlPayload,
  CreateCategoriaRiesgoPayload,
  CreateEvaluacionCuantitativaPayload,
  CreateKRIPayload,
  CreatePlanTratamientoPayload,
  CreateRegistroMonitoreoPayload,
  CreateRiesgoActivoPayload,
  CreateRiesgoPayload,
  DashboardRiesgos,
  FrecuenciaControl,
  EvaluacionCuantitativa,
  EvaluacionCuantitativaFilter,
  HeatmapPayload,
  Id,
  KRI,
  KRIFilter,
  PaginatedResult,
  PlanTratamiento,
  PlanTratamientoFilter,
  RegistrarMedicionKRIPayload,
  RegistroMonitoreo,
  RegistroMonitoreoFilter,
  RiesgoReporteSimpleItem,
  ResourceFilter,
  Riesgo,
  RiesgoControl,
  RiesgoActivo,
  RiesgoActivoFilter,
  RiesgoFilter,
  NaturalezaConsecuencia,
  TipoActivoRemediacion,
  TipoControl,
  TipoRiesgo,
  TipoTratamientoMaestro,
  UnidadPerdida,
  UpdateActivoInformacionPayload,
  UpdateCategoriaRiesgoPayload,
  UpdateEvaluacionCuantitativaPayload,
  UpdateKRIPayload,
  UpdatePlanTratamientoPayload,
  UpdateRegistroMonitoreoPayload,
  UpdateRiesgoActivoPayload,
  UpdateRiesgoPayload,
  Control,
} from '@/types';

const BASE_URL = '/riesgos';

export class ApiRequestError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.payload = payload;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const unwrapData = <T>(payload: unknown): T => {
  if (isRecord(payload) && 'data' in payload) {
    const wrapped = payload as ApiWrappedResponse<T>;
    if (wrapped.data !== undefined) return wrapped.data;
  }

  return payload as T;
};

const normalizePaginated = <T>(payload: unknown): PaginatedResult<T> => {
  const raw = unwrapData<unknown>(payload);

  if (Array.isArray(raw)) {
    return { count: raw.length, results: raw as T[] };
  }

  if (isRecord(raw) && Array.isArray(raw.results)) {
    const paginated = raw as ApiPaginatedResponse<T>;
    return {
      count: typeof paginated.count === 'number' ? paginated.count : paginated.results.length,
      results: paginated.results,
    };
  }

  if (raw === undefined || raw === null) {
    return { count: 0, results: [] };
  }

  return { count: 1, results: [raw as T] };
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (status === 401) return 'Sesion expirada o no autenticada. Inicia sesion nuevamente.';
  if (status === 403) return 'Permiso denegado para esta accion.';

  if (typeof data === 'string') return data;

  if (isRecord(data)) {
    if (typeof data.message === 'string') return data.message;
    if (typeof data.detail === 'string') return data.detail;

    if (isRecord(data.errors)) {
      const first = Object.entries(data.errors)[0];
      if (first) {
        const [field, value] = first;
        const formatted = Array.isArray(value) ? value[0] : value;
        if (field === 'non_field_errors' || field === '__all__') {
          return String(formatted);
        }
        return `${field}: ${String(formatted)}`;
      }
    }

    const flatField = Object.entries(data).find(([, value]) => Array.isArray(value) || typeof value === 'string');
    if (flatField) {
      const [field, value] = flatField;
      const formatted = Array.isArray(value) ? value[0] : value;
      if (field === 'non_field_errors' || field === '__all__') {
        return String(formatted);
      }
      return `${field}: ${String(formatted)}`;
    }
  }

  return fallback;
};

const mapToRequestError = (error: unknown, fallback: string): ApiRequestError => {
  if (!axios.isAxiosError(error)) return new ApiRequestError(fallback);

  const status = error.response?.status;
  const payload = error.response?.data;
  const message = getApiErrorMessage(error, fallback);

  return new ApiRequestError(message, status, payload);
};

const toRiesgo = (riesgo: Riesgo): Riesgo => {
  const raw = riesgo as unknown as Record<string, unknown>;
  const duenoNombre = typeof raw.dueno_riesgo_nombre === 'string' ? raw.dueno_riesgo_nombre : undefined;
  const duenoId = raw.dueno_riesgo as Id | undefined;
  const tipoRiesgoId = (raw.tipo_riesgo as Id | undefined) ?? undefined;
  const tipoRiesgoNombre = typeof raw.tipo_riesgo_nombre === 'string' ? raw.tipo_riesgo_nombre : undefined;
  const fechaRevision =
    (typeof raw.fecha_revision === 'string' && raw.fecha_revision) ||
    (typeof raw.proxima_revision_fecha === 'string' && raw.proxima_revision_fecha) ||
    undefined;
  const nivelInherente = typeof raw.nivel_riesgo_inherente === 'number' ? raw.nivel_riesgo_inherente : undefined;

  return {
    ...riesgo,
    titulo: riesgo.titulo ?? riesgo.nombre,
    nombre: riesgo.nombre ?? riesgo.titulo ?? '',
    categoria: (riesgo.categoria as Id | undefined) ?? tipoRiesgoId ?? '',
    categoria_nombre: riesgo.categoria_nombre ?? tipoRiesgoNombre,
    propietario: riesgo.propietario ?? duenoId,
    propietario_nombre: riesgo.propietario_nombre ?? duenoNombre,
    responsable_riesgo: riesgo.responsable_riesgo ?? duenoId,
    responsable_riesgo_nombre: riesgo.responsable_riesgo_nombre ?? duenoNombre,
    nivel_inherente: riesgo.nivel_inherente ?? nivelInherente,
    nivel_residual:
      riesgo.nivel_residual ??
      (typeof raw.riesgo_residual_calculado === 'number' ? raw.riesgo_residual_calculado : undefined),
    fecha_revision: riesgo.fecha_revision ?? fechaRevision,
  };
};

const withNumericIfValid = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const withStringIfValid = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeOptionalId = (value: unknown): Id | null | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed;
  }
  if (typeof value === 'number') return value;
  return undefined;
};

const mapRiesgoPayload = (payload: Partial<CreateRiesgoPayload>, isUpdate = false): Record<string, unknown> => {
  const nombre = withStringIfValid(payload.titulo) ?? withStringIfValid(payload.nombre);
  const tipoRiesgo = normalizeOptionalId(payload.tipo_riesgo ?? payload.categoria);

  const mapped: Record<string, unknown> = {};

  if (!isUpdate) {
    mapped.codigo = withStringIfValid(payload.codigo) ?? `RSG-${Date.now().toString().slice(-6)}`;
  } else if (withStringIfValid(payload.codigo)) {
    mapped.codigo = withStringIfValid(payload.codigo);
  }

  if (nombre) mapped.nombre = nombre;
  if (withStringIfValid(payload.descripcion)) mapped.descripcion = withStringIfValid(payload.descripcion);
  if (tipoRiesgo !== undefined) mapped.tipo_riesgo = tipoRiesgo;

  const naturalezaCausa = normalizeOptionalId(payload.naturaleza_causa);
  if (naturalezaCausa !== undefined) mapped.naturaleza_causa = naturalezaCausa;

  const naturalezaConsecuencia = normalizeOptionalId(payload.naturaleza_consecuencia);
  if (naturalezaConsecuencia !== undefined) mapped.naturaleza_consecuencia = naturalezaConsecuencia;

  const proceso = normalizeOptionalId(payload.proceso);
  if (proceso !== undefined) mapped.proceso = proceso;

  if (withStringIfValid(payload.proceso_texto)) {
    mapped.proceso_texto = withStringIfValid(payload.proceso_texto);
  }

  if (withStringIfValid(payload.fuente)) mapped.fuente = withStringIfValid(payload.fuente);
  if (withStringIfValid(payload.velocidad_materializacion)) {
    mapped.velocidad_materializacion = withStringIfValid(payload.velocidad_materializacion);
  }

  if (withStringIfValid(payload.causa_raiz)) mapped.causa_raiz = withStringIfValid(payload.causa_raiz);
  if (withStringIfValid(payload.consecuencia)) mapped.consecuencia = withStringIfValid(payload.consecuencia);
  if (withStringIfValid(payload.escenarios)) mapped.escenarios = withStringIfValid(payload.escenarios);

  const probabilidad = withNumericIfValid(payload.probabilidad);
  if (probabilidad !== undefined) mapped.probabilidad = probabilidad;

  const impacto = withNumericIfValid(payload.impacto);
  if (impacto !== undefined) mapped.impacto = impacto;

  const dueno = normalizeOptionalId(payload.dueno_riesgo);
  if (dueno !== undefined) mapped.dueno_riesgo = dueno;

  if (withStringIfValid(payload.fecha_identificacion)) {
    mapped.fecha_identificacion = withStringIfValid(payload.fecha_identificacion);
  }

  const fechaRevision = withStringIfValid(payload.proxima_revision_fecha) ?? withStringIfValid(payload.fecha_revision);
  if (fechaRevision) mapped.proxima_revision_fecha = fechaRevision;

  if (typeof payload.evaluacion_cuantitativa_activa === 'boolean') {
    mapped.evaluacion_cuantitativa_activa = payload.evaluacion_cuantitativa_activa;
  }

  const unidadPerdida = normalizeOptionalId(payload.unidad_perdida);
  if (unidadPerdida !== undefined) mapped.unidad_perdida = unidadPerdida;

  const montoPerdida = withNumericIfValid(payload.monto_perdida);
  if (montoPerdida !== undefined) mapped.monto_perdida = montoPerdida;

  const valorActivo = withNumericIfValid(payload.valor_activo);
  if (valorActivo !== undefined) mapped.valor_activo = valorActivo;

  const factorExposicion = withNumericIfValid(payload.factor_exposicion);
  if (factorExposicion !== undefined) mapped.factor_exposicion = factorExposicion;

  const aro = withNumericIfValid(payload.aro);
  if (aro !== undefined) mapped.aro = aro;

  if (withStringIfValid(payload.moneda)) mapped.moneda = withStringIfValid(payload.moneda);

  const impactoFinanciero = withNumericIfValid(payload.impacto_financiero);
  if (impactoFinanciero !== undefined) mapped.impacto_financiero = impactoFinanciero;

  const impactoOperacional = withNumericIfValid(payload.impacto_operacional);
  if (impactoOperacional !== undefined) mapped.impacto_operacional = impactoOperacional;

  const impactoReputacional = withNumericIfValid(payload.impacto_reputacional);
  if (impactoReputacional !== undefined) mapped.impacto_reputacional = impactoReputacional;

  return mapped;
};

const buildQuery = (filters?: Record<string, unknown>): string => {
  if (!filters) return '';

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

const normalizeActionResponse = (payload: unknown): ActionResponse => {
  if (isRecord(payload)) {
    return {
      success: typeof payload.success === 'boolean' ? payload.success : undefined,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    };
  }

  return {};
};

const getEmpresaIdFromSession = (): string | number | null => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const parsedUser = JSON.parse(rawUser) as { empresa?: string | number | null };
    return parsedUser.empresa ?? null;
  } catch {
    return null;
  }
};

const toIsoDate = (value: Date): string => value.toISOString().slice(0, 10);

const addDays = (value: Date, days: number): Date => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const normalizePlan = (payload: PlanTratamiento): PlanTratamiento => {
  const raw = payload as unknown as Record<string, unknown>;

  return {
    ...payload,
    nombre:
      (typeof raw.nombre === 'string' && raw.nombre) ||
      (typeof raw.descripcion_accion === 'string' && raw.descripcion_accion) ||
      'Plan de tratamiento',
    descripcion:
      (typeof raw.descripcion === 'string' && raw.descripcion) ||
      (typeof raw.objetivos === 'string' && raw.objetivos) ||
      '',
    avance:
      typeof raw.avance === 'number'
        ? raw.avance
        : typeof raw.porcentaje_avance === 'number'
          ? raw.porcentaje_avance
          : 0,
  };
};

const normalizeMonitoreo = (payload: RegistroMonitoreo): RegistroMonitoreo => {
  const raw = payload as unknown as Record<string, unknown>;
  const resultado = typeof raw.resultado === 'string' ? raw.resultado : '';

  return {
    ...payload,
    fecha:
      (typeof raw.fecha === 'string' && raw.fecha) ||
      (typeof raw.fecha_revision === 'string' && raw.fecha_revision) ||
      '',
    estado:
      (typeof raw.estado === 'string' && raw.estado) ||
      resultado ||
      '',
    comentario:
      (typeof raw.comentario === 'string' && raw.comentario) ||
      (typeof raw.observaciones === 'string' && raw.observaciones) ||
      '',
    alerta:
      typeof raw.alerta === 'boolean'
        ? raw.alerta
        : ['deterioro', 'incidente'].includes(resultado),
  };
};

const normalizeActivo = (payload: ActivoInformacion): ActivoInformacion => {
  const raw = payload as unknown as Record<string, unknown>;

  const confidencialidad =
    typeof raw.confidencialidad === 'number'
      ? raw.confidencialidad
      : typeof raw.criticidad === 'string'
        ? raw.criticidad === 'alta'
          ? 5
          : raw.criticidad === 'media'
            ? 3
            : 1
        : 3;

  const integridad = typeof raw.integridad === 'number' ? raw.integridad : confidencialidad;
  const disponibilidad = typeof raw.disponibilidad === 'number' ? raw.disponibilidad : confidencialidad;

  return {
    ...payload,
    tipo_activo:
      (typeof raw.tipo_activo === 'string' && raw.tipo_activo) ||
      (typeof raw.tipo === 'string' && raw.tipo) ||
      'otro',
    tipo:
      (typeof raw.tipo === 'string' && raw.tipo) ||
      (typeof raw.tipo_activo === 'string' ? raw.tipo_activo : undefined),
    descripcion: typeof raw.descripcion === 'string' ? raw.descripcion : undefined,
    criticidad:
      (typeof raw.criticidad === 'string' && raw.criticidad) ||
      (confidencialidad >= 5 ? 'alta' : confidencialidad >= 3 ? 'media' : 'baja'),
    confidencialidad,
    integridad,
    disponibilidad,
    valor_activo:
      typeof raw.valor_activo === 'number'
        ? raw.valor_activo
        : typeof raw.valor_economico === 'number'
          ? raw.valor_economico
          : undefined,
    valor_economico:
      typeof raw.valor_economico === 'number'
        ? raw.valor_economico
        : typeof raw.valor_activo === 'number'
          ? raw.valor_activo
          : undefined,
    propietario_activo:
      (typeof raw.propietario_activo === 'string' && raw.propietario_activo) ||
      (typeof raw.propietario === 'string' ? raw.propietario : undefined),
    propietario:
      (typeof raw.propietario === 'string' && raw.propietario) ||
      (typeof raw.propietario_activo === 'string' ? raw.propietario_activo : undefined),
  };
};

const normalizeRiesgoActivo = (payload: RiesgoActivo): RiesgoActivo => {
  const raw = payload as unknown as Record<string, unknown>;

  const nivelAfectacion =
    typeof raw.nivel_afectacion === 'number' || typeof raw.nivel_afectacion === 'string'
      ? raw.nivel_afectacion
      : 3;

  return {
    ...payload,
    activo_informacion: (raw.activo_informacion as Id | undefined) ?? (raw.activo as Id),
    activo: (raw.activo as Id | undefined) ?? (raw.activo_informacion as Id),
    tipo_afectacion:
      (typeof raw.tipo_afectacion === 'string' && raw.tipo_afectacion) ||
      'operacional',
    nivel_afectacion: nivelAfectacion,
    impacto_especifico:
      (typeof raw.impacto_especifico === 'string' && raw.impacto_especifico) ||
      (typeof raw.justificacion === 'string' ? raw.justificacion : ''),
    justificacion:
      (typeof raw.justificacion === 'string' && raw.justificacion) ||
      (typeof raw.impacto_especifico === 'string' ? raw.impacto_especifico : undefined),
  };
};

const normalizeEvaluacionCuantitativa = (payload: EvaluacionCuantitativa): EvaluacionCuantitativa => {
  const raw = payload as unknown as Record<string, unknown>;
  const sle = typeof raw.sle === 'number' ? raw.sle : 0;
  const aro = typeof raw.aro === 'number' ? raw.aro : 0;
  const ale =
    typeof raw.ale === 'number'
      ? raw.ale
      : typeof raw.sle === 'number' && typeof raw.aro === 'number'
        ? Number((raw.sle * raw.aro).toFixed(2))
        : undefined;

  return {
    ...payload,
    metodo_evaluacion:
      (typeof raw.metodo_evaluacion === 'string' && raw.metodo_evaluacion) ||
      (typeof raw.metodo === 'string' && raw.metodo) ||
      'ale',
    metodo:
      (typeof raw.metodo === 'string' && raw.metodo) ||
      (typeof raw.metodo_evaluacion === 'string' ? raw.metodo_evaluacion : undefined),
    fecha:
      (typeof raw.fecha === 'string' && raw.fecha) ||
      (typeof raw.fecha_creacion === 'string' ? raw.fecha_creacion.slice(0, 10) : undefined),
    sle,
    aro,
    ale,
    observaciones:
      (typeof raw.observaciones === 'string' && raw.observaciones) ||
      (typeof raw.supuestos === 'string' ? raw.supuestos : undefined),
    supuestos:
      (typeof raw.supuestos === 'string' && raw.supuestos) ||
      (typeof raw.observaciones === 'string' ? raw.observaciones : undefined),
  };
};

const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const asCellCount = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'number') return value;
  if (isRecord(value) && typeof value.total === 'number') return value.total;
  return 0;
};

const normalizeDashboard = (payload: DashboardRiesgos): DashboardRiesgos => {
  const raw = payload as unknown as Record<string, unknown>;
  const resumenRaw = isRecord(raw.resumen) ? raw.resumen : {};
  const porEstado = isRecord(resumenRaw.por_estado) ? resumenRaw.por_estado : {};
  const porClasificacion = isRecord(resumenRaw.por_clasificacion) ? resumenRaw.por_clasificacion : {};

  const riesgoAltoBackend = asNumber((resumenRaw as Record<string, unknown>).riesgo_alto);
  const altos = asNumber((porClasificacion as Record<string, unknown>).alto) ?? 0;
  const criticos = asNumber((porClasificacion as Record<string, unknown>).critico) ?? 0;

  return {
    ...payload,
    resumen: {
      total_riesgos: asNumber((resumenRaw as Record<string, unknown>).total_riesgos) ?? 0,
      en_revision:
        asNumber((resumenRaw as Record<string, unknown>).en_revision) ??
        asNumber((porEstado as Record<string, unknown>).en_revision) ??
        0,
      aprobados:
        asNumber((resumenRaw as Record<string, unknown>).aprobados) ??
        asNumber((porEstado as Record<string, unknown>).aprobado) ??
        0,
      en_tratamiento:
        asNumber((resumenRaw as Record<string, unknown>).en_tratamiento) ??
        asNumber((porEstado as Record<string, unknown>).en_tratamiento) ??
        0,
      cerrados:
        asNumber((resumenRaw as Record<string, unknown>).cerrados) ??
        asNumber((porEstado as Record<string, unknown>).cerrado) ??
        0,
      riesgo_alto: riesgoAltoBackend ?? altos + criticos,
      kris_en_rojo: asNumber((resumenRaw as Record<string, unknown>).kris_en_rojo) ?? 0,
      planes_activos: asNumber((resumenRaw as Record<string, unknown>).planes_activos) ?? 0,
      cobertura_controles: asNumber((resumenRaw as Record<string, unknown>).cobertura_controles) ?? 0,
      riesgos_bajo: asNumber((porClasificacion as Record<string, unknown>).bajo) ?? 0,
      riesgos_medio: asNumber((porClasificacion as Record<string, unknown>).medio) ?? 0,
      riesgos_alto: altos,
      riesgos_critico: criticos,
    },
  };
};

const normalizeHeatmap = (payload: HeatmapPayload): HeatmapPayload => {
  const raw = payload as unknown as Record<string, unknown>;
  const matriz = Array.isArray(raw.matriz) ? raw.matriz : [];
  const riesgosPorCelda = isRecord(raw.riesgos_por_celda) ? raw.riesgos_por_celda : {};
  const mapaPlano = isRecord(raw.heatmap) ? raw.heatmap : {};
  const riesgosResidual = Array.isArray(raw.riesgos) ? raw.riesgos : [];

  const normalizedCells: HeatmapPayload['matriz'] = [];

  if (Object.keys(mapaPlano).length > 0) {
    Object.entries(mapaPlano).forEach(([key, value]) => {
      if (!isRecord(value)) return;

      const [probRaw, impRaw] = key.split(',');
      const probabilidad = Number(probRaw);
      const impacto = Number(impRaw);
      if (!Number.isFinite(probabilidad) || !Number.isFinite(impacto)) return;

      const total = asNumber(value.total) ?? 0;
      normalizedCells.push({ probabilidad, impacto, total });
    });
  }

  if (normalizedCells.length === 0 && riesgosResidual.length > 0) {
    const acumulado: Record<string, number> = {};

    riesgosResidual.forEach((item) => {
      if (!isRecord(item)) return;
      const probabilidad = asNumber(item.probabilidad);
      const impacto = asNumber(item.impacto);
      if (probabilidad === undefined || impacto === undefined) return;

      const key = `${probabilidad}_${impacto}`;
      acumulado[key] = (acumulado[key] ?? 0) + 1;
    });

    for (let impacto = 1; impacto <= 5; impacto += 1) {
      for (let probabilidad = 1; probabilidad <= 5; probabilidad += 1) {
        const key = `${probabilidad}_${impacto}`;
        normalizedCells.push({ probabilidad, impacto, total: acumulado[key] ?? 0 });
      }
    }
  }

  matriz.forEach((row) => {
    if (isRecord(row)) {
      const probabilidad = asNumber(row.probabilidad);
      const impacto = asNumber(row.impacto);
      if (probabilidad === undefined || impacto === undefined) return;

      const backendKeyUnderscore = `${probabilidad}_${impacto}`;
      const backendKeyHyphen = `${probabilidad}-${impacto}`;
      const riesgosUnderscore = (riesgosPorCelda as Record<string, unknown>)[backendKeyUnderscore];
      const riesgosHyphen = (riesgosPorCelda as Record<string, unknown>)[backendKeyHyphen];
      const totalFromRiesgos = asCellCount(riesgosUnderscore) || asCellCount(riesgosHyphen) || 0;
      const total = asNumber(row.total) ?? totalFromRiesgos;

      normalizedCells.push({ probabilidad, impacto, total });
      return;
    }

    if (!Array.isArray(row)) return;

    row.forEach((cell) => {
      if (!isRecord(cell)) return;

      const probabilidad = asNumber(cell.probabilidad);
      const impacto = asNumber(cell.impacto);
      if (probabilidad === undefined || impacto === undefined) return;

      const backendKeyUnderscore = `${probabilidad}_${impacto}`;
      const backendKeyHyphen = `${probabilidad}-${impacto}`;
      const riesgosUnderscore = (riesgosPorCelda as Record<string, unknown>)[backendKeyUnderscore];
      const riesgosHyphen = (riesgosPorCelda as Record<string, unknown>)[backendKeyHyphen];
      const totalFromRiesgos = asCellCount(riesgosUnderscore) || asCellCount(riesgosHyphen) || 0;
      const total = asNumber(cell.total) ?? totalFromRiesgos;

      normalizedCells.push({ probabilidad, impacto, total });
    });
  });

  if (normalizedCells.length === 0) {
    for (let impacto = 1; impacto <= 5; impacto += 1) {
      for (let probabilidad = 1; probabilidad <= 5; probabilidad += 1) {
        normalizedCells.push({ probabilidad, impacto, total: 0 });
      }
    }
  }

  return { matriz: normalizedCells };
};

const listResource = async <T>(endpoint: string, filters?: ResourceFilter): Promise<PaginatedResult<T>> => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}${endpoint}${buildQuery(filters)}`);
    return normalizePaginated<T>(response.data);
  } catch (error) {
    throw mapToRequestError(error, 'No se pudo cargar la informacion');
  }
};

const getResource = async <T>(endpoint: string, id: Id): Promise<T> => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}${endpoint}${id}/`);
    return unwrapData<T>(response.data);
  } catch (error) {
    throw mapToRequestError(error, 'No se pudo cargar el detalle');
  }
};

const createResource = async <T, P>(endpoint: string, payload: P): Promise<T> => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}${endpoint}`, payload);
    return unwrapData<T>(response.data);
  } catch (error) {
    throw mapToRequestError(error, 'No se pudo crear el registro');
  }
};

const updateResource = async <T, P>(endpoint: string, id: Id, payload: P): Promise<T> => {
  try {
    const response = await axiosInstance.patch(`${BASE_URL}${endpoint}${id}/`, payload);
    return unwrapData<T>(response.data);
  } catch (error) {
    throw mapToRequestError(error, 'No se pudo actualizar el registro');
  }
};

const deleteResource = async (endpoint: string, id: Id): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_URL}${endpoint}${id}/`);
  } catch (error) {
    throw mapToRequestError(error, 'No se pudo eliminar el registro');
  }
};

export const riesgosApi = {
  // Dashboard y mapa
  getDashboard: async (filters?: RiesgoFilter): Promise<DashboardRiesgos> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/dashboard/${buildQuery(filters)}`);
      return normalizeDashboard(unwrapData<DashboardRiesgos>(response.data));
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cargar el dashboard');
    }
  },

  getMapaCalor: async (filters?: RiesgoFilter): Promise<HeatmapPayload> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/mapa_calor/${buildQuery(filters)}`);
      return normalizeHeatmap(unwrapData<HeatmapPayload>(response.data));
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cargar el mapa de calor');
    }
  },

  heatmapInherente: async (filters?: RiesgoFilter): Promise<HeatmapPayload> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/heatmap/inherente/${buildQuery(filters)}`);
      return normalizeHeatmap(unwrapData<HeatmapPayload>(response.data));
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cargar el mapa de calor inherente');
    }
  },

  heatmapResidual: async (filters?: RiesgoFilter): Promise<HeatmapPayload> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/heatmap/residual/${buildQuery(filters)}`);
      return normalizeHeatmap(unwrapData<HeatmapPayload>(response.data));
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cargar el mapa de calor residual');
    }
  },

  // Categorias
  listCategorias: async (filters?: CategoriaRiesgoFilter) => {
    try {
      return await listResource<CategoriaRiesgo>('/categorias/', filters);
    } catch (error) {
      const requestError = error instanceof ApiRequestError ? error : undefined;
      if (requestError?.status !== 404) throw error;

      // Fallback: usar tipos de riesgo como catálogo cuando /categorias no está expuesto.
      const tipos = await tiposRiesgoApi.list();
      const mapped: CategoriaRiesgo[] = tipos.map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        activo: true,
      }));
      return {
        count: mapped.length,
        results: mapped,
      };
    }
  },
  getCategoria: (id: Id) => getResource<CategoriaRiesgo>('/categorias/', id),
  createCategoria: (payload: CreateCategoriaRiesgoPayload) => {
    const empresa = payload.empresa ?? getEmpresaIdFromSession();
    const requestPayload = {
      ...payload,
      ...(empresa != null ? { empresa } : {}),
    };
    return createResource<CategoriaRiesgo, typeof requestPayload>('/categorias/', requestPayload);
  },
  updateCategoria: (id: Id, payload: UpdateCategoriaRiesgoPayload) => {
    const empresa = payload.empresa ?? getEmpresaIdFromSession();
    const requestPayload = {
      ...payload,
      ...(empresa != null ? { empresa } : {}),
    };
    return updateResource<CategoriaRiesgo, typeof requestPayload>('/categorias/', id, requestPayload);
  },
  deleteCategoria: (id: Id) => deleteResource('/categorias/', id),

  // Riesgos
  listRiesgos: async (filters?: RiesgoFilter): Promise<PaginatedResult<Riesgo>> => {
    const data = await listResource<Riesgo>('/riesgos/', filters);
    return {
      count: data.count,
      results: data.results.map(toRiesgo),
    };
  },
  getRiesgo: async (id: Id): Promise<Riesgo> => toRiesgo(await getResource<Riesgo>('/riesgos/', id)),
  createRiesgo: async (payload: CreateRiesgoPayload): Promise<Riesgo> => {
    const created = await createResource<Riesgo, Record<string, unknown>>('/riesgos/', mapRiesgoPayload(payload));
    return toRiesgo(created);
  },
  updateRiesgo: async (id: Id, payload: UpdateRiesgoPayload): Promise<Riesgo> => {
    const mapped = mapRiesgoPayload(payload, true);
    const updated = await updateResource<Riesgo, Record<string, unknown>>('/riesgos/', id, mapped);
    return toRiesgo(updated);
  },
  deleteRiesgo: (id: Id) => deleteResource('/riesgos/', id),

  enviarRevisionRiesgo: async (id: Id): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/riesgos/${id}/enviar_revision/`);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo enviar el riesgo a revision');
    }
  },
  aprobarRiesgo: async (id: Id): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/riesgos/${id}/aprobar/`);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo aprobar el riesgo');
    }
  },
  rechazarRiesgo: async (id: Id): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/riesgos/${id}/rechazar/`);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo rechazar el riesgo');
    }
  },
  cerrarRiesgo: async (id: Id): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/riesgos/${id}/cerrar/`);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cerrar el riesgo');
    }
  },

  // Planes de tratamiento
  listPlanesTratamiento: (filters?: PlanTratamientoFilter) =>
    listResource<PlanTratamiento>('/planes/', filters).then((result) => ({
      count: result.count,
      results: result.results.map(normalizePlan),
    })),
  getPlanTratamiento: (id: Id) => getResource<PlanTratamiento>('/planes/', id).then(normalizePlan),
  createPlanTratamiento: async (payload: CreatePlanTratamientoPayload) => {
    const today = new Date();
    const riesgos = payload.riesgos && payload.riesgos.length > 0
      ? payload.riesgos
      : [payload.riesgo];
    const riesgosAsociados = payload.riesgos_asociados && payload.riesgos_asociados.length > 0
      ? payload.riesgos_asociados
      : riesgos;
    const costoTotal = payload.costo_total ?? (payload.activos_plan?.reduce((sum, activo) => sum + (activo.costo_estimado ?? 0), 0) ?? 0);

    const requestPayload = {
      riesgo: payload.riesgo,
      riesgos,
      riesgos_asociados: riesgosAsociados,
      tipo: payload.tipo ?? payload.tipo_tratamiento ?? 'mitigar',
      tipo_tratamiento: payload.tipo_tratamiento ?? payload.tipo ?? 'mitigar',
      estado: payload.estado_accion,
      descripcion_accion:
        payload.descripcion_accion ?? payload.nombre ?? payload.descripcion ?? 'Accion de tratamiento',
      objetivos: payload.descripcion ?? payload.objetivos ?? '',
      responsable_accion: payload.responsable_accion ?? payload.responsable,
      prioridad: payload.prioridad ?? 'media',
      fecha_inicio: payload.fecha_inicio ?? toIsoDate(today),
      fecha_fin_plan: payload.fecha_fin_plan ?? payload.fecha_fin ?? toIsoDate(addDays(today, 30)),
      recursos_requeridos: payload.recursos_requeridos ?? payload.observaciones ?? '',
      eficacia_esperada: payload.eficacia_esperada,
      nivel_riesgo_objetivo: payload.nivel_riesgo_objetivo,
      mejora: payload.mejora,
      nueva_probabilidad: payload.nueva_probabilidad,
      nuevo_impacto: payload.nuevo_impacto,
      nivel_residual_esperado: payload.nivel_residual_esperado,
      costo_total: costoTotal,
      activos_plan: payload.activos_plan,
      dependencias: payload.dependencias,
    };

    const created = await createResource<PlanTratamiento, typeof requestPayload>('/planes/', requestPayload);
    return normalizePlan(created);
  },
  updatePlanTratamiento: async (id: Id, payload: UpdatePlanTratamientoPayload) => {
    const requestPayload = {
      ...(payload.tipo ? { tipo: payload.tipo } : {}),
      ...(payload.tipo_tratamiento ? { tipo: payload.tipo_tratamiento } : {}),
      ...(payload.riesgos_asociados ? { riesgos_asociados: payload.riesgos_asociados } : {}),
      ...(payload.mejora ? { mejora: payload.mejora } : {}),
      ...(payload.nueva_probabilidad !== undefined ? { nueva_probabilidad: payload.nueva_probabilidad } : {}),
      ...(payload.nuevo_impacto !== undefined ? { nuevo_impacto: payload.nuevo_impacto } : {}),
      ...(payload.nivel_residual_esperado !== undefined ? { nivel_residual_esperado: payload.nivel_residual_esperado } : {}),
      ...(payload.costo_total !== undefined ? { costo_total: payload.costo_total } : {}),
      ...(payload.activos_plan ? { activos_plan: payload.activos_plan } : {}),
      ...(payload.dependencias ? { dependencias: payload.dependencias } : {}),
      ...(payload.estado_accion ? { estado: payload.estado_accion } : {}),
      ...(payload.descripcion_accion ? { descripcion_accion: payload.descripcion_accion } : {}),
      ...(payload.nombre ? { descripcion_accion: payload.nombre } : {}),
      ...(payload.descripcion ? { objetivos: payload.descripcion } : {}),
      ...(payload.objetivos ? { objetivos: payload.objetivos } : {}),
      ...(payload.responsable_accion ? { responsable_accion: payload.responsable_accion } : {}),
      ...(payload.responsable ? { responsable_accion: payload.responsable } : {}),
      ...(payload.prioridad ? { prioridad: payload.prioridad } : {}),
      ...(payload.fecha_inicio ? { fecha_inicio: payload.fecha_inicio } : {}),
      ...(payload.fecha_fin_plan ? { fecha_fin_plan: payload.fecha_fin_plan } : {}),
      ...(payload.fecha_fin ? { fecha_fin_plan: payload.fecha_fin } : {}),
      ...(payload.recursos_requeridos ? { recursos_requeridos: payload.recursos_requeridos } : {}),
      ...(payload.eficacia_esperada ? { eficacia_esperada: payload.eficacia_esperada } : {}),
      ...(payload.nivel_riesgo_objetivo ? { nivel_riesgo_objetivo: payload.nivel_riesgo_objetivo } : {}),
    };

    const updated = await updateResource<PlanTratamiento, typeof requestPayload>('/planes/', id, requestPayload);
    return normalizePlan(updated);
  },
  deletePlanTratamiento: (id: Id) => deleteResource('/planes/', id),

  actualizarAvancePlan: async (id: Id, avance: number): Promise<PlanTratamiento> => {
    try {
      const response = await axiosInstance.patch(`${BASE_URL}/planes/${id}/actualizar_avance/`, {
        porcentaje_avance: avance,
      });
      return normalizePlan(unwrapData<PlanTratamiento>(response.data));
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo actualizar el avance');
    }
  },
  aprobarPlan: async (id: Id): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/planes/${id}/aprobar/`);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo aprobar el plan');
    }
  },

  // KRIs
  listKris: (filters?: KRIFilter) => listResource<KRI>('/kris/', filters),
  getKri: (id: Id) => getResource<KRI>('/kris/', id),
  createKri: (payload: CreateKRIPayload) => createResource<KRI, CreateKRIPayload>('/kris/', payload),
  updateKri: (id: Id, payload: UpdateKRIPayload) => updateResource<KRI, UpdateKRIPayload>('/kris/', id, payload),
  deleteKri: (id: Id) => deleteResource('/kris/', id),

  registrarMedicionKri: async (id: Id, payload: RegistrarMedicionKRIPayload): Promise<ActionResponse> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/kris/${id}/registrar_medicion/`, payload);
      return normalizeActionResponse(response.data);
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo registrar la medicion del KRI');
    }
  },

  // Registro monitoreo
  listRegistroMonitoreo: (filters?: RegistroMonitoreoFilter) =>
    listResource<RegistroMonitoreo>('/monitoreo/', filters).then((result) => ({
      count: result.count,
      results: result.results.map(normalizeMonitoreo),
    })),
  getRegistroMonitoreo: (id: Id) => getResource<RegistroMonitoreo>('/monitoreo/', id).then(normalizeMonitoreo),
  createRegistroMonitoreo: async (payload: CreateRegistroMonitoreoPayload) => {
    const requestPayload = {
      riesgo: payload.riesgo,
      probabilidad_revisada: payload.probabilidad_revisada,
      impacto_revisado: payload.impacto_revisado,
      resultado: payload.resultado ?? payload.estado ?? 'sin_cambios',
      observaciones: payload.observaciones ?? payload.comentario ?? '',
      acciones_adicionales: payload.acciones_adicionales ?? '',
      fecha_revision: payload.fecha,
      proxima_revision: payload.proxima_revision,
    };
    const created = await createResource<RegistroMonitoreo, typeof requestPayload>('/monitoreo/', requestPayload);
    return normalizeMonitoreo(created);
  },
  updateRegistroMonitoreo: async (id: Id, payload: UpdateRegistroMonitoreoPayload) => {
    const requestPayload = {
      ...(payload.probabilidad_revisada ? { probabilidad_revisada: payload.probabilidad_revisada } : {}),
      ...(payload.impacto_revisado ? { impacto_revisado: payload.impacto_revisado } : {}),
      ...(payload.resultado ? { resultado: payload.resultado } : {}),
      ...(payload.estado ? { resultado: payload.estado } : {}),
      ...(payload.observaciones ? { observaciones: payload.observaciones } : {}),
      ...(payload.comentario ? { observaciones: payload.comentario } : {}),
      ...(payload.acciones_adicionales ? { acciones_adicionales: payload.acciones_adicionales } : {}),
      ...(payload.proxima_revision ? { proxima_revision: payload.proxima_revision } : {}),
      ...(payload.fecha ? { proxima_revision: payload.fecha } : {}),
    };
    const updated = await updateResource<RegistroMonitoreo, typeof requestPayload>('/monitoreo/', id, requestPayload);
    return normalizeMonitoreo(updated);
  },
  deleteRegistroMonitoreo: (id: Id) => deleteResource('/monitoreo/', id),

  // Reporte simple (Entrega 1)
  getReporteSimple: async (): Promise<PaginatedResult<RiesgoReporteSimpleItem>> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/reporte_simple/`);
      const data = unwrapData<{ count?: number; results?: RiesgoReporteSimpleItem[] }>(response.data);
      return {
        count: data.count ?? (data.results?.length ?? 0),
        results: data.results ?? [],
      };
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo cargar el reporte simple');
    }
  },

  exportReporteSimple: async (): Promise<Blob> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/riesgos/reporte_simple_export/`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw mapToRequestError(error, 'No se pudo exportar el reporte simple');
    }
  },

  // Activos
  listActivos: (filters?: ActivoInformacionFilter) =>
    listResource<ActivoInformacion>('/activos/', filters).then((result) => ({
      count: result.count,
      results: result.results.map(normalizeActivo),
    })),
  getActivo: (id: Id) => getResource<ActivoInformacion>('/activos/', id).then(normalizeActivo),
  createActivo: async (payload: CreateActivoInformacionPayload) => {
    const criticidad = payload.criticidad ?? 'media';
    const criticidadBase = criticidad === 'alta' ? 5 : criticidad === 'media' ? 3 : 1;

    const requestPayload = {
      codigo: payload.codigo,
      nombre: payload.nombre,
      tipo_activo: payload.tipo_activo ?? payload.tipo ?? 'otro',
      tipo: payload.tipo ?? payload.tipo_activo ?? 'otro',
      descripcion: payload.descripcion,
      criticidad,
      categoria_nist: payload.categoria_nist,
      confidencialidad: payload.confidencialidad ?? criticidadBase,
      integridad: payload.integridad ?? criticidadBase,
      disponibilidad: payload.disponibilidad ?? criticidadBase,
      valor_activo: payload.valor_activo ?? payload.valor_economico,
      valor_economico: payload.valor_economico ?? payload.valor_activo,
      propietario_activo: payload.propietario_activo ?? payload.propietario,
      propietario: payload.propietario ?? payload.propietario_activo,
      custodio_activo: payload.custodio_activo,
      proceso: payload.proceso,
    };

    const created = await createResource<ActivoInformacion, typeof requestPayload>('/activos/', requestPayload);
    return normalizeActivo(created);
  },
  updateActivo: (id: Id, payload: UpdateActivoInformacionPayload) =>
    updateResource<ActivoInformacion, UpdateActivoInformacionPayload>('/activos/', id, payload),
  deleteActivo: (id: Id) => deleteResource('/activos/', id),

  // Riesgo-activos
  listRiesgoActivos: (filters?: RiesgoActivoFilter) =>
    listResource<RiesgoActivo>('/riesgo-activos/', filters).then((result) => ({
      count: result.count,
      results: result.results.map(normalizeRiesgoActivo),
    })),
  getRiesgoActivo: (id: Id) => getResource<RiesgoActivo>('/riesgo-activos/', id).then(normalizeRiesgoActivo),
  createRiesgoActivo: async (payload: CreateRiesgoActivoPayload) => {
    const nivelLabel = typeof payload.nivel_afectacion === 'string' ? payload.nivel_afectacion.toLowerCase() : '';
    const nivelNumerico =
      typeof payload.nivel_afectacion === 'number'
        ? payload.nivel_afectacion
        : nivelLabel === 'critico'
          ? 5
          : nivelLabel === 'alto'
            ? 4
            : nivelLabel === 'medio'
              ? 3
              : 2;

    const tipoAfectacion =
      payload.tipo_afectacion ??
      (typeof payload.nivel_afectacion === 'string'
        ? 'operacional'
        : 'operacional');

    const requestPayload = {
      riesgo: payload.riesgo,
      activo_informacion: payload.activo_informacion ?? payload.activo,
      activo: payload.activo ?? payload.activo_informacion,
      tipo_afectacion: tipoAfectacion,
      nivel_afectacion: nivelNumerico,
      impacto_especifico: payload.impacto_especifico ?? payload.justificacion ?? '',
      justificacion: payload.justificacion ?? payload.impacto_especifico ?? '',
    };

    const created = await createResource<RiesgoActivo, typeof requestPayload>('/riesgo-activos/', requestPayload);
    return normalizeRiesgoActivo(created);
  },
  updateRiesgoActivo: (id: Id, payload: UpdateRiesgoActivoPayload) =>
    updateResource<RiesgoActivo, UpdateRiesgoActivoPayload>('/riesgo-activos/', id, payload),
  deleteRiesgoActivo: (id: Id) => deleteResource('/riesgo-activos/', id),

  // Evaluaciones cuantitativas
  listEvaluacionesCuantitativas: (filters?: EvaluacionCuantitativaFilter) =>
    listResource<EvaluacionCuantitativa>('/evaluaciones-cuantitativas/', filters).then((result) => ({
      count: result.count,
      results: result.results.map(normalizeEvaluacionCuantitativa),
    })),
  getEvaluacionCuantitativa: (id: Id) =>
    getResource<EvaluacionCuantitativa>('/evaluaciones-cuantitativas/', id).then(normalizeEvaluacionCuantitativa),
  createEvaluacionCuantitativa: async (payload: CreateEvaluacionCuantitativaPayload) => {
    const metodo = payload.metodo_evaluacion ?? payload.metodo ?? 'ale';
    const requestPayload = {
      riesgo: payload.riesgo,
      metodo_evaluacion: metodo,
      metodo,
      fecha: payload.fecha,
      sle: payload.sle,
      aro: payload.aro,
      ale: payload.ale,
      var_95: payload.var_95,
      supuestos: payload.supuestos ?? payload.observaciones,
      observaciones: payload.observaciones ?? payload.supuestos,
    };

    const created = await createResource<EvaluacionCuantitativa, typeof requestPayload>(
      '/evaluaciones-cuantitativas/',
      requestPayload,
    );
    return normalizeEvaluacionCuantitativa(created);
  },
  updateEvaluacionCuantitativa: (id: Id, payload: UpdateEvaluacionCuantitativaPayload) =>
    updateResource<EvaluacionCuantitativa, UpdateEvaluacionCuantitativaPayload>('/evaluaciones-cuantitativas/', id, payload),
  deleteEvaluacionCuantitativa: (id: Id) => deleteResource('/evaluaciones-cuantitativas/', id),
};

export const tiposRiesgoApi = {
  list: async (): Promise<TipoRiesgo[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/tipos-riesgo/');
    return unwrapData<TipoRiesgo[]>(res.data) ?? [];
  },
};

export const causasRiesgoApi = {
  list: async (): Promise<CausaRiesgo[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/causas/');
    return unwrapData<CausaRiesgo[]>(res.data) ?? [];
  },
};

export const naturalezasConsecuenciaApi = {
  list: async (): Promise<NaturalezaConsecuencia[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/consecuencias/');
    return unwrapData<NaturalezaConsecuencia[]>(res.data) ?? [];
  },
};

export const tiposTratamientoApi = {
  list: async (): Promise<TipoTratamientoMaestro[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/tipos-tratamiento/');
    return unwrapData<TipoTratamientoMaestro[]>(res.data) ?? [];
  },
};

export const tiposControlApi = {
  list: async (): Promise<TipoControl[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/tipos-control/');
    return unwrapData<TipoControl[]>(res.data) ?? [];
  },
};

export const frecuenciasControlApi = {
  list: async (): Promise<FrecuenciaControl[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/frecuencias-control/');
    return unwrapData<FrecuenciaControl[]>(res.data) ?? [];
  },
};

export const unidadesPerdidaApi = {
  list: async (): Promise<UnidadPerdida[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/unidades-perdida/');
    return unwrapData<UnidadPerdida[]>(res.data) ?? [];
  },
};

export const tiposActivoRemediacionApi = {
  list: async (): Promise<TipoActivoRemediacion[]> => {
    const res = await axiosInstance.get('/riesgos/maestros/tipos-activo/');
    return unwrapData<TipoActivoRemediacion[]>(res.data) ?? [];
  },
};

export const configuracionRevisionApi = {
  get: async (): Promise<ConfiguracionRevision> => {
    const res = await axiosInstance.get('/riesgos/config/revision/');
    return unwrapData<ConfiguracionRevision>(res.data);
  },
  update: async (payload: Partial<ConfiguracionRevision>): Promise<ConfiguracionRevision> => {
    const res = await axiosInstance.patch('/riesgos/config/revision/', payload);
    return unwrapData<ConfiguracionRevision>(res.data);
  },
};

export const configuracionFormulasApi = {
  getActiva: async (): Promise<ConfiguracionFormulas> => {
    const res = await axiosInstance.get('/riesgos/config/formulas/activa/');
    return unwrapData<ConfiguracionFormulas>(res.data);
  },
  update: async (id: Id, payload: Partial<ConfiguracionFormulas>): Promise<ConfiguracionFormulas> => {
    const res = await axiosInstance.patch(`/riesgos/config/formulas/${id}/`, payload);
    return unwrapData<ConfiguracionFormulas>(res.data);
  },
};

export const controlesApi = {
  list: async (filters?: { tipo?: string }): Promise<Control[]> => {
    const params = new URLSearchParams();
    if (filters?.tipo) params.set('tipo', filters.tipo);
    const query = params.toString();
    const res = await axiosInstance.get(`/riesgos/controles/${query ? `?${query}` : ''}`);
    return normalizePaginated<Control>(res.data).results;
  },
  create: async (payload: CreateControlPayload): Promise<Control> => {
    const res = await axiosInstance.post('/riesgos/controles/', payload);
    return unwrapData<Control>(res.data);
  },
  update: async (id: string, payload: Partial<CreateControlPayload>): Promise<Control> => {
    const res = await axiosInstance.patch(`/riesgos/controles/${id}/`, payload);
    return unwrapData<Control>(res.data);
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/riesgos/controles/${id}/`);
  },
  vincularRiesgo: async (
    controlId: string,
    payload: { riesgo_id: string; efectividad_diseno?: number; efectividad_operativa?: number; notas?: string },
  ): Promise<RiesgoControl> => {
    const res = await axiosInstance.post(`/riesgos/controles/${controlId}/vincular_riesgo/`, payload);
    return unwrapData<RiesgoControl>(res.data);
  },
  desvincularRiesgo: async (controlId: string, riesgoId: string): Promise<void> => {
    await axiosInstance.delete(`/riesgos/controles/${controlId}/desvincular_riesgo/`, {
      data: { riesgo_id: riesgoId },
    });
  },
  getControlesRiesgo: async (riesgoId: string): Promise<RiesgoControl[]> => {
    const res = await axiosInstance.get(`/riesgos/riesgos/${riesgoId}/controles/`);
    return unwrapData<RiesgoControl[]>(res.data) ?? [];
  },
};

export const activosPlanApi = {
  list: async (planId: string): Promise<ActivoPlan[]> => {
    const res = await axiosInstance.get(`/riesgos/planes/${planId}/activos/`);
    return unwrapData<ActivoPlan[]>(res.data) ?? [];
  },
  create: async (planId: string, payload: Omit<ActivoPlan, 'id' | 'plan'>): Promise<ActivoPlan> => {
    const res = await axiosInstance.post(`/riesgos/planes/${planId}/activos/`, payload);
    return unwrapData<ActivoPlan>(res.data);
  },
};
