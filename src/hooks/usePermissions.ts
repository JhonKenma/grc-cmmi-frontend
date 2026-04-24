// src/hooks/usePermissions.ts

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        isSuperuser: false,
        isAdmin: false,
        isUser: false,
        isAuditor: false,
        isRiskAnalyst: false,
        canManageEncuestas: false,
        canOperateRiesgos: false,
      };
    }

    const isSuperuser = user.rol === 'superadmin';
    const isAdmin = user.rol === 'administrador';
    const isUser = user.rol === 'usuario';
    const isAuditor = user.rol === 'auditor';
    const isRiskAnalyst = user.rol === 'analista_riesgos';

    return {
      isSuperuser,
      isAdmin,
      isUser,
      isAuditor,
      isRiskAnalyst,
      canManageEncuestas: isSuperuser || isAdmin,
      canOperateRiesgos: isSuperuser || isAdmin || isRiskAnalyst,
    };
  }, [user]);

  return permissions;
};