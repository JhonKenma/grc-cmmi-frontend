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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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