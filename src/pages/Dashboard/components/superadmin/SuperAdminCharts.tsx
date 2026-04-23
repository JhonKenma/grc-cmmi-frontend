// src/pages/Dashboard/components/superadmin/SuperAdminCharts.tsx
import { DashboardSuperAdmin } from '@/api/endpoints/dashboard.service';

// Etiquetas legibles para estados y roles
const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa', en_progreso: 'En Progreso', completada: 'Completada',
  vencida: 'Vencida', cancelada: 'Cancelada', pendiente: 'Pendiente',
  auditada: 'Auditada', aprobada: 'Aprobada', rechazada: 'Rechazada',
};

const PLAN_LABELS: Record<string, string> = {
  demo: 'Demo', basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise',
};

const ROL_LABELS: Record<string, string> = {
  administrador: 'Administrador', usuario: 'Usuario',
  auditor: 'Auditor', analista_riesgos: 'Analista',
};

const RIESGO_COLORS: Record<string, string> = {
  alto: 'bg-red-500', medio: 'bg-orange-400', bajo: 'bg-green-500',
};

const PLAN_COLORS: Record<string, string> = {
  demo: 'bg-gray-400', basico: 'bg-blue-400',
  profesional: 'bg-purple-500', enterprise: 'bg-violet-600',
};

interface Props {
  charts: DashboardSuperAdmin['charts'];
}

// Barra horizontal simple reutilizable
const BarChart: React.FC<{ items: { label: string; value: number; colorClass: string }[] }> = ({ items }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-semibold text-gray-900">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`${item.colorClass} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SuperAdminCharts: React.FC<Props> = ({ charts }) => {
  const empresasPorPlan = charts.empresas_por_plan.map((d) => ({
    label: PLAN_LABELS[d.plan] ?? d.plan,
    value: d.total,
    colorClass: PLAN_COLORS[d.plan] ?? 'bg-gray-400',
  }));

  const evalsPorEstado = charts.evaluaciones_por_estado.map((d) => ({
    label: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    colorClass: d.estado === 'vencida' ? 'bg-red-500' : d.estado === 'completada' ? 'bg-green-500' : 'bg-blue-500',
  }));

  const proveedoresPorRiesgo = charts.proveedores_por_riesgo.map((d) => ({
    label: d.nivel_riesgo.charAt(0).toUpperCase() + d.nivel_riesgo.slice(1),
    value: d.total,
    colorClass: RIESGO_COLORS[d.nivel_riesgo] ?? 'bg-gray-400',
  }));

  const usuariosPorRol = charts.usuarios_por_rol.map((d) => ({
    label: ROL_LABELS[d.rol] ?? d.rol,
    value: d.total,
    colorClass: 'bg-indigo-500',
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Empresas por Plan</h3>
        <BarChart items={empresasPorPlan} />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Evaluaciones por Estado</h3>
        <BarChart items={evalsPorEstado} />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Proveedores por Riesgo</h3>
        <BarChart items={proveedoresPorRiesgo} />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Usuarios por Rol</h3>
        <BarChart items={usuariosPorRol} />
      </div>
    </div>
  );
};