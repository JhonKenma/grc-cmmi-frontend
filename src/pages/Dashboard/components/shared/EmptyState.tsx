// src/pages/Dashboard/components/shared/EmptyState.tsx
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-600">{title}</p>
    {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-3 text-xs text-blue-600 hover:underline font-medium"
      >
        {action.label}
      </button>
    )}
  </div>
);