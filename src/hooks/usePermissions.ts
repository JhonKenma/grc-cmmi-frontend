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
        canManageEncuestas: false,
      };
    }

    const isSuperuser = user.rol === 'superadmin';
    const isAdmin = user.rol === 'administrador';
    const isUser = user.rol === 'usuario';
    const isAuditor = user.rol === 'auditor';

    return {
      isSuperuser,
      isAdmin,
      isUser,
      isAuditor,
      canManageEncuestas: isSuperuser || isAdmin,
    };
  }, [user]);

  return permissions;
};