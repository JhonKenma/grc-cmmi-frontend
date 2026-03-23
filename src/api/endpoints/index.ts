// src/api/endpoints/index.ts

export { encuestasApi } from './encuestas.api'; // <-- AGREGAR
export * from './dimensiones.api';
export { preguntasApi } from './preguntas.api';
export * from './niveles.api';
export { notificacionesApi } from './notificaciones.api';  // ⭐ AGREGAR
export { asignacionesApi } from './asignaciones.api';  
export { evaluacionesApi } from './evaluaciones.api'; 
export { usuarioService as usuariosApi } from '../usuario.service';
export * from './config-niveles.api';
export { respuestasApi } from './respuestas.api';
export * from './respuestas.api';
export * from './reportes.api';
export * from './proyectos-remediacion.api';
export * from './proveedores.api';
export * from './iqevaluaciones.api';
export * from './empresa-framework.api';
export * from './asignacion-iq.api'; // <-- AGREGAR
// export * from './respuestas-iq.api'; // <-- AGREGAR (pending file creation)
export { respuestaIQApi } from './respuesta-iq.api';
export * from './documentos.api';
export * from './auditor-iq.api';


// Aquí puedes agregar más exports según vayas creando APIs
