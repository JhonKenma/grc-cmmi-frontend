// src/api/endpoints/dashboard.service.ts
import api from '@/api/axios';

// ── Tipos de respuesta por rol ──────────────────────────────────────────────

export interface AlertaItem {
  tipo: string;
  nivel: 'critico' | 'alto' | 'warning';
  mensaje: string;
  empresa_id?: string;
  evaluacion_id?: string;
  asignacion_id?: string;
}

// SuperAdmin
export interface DashboardSuperAdmin {
  rol: 'superadmin';
  kpis: {
    total_empresas: number;
    planes_vencidos: number;
    planes_por_vencer_30d: number;
    total_usuarios: number;
    total_proveedores: number;
    evaluaciones_encuesta_total: number;
    evaluaciones_encuesta_vencidas: number;
    evaluaciones_iq_total: number;
    evaluaciones_iq_completadas: number;
  };
  alertas: AlertaItem[];
  charts: {
    empresas_por_plan: { plan: string; total: number }[];
    evaluaciones_por_estado: { estado: string; total: number }[];
    proveedores_por_riesgo: { nivel_riesgo: string; total: number }[];
    usuarios_por_rol: { rol: string; total: number }[];
  };
}

// Admin
export interface DashboardAdmin {
  rol: 'administrador';
  kpis: {
    plan: {
      tipo: string;
      esta_activo: boolean;
      dias_restantes: number | null;
      max_usuarios: number;
    } | null;
    usuarios_activos: number;
    evaluaciones_encuesta: { activas: number; completadas: number; vencidas: number };
    evaluaciones_iq: { pendientes: number; en_auditoria: number; auditadas: number };
    asignaciones: {
      pendientes: number;
      en_progreso: number;
      pendiente_auditoria: number;
      vencidas: number;
    };
    proveedores: { total: number; riesgo_alto: number };
    gap_promedio: number | null;
  };
  alertas: AlertaItem[];
  charts: {
    progreso_evaluaciones: { estado: string; total: number }[];
    iq_por_estado: { estado: string; total: number }[];
    gap_por_seccion: {
      seccion: string;
      nivel_actual: number;
      nivel_deseado: number;
      gap: number;
      clasificacion_gap: string;
    }[];
    asignaciones_por_estado: { estado: string; total: number }[];
    proveedores_por_riesgo: { nivel_riesgo: string; total: number }[];
  };
}

// Auditor
export interface DashboardAuditor {
  rol: 'auditor';
  kpis: {
    iq_pendientes_auditoria: number;
    iq_en_revision_mia: number;
    iq_auditadas_este_mes: number;
    iq_vencidas: number;
    asignaciones_encuesta_pendientes: number;
    gap_promedio_mis_auditorias: number | null;
  };
  alertas: AlertaItem[];
  charts: {
    iq_por_estado: { estado: string; total: number }[];
    gap_clasificacion: { clasificacion: string; total: number }[];
    carga_semanal: { semana: string; total: number }[];
  };
}

// Usuario
export interface DashboardUsuario {
  rol: 'usuario' | 'analista_riesgos';
  kpis: {
    asignaciones_encuesta: {
      pendientes: number;
      en_progreso: number;
      completadas: number;
      vencidas: number;
      proxima_vencimiento: {
        id: string;
        fecha_limite: string;
        'dimension__nombre': string;
      } | null;
    };
    evaluaciones_iq: {
      pendientes: number;
      completadas: number;
      vencidas: number;
      proxima_vencimiento: {
        id: number;
        fecha_limite: string;
        'evaluacion__nombre': string;
      } | null;
    };
  };
  alertas: AlertaItem[];
  charts: {
    mis_asignaciones_por_estado: { estado: string; total: number }[];
    mis_iq_por_estado: { estado: string; total: number }[];
  };
}

export type DashboardResponse =
  | DashboardSuperAdmin
  | DashboardAdmin
  | DashboardAuditor
  | DashboardUsuario;

// ── Service ─────────────────────────────────────────────────────────────────

export const dashboardService = {

  getSummary: async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>('/v1/dashboard/summary/');
  return response.data;
 },
};