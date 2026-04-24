import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Rol } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Rol[];
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user, loading, isSuperAdmin } = useAuth();

  // Mostrar loading mientras se carga el usuario
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600" />
          <p className="text-sm font-medium text-slate-600">Cargando sesion...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere superadmin y no lo es
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si hay roles permitidos, verificar que el usuario tenga uno
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};