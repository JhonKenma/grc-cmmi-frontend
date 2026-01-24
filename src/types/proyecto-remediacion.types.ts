// src/types/proyecto-remediacion.types.ts

/**
 * TIPOS PARA MÓDULO DE PROYECTOS DE REMEDIACIÓN
 * 
 * Actualizado con soporte para:
 * - Sistema de presupuesto dual (global / por ítems)
 * - Gestión de ítems de proyecto
 * - Dependencias entre ítems
 * - Proveedores
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

// ⭐ NUEVO: Modo de presupuesto
export type ModoPresupuesto = 
  | 'global'      // Un solo monto para todo el proyecto
  | 'por_items';  // Desglosado en ítems/tareas individuales

// ⭐ NUEVO: Estados de ítem
export type EstadoItem = 
  | 'pendiente' 
  | 'en_proceso' 
  | 'completado' 
  | 'bloqueado';  // Bloqueado por dependencia

export type MonedaProyecto = 
  | 'USD' 
  | 'EUR' 
  | 'PEN' 
  | 'COP' 
  | 'MXN';

export type ResultadoFinal = 
  | 'exitoso' 
  | 'parcialmente_exitoso' 
  | 'no_exitoso' 
  | 'cancelado';

// ═══════════════════════════════════════════════════════════════
// INTERFACES DE DATOS BÁSICOS
// ═══════════════════════════════════════════════════════════════

/**
 * Información del GAP original
 */
export interface CalculoNivelInfo {
  id: string;
  dimension: string;
  dimension_codigo: string;
  dimension_nombre: string;
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
}

// ⭐ NUEVO: Información de proveedor
export interface ProveedorInfo {
  id: string;
  razon_social: string;
  ruc: string;
  categoria?: string;
  email?: string;
}

// ═══════════════════════════════════════════════════════════════
// ÍTEM DE PROYECTO (NUEVO) ⭐
// ═══════════════════════════════════════════════════════════════

/**
 * Ítem/Tarea individual de un proyecto (para modo por_items)
 */
export interface ItemProyecto {
  id: string;
  numero_item: number;
  nombre_item: string;
  descripcion: string;
  
  // Proveedor (opcional)
  requiere_proveedor: boolean;
  proveedor: string | null;
  proveedor_nombre: string | null;
  nombre_responsable_proveedor: string;
  
  // Responsable interno (obligatorio)
  responsable_ejecucion: number;
  responsable_nombre: string;
  
  // Presupuesto
  presupuesto_planificado: number;
  presupuesto_ejecutado: number;
  diferencia_presupuesto: number;
  
  // Cronograma
  fecha_inicio: string;
  duracion_dias: number;
  fecha_fin: string; // Calculada automáticamente
  
  // Dependencias
  tiene_dependencia: boolean;
  item_dependencia: string | null;
  
  // Estado y seguimiento
  estado: EstadoItem;
  estado_display: string;
  porcentaje_avance: number;
  
  // Propiedades calculadas
  puede_iniciar: boolean;
  dias_restantes: number;
  esta_vencido: boolean;
  
  // Auditoría
  fecha_creacion: string;
}

/**
 * Ítem detallado con relaciones expandidas
 */
