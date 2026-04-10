// src/types/reporte-iq.types.ts

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN (equivalente a Dimension en encuestas)
// ─────────────────────────────────────────────────────────────────────────────

export interface SeccionIQ {
  id: string;              // "{framework_id}__{seccion}"
  nombre: string;
  codigo: string;
  framework_id: number;
  framework_nombre: string;
  orden: number;
}

export interface UsuarioSeccionIQ {
  usuario_id: number;
  usuario_nombre: string;
  nivel_actual: number;
  gap: number;
  clasificacion_gap: string;
  clasificacion_gap_display: string;
  porcentaje_cumplimiento: number;
  total_preguntas: number;
  calculo_nivel_iq_id: string;
  asignacion_id: string;
  respuestas: {
    si_cumple: number;
    cumple_parcial: number;
    no_cumple: number;
    no_aplica: number;
  };
}

export interface SeccionGAPData {
  seccion: SeccionIQ;
  nivel_deseado: number;
  nivel_actual_promedio: number;
  gap_promedio: number;
  clasificacion_gap: string;
  clasificacion_gap_display: string;
  porcentaje_cumplimiento_promedio: number;

  // Brecha
  tiene_brecha: boolean;
  severidad_brecha: 'critica' | 'alta' | 'media' | 'baja' | 'ninguna';

  // Para compatibilidad con TablaDetalleDimensiones
  total_preguntas: number;
  total_usuarios_evaluados: number;
  tiene_proyecto_activo: boolean;
  proyecto_id: string | null;
  total_proyectos: number;

  respuestas: {
    si_cumple: number;
    cumple_parcial: number;
    no_cumple: number;
    no_aplica: number;
  };
  usuarios: UsuarioSeccionIQ[];
  calculo_nivel_iq_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRECHA IDENTIFICADA (para remediación)
// ─────────────────────────────────────────────────────────────────────────────

export interface BrechaIQ {
  prioridad: number;                 // 1=crítico, 2=alto, 3=medio, 4=bajo
  seccion: string;
  framework_id: number;
  framework_nombre: string;
  nivel_deseado: number;
  nivel_actual: number;
  gap: number;
  clasificacion_gap: string;
  clasificacion_gap_display: string;
  porcentaje_cumplimiento: number;
  total_preguntas: number;
  respuestas_no_cumple: number;
  calculo_nivel_iq_id: string;
  tiene_proyecto_remediacion: boolean;
  proyecto_remediacion_id: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN GENERAL
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumenIQ {
  nivel_deseado_promedio: number;
  nivel_actual_promedio: number;
  gap_promedio: number;
  porcentaje_cumplimiento_promedio: number;
  total_secciones: number;
  total_frameworks: number;
  total_preguntas: number;
  secciones_con_brecha: number;
  secciones_sin_brecha: number;
  secciones_criticas: number;
  // Compatibilidad con ResumenGeneral.tsx
  total_dimensiones: number;
  dimensiones_evaluadas: number;
  total_usuarios: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASIFICACIONES GAP
// ─────────────────────────────────────────────────────────────────────────────

export interface ClasificacionesGAP {
  critico: number;
  alto: number;
  medio: number;
  bajo: number;
  cumplido: number;
  superado: number;
  critico_porcentaje: number;
  alto_porcentaje: number;
  medio_porcentaje: number;
  bajo_porcentaje: number;
  cumplido_porcentaje: number;
  superado_porcentaje: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUCIÓN DE RESPUESTAS
// ─────────────────────────────────────────────────────────────────────────────

export interface DistribucionRespuestas {
  si_cumple: number;
  cumple_parcial: number;
  no_cumple: number;
  no_aplica: number;
  total: number;
  porcentajes: {
    si_cumple: number;
    cumple_parcial: number;
    no_cumple: number;
    no_aplica: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTE COMPLETO IQ
// ─────────────────────────────────────────────────────────────────────────────

export interface ReporteEvaluacionIQ {
  asignacion: {
    id: number;
    evaluacion_nombre: string;
    evaluacion_descripcion: string;
    empresa: string;
    usuario: string;
    usuario_email: string;
    estado: string;
    estado_display: string;
    fecha_asignacion: string;
    fecha_inicio: string;
    fecha_limite: string;
    fecha_completado: string | null;
    fecha_auditada: string | null;
    auditado_por: string | null;
    nivel_deseado: number;
    nivel_deseado_display: string;
    frameworks: string[];
  };
  resumen: ResumenIQ;
  por_seccion: SeccionGAPData[];
  por_usuario: Array<{
    usuario: {
      id: number;
      nombre_completo: string;
      email: string;
      cargo: string | null;
    };
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    total_dimensiones_evaluadas: number;
    dimensiones: Array<{
      seccion_nombre: string;
      framework_nombre: string;
      nivel_deseado: number;
      nivel_actual: number;
      gap: number;
      clasificacion_gap: string;
      porcentaje_cumplimiento: number;
    }>;
  }>;
  clasificaciones_gap: ClasificacionesGAP;
  brechas_identificadas: BrechaIQ[];
  distribucion_respuestas: DistribucionRespuestas;
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTADO DE ASIGNACIONES IQ AUDITADAS (para el selector)
// ─────────────────────────────────────────────────────────────────────────────

export interface AsignacionIQAuditada {
  asignacion_id: number;
  evaluacion_nombre: string;
  usuario: string;
  fecha_auditada: string;
  estado: string;
  gap_promedio: number;
  nivel_actual_promedio: number;
  porcentaje_cumplimiento: number;
  total_brechas: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER: convierte SeccionGAPData al shape que espera TablaDetalleDimensiones
// ─────────────────────────────────────────────────────────────────────────────

export const adaptarSeccionParaTabla = (seccion: SeccionGAPData) => ({
  dimension: {
    id:     seccion.seccion.id,
    codigo: seccion.seccion.codigo,
    nombre: seccion.seccion.nombre,
    orden:  seccion.seccion.orden,
  },
  nivel_deseado:                      seccion.nivel_deseado,
  nivel_actual_promedio:              seccion.nivel_actual_promedio,
  gap_promedio:                       seccion.gap_promedio,
  porcentaje_cumplimiento_promedio:   seccion.porcentaje_cumplimiento_promedio,
  total_usuarios_evaluados:           seccion.total_usuarios_evaluados,
  total_proyectos:                    seccion.total_proyectos,
  tiene_proyecto_activo:              seccion.tiene_proyecto_activo,
  proyecto_id:                        seccion.proyecto_id,
  usuarios: seccion.usuarios.map(u => ({
    usuario_id:                u.usuario_id,
    usuario_nombre:            u.usuario_nombre,
    nivel_actual:              u.nivel_actual,
    gap:                       u.gap,
    clasificacion_gap:         u.clasificacion_gap,
    clasificacion_gap_display: u.clasificacion_gap_display,
    porcentaje_cumplimiento:   u.porcentaje_cumplimiento,
    total_preguntas:           u.total_preguntas,
    calculo_nivel_id:          u.calculo_nivel_iq_id,   // renombrado para compatibilidad
    asignacion_id:             u.asignacion_id,
    respuestas:                u.respuestas,
  })),
});