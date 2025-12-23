// src/pages/encuestas/components/EncuestaFilters.tsx

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/common';

interface EncuestaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export const EncuestaFilters: React.FC<EncuestaFiltersProps> = ({
  searchTerm,
  onSearchChange,
  showInactive,
  onShowInactiveChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Búsqueda */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Buscar evaluaciones..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>

      {/* Filtro de inactivas */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-500" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onShowInactiveChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Mostrar inactivas</span>
        </label>
      </div>
    </div>
  );
};