export interface ItemProyectoDetail extends ItemProyecto {
  responsable_info: UsuarioInfo;
  proveedor_info: ProveedorInfo | null;
  item_dependencia_info: {
    id: string;
    numero_item: number;
    nombre_item: string;
    estado: EstadoItem;
    estado_display: string;
    porcentaje_avance: number;
  } | null;
  items_que_dependen: Array<{
    id: string;
    numero_item: number;
    nombre_item: string;
    estado: EstadoItem;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// PROYECTO - LISTA (Vista simplificada) - ACTUALIZADO
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
  
  // ⭐ NUEVO: Modo de presupuesto
  modo_presupuesto: ModoPresupuesto;
  modo_presupuesto_display: string;
  
  // Responsables
  dueno_proyecto_nombre: string;
  responsable_implementacion_nombre: string;
  dueno_nombre: string;  // Mantener por compatibilidad
  responsable_nombre: string;  // Mantener por compatibilidad
  
  // Fechas y tiempo
  fecha_inicio: string;
  fecha_fin_estimada: string;
  dias_restantes: number;
  dias_transcurridos: number;
  porcentaje_tiempo_transcurrido: number;  // ⭐ AGREGADO
  esta_vencido: boolean;
  
  // ⭐ ACTUALIZADO: Presupuesto inteligente
  presupuesto_total_planificado: number;  // Suma según modo
  presupuesto_total_ejecutado: number;    // Suma según modo
  porcentaje_presupuesto_gastado: number;
  moneda: MonedaProyecto;
  
  // ⭐ NUEVO: Información de ítems (si modo='por_items')
  total_items: number;
  items_completados: number;
  porcentaje_avance_items: number;
  
  // Info del cálculo de nivel (GAP)
  calculo_nivel_info: CalculoNivelInfo;
  
  fecha_creacion: string;
}

// ═══════════════════════════════════════════════════════════════
// PROYECTO - DETALLE (Vista completa) - ACTUALIZADO
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
  fecha_fin_real: string | null;
  estado: EstadoProyecto;
  estado_display: string;
  prioridad: PrioridadProyecto;
  prioridad_display: string;
  categoria: CategoriaProyecto;
  categoria_display: string;
  
  // ═══ RELACIÓN CON GAP ═══
  calculo_nivel: string;
  calculo_nivel_info: CalculoNivelInfo;
  
  // ═══ PLANIFICACIÓN (SIMPLIFICADO) ═══
  alcance_proyecto: string;
  objetivos_especificos: string;
  criterios_aceptacion: string;
  riesgos_proyecto: string;
  preguntas_abordadas: string[];
  preguntas_abordadas_info: PreguntaAbordadaInfo[];
  
  // ═══ RESPONSABLES (SIMPLIFICADO) ═══
  dueno_proyecto: number;
  dueno_proyecto_info: UsuarioInfo;
  responsable_implementacion: number;
  responsable_implementacion_info: UsuarioInfo;
  validador_interno: number | null;
  validador_interno_info: UsuarioInfo | null;
  
  // ═══ PRESUPUESTO ⭐ NUEVO SISTEMA ═══
  modo_presupuesto: ModoPresupuesto;
  modo_presupuesto_display: string;
  moneda: MonedaProyecto;
  moneda_display: string;
  
  // Presupuesto global (solo si modo='global')
  presupuesto_global: number;
  presupuesto_global_gastado: number;
  
  // Presupuesto calculado (según modo)
  presupuesto_total_planificado: number;
  presupuesto_total_ejecutado: number;
  presupuesto_disponible: number;
  porcentaje_presupuesto_gastado: number;
  
  // ⭐ NUEVO: Ítems del proyecto (si modo='por_items')
  items: ItemProyecto[];
  total_items: number;
  items_completados: number;
  porcentaje_avance_items: number;
  
  // ═══ CIERRE ═══
  resultado_final: ResultadoFinal | null;
  resultado_final_display: string;
  lecciones_aprendidas: string;
  
  // ═══ EMPRESA Y AUDITORÍA ═══
  empresa: number;
  empresa_info: EmpresaInfo;
  creado_por: number | null;
  creado_por_info: UsuarioInfo | null;
  version: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // ═══ CAMPOS CALCULADOS ═══
  dias_restantes: number;
  dias_transcurridos: number;
  duracion_estimada_dias: number;
  porcentaje_tiempo_transcurrido: number;  // ⭐ AGREGADO
  esta_vencido: boolean;
  gap_original: number;
  dimension_nombre: string;
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIOS - CREAR PROYECTO (SIMPLIFICADO)
// ═══════════════════════════════════════════════════════════════

export interface CrearProyectoFormData {
  // ═══ BÁSICO ═══
  nombre_proyecto: string;
  descripcion: string;
  calculo_nivel: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  prioridad: PrioridadProyecto;
  categoria: CategoriaProyecto;
  
