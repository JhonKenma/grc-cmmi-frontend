// src/api/endpoints/index.ts

export { encuestasApi } from './encuestas.api'; // <-- AGREGAR
export * from './dimensiones.api';
export * from './preguntas.api';
export * from './niveles.api';
export { notificacionesApi } from './notificaciones.api';  // ⭐ AGREGAR
export { asignacionesApi } from './asignaciones.api';  
export * from './evaluaciones.api'; 
export { usuarioService as usuariosApi } from '../usuario.service';
export * from './config-niveles.api';
export * from './respuestas.api';
export * from './reportes.api';
export * from './proyectos-remediacion.api';
export * from './proveedores.api';
// Aquí puedes agregar más exports según vayas creando APIs
