// src/types/proveedor.ts (CREAR ARCHIVO)

export type TipoProveedor = 
  | 'consultoria'
  | 'software'
  | 'capacitacion'
  | 'auditoria'
  | 'infraestructura'
  | 'otro';

export interface Proveedor {
  id: string;
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
  razon_social: string;
  ruc: string;
  tipo_proveedor: TipoProveedor;
  contacto_email: string;
  contacto_telefono: string;
}

export interface ProveedorUpdate {
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