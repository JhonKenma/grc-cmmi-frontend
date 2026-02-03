// src/types/proveedor.ts

// ============================================================
// CATÁLOGOS
// ============================================================

export interface TipoProveedor {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
}

export interface ClasificacionProveedor {
  id: string;
  codigo: 'estrategico' | 'critico' | 'no_critico' | 'temporal';
  codigo_display: string;
  nombre: string;
  descripcion: string | null;
  color: string; // Hex color
  activo: boolean;
}

// ============================================================
// TIPOS Y ENUMS
// ============================================================

export type NivelRiesgo = 'alto' | 'medio' | 'bajo';

export type EstadoProveedor = 'activo' | 'inactivo' | 'suspendido';

export type TipoContrato = 
  | 'servicio'
  | 'compra'
  | 'licencia'
  | 'outsourcing'
  | 'consultoria'
  | 'mantenimiento'
  | 'otro';

// ============================================================
// PROVEEDOR PRINCIPAL
// ============================================================

export interface Proveedor {
  // IDs y relaciones
  id: string;
  empresa: string | null;
  tipo_proveedor: string;
  clasificacion: string | null;
  creado_por: string;
  
  // Información básica
  razon_social: string;
  nombre_comercial: string | null;
  
  // Legal y fiscal
  pais: string;
  tipo_documento_fiscal: string;
  numero_documento_fiscal: string;
  direccion_legal: string | null;
  
  // Contacto
  nombre_contacto_principal: string | null;
  cargo_contacto: string | null;
  email_contacto: string;
  telefono_contacto: string;
  
  // Contractual
  numero_contrato: string | null;
  fecha_inicio_contrato: string | null;
  fecha_fin_contrato: string | null;
  tipo_contrato: TipoContrato | null;
  tipo_contrato_display: string | null;
  sla_aplica: boolean;
  
  // Estado y clasificación GRC
  nivel_riesgo: NivelRiesgo;
  nivel_riesgo_display: string;
  proveedor_estrategico: boolean;
  estado_proveedor: EstadoProveedor;
  estado_proveedor_display: string;
  fecha_alta: string;
  fecha_baja: string | null;
  
  // Cumplimiento
  requiere_certificaciones: boolean;
  certificaciones: string[];
  cumple_compliance: boolean;
  ultima_evaluacion_riesgo: string | null;
  proxima_evaluacion_riesgo: string | null;
  
  // Observaciones
  observaciones: string | null;
  
  // Campos base
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Campos relacionados (read-only)
  tipo_proveedor_nombre: string;
  clasificacion_nombre: string | null;
  clasificacion_color: string | null;
  empresa_nombre: string | null;
  creado_por_nombre: string;
  es_global: boolean;
  nivel_criticidad: string;
  contrato_vigente: boolean | null;
}

// ============================================================
// DTOs PARA CREAR Y ACTUALIZAR
// ============================================================

export interface ProveedorCreate {
  // Relaciones (empresa es opcional, solo superadmin puede enviarlo)
  empresa?: string | null;
  tipo_proveedor: string; // UUID del tipo
  clasificacion?: string | null; // UUID de la clasificación
  
  // Información básica
  razon_social: string;
  nombre_comercial?: string;
  
  // Legal y fiscal
  pais?: string;
  tipo_documento_fiscal?: string;
  numero_documento_fiscal: string;
  direccion_legal?: string;
  
  // Contacto
  nombre_contacto_principal?: string;
  cargo_contacto?: string;
  email_contacto: string;
  telefono_contacto: string;
  
  // Contractual
  numero_contrato?: string;
  fecha_inicio_contrato?: string; // YYYY-MM-DD
  fecha_fin_contrato?: string; // YYYY-MM-DD
  tipo_contrato?: TipoContrato;
  sla_aplica?: boolean;
  
  // Estado y clasificación GRC
  nivel_riesgo?: NivelRiesgo;
  proveedor_estrategico?: boolean;
  
  // Cumplimiento
  requiere_certificaciones?: boolean;
  certificaciones?: string[];
  cumple_compliance?: boolean;
  
  // Observaciones
  observaciones?: string;
}

