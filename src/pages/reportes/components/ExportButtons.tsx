// src/pages/reportes/components/ExportButtons.tsx

import React, { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import axiosInstance from '@/api/axios';
import toast from 'react-hot-toast';
import { reportesApi } from '@/api/endpoints/reportes.api';
import { generateEvaluationPDF } from '@/utils/reportes-pdf';

interface ExportButtonsProps {
  evaluacionId: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ evaluacionId }) => {
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleExportExcel = async () => {
    try {
      setLoadingExcel(true);
      
      const response = await axiosInstance.get('/reportes/export_excel_completo/', {
        params: { evaluacion_empresa_id: evaluacionId },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Evaluacion_${evaluacionId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel descargado exitosamente');
    } catch (error: any) {
      console.error('Error al exportar Excel:', error);
      toast.error(error.response?.data?.message || 'Error al generar Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoadingPDF(true);

      const reporte = await reportesApi.getReporteEvaluacion(evaluacionId);
      generateEvaluationPDF({
        evaluacionId,
        reporte,
      });

      toast.success('PDF generado exitosamente con recomendaciones dinamicas');
    } catch (error: any) {
      console.error('Error al generar PDF en frontend:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al generar PDF';
      toast.error(errorMessage);
    } finally {
      setLoadingPDF(false);
    }
  };

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