  // ═══ RESPONSABLES ═══
  dueno_proyecto: number;
  responsable_implementacion: number;
  validador_interno?: number;
  
  // ⭐ NUEVO: PRESUPUESTO ═══
  modo_presupuesto: ModoPresupuesto;
  moneda: MonedaProyecto;
  presupuesto_global?: number;  // Solo si modo='global'
  
  // ═══ PLANIFICACIÓN ═══
  alcance_proyecto: string;
  objetivos_especificos: string;
  criterios_aceptacion: string;
  riesgos_proyecto?: string;
  preguntas_abordadas_ids?: string[];
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIO - CREAR DESDE GAP (ACTUALIZADO)
// ═══════════════════════════════════════════════════════════════

export interface CrearDesdeGAPFormData {
  calculo_nivel_id: string;
  nombre_proyecto?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  dueno_proyecto_id: number;
  responsable_implementacion_id: number;
  validador_interno_id?: number;
  
  // ⭐ NUEVO: Sistema de presupuesto
  modo_presupuesto: ModoPresupuesto;
  moneda: MonedaProyecto;
  presupuesto_global?: number;  // Solo si modo='global'
  
  categoria?: CategoriaProyecto;
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIO - ACTUALIZAR PROYECTO (SIMPLIFICADO)
// ═══════════════════════════════════════════════════════════════

export interface ActualizarProyectoFormData {
  nombre_proyecto?: string;
  descripcion?: string;
  fecha_fin_estimada?: string;
  prioridad?: PrioridadProyecto;
  categoria?: CategoriaProyecto;
  estado?: EstadoProyecto;
  alcance_proyecto?: string;
  objetivos_especificos?: string;
  criterios_aceptacion?: string;
  riesgos_proyecto?: string;
  dueno_proyecto?: number;
  responsable_implementacion?: number;
  validador_interno?: number;
  presupuesto_global?: number;  // Solo en modo global
  presupuesto_global_gastado?: number;
  lecciones_aprendidas?: string;
  preguntas_abordadas_ids?: string[];
}

// ═══════════════════════════════════════════════════════════════
// FORMULARIOS DE ÍTEMS (NUEVO) ⭐
// ═══════════════════════════════════════════════════════════════

export interface CrearItemFormData {
  nombre_item: string;
  descripcion?: string;
  
  // Proveedor (opcional)
  requiere_proveedor: boolean;
  proveedor_id?: string;
  nombre_responsable_proveedor?: string;
  
  // Responsable (obligatorio)
  responsable_ejecucion_id: number;
  
  // Presupuesto
  presupuesto_planificado: number;
  
  // Cronograma
  fecha_inicio: string;
  duracion_dias: number;
  
