// src/pages/Dashboard/hooks/useAuditorKpiBadges.ts
import { useMemo } from 'react';
import { DashboardAuditor } from '@/api/endpoints/dashboard.service';

// ── Tipos ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'warning' | 'danger' | undefined;

export interface KpiBadge {
  text: string;
  variant: BadgeVariant;
}

export interface AuditorKpiBadges {
  iqPendientesBadge: KpiBadge | undefined;
  iqVencidasBadge: KpiBadge | undefined;
  encuestasPendientesBadge: KpiBadge | undefined;
  iqPendientesIconBg: string;
  iqVencidasIconBg: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Deriva los badges y colores condicionales de los KPIs del auditor.
 * Encapsula la lógica "si valor > 0, muestra advertencia" para
 * que el componente solo reciba el resultado final.
 */
export const useAuditorKpiBadges = (
  kpis: DashboardAuditor['kpis']
): AuditorKpiBadges => {
  return useMemo(() => {
    const iqPendientesBadge: KpiBadge | undefined =
      kpis.iq_pendientes_auditoria > 0
        ? { text: 'Requiere acción', variant: 'warning' }
        : undefined;

    const iqVencidasBadge: KpiBadge | undefined =
      kpis.iq_vencidas > 0
        ? { text: 'Vencidas', variant: 'danger' }
        : undefined;

    const encuestasPendientesBadge: KpiBadge | undefined =
      kpis.asignaciones_encuesta_pendientes > 0
        ? { text: 'En espera', variant: 'warning' }
        : undefined;

    const iqPendientesIconBg =
      kpis.iq_pendientes_auditoria > 0 ? 'bg-amber-500' : 'bg-gray-400';

    const iqVencidasIconBg =
      kpis.iq_vencidas > 0 ? 'bg-red-500' : 'bg-gray-400';

    return {
      iqPendientesBadge,
      iqVencidasBadge,
      encuestasPendientesBadge,
      iqPendientesIconBg,
      iqVencidasIconBg,
    };
  }, [kpis]);
};