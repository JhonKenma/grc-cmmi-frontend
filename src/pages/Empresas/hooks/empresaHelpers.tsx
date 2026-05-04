// src/pages/Empresas/hooks/empresaHelpers.tsx
import { Shield, Clock } from 'lucide-react';
import { Empresa } from '@/types';

const PLAN_COLORS: Record<string, string> = {
  demo:        'bg-yellow-100 text-yellow-800',
  basico:      'bg-blue-100   text-blue-800',
  profesional: 'bg-purple-100 text-purple-800',
  enterprise:  'bg-green-100  text-green-800',
};

export const PlanBadge = ({ empresa }: { empresa: Empresa }) => {
  const plan = empresa.plan;

  if (!plan) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Sin plan
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[plan.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
        <Shield size={10} />
        {plan.tipo_display}
      </span>
      {plan.dias_restantes !== null && (
        <span className={`inline-flex items-center gap-1 text-xs ${plan.dias_restantes <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
          <Clock size={10} />
          {plan.dias_restantes}d restantes
        </span>
      )}
      {!plan.esta_activo && (
        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
          ⚠ Expirado
        </span>
      )}
    </div>
  );
};