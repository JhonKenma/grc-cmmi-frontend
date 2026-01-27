// src/components/layout/MainLayout.tsx

import { ReactNode, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  ClipboardList, 
  LogOut,
  ChevronDown,
  User,
  Upload,
  Bell,
  BarChart3,  
  Truck,
  CheckSquare
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { FolderKanban } from 'lucide-react'; 


interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // MENÚ DE NAVEGACIÓN
  // ==========================================
  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['superadmin', 'administrador', 'usuario', 'auditor'],
    },
    {
      name: 'Empresas',
      icon: Building2,
      path: '/empresas',
      roles: ['superadmin'],
      requireSuperAdmin: true,
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: '/usuarios',
      roles: ['superadmin', 'administrador', 'auditor'],
    },
    {
      name: 'Proveedores',
      icon: Truck,
      path: '/proveedores',
      roles: ['superadmin', 'administrador'],
    },

    {
      name: 'Evaluaciones',
      icon: FileText,
      path: '/encuestas',
      roles: ['superadmin', 'administrador', 'usuario', 'auditor'],
    },
    {
      name: 'Cargar Evaluación',
      icon: Upload,
      path: '/encuestas/cargar',
      roles: ['superadmin'],
      requireSuperAdmin: true,
    },
    {
      name: 'Asignaciones',
      icon: ClipboardList,
      path: '/asignaciones/mis-evaluaciones',
      roles: ['superadmin', 'administrador'],
    },
    {
      name: 'Mis Tareas',
      icon: ClipboardList,
      path: '/mis-tareas',
      roles: ['usuario'],
    },
    // ⭐ AGREGAR ITEM DE REPORTES
    {
      name: 'Análisis GAP',
      icon: BarChart3,
      path: '/reportes/evaluacion',
      roles: ['superadmin', 'administrador'],
    },
    {
      name: 'Mis Proyectos',
      icon: FolderKanban, // ⚠️ Importar este icono
      path: '/mis-proyectos',
      roles: ['superadmin', 'administrador', 'usuario', 'auditor'],
    },
    {
    name: 'Aprobaciones',
    icon: CheckSquare, // Importar: import { CheckSquare } from 'lucide-react';
    path: '/aprobaciones-pendientes',
    roles: ['superadmin', 'administrador'],
    },
  ];

  // Filtrar menú según permisos
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requireSuperAdmin && !isSuperAdmin) return false;
    if (!user) return false;
    return item.roles.includes(user.rol);
  });

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ==========================================
          SIDEBAR
          ========================================== */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-30`}
      >
        {/* Logo y Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img 
                src="/logo-grc.jpeg"
                alt="SHIELDGrid" 
                className="h-12 w-12 rounded-lg object-cover shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  ShieldGrid
                </h1>
                <p className="text-xs text-gray-500 font-medium">Sistema GRC</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.name : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ==========================================
          MAIN CONTENT
          ========================================== */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find((item) => isActive(item.path))?.name || 'Dashboard'}
            </h2>
          </div>

          {/* Área de Notificaciones y User Menu */}
          <div className="flex items-center gap-4">
            {/* Campanita de notificaciones */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nombre_completo}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.rol === 'superadmin' ? 'Super Admin' : user?.rol}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nombre_completo}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-primary-600" />
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.nombre_completo}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      
                      {user?.rol !== 'superadmin' && user?.empresa_info && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.empresa_info.nombre}
                        </p>
                      )}
                      
                      {user?.rol === 'superadmin' && (
                        <p className="text-xs text-primary-600 font-medium mt-1">
                          Super Administrador
                        </p>
                      )}
                    </div>

                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Mi Perfil
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};