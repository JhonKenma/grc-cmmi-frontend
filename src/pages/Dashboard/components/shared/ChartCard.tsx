// src/pages/Dashboard/components/shared/ChartCard.tsx
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
  height?: string; // e.g. 'h-64'
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title, subtitle, children, action, height = 'h-64'
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {action.label} →
        </button>
      )}
    </div>
    <div className={height}>
      {children}
    </div>
  </div>
);