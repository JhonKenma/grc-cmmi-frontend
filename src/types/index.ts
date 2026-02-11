// src/types/index.ts

// ==========================================
// TIPOS DE USUARIO
// ==========================================
export type Rol = 'superadmin' | 'administrador' | 'usuario' | 'auditor';  // <-- AGREGADO superadmin

export interface Usuario {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  empresa: number | null;  // <-- Puede ser null para superadmin
  empresa_info?: Empresa;
  rol: Rol;
  telefono: string;
  cargo: string;
  departamento: string;
  avatar?: string;
  activo: boolean;
  is_active: boolean;
  total_asignaciones: number;
  asignaciones_pendientes: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ==========================================
// TIPOS DE AUTENTICACIÓN
// ==========================================
export interface LoginResponse {
  access: string;
  refresh: string;
  usuario: {
    id: number;
    email: string;
    username: string;
    nombre_completo: string;
    rol: Rol;
    empresa_id: number | null;
    empresa_nombre: string | null;
    avatar: string | null;
    es_superadmin: boolean;  // <-- NUEVO campo
  };
}

export interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isAuditor: boolean;
  isUsuario: boolean;
}

// Resto del código sin cambios...
export interface Empresa {
  id: number;
  nombre: string;
  razon_social: string;
  ruc: string;
  pais: string;
  pais_otro?: string;
  pais_display: string;
  tamanio?: string;
  tamanio_otro?: string;
  tamanio_display?: string;
  sector?: string;
  sector_otro?: string;
  sector_display?: string;
  direccion: string;
  telefono: string;
  email: string;
  timezone: string;
  logo?: string;
  activo: boolean;
  total_usuarios: number;
  total_encuestas: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export * from './encuesta.types';
export * from './notificaciones.types';
export * from './asignaciones.types'; 
export * from './respuestas.types';
export * from './evaluaciones.types';
export * as proyectoRemediacion from './proyecto-remediacion.types';
export * from './proveedor';