// src/types/proveedor.ts

export type TipoProveedor = 
  | 'consultoria'
  | 'software'
  | 'capacitacion'
  | 'auditoria'
  | 'infraestructura'
  | 'otro';

export interface Proveedor {
  id: string;
  empresa: number | null;  // ⭐ NUEVO: ID de empresa (null si es global)
  empresa_nombre: string | null;  // ⭐ NUEVO: Nombre de empresa
  es_global: boolean;  // ⭐ NUEVO: true si no tiene empresa
  razon_social: string;
  ruc: string;
  tipo_proveedor: TipoProveedor;
  tipo_proveedor_display: string;
  contacto_email: string;
  contacto_telefono: string;
  activo: boolean;
  creado_por: number;
  creado_por_nombre: string;
  creado_por_email: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProveedorCreate {
  empresa?: number | null;  // ⭐ NUEVO: Opcional, solo superadmin puede enviarlo
  razon_social: string;
  ruc: string;
  tipo_proveedor: TipoProveedor;
  contacto_email: string;
  contacto_telefono: string;
}

export interface ProveedorUpdate {
  // empresa NO se puede actualizar (readonly en backend)
  razon_social?: string;
  ruc?: string;
  tipo_proveedor?: TipoProveedor;
  contacto_email?: string;
  contacto_telefono?: string;
}

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