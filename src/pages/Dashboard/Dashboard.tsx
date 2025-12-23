import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  // ==========================================
  // STATS CARDS (datos de ejemplo)
  // ==========================================
  const stats = [
    {
      name: 'Total Usuarios',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      show: isAdmin || isSuperAdmin,
    },
    {
      name: 'Empresas Activas',
      value: '12',
      icon: Building2,
      color: 'bg-green-500',
      show: isSuperAdmin,
    },
    {
      name: 'Encuestas Activas',
      value: '8',
      icon: FileText,
      color: 'bg-purple-500',
      show: true,
    },
    {
      name: 'Tareas Completadas',
      value: '45',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      show: true,
    },
    {
      name: 'Tareas Pendientes',
      value: '12',
      icon: Clock,
      color: 'bg-orange-500',
      show: true,
    },
    {
      name: 'Tareas Vencidas',
      value: '3',
      icon: AlertCircle,
      color: 'bg-red-500',
      show: true,
    },
  ];

  const visibleStats = stats.filter((stat) => stat.show);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.first_name || user?.nombre_completo}!
        </h1>
        <p className="text-gray-600 mt-1">
          {/* ✅ LÍNEA CORREGIDA */}
          {isSuperAdmin && 'Super Administrador del Sistema'}
          {isAdmin && !isSuperAdmin && `Administrador de ${user?.empresa_info?.nombre}`}
          {!isAdmin && !isSuperAdmin && 'Panel de Control'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <FileText size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Encuesta completada
                  </p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">Sección A</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};