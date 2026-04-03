// src/pages/PlanExpirado.tsx
import { Shield, Mail, Phone } from 'lucide-react';

export const PlanExpirado = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield size={32} className="text-red-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Plan expirado
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        El plan de tu empresa ha vencido y el acceso está suspendido
        temporalmente. Contacta a ShieldGrid 365 para renovar.
      </p>

      <div className="space-y-3">
        <a
          href="mailto:soporte@shieldgrid365.com"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          <Mail size={18} />
          soporte@shieldgrid365.com
        </a>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Una vez renovado el plan, podrás ingresar nuevamente sin perder
        ningún dato.
      </p>
    </div>
  </div>
);