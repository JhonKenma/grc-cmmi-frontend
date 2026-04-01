// src/utils/constants.ts
/// <reference types="vite/client" />

/**
 * URLs de la API
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Información de la aplicación
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Sistema GRC';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

/**
 * Keys para localStorage
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
} as const;

/**
 * Roles del sistema con sus etiquetas
 */
export const ROLES = {
  SUPERUSER: 'superuser',
  ADMINISTRADOR: 'administrador',
  USUARIO: 'usuario',
  AUDITOR: 'auditor',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  superuser: 'Super Usuario',
  administrador: 'Administrador',
  usuario: 'Usuario',
  auditor: 'Auditor',
};

/**
 * Colores por rol (para badges)
 */
export const ROLE_COLORS: Record<string, string> = {
  superuser: 'purple',
  administrador: 'blue',
  usuario: 'green',
  auditor: 'yellow',
};

/**
 * Estados de activación
 */
export const ESTADO_LABELS = {
  true: 'Activo',
  false: 'Inactivo',
};

export const ESTADO_COLORS = {
  true: 'green',
  false: 'red',
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

/**
 * Mensajes del sistema
 */
export const MESSAGES = {
  // Éxito
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  CREATE_SUCCESS: 'Registro creado exitosamente',
  UPDATE_SUCCESS: 'Registro actualizado exitosamente',
  DELETE_SUCCESS: 'Registro eliminado exitosamente',
  PASSWORD_CHANGE_SUCCESS: 'Contraseña cambiada exitosamente',
  
  // Errores
  GENERIC_ERROR: 'Ocurrió un error inesperado',
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados',
  
  // Confirmaciones
  CONFIRM_DELETE: '¿Estás seguro de eliminar este registro?',
  CONFIRM_DISABLE: '¿Estás seguro de desactivar este registro?',
  CONFIRM_ENABLE: '¿Estás seguro de activar este registro?',
  CONFIRM_LOGOUT: '¿Estás seguro de cerrar sesión?',
} as const;

/**
 * Configuración de timezones
 */
export const TIMEZONES = [
  { value: 'America/Lima', label: 'Lima (GMT-5)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Santiago', label: 'Santiago (GMT-4)' },
];

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  // Públicas
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Privadas
  DASHBOARD: '/dashboard',
  
  // Empresas
  EMPRESAS: '/empresas',
  EMPRESA_DETALLE: '/empresas/:id',
  EMPRESA_CREAR: '/empresas/crear',
  EMPRESA_EDITAR: '/empresas/:id/editar',
  
  // Usuarios
  USUARIOS: '/usuarios',
  USUARIO_CREAR: '/usuarios/crear',
  USUARIO_EDITAR: '/usuarios/:id/editar',
  USUARIO_PERFIL: '/perfil',
  
  // Encuestas
  ENCUESTAS: '/encuestas',
  ENCUESTA_CREAR: '/encuestas/crear',
  ENCUESTA_CARGAR: '/encuestas/cargar',
  ENCUESTA_DETALLE: '/encuestas/:id',
  ENCUESTA_EDITAR: '/encuestas/:id/editar',
  
  // Asignaciones
  ASIGNACIONES: '/asignaciones',
  ASIGNACION_CREAR: '/asignaciones/crear',
  MIS_TAREAS: '/mis-tareas',
  
  // Reportes
  REPORTES: '/reportes',
  
  // Configuración
  CONFIGURACION: '/configuracion',
  
  // Otras
  NOT_FOUND: '*',
} as const;

/**
 * Configuración de validación de formularios
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD_MIN_LENGTH: 8,
  RUC_LENGTH: 11,
  TELEFONO_MIN_LENGTH: 7,
  TELEFONO_MAX_LENGTH: 15,
} as const;

/**
 * Códigos de estado HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;