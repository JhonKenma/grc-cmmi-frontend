export enum EstadoRiesgo {
  BORRADOR = 'borrador',
  EN_REVISION = 'en_revision',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  CERRADO = 'cerrado',
}

export enum TipoActivo {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  DATOS = 'datos',
  SERVICIO = 'servicio',
  PROCESO = 'proceso',
  PERSONA = 'persona',
  OTRO = 'otro',
}

export enum TipoAfectacion {
  CONFIDENCIALIDAD = 'confidencialidad',
  INTEGRIDAD = 'integridad',
  DISPONIBILIDAD = 'disponibilidad',
  FINANCIERA = 'financiera',
  LEGAL = 'legal',
  REPUTACIONAL = 'reputacional',
  OPERACIONAL = 'operacional',
}

export enum TipoTratamiento {
  EVITAR = 'evitar',
  MITIGAR = 'mitigar',
  TRANSFERIR = 'transferir',
  ACEPTAR = 'aceptar',
}

export enum MetodoEvaluacion {
  ALE = 'ale',
  MONTE_CARLO = 'monte_carlo',
  VAR = 'var',
}

export type Id = number | string;

export interface CategoriaRiesgo {
  id: Id;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface Riesgo {
  id: Id;
  codigo: string;
  nombre: string;
  titulo?: string;
  descripcion: string;
  categoria_coso?: string;
  causa_raiz?: string;
  consecuencia?: string;
  fecha_identificacion?: string;
  fecha_revision?: string;
  controles_asociados?: string;
  estado_tratamiento?: string;
  identificado_por?: Id;
  identificado_por_nombre?: string;
  categoria: Id | CategoriaRiesgo;
  categoria_nombre?: string;
  probabilidad: number;
  impacto: number;
  nivel_inherente?: number;
  nivel_residual?: number;
  clasificacion?: 'bajo' | 'medio' | 'alto' | 'critico';
  estado: EstadoRiesgo | string;
  proceso?: string;
  propietario?: Id;
  propietario_nombre?: string;
  responsable_riesgo?: Id;
  responsable_riesgo_nombre?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  tipo_riesgo?: Id | null;
  tipo_riesgo_nombre?: string | null;
  naturaleza_causa?: Id | null;
  naturaleza_causa_nombre?: string | null;
  naturaleza_consecuencia?: Id | null;
  naturaleza_consecuencia_nombre?: string | null;
  evaluacion_cuantitativa_activa?: boolean;
  unidad_perdida?: Id | null;
  monto_perdida?: number | null;
  valor_activo?: number | null;
  factor_exposicion?: number | null;
  sle_calculado?: number | null;
  impacto_financiero?: number | null;
  impacto_operacional?: number | null;
  impacto_reputacional?: number | null;
  nrc_calculado?: number | null;
  riesgo_residual_calculado?: number | null;
  proxima_revision_fecha?: string | null;
}

export interface PlanTratamiento {
  id: Id;
  riesgo: Id;
  riesgo_nombre?: string;
  riesgos_asociados?: Array<{ id: Id; codigo: string; nombre: string }>;
  tipo_tratamiento_nombre?: string | null;
  riesgos_asociados_ids?: string[];
  mejora?: 'probabilidad' | 'impacto' | 'ambos' | null;
  nueva_probabilidad?: number | null;
  nuevo_impacto?: number | null;
  nivel_residual_esperado?: number | null;
  costo_total?: number;
  activos_plan?: ActivoPlan[];
  dependencias?: string[];
  nombre?: string;
  descripcion?: string;
  descripcion_accion?: string;
  tipo_tratamiento?: TipoTratamiento | string;
  tipo?: TipoTratamiento | string;
  responsable?: Id;
  responsable_nombre?: string;
  responsable_accion?: Id;
  responsable_accion_nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_fin_plan?: string;
  avance?: number;
  porcentaje_avance?: number;
  estado?: string;
  observaciones?: string;
  aprobado_por?: Id | null;
  aprobado_por_nombre?: string;
  fecha_aprobacion?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface KRI {
  id: Id;
  riesgo: Id;
  riesgo_nombre?: string;
  nombre: string;
  descripcion?: string;
  unidad_medida?: string;
  umbral_verde?: number;
  umbral_amarillo?: number;
  umbral_rojo?: number;
  valor_actual?: number;
  frecuencia?: string;
  ultima_medicion?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface RegistroMonitoreo {
  id: Id;
  riesgo: Id;
  riesgo_nombre?: string;
  fecha: string;
  estado?: string;
  comentario?: string;
  alerta?: boolean;
  fecha_creacion?: string;
}

export interface ActivoInformacion {
  id: Id;
  codigo: string;
  nombre: string;
  tipo_activo: TipoActivo | string;
  tipo?: TipoActivo | string;
  descripcion?: string;
  criticidad?: 'baja' | 'media' | 'alta' | string;
  categoria_nist?: string;
  confidencialidad: number;
  integridad: number;
  disponibilidad: number;
  valor_activo?: number;
  valor_economico?: number;
  propietario_activo?: string;
  propietario?: string;
  custodio_activo?: string;
  proceso?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface RiesgoActivo {
  id: Id;
  riesgo: Id;
  activo?: Id;
  activo_informacion: Id;
  tipo_afectacion: TipoAfectacion | string;
  nivel_afectacion: number | string;
  impacto_especifico: string;
  justificacion?: string;
  riesgo_nombre?: string;
  activo_nombre?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface EvaluacionCuantitativa {
  id: Id;
  riesgo: Id;
  riesgo_nombre?: string;
  metodo_evaluacion: MetodoEvaluacion | string;
  metodo?: string;
  fecha?: string;
  sle: number;
  aro: number;
  ale?: number;
  var_95?: number;
  observaciones?: string;
  supuestos?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface DashboardRiesgos {
  resumen?: {
    total_riesgos: number;
    en_revision: number;
    aprobados: number;
    en_tratamiento?: number;
    cerrados: number;
    riesgo_alto: number;
    kris_en_rojo?: number;
    planes_activos?: number;
    cobertura_controles?: number;
    riesgos_bajo?: number;
    riesgos_medio?: number;
    riesgos_alto?: number;
    riesgos_critico?: number;
  };
  riesgos_recientes?: Riesgo[];
  riesgos_criticos?: Riesgo[];
}

export interface ConfiguracionFormulas {
  id: Id;
  empresa?: Id;
  peso_impacto_financiero: number;
  peso_impacto_operacional: number;
  peso_impacto_reputacional: number;
  apetito_riesgo_nrc: number;
  ale_umbral_alto: number;
  ale_umbral_medio: number;
  sle_umbral_alto: number;
  sle_umbral_medio: number;
}

export interface HeatmapCell {
  probabilidad: number;
  impacto: number;
  total: number;
}

export interface HeatmapPayload {
  matriz: HeatmapCell[];
}

export interface ApiWrappedResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[] | string>;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface PaginatedResult<T> {
  count: number;
  results: T[];
}

export interface ResourceFilter {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CategoriaRiesgoFilter extends ResourceFilter {
  activo?: boolean;
}

export interface RiesgoFilter extends ResourceFilter {
  categoria?: Id;
  estado?: EstadoRiesgo | string;
  probabilidad?: number;
  impacto?: number;
  proceso?: string;
  propietario?: Id;
  responsable?: Id;
  clasificacion?: 'bajo' | 'medio' | 'alto' | 'critico';
  solo_mios?: boolean;
}

export interface PlanTratamientoFilter extends ResourceFilter {
  riesgo?: Id;
  tipo_tratamiento?: TipoTratamiento | string;
  estado?: string;
}

export interface KRIFilter extends ResourceFilter {
  riesgo?: Id;
}

export interface RegistroMonitoreoFilter extends ResourceFilter {
  riesgo?: Id;
  alerta?: boolean;
}

export interface ActivoInformacionFilter extends ResourceFilter {
  tipo_activo?: TipoActivo | string;
  proceso?: string;
}

export interface RiesgoActivoFilter extends ResourceFilter {
  riesgo?: Id;
  activo_informacion?: Id;
  tipo_afectacion?: TipoAfectacion | string;
}

export interface EvaluacionCuantitativaFilter extends ResourceFilter {
  riesgo?: Id;
  metodo_evaluacion?: MetodoEvaluacion | string;
}

export interface CreateCategoriaRiesgoPayload {
  empresa?: Id;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export type UpdateCategoriaRiesgoPayload = Partial<CreateCategoriaRiesgoPayload>;

export interface CreateRiesgoPayload {
  nombre?: string;
  titulo: string;
  codigo: string;
  descripcion: string;
  categoria?: Id;
  tipo_riesgo?: Id | null;
  naturaleza_causa?: Id | null;
  naturaleza_consecuencia?: Id | null;
  escenarios?: string;
  fuente?: string;
  velocidad_materializacion?: string;
  categoria_coso?: string;
  probabilidad: number;
  impacto: number;
  causa_raiz?: string;
  consecuencia?: string;
  fecha_identificacion?: string;
  fecha_revision?: string;
  proxima_revision_fecha?: string;
  controles_asociados?: string;
  estado_tratamiento?: string;
  proceso?: Id | string | null;
  proceso_texto?: string;
  dueno_riesgo?: Id;
  evaluacion_cuantitativa_activa?: boolean;
  unidad_perdida?: Id | null;
  monto_perdida?: number | string | null;
  valor_activo?: number | string | null;
  factor_exposicion?: number | string | null;
  aro?: number | string | null;
  moneda?: string;
  impacto_financiero?: number;
  impacto_operacional?: number;
  impacto_reputacional?: number;
}

export type UpdateRiesgoPayload = Partial<CreateRiesgoPayload>;

export interface CreatePlanTratamientoPayload {
  riesgo: Id;
  riesgos?: Id[];
  riesgos_asociados?: Id[];
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  estado_accion?: string;
  descripcion_accion?: string;
  objetivos?: string;
  responsable_accion?: Id;
  prioridad?: string;
  tipo_tratamiento?: TipoTratamiento | string;
  responsable?: Id;
  fecha_inicio?: string;
  fecha_fin_plan?: string;
  fecha_fin?: string;
  porcentaje_avance?: number;
  avance?: number;
  recursos_requeridos?: string;
  eficacia_esperada?: number;
  nivel_riesgo_objetivo?: number;
  observaciones?: string;
  mejora?: 'probabilidad' | 'impacto' | 'ambos' | '';
  nueva_probabilidad?: number | null;
  nuevo_impacto?: number | null;
  nivel_residual_esperado?: number | null;
  costo_total?: number;
  activos_plan?: ActivoPlan[];
  dependencias?: string[];
}

export type UpdatePlanTratamientoPayload = Partial<CreatePlanTratamientoPayload>;

export interface CreateKRIPayload {
  riesgo: Id;
  nombre: string;
  descripcion?: string;
  unidad_medida?: string;
  umbral_verde?: number;
  umbral_amarillo?: number;
  umbral_rojo?: number;
  frecuencia?: string;
}

export type UpdateKRIPayload = Partial<CreateKRIPayload>;

export interface CreateRegistroMonitoreoPayload {
  riesgo: Id;
  fecha?: string;
  estado?: string;
  resultado?: string;
  comentario?: string;
  observaciones?: string;
  probabilidad_revisada?: number;
  impacto_revisado?: number;
  acciones_adicionales?: string;
  proxima_revision?: string;
  alerta?: boolean;
}

export type UpdateRegistroMonitoreoPayload = Partial<CreateRegistroMonitoreoPayload>;

export interface CreateActivoInformacionPayload {
  codigo: string;
  nombre: string;
  tipo_activo?: TipoActivo | string;
  tipo?: TipoActivo | string;
  descripcion?: string;
  criticidad?: 'baja' | 'media' | 'alta' | string;
  categoria_nist?: string;
  confidencialidad?: number;
  integridad?: number;
  disponibilidad?: number;
  valor_activo?: number;
  valor_economico?: number;
  propietario_activo?: string;
  propietario?: string;
  custodio_activo?: string;
  proceso?: string;
}

export type UpdateActivoInformacionPayload = Partial<CreateActivoInformacionPayload>;

export interface CreateRiesgoActivoPayload {
  riesgo: Id;
  activo_informacion?: Id;
  activo?: Id;
  tipo_afectacion?: TipoAfectacion | string;
  nivel_afectacion?: number | string;
  impacto_especifico?: string;
  justificacion?: string;
}

export type UpdateRiesgoActivoPayload = Partial<CreateRiesgoActivoPayload>;

export interface CreateEvaluacionCuantitativaPayload {
  riesgo: Id;
  metodo_evaluacion?: MetodoEvaluacion | string;
  metodo?: string;
  fecha?: string;
  sle: number;
  aro: number;
  ale?: number;
  var_95?: number;
  observaciones?: string;
  supuestos?: string;
}

export type UpdateEvaluacionCuantitativaPayload = Partial<CreateEvaluacionCuantitativaPayload>;

export interface RegistrarMedicionKRIPayload {
  valor: number;
  fecha?: string;
  comentario?: string;
}

export interface ActionResponse {
  success?: boolean;
  message?: string;
}

export interface RiesgoReporteSimpleItem {
  id: Id;
  codigo: string;
  nombre: string;
  proceso: string;
  categoria_coso: string;
  probabilidad: number;
  impacto: number;
  nivel_riesgo: number;
  categoria_riesgo: string;
  responsable_riesgo: string;
  estado_tratamiento: string;
  fecha_identificacion?: string;
  fecha_revision?: string;
}

// ========== TABLAS MAESTRAS ==========

export interface TipoRiesgo {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  es_predefinido: boolean;
}

export interface CausaRiesgo {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  es_predefinido: boolean;
}

export interface NaturalezaConsecuencia {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  es_predefinido: boolean;
}

export interface TipoTratamientoMaestro {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
}

export interface TipoControl {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface FrecuenciaControl {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
}

export interface UnidadPerdida {
  id: string;
  numero: number;
  nombre: string;
  categoria: 'tiempo' | 'volumen' | 'persona' | 'activo' | 'regulatorio' | 'ambiental';
  aplicacion_tipica: string;
}

export interface TipoActivoRemediacion {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
}

export interface ConfiguracionRevision {
  id: string;
  dias_critico: number;
  dias_alto: number;
  dias_medio: number;
  dias_bajo: number;
  dias_insignificante: number;
}

// ========== CONTROL (BIBLIOTECA) ==========

export interface Control {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string | null;
  tipo_nombre: string | null;
  modo: 'manual' | 'semi_auto' | 'automatico';
  frecuencia: string | null;
  frecuencia_nombre: string | null;
  efectividad_diseno: number;
  efectividad_operativa: number;
  efectividad_promedio: number;
  estado: 'activo' | 'inactivo';
  fecha_ultima_prueba: string | null;
  evidencia_requerida: string;
}

export interface RiesgoControl {
  id: string;
  riesgo: string;
  control: string;
  control_detail: Control;
  efectividad_diseno: number;
  efectividad_operativa: number;
  fecha_ultima_prueba: string | null;
  notas: string;
}

export interface CreateControlPayload {
  nombre: string;
  descripcion?: string;
  tipo?: string;
  modo: 'manual' | 'semi_auto' | 'automatico';
  frecuencia?: string;
  efectividad_diseno: number;
  efectividad_operativa: number;
  evidencia_requerida?: string;
  estado?: 'activo' | 'inactivo';
}

// ========== ACTIVO DE PLAN ==========

export interface ActivoPlan {
  id: string;
  plan: string;
  tipo_activo: string | null;
  tipo_activo_nombre: string | null;
  descripcion: string;
  costo_estimado: number;
  costo_real: number;
  responsable_adquisicion: string | null;
  fecha_requerida: string | null;
  proveedor: string;
  estado: 'pendiente' | 'en_proceso' | 'adquirido' | 'implementado';
}