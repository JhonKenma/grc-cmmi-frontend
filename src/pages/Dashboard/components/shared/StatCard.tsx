// src/pages/Dashboard/components/shared/StatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  name: string;
  value: number | string;
  icon: LucideIcon;
  color: string;       // bg-blue-500, bg-red-500, etc.
  badge?: {
    label: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
  };
}

const badgeClasses = {
  danger:  'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  success: 'bg-green-100 text-green-700',
  info:    'bg-blue-100 text-blue-700',
};

export const StatCard: React.FC<StatCardProps> = ({ name, value, icon: Icon, color, badge }) => (
  <div className="card hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{name}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {badge && (
          <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${badgeClasses[badge.variant]}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);