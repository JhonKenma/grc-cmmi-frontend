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
  CheckSquare,
  Brain,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { FolderKanban } from 'lucide-react'; 


interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // MENÚ DE NAVEGACIÓN ⭐ ACTUALIZADO
  // ==========================================
  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['superadmin', 'administrador', 'usuario', 'auditor', 'analista_riesgos'],
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: '/usuarios',
      roles: ['superadmin', 'administrador', 'auditor'],
    },
   {
      name: 'Mis Revisiones',
      icon: ShieldCheck,
      path: '/auditor/revisiones',
      roles: ['auditor'],
    },

    {
      name: 'Empresas',
      icon: Building2,
      path: '/empresas',
      roles: ['superadmin'],
      requireSuperAdmin: true,
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
      roles: ['superadmin', 'administrador', 'auditor'],
    },
    {
      name: 'Asignaciones',
      icon: ClipboardList,
      path: '/asignaciones/mis-evaluaciones',
      roles: ['superadmin', 'administrador'],
    },
    {
      name: 'Mis evaluaciones',
      icon: ClipboardList,
      path: '/mis-tareas',
      roles: ['usuario'],
    },
    
    // ⭐ NUEVO: Mis Evaluaciones IQ (Usuario)
    {
      name: 'Mis Evaluaciones IQ',
      icon: CheckSquare,
      path: '/evaluaciones-iq/mis-asignaciones',
      roles: ['usuario'],
    },
    
    {
      name: 'Análisis GAP',
      icon: BarChart3,
      path: '/reportes/evaluacion',
      roles: ['superadmin', 'administrador'],
    }, 

    {
    name: 'Análisis GAP IQ',
    icon: ShieldCheck,
    path: '/reportes/evaluacion-iq',
    roles: ['superadmin', 'administrador'],
  },
    {
      name: 'Mis Proyectos',
      icon: FolderKanban,
      path: '/mis-proyectos',
      roles: ['superadmin', 'administrador', 'usuario'],
    },
    
    // ⭐ NUEVO: Gestión de Riesgos
    {
      name: 'Gestión de Riesgos',
      icon: ShieldCheck,
      path: '/riesgos/dashboard',
      roles: ['superadmin', 'administrador', 'auditor', 'analista_riesgos'],
    },
    
    // ⭐ ACTUALIZADO: Evaluaciones IQ (Admin/SuperAdmin)
    {
      name: 'Evaluaciones IQ',
      icon: Brain,
      path: '/evaluaciones-inteligentes',
      roles: ['superadmin', 'administrador'],
    },
    // ⭐ NUEVO: Asignar Frameworks (SuperAdmin)
    {
      name: 'Asignar Frameworks',
      icon: Package,
      path: '/evaluaciones-inteligentes/asignar-frameworks',
      roles: ['superadmin'],
    },
  
    
    // ⭐ NUEVO: Gestionar Asignaciones (Admin)
    {
      name: 'G-Asignaciones',
      icon: CheckSquare,
      path: '/evaluaciones-inteligentes/gestionar-asignaciones',
      roles: ['administrador'],
    },

    // ⭐ AGREGADO: Maestro de Documentos
    {
      name: 'Gobierno',
      icon: FileText,
      path: '/documentos-maestros',
      roles: ['administrador'],
      requireSuperAdmin: false,
    },
  ];

  // Filtrar menú según permisos
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requireSuperAdmin && !isSuperAdmin) return false;
    if (!user) return false;
    return item.roles.includes(user.rol);
  });

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/riesgos/dashboard') {
      return location.pathname.startsWith('/riesgos');
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // ✅ Navega después de que logout limpió todo
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
                src="/logo_min.png"
                alt="ShieldGrid" 
                className="h-10 w-10 object-contain"
              />
              <div className="flex items-baseline gap-1">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  ShieldGrid
                </h1>
                <span className="text-xl font-bold text-blue-500">
                  365
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2 overflow-y-auto flex-1">
          {visibleMenuItems.map((item: any, idx: number) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const itemKey = item.path || `menu-${item.name}-${idx}`;

            // Dividers
            if (item.name === 'divider') {
              return <div key={`divider-${idx}`} className="border-t border-gray-200 my-2" />;
            }

            return (
              <div key={itemKey}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  } ${!sidebarOpen && 'justify-center'}`}
                  title={!sidebarOpen ? item.name : ''}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </div>
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
          <div className="flex items-center gap-6">
            {/* Campanita de notificaciones con enlace */}
            <Link
              to="/notificaciones"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <NotificationBell />
              <span className="text-sm font-medium text-gray-700">
                Notificaciones
              </span>
            </Link>

            {/* Separador visual */}
            <div className="h-8 w-px bg-gray-200"></div>

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
                    {user?.rol === 'superadmin'
                      ? 'Super Admin'
                      : user?.rol === 'analista_riesgos'
                        ? 'Analista de Riesgos'
                        : user?.rol}
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
