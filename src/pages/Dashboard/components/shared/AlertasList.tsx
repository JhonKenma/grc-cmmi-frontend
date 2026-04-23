// src/pages/Dashboard/components/shared/AlertasList.tsx
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AlertaItem } from '@/api/endpoints/dashboard.service';

interface AlertasListProps {
  alertas: AlertaItem[];
}

const nivelConfig = {
  critico: { icon: AlertCircle,   classes: 'bg-red-50 border-red-200 text-red-800',    iconClass: 'text-red-500' },
  alto:    { icon: AlertTriangle, classes: 'bg-orange-50 border-orange-200 text-orange-800', iconClass: 'text-orange-500' },
  warning: { icon: Info,          classes: 'bg-yellow-50 border-yellow-200 text-yellow-800', iconClass: 'text-yellow-500' },
};

export const AlertasList: React.FC<AlertasListProps> = ({ alertas }) => {
  if (!alertas.length) return null;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h2>
      <div className="space-y-3">
        {alertas.map((alerta, idx) => {
          const config = nivelConfig[alerta.nivel] ?? nivelConfig.warning;
          const Icon = config.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.classes}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${config.iconClass}`} />
              <p className="text-sm">{alerta.mensaje}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};