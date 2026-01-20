// src/types/proyecto-remediacion.types.ts

/**
 * TIPOS PARA MÓDULO DE PROYECTOS DE REMEDIACIÓN
 * 
 * Estructura completa de tipos que mapean exactamente
 * con los modelos del backend Django
 */

// ═══════════════════════════════════════════════════════════════
// ENUMS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

export type EstadoProyecto = 
  | 'planificado' 
  | 'en_ejecucion' 
  | 'en_validacion' 
  | 'cerrado' 
  | 'suspendido' 
  | 'cancelado';

export type PrioridadProyecto = 
  | 'critica' 
  | 'alta' 
  | 'media' 
  | 'baja';

export type CategoriaProyecto = 
  | 'tecnico' 
  | 'documental' 
  | 'procesal' 
  | 'organizacional' 
  | 'capacitacion';

export type NormativaProyecto = 
  | 'iso_27001' 
  | 'iso_9001' 
  | 'nist_csf' 
  | 'gdpr' 
  | 'pci_dss' 
  | 'sox' 
  | 'hipaa' 
  | 'cmmi' 
  | 'otro';

export type TipoBrechaProyecto = 
  | 'ausencia_total' 
  | 'parcial' 
  | 'no_efectiva' 
  | 'no_documentada';

export type EstrategiaCierre = 
  | 'implementacion_nueva' 
  | 'fortalecimiento' 
  | 'optimizacion' 
  | 'documentacion';

export type FrecuenciaReporte = 
  | 'diaria' 
  | 'semanal' 
  | 'quincenal' 
  | 'mensual';

export type CanalComunicacion = 
  | 'email' 
  | 'teams' 
  | 'slack' 
  | 'whatsapp' 
  | 'otro';

export type MetodoVerificacion = 
  | 'muestreo' 
  | 'prueba_completa' 
  | 'observacion' 
  | 'revision_documental' 
  | 'entrevista' 
  | 'inspeccion';

export type ResultadoFinal = 
  | 'exitoso' 
  | 'parcialmente_exitoso' 
  | 'no_exitoso' 
  | 'cancelado';

export type MonedaProyecto = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'PEN' 
  | 'COP' 
  | 'MXN' 
  | 'CLP' 
  | 'ARS';

// ═══════════════════════════════════════════════════════════════
// INTERFACES DE DATOS
// ═══════════════════════════════════════════════════════════════

/**
 * Información del GAP original que dio origen al proyecto
 */
export interface CalculoNivelInfo {
  id: string;
  dimension: string;
  dimension_codigo: string;
  nivel_deseado: number;
  nivel_actual: number;
  gap: number;
  clasificacion_gap: string;
  clasificacion_gap_display: string;
  porcentaje_cumplimiento: number;
  calculado_at: string;
}

/**
 * Información básica de usuario
 */
export interface UsuarioInfo {
  id: number;
  nombre_completo: string;
  email: string;
  cargo?: string;
  rol: string;
}

/**
 * Información básica de empresa
 */
export interface EmpresaInfo {
  id: number;
  nombre: string;
  ruc?: string;
  pais: string;
}

/**
 * Información de pregunta abordada
 */
export interface PreguntaAbordadaInfo {
  id: string;
  codigo: string;
  titulo: string;
  texto: string;
  dimension: string;
}

// ═══════════════════════════════════════════════════════════════
// PROYECTO - LISTA (Vista simplificada)
// ═══════════════════════════════════════════════════════════════

export interface ProyectoRemediacionList {
  id: string;
  codigo_proyecto: string;
  nombre_proyecto: string;
  empresa: number;
  empresa_nombre: string;
  dimension_nombre: string;
  gap_original: number;
  estado: EstadoProyecto;
  estado_display: string;
  prioridad: PrioridadProyecto;
  prioridad_display: string;
  categoria: CategoriaProyecto;
  categoria_display: string;
  dueno_nombre: string;
  responsable_nombre: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  dias_restantes: number;
  dias_transcurridos: number;
  esta_vencido: boolean;
  presupuesto_asignado: number;
  presupuesto_gastado: number;
  porcentaje_presupuesto_gastado: number;
  moneda: MonedaProyecto;
  fecha_creacion: string;
}

// ═══════════════════════════════════════════════════════════════
// PROYECTO - DETALLE (Vista completa)
// ═══════════════════════════════════════════════════════════════