  // Dependencias
  tiene_dependencia: boolean;
  item_dependencia_id?: string;
}

export interface ActualizarItemFormData {
  item_id: string;
  nombre_item?: string;
  descripcion?: string;
  requiere_proveedor?: boolean;
  proveedor_id?: string;
  nombre_responsable_proveedor?: string;
  responsable_ejecucion_id?: number;
  presupuesto_planificado?: number;
  presupuesto_ejecutado?: number;
  fecha_inicio?: string;
  duracion_dias?: number;
  tiene_dependencia?: boolean;
  item_dependencia_id?: string;
  estado?: EstadoItem;
  porcentaje_avance?: number;
}

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS DE API - ÍTEMS (NUEVO) ⭐
// ═══════════════════════════════════════════════════════════════

export interface ListarItemsResponse {
  success: boolean;
  data: {
    proyecto_id: string;
    codigo_proyecto: string;
    total_items: number;
    items: ItemProyecto[];
    resumen: {
      total_presupuesto_planificado: number;
      total_presupuesto_ejecutado: number;
      items_completados: number;
      items_bloqueados: number;
    };
  };
}

export interface ItemActionResponse {
  success: boolean;
  data: ItemProyectoDetail;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS (ACTUALIZADO)
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
  // ⭐ NUEVO: Por modo de presupuesto
  por_modo_presupuesto: {
    global: number;
    por_items: number;
  };
  alertas: {
    vencidos: number;
    proximos_a_vencer: number;
  };
  // ⭐ ACTUALIZADO: Presupuesto inteligente
  presupuesto: {
    total_planificado: number;
    total_ejecutado: number;
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
  estado?: EstadoProyecto;
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
// FILTROS (ACTUALIZADO)
// ═══════════════════════════════════════════════════════════════

export interface ProyectosFiltros {
  estado?: EstadoProyecto;
  prioridad?: PrioridadProyecto;
  categoria?: CategoriaProyecto;
  modo_presupuesto?: ModoPresupuesto;  // ⭐ NUEVO
  empresa?: string;
  calculo_nivel?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ItemsFiltros {
  estado?: EstadoItem;
  requiere_proveedor?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES PARA UI (ACTUALIZADO)
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

// ⭐ NUEVO: Modos de presupuesto
export const MODOS_PRESUPUESTO_OPTIONS = [
  { value: 'global', label: 'Presupuesto Global', description: 'Un monto único para todo el proyecto' },
  { value: 'por_items', label: 'Presupuesto por Ítems', description: 'Desglosado en tareas individuales' },
] as const;

// ⭐ NUEVO: Estados de ítem
export const ESTADOS_ITEM_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: 'gray' },
  { value: 'en_proceso', label: 'En Proceso', color: 'blue' },
  { value: 'completado', label: 'Completado', color: 'green' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'red' },
] as const;

export const MONEDAS_OPTIONS = [
  { value: 'USD', label: 'USD - Dólar Estadounidense', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'PEN', label: 'PEN - Sol Peruano', symbol: 'S/' },
  { value: 'COP', label: 'COP - Peso Colombiano', symbol: '$' },
  { value: 'MXN', label: 'MXN - Peso Mexicano', symbol: '$' },
] as const;

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

export interface GAPInfo {
  dimension_nombre: string;
  dimension_codigo: string;
  gap: number;
  clasificacion_gap: string;
  nivel_actual: number;
  nivel_deseado: number;
}

/**
 * Helper para obtener el símbolo de moneda
 */
export const getMonedaSymbol = (moneda: MonedaProyecto): string => {
  const found = MONEDAS_OPTIONS.find(m => m.value === moneda);
  return found?.symbol || '$';
};

/**
 * Helper para obtener el color de un estado de proyecto
 */
export const getEstadoColor = (estado: EstadoProyecto): string => {
  const colores: Record<EstadoProyecto, string> = {
    planificado: 'bg-blue-100 text-blue-800 border-blue-300',
    en_ejecucion: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    en_validacion: 'bg-purple-100 text-purple-800 border-purple-300',
    cerrado: 'bg-green-100 text-green-800 border-green-300',
    suspendido: 'bg-orange-100 text-orange-800 border-orange-300',
    cancelado: 'bg-red-100 text-red-800 border-red-300',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Helper para obtener el color de un estado de ítem
 */
export const getEstadoItemColor = (estado: EstadoItem): string => {
  const found = ESTADOS_ITEM_OPTIONS.find(e => e.value === estado);
  return found?.color || 'gray';
};

export const formatCurrency = (amount: number, moneda: MonedaProyecto): string => {
  const symbol = getMonedaSymbol(moneda);
  
  // Convertir a número y validar
  const numAmount = Number(amount) || 0;
  
  // Formatear con locale que soporta separadores de miles
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
  
  return `${symbol}${formatted}`;
};