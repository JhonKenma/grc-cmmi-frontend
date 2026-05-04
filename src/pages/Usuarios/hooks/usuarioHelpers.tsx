// src/pages/Usuarios/hooks/usuarioHelpers.tsx
import { Shield, UserCog, Eye, User } from 'lucide-react';

// ── Constantes ───────────────────────────────────────────────────────────────

const ROL_STYLES: Record<string, string> = {
  superadmin:    'bg-purple-100 text-purple-800',
  administrador: 'bg-blue-100   text-blue-800',
  auditor:       'bg-orange-100 text-orange-800',
  usuario:       'bg-gray-100   text-gray-800',
};

const ROL_LABELS: Record<string, string> = {
  superadmin:    'Super Admin',
  administrador: 'Admin',
  auditor:       'Auditor',
  usuario:       'Usuario',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const getRolIcon = (rol: string) => {
  switch (rol) {
    case 'superadmin':    return <Shield  className="w-4 h-4 text-purple-600" />;
    case 'administrador': return <UserCog className="w-4 h-4 text-blue-600"   />;
    case 'auditor':       return <Eye     className="w-4 h-4 text-orange-600" />;
    default:              return <User    className="w-4 h-4 text-gray-600"   />;
  }
};

export const getRolBadge = (rol: string) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
    ROL_STYLES[rol] ?? 'bg-gray-100 text-gray-800'
  }`}>
    {getRolIcon(rol)}
    {ROL_LABELS[rol] ?? rol}
  </span>
);