export interface ProyectoRemediacionDetail {
  // ═══ IDENTIFICACIÓN ═══
  id: string;
  codigo_proyecto: string;
  
  // ═══ INFORMACIÓN BÁSICA ═══
  nombre_proyecto: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  fecha_fin_real?: string | null;
  estado: EstadoProyecto;
  estado_display: string;
  prioridad: PrioridadProyecto;
  prioridad_display: string;
  categoria: CategoriaProyecto;
  categoria_display: string;
  
  // ═══ RELACIÓN CON GAP ═══
  calculo_nivel: string;
  calculo_nivel_info: CalculoNivelInfo;
  
  // ═══ DATOS DE LA BRECHA ═══
  normativa: NormativaProyecto;
  normativa_display: string;
  control_no_conforme: string;
  tipo_brecha: TipoBrechaProyecto;
  tipo_brecha_display: string;
  nivel_criticidad_original: number;
  impacto_riesgo: string;
  evidencia_no_conformidad: string;
  fecha_identificacion_gap: string;
  
  // ═══ PLANIFICACIÓN ═══
  estrategia_cierre: EstrategiaCierre;
  estrategia_cierre_display: string;
  alcance_proyecto: string;
  objetivos_especificos: string;
  criterios_aceptacion: string;
  supuestos: string;
  restricciones: string;
  riesgos_proyecto: string;
  preguntas_abordadas: string[];
  preguntas_abordadas_info: PreguntaAbordadaInfo[];
  
  // ═══ RESPONSABLES ═══
  dueno_proyecto: number;
  dueno_proyecto_info: UsuarioInfo;
  responsable_implementacion: number;
  responsable_implementacion_info: UsuarioInfo;
  equipo_implementacion: number[];
  equipo_implementacion_info: UsuarioInfo[];
  validador_interno?: number | null;
  validador_interno_info?: UsuarioInfo | null;
  auditor_verificacion?: number | null;
  auditor_verificacion_info?: UsuarioInfo | null;
  responsable_validacion?: number | null;
  responsable_validacion_info?: UsuarioInfo | null;
  
  // ═══ RECURSOS ═══
  presupuesto_asignado: number;
  presupuesto_gastado: number;
  presupuesto_disponible: number;
  porcentaje_presupuesto_gastado: number;
  moneda: MonedaProyecto;
  moneda_display: string;
  recursos_humanos_asignados: number;
  recursos_tecnicos: string;
  
  // ═══ SEGUIMIENTO ═══
  frecuencia_reporte: FrecuenciaReporte;
  frecuencia_reporte_display: string;
  metricas_desempeno: string;
  umbrales_alerta: string;
  canal_comunicacion: CanalComunicacion;
  canal_comunicacion_display: string;
  
  // ═══ VALIDACIÓN ═══
  criterios_validacion: string;
  metodo_verificacion: MetodoVerificacion;
  metodo_verificacion_display: string;
  
  // ═══ CIERRE ═══
  fecha_cierre_tecnico?: string | null;
  fecha_cierre_formal?: string | null;
  resultado_final?: ResultadoFinal;
  resultado_final_display?: string;
  lecciones_aprendidas: string;
  acciones_mejora_continua: string;
  recomendaciones_futuros_gap: string;
  
  // ═══ EMPRESA Y AUDITORÍA ═══
  empresa: number;
  empresa_info: EmpresaInfo;
  creado_por?: number | null;
  creado_por_info?: UsuarioInfo | null;
  version: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // ═══ CAMPOS CALCULADOS ═══
  dias_restantes: number;
  dias_transcurridos: number;
  duracion_estimada_dias: number;
  porcentaje_tiempo_transcurrido: number;
  esta_vencido: boolean;
  gap_original: number;
  dimension_nombre: string;
  nivel_deseado_original: number;
  nivel_actual_original: number;
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIOS - CREAR PROYECTO
// ═══════════════════════════════════════════════════════════════

export interface CrearProyectoFormData {
  // ═══ SECCIÓN 1: BÁSICO ═══
  nombre_proyecto: string;
  descripcion: string;
  calculo_nivel: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  prioridad: PrioridadProyecto;
  categoria: CategoriaProyecto;
  
  // ═══ SECCIÓN 2: BRECHA ═══
  normativa: NormativaProyecto;
  control_no_conforme: string;
  tipo_brecha: TipoBrechaProyecto;
  nivel_criticidad_original: number;
  impacto_riesgo: string;
  evidencia_no_conformidad?: string;
  fecha_identificacion_gap: string;
  
