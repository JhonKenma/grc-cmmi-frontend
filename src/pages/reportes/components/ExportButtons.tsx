// src/pages/reportes/components/ExportButtons.tsx

import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { useExportButtons } from '../hooks/useExportButtons';

interface ExportButtonsProps {
  evaluacionId: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ evaluacionId }) => {
  const { loadingPDF, loadingExcel, handleExportExcel, handleExportPDF } =
    useExportButtons(evaluacionId);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportExcel}
        disabled={loadingExcel}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
      >
        <FileSpreadsheet size={18} />
        {loadingExcel ? 'Generando...' : 'Excel'}
      </button>
      
      <button
        onClick={handleExportPDF}
        disabled={loadingPDF}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
      >
        <FileText size={18} />
        {loadingPDF ? 'Generando...' : 'PDF'}
      </button>
    </div>
  );
};
