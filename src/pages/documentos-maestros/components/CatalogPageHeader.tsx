import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';

interface CatalogPageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onBack: () => void;
  backTitle?: string;
  action?: React.ReactNode;
}

export const CatalogPageHeader: React.FC<CatalogPageHeaderProps> = ({
  title,
  description,
  icon,
  onBack,
  backTitle = 'Volver',
  action,
}) => {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 border border-gray-200 shadow-sm bg-white text-gray-500 hover:text-gray-700"
          title={backTitle}
        >
          <ArrowLeft size={20} />
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>

      {action}
    </div>
  );
};