  // ═══ SECCIÓN 3: PLANIFICACIÓN ═══
  estrategia_cierre: EstrategiaCierre;
  alcance_proyecto: string;
  objetivos_especificos: string;
  criterios_aceptacion: string;
  supuestos?: string;
  restricciones?: string;
  riesgos_proyecto?: string;
  preguntas_abordadas_ids?: string[];
  
  // ═══ SECCIÓN 4: RESPONSABLES ═══
  dueno_proyecto: number;
  responsable_implementacion: number;
  equipo_implementacion?: number[];
  validador_interno?: number;
  auditor_verificacion?: number;
  
  // ═══ SECCIÓN 5: RECURSOS ═══
  presupuesto_asignado: number;
  moneda: MonedaProyecto;
  recursos_humanos_asignados?: number;
  recursos_tecnicos?: string;
  
  // ═══ SECCIÓN 6: SEGUIMIENTO ═══
  frecuencia_reporte: FrecuenciaReporte;
  metricas_desempeno?: string;
  umbrales_alerta?: string;
  canal_comunicacion: CanalComunicacion;
  
  // ═══ SECCIÓN 7: VALIDACIÓN ═══
  criterios_validacion: string;
  metodo_verificacion: MetodoVerificacion;
  responsable_validacion?: number;
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIO - CREAR DESDE GAP (Simplificado)
// ═══════════════════════════════════════════════════════════════

export interface CrearDesdeGAPFormData {
  calculo_nivel_id: string;
  nombre_proyecto?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  dueno_proyecto_id: number;
  responsable_implementacion_id: number;
  equipo_implementacion_ids?: number[];
  validador_interno_id?: number;
  auditor_verificacion_id?: number;
  presupuesto_asignado: number;
  moneda: MonedaProyecto;
  recursos_humanos_asignados?: number;
  categoria?: CategoriaProyecto;
  normativa?: NormativaProyecto;
  estrategia_cierre?: EstrategiaCierre;
  frecuencia_reporte?: FrecuenciaReporte;
  canal_comunicacion?: CanalComunicacion;
  metodo_verificacion?: MetodoVerificacion;
  criterios_validacion?: string;
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIO - ACTUALIZAR PROYECTO
// ═══════════════════════════════════════════════════════════════

export interface ActualizarProyectoFormData {
  nombre_proyecto?: string;
  descripcion?: string;
  fecha_fin_estimada?: string;
  prioridad?: PrioridadProyecto;
  categoria?: CategoriaProyecto;
  estado?: EstadoProyecto;
  control_no_conforme?: string;
  impacto_riesgo?: string;
  estrategia_cierre?: EstrategiaCierre;
  alcance_proyecto?: string;
  objetivos_especificos?: string;
  criterios_aceptacion?: string;
  supuestos?: string;
  restricciones?: string;
  riesgos_proyecto?: string;
  preguntas_abordadas_ids?: string[];
  dueno_proyecto?: number;
  responsable_implementacion?: number;
  equipo_implementacion?: number[];
  validador_interno?: number;
  auditor_verificacion?: number;
  presupuesto_asignado?: number;
  presupuesto_gastado?: number;
  recursos_humanos_asignados?: number;
  recursos_tecnicos?: string;
  frecuencia_reporte?: FrecuenciaReporte;
  metricas_desempeno?: string;
  umbrales_alerta?: string;
  canal_comunicacion?: CanalComunicacion;
  criterios_validacion?: string;
  metodo_verificacion?: MetodoVerificacion;
  responsable_validacion?: number;
  lecciones_aprendidas?: string;
  acciones_mejora_continua?: string;
  recomendaciones_futuros_gap?: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════

export interface EstadisticasProyectos {
  total_proyectos: number;
  por_estado: {
    planificado: number;
    en_ejecucion: number;
    en_validacion: number;
    cerrado: number;
    suspendido: number;
    cancelado: number;
  };
  por_prioridad: {
    critica: number;
    alta: number;
    media: number;
    baja: number;
  };
  por_categoria: {
    tecnico: number;
    documental: number;
    procesal: number;
    organizacional: number;
    capacitacion: number;
  };
  alertas: {
    vencidos: number;
    proximos_a_vencer: number;
  };
  presupuesto: {
    total_asignado: number;
    total_gastado: number;
    disponible: number;
    porcentaje_gastado: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS DE API
// ═══════════════════════════════════════════════════════════════

export interface ProyectosListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProyectoRemediacionList[];
}

export interface MisProyectosParams {
  rol?: 'dueno' | 'responsable' | 'equipo' | 'validador' | 'auditor';
  estado?: EstadoProyecto;
}

export interface ProyectosPorEstadoResponse {
  estado: EstadoProyecto;
  count: number;
  proyectos: ProyectoRemediacionList[];
}

export interface ProyectosVencidosResponse {
  count: number;
  proyectos: ProyectoRemediacionList[];
}

export interface ProyectosProximosVencerParams {
  dias?: number;
}

export interface ProyectosProximosVencerResponse {
  dias: number;
  count: number;
  proyectos: ProyectoRemediacionList[];
}

// ═══════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════

export interface ProyectosFiltros {
  estado?: EstadoProyecto;
  prioridad?: PrioridadProyecto;
  categoria?: CategoriaProyecto;
  empresa?: string;
  calculo_nivel?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES PARA UI
// ═══════════════════════════════════════════════════════════════

export const ESTADOS_PROYECTO_OPTIONS = [
  { value: 'planificado', label: 'Planificado', color: 'blue' },
  { value: 'en_ejecucion', label: 'En Ejecución', color: 'yellow' },
  { value: 'en_validacion', label: 'En Validación', color: 'purple' },
  { value: 'cerrado', label: 'Cerrado', color: 'green' },
  { value: 'suspendido', label: 'Suspendido', color: 'orange' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' },
] as const;

export const PRIORIDADES_PROYECTO_OPTIONS = [
  { value: 'critica', label: 'Crítica', color: 'red' },
  { value: 'alta', label: 'Alta', color: 'orange' },
  { value: 'media', label: 'Media', color: 'yellow' },
  { value: 'baja', label: 'Baja', color: 'green' },
] as const;

export const CATEGORIAS_PROYECTO_OPTIONS = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'documental', label: 'Documental' },
  { value: 'procesal', label: 'Procesal' },
  { value: 'organizacional', label: 'Organizacional' },
  { value: 'capacitacion', label: 'Capacitación' },
] as const;

export const NORMATIVAS_OPTIONS = [
  { value: 'iso_27001', label: 'ISO 27001' },
  { value: 'iso_9001', label: 'ISO 9001' },
  { value: 'nist_csf', label: 'NIST CSF' },
  { value: 'gdpr', label: 'GDPR' },
  { value: 'pci_dss', label: 'PCI-DSS' },
  { value: 'sox', label: 'SOX' },
  { value: 'hipaa', label: 'HIPAA' },
  { value: 'cmmi', label: 'CMMI' },
  { value: 'otro', label: 'Otro' },
] as const;

export const TIPOS_BRECHA_OPTIONS = [
  { value: 'ausencia_total', label: 'Ausencia Total' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'no_efectiva', label: 'No Efectiva' },
  { value: 'no_documentada', label: 'No Documentada' },
] as const;

export const ESTRATEGIAS_CIERRE_OPTIONS = [
  { value: 'implementacion_nueva', label: 'Implementación Nueva' },
  { value: 'fortalecimiento', label: 'Fortalecimiento' },
  { value: 'optimizacion', label: 'Optimización' },
  { value: 'documentacion', label: 'Documentación' },
] as const;

export const FRECUENCIAS_REPORTE_OPTIONS = [
  { value: 'diaria', label: 'Diaria' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
] as const;

export const CANALES_COMUNICACION_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'slack', label: 'Slack' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'otro', label: 'Otro' },
] as const;

export const METODOS_VERIFICACION_OPTIONS = [
  { value: 'muestreo', label: 'Muestreo' },
  { value: 'prueba_completa', label: 'Prueba Completa' },
  { value: 'observacion', label: 'Observación' },
  { value: 'revision_documental', label: 'Revisión Documental' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'inspeccion', label: 'Inspección Física' },
] as const;

export const MONEDAS_OPTIONS = [
  { value: 'USD', label: 'USD - Dólar Estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Libra Esterlina' },
  { value: 'PEN', label: 'PEN - Sol Peruano' },
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'CLP', label: 'CLP - Peso Chileno' },
  { value: 'ARS', label: 'ARS - Peso Argentino' },
] as const;

export interface GAPInfo {
  dimension_nombre: string;
  dimension_codigo: string;
  gap: number;
  clasificacion_gap: string;
  nivel_actual: number;
  nivel_deseado: number;
}