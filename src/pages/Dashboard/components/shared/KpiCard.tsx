// src/pages/Dashboard/components/shared/KpiCard.tsx
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg: string;        // e.g. 'bg-blue-500'
  trend?: {
    value: number;       // positivo o negativo
    label: string;
  };
  badge?: {
    text: string;
    variant: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  };
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

const badgeVariants = {
  danger:  'bg-red-100 text-red-700 border border-red-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  success: 'bg-green-100 text-green-700 border border-green-200',
  info:    'bg-blue-100 text-blue-700 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label, value, icon: Icon, iconBg, trend, badge, onClick, href, disabled
}) => {
  const navigate = useNavigate();
  const isClickable = (onClick || href) && !disabled;

  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    else if (href) navigate(href);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl border border-gray-200 p-5
        transition-all duration-200
        ${isClickable
          ? 'cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98]'
          : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5 tabular-nums">
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}

          {/* Badge */}
          {badge && (
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${badgeVariants[badge.variant]}`}>
              {badge.text}
            </span>
          )}
        </div>

        <div className={`${iconBg} p-2.5 rounded-lg ml-3 shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Click hint */}
      {isClickable && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">Ver detalle</span>
          <span className="text-xs text-gray-400">→</span>
        </div>
      )}
    </div>
  );
};