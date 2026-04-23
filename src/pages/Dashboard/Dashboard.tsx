// src/pages/Dashboard/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from './hooks/useDashboard';
import { DashboardSkeleton } from './components/shared/DashboardSkeleton';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditorDashboard } from './components/auditor/AuditorDashboard';
import { UsuarioDashboard } from './components/usuario/UsuarioDashboard';
import {
  DashboardSuperAdmin,
  DashboardAdmin,
  DashboardAuditor,
  DashboardUsuario,
} from '@/api/endpoints/dashboard.service';

export const Dashboard: React.FC = () => {
  const { user, isSuperAdmin, isAdmin, isAuditor } = useAuth();
  const { data, loading, error, refetch } = useDashboard();

  const welcomeSubtitle = isSuperAdmin
    ? 'Super Administrador del Sistema'
    : isAdmin
    ? `Administrador de ${user?.empresa_info?.nombre ?? ''}`
    : isAuditor
    ? 'Auditor'
    : 'Panel de Control';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.first_name || user?.nombre_completo}!
            </h1>
            <p className="text-gray-600 mt-1">{welcomeSubtitle}</p>
          </div>
          {!loading && (
            <button
              onClick={refetch}
              className="text-xs text-blue-600 hover:underline"
            >
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <DashboardSkeleton />}

      {/* Contenido por rol */}
      {!loading && data && (
        <>
          {data.rol === 'superadmin' && (
            <SuperAdminDashboard data={data as DashboardSuperAdmin} />
          )}
          {data.rol === 'administrador' && (
            <AdminDashboard data={data as DashboardAdmin} />
          )}
          {data.rol === 'auditor' && (
            <AuditorDashboard data={data as DashboardAuditor} />
          )}
          {(data.rol === 'usuario' || data.rol === 'analista_riesgos') && (
            <UsuarioDashboard data={data as DashboardUsuario} />
          )}
        </>
      )}
    </div>
  );
};