export interface ProveedorUpdate {
  // empresa NO se puede actualizar (readonly en backend)
  tipo_proveedor?: string;
  clasificacion?: string | null;
  
  // Información básica
  razon_social?: string;
  nombre_comercial?: string;
  
  // Legal y fiscal
  pais?: string;
  tipo_documento_fiscal?: string;
  numero_documento_fiscal?: string;
  direccion_legal?: string;
  
  // Contacto
  nombre_contacto_principal?: string;
  cargo_contacto?: string;
  email_contacto?: string;
  telefono_contacto?: string;
  
  // Contractual
  numero_contrato?: string;
  fecha_inicio_contrato?: string;
  fecha_fin_contrato?: string;
  tipo_contrato?: TipoContrato;
  sla_aplica?: boolean;
  
  // Estado y clasificación GRC
  nivel_riesgo?: NivelRiesgo;
  proveedor_estrategico?: boolean;
  estado_proveedor?: EstadoProveedor;
  fecha_baja?: string;
  
  // Cumplimiento
  requiere_certificaciones?: boolean;
  certificaciones?: string[];
  cumple_compliance?: boolean;
  ultima_evaluacion_riesgo?: string;
  proxima_evaluacion_riesgo?: string;
  
  // Observaciones
  observaciones?: string;
}

// ============================================================
// RESPONSES DE LA API
// ============================================================

export interface ProveedorListResponse {
  success: boolean;
  data: Proveedor[];
  total: number;
}

export interface ProveedorDetailResponse {
  success: boolean;
  message: string;
  data: Proveedor;
}

export interface ProveedorPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proveedor[];
}

export interface TipoProveedorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TipoProveedor[];
}

export interface ClasificacionProveedorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClasificacionProveedor[];
}

// ============================================================
// FILTROS Y QUERY PARAMS
// ============================================================

export interface ProveedorFilters {
  tipo_id?: string;
  clasificacion_id?: string;
  nivel_riesgo?: NivelRiesgo;
  estado?: EstadoProveedor;
  activo?: boolean;
  es_estrategico?: boolean;
  search?: string;
}

// ============================================================
// CONSTANTES Y HELPERS
// ============================================================

export const NIVELES_RIESGO: { value: NivelRiesgo; label: string; color: string }[] = [
  { value: 'alto', label: 'Alto', color: '#EF4444' },
  { value: 'medio', label: 'Medio', color: '#F59E0B' },
  { value: 'bajo', label: 'Bajo', color: '#10B981' },
];

export const ESTADOS_PROVEEDOR: { value: EstadoProveedor; label: string; color: string }[] = [
  { value: 'activo', label: 'Activo', color: '#10B981' },
  { value: 'inactivo', label: 'Inactivo', color: '#6B7280' },
  { value: 'suspendido', label: 'Suspendido', color: '#EF4444' },
];

export const TIPOS_CONTRATO: { value: TipoContrato; label: string }[] = [
  { value: 'servicio', label: 'Contrato de Servicios' },
  { value: 'compra', label: 'Contrato de Compra' },
  { value: 'licencia', label: 'Licenciamiento' },
  { value: 'outsourcing', label: 'Outsourcing' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'otro', label: 'Otro' },
];

// Helper para obtener el color del nivel de riesgo
export const getRiesgoColor = (nivel: NivelRiesgo): string => {
  const riesgo = NIVELES_RIESGO.find(r => r.value === nivel);
  return riesgo?.color || '#6B7280';
};

// Helper para obtener el color del estado
export const getEstadoColor = (estado: EstadoProveedor): string => {
  const estadoItem = ESTADOS_PROVEEDOR.find(e => e.value === estado);
  return estadoItem?.color || '#6B7280';
};

// Helper para formatear certificaciones
export const formatCertificaciones = (certificaciones: string[]): string => {
  if (!certificaciones || certificaciones.length === 0) return 'Sin certificaciones';
  return certificaciones.join(', ');
};

// Helper para validar vigencia de contrato
export const isContratoVigente = (fechaInicio: string | null, fechaFin: string | null): boolean | null => {
  if (!fechaInicio || !fechaFin) return null;
  
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  return hoy >= inicio && hoy <= fin;
};