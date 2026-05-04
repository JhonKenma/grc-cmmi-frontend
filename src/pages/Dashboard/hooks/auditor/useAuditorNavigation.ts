// src/pages/Dashboard/hooks/useAuditorNavigation.ts
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// ── Rutas del módulo auditor ─────────────────────────────────────────────────

const ROUTES = {
  revisionesIq: '/auditor/revisiones-iq',
  revisiones: '/auditor/revisiones',
} as const;

// ── Tipos de retorno ─────────────────────────────────────────────────────────

export interface AuditorNavigation {
  goToRevisionesIq: () => void;
  goToRevisiones: () => void;
  routes: typeof ROUTES;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Centraliza la navegación del dashboard auditor.
 * Permite cambiar rutas en un solo lugar sin tocar los componentes.
 */
export const useAuditorNavigation = (): AuditorNavigation => {
  const navigate = useNavigate();

  const goToRevisionesIq = useCallback(
    () => navigate(ROUTES.revisionesIq),
    [navigate]
  );

  const goToRevisiones = useCallback(
    () => navigate(ROUTES.revisiones),
    [navigate]
  );

  return {
    goToRevisionesIq,
    goToRevisiones,
    routes: ROUTES,
  };
};