// src/types/reporte-iq.types.ts

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR — lista de evaluaciones IQ auditadas
// ─────────────────────────────────────────────────────────────────────────────

export interface EvaluacionIQAuditada {
  evaluacion_id:           number;
  evaluacion_nombre:       string;
  descripcion:             string;
  nivel_deseado:           number;
  nivel_deseado_display:   string;
  frameworks:              string[];       // nombres de frameworks
  total_usuarios:          number;
  gap_promedio:            number;
  nivel_actual_promedio:   number;
  porcentaje_cumplimiento: number;
  total_brechas:           number;
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO EVALUACIÓN (cabecera del reporte)
// ─────────────────────────────────────────────────────────────────────────────

export interface InfoEvaluacionIQ {
  id:                    number;
  nombre:                string;
  descripcion:           string;
  nivel_deseado:         number;
  nivel_deseado_display: string;
  frameworks: {
    id:     number;
    nombre: string;
    codigo: string;
  }[];
  total_usuarios: number;
  usuarios: {
    id:             number;
    nombre:         string;
    email:          string;
    estado:         string;
    fecha_auditada: string | null;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN GENERAL
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumenIQ {
  nivel_deseado_promedio:           number;
  nivel_actual_promedio:            number;
  gap_promedio:                     number;
  porcentaje_cumplimiento_promedio: number;
  total_secciones:                  number;
  total_frameworks:                 number;
  total_preguntas:                  number;
  total_usuarios:                   number;
  secciones_con_brecha:             number;
  secciones_sin_brecha:             number;
  secciones_criticas:               number;
  // Compatibilidad
  total_dimensiones:                number;
  dimensiones_evaluadas:            number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN (equivalente a Dimensión en encuestas)
// ─────────────────────────────────────────────────────────────────────────────

export interface SeccionIQInfo {
  id:               string;   // "{framework_id}__{seccion}"
  nombre:           string;
  codigo:           string;
  framework_id:     number;
  framework_nombre: string;
  orden:            number;
}

export interface UsuarioEnSeccionIQ {
  usuario_id:                number;
  usuario_nombre:            string;
  nivel_actual:              number;
  gap:                       number;
  clasificacion_gap:         string;
  clasificacion_gap_display: string;
  porcentaje_cumplimiento:   number;
  total_preguntas:           number;
  calculo_nivel_iq_id:       string;
  asignacion_id:             string;
  respuestas: {
    si_cumple:      number;
    cumple_parcial: number;
    no_cumple:      number;
    no_aplica:      number;
  };
}

export interface SeccionGAPData {
  seccion:                          SeccionIQInfo;
  nivel_deseado:                    number;
  nivel_actual_promedio:            number;
  gap_promedio:                     number;
  clasificacion_gap:                string;
  clasificacion_gap_display:        string;
  porcentaje_cumplimiento_promedio: number;
  total_usuarios_evaluados:         number;
  tiene_brecha:                     boolean;
  tiene_proyecto_activo:            boolean;
  proyecto_id:                      string | null;
  total_proyectos:                  number;
  respuestas: {
    si_cumple:      number;
    cumple_parcial: number;
    no_cumple:      number;
    no_aplica:      number;
  };
  usuarios:             UsuarioEnSeccionIQ[];
  calculo_nivel_iq_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// POR USUARIO
// ─────────────────────────────────────────────────────────────────────────────

export interface UsuarioIQ {
  usuario: {
    id:              number;
    nombre_completo: string;
    email:           string;
    cargo:           string | null;
  };
  nivel_actual_promedio:            number;
  gap_promedio:                     number;
  porcentaje_cumplimiento_promedio: number;
  total_dimensiones_evaluadas:      number;
  dimensiones: {
    seccion_nombre:          string;
    framework_nombre:        string;
    nivel_deseado:           number;
    nivel_actual:            number;
    gap:                     number;
    clasificacion_gap:       string;
    porcentaje_cumplimiento: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// BRECHA IDENTIFICADA
// ─────────────────────────────────────────────────────────────────────────────

export interface BrechaIQ {
  prioridad:                  number;
  seccion:                    string;
  framework_id:               number;
  framework_nombre:           string;
  nivel_deseado:              number;
  nivel_actual:               number;
  gap:                        number;
  clasificacion_gap:          string;
  clasificacion_gap_display:  string;
  porcentaje_cumplimiento:    number;
  total_preguntas:            number;
  respuestas_no_cumple:       number;
  calculo_nivel_iq_ids:       string[];
  total_usuarios:             number;
  tiene_proyecto_remediacion: boolean;
  proyecto_remediacion_id:    string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASIFICACIONES GAP
// ─────────────────────────────────────────────────────────────────────────────

export interface ClasificacionesGAP {
  critico:             number;
  alto:                number;
  medio:               number;
  bajo:                number;
  cumplido:            number;
  superado:            number;
  critico_porcentaje:  number;
  alto_porcentaje:     number;
  medio_porcentaje:    number;
  bajo_porcentaje:     number;
  cumplido_porcentaje: number;
  superado_porcentaje: number;
  [key: string]: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUCIÓN DE RESPUESTAS
// ─────────────────────────────────────────────────────────────────────────────

export interface DistribucionRespuestas {
  si_cumple:      number;
  cumple_parcial: number;
  no_cumple:      number;
  no_aplica:      number;
  total:          number;
  porcentajes: {
    si_cumple:      number;
    cumple_parcial: number;
    no_cumple:      number;
    no_aplica:      number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTE COMPLETO IQ — por evaluación (múltiples usuarios)
// ─────────────────────────────────────────────────────────────────────────────

export interface ReporteEvaluacionIQ {
  evaluacion:              InfoEvaluacionIQ;
  resumen:                 ResumenIQ;
  por_seccion:             SeccionGAPData[];
  por_usuario:             UsuarioIQ[];
  clasificaciones_gap:     ClasificacionesGAP;
  brechas_identificadas:   BrechaIQ[];
  distribucion_respuestas: DistribucionRespuestas;
}