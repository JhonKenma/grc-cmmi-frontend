import { useState } from 'react';
import axiosInstance from '@/api/axios';
import toast from 'react-hot-toast';
import { reportesApi } from '@/api/endpoints/reportes.api';
import { generateEvaluationPDF } from '@/utils/reportes-pdf';

export const useExportButtons = (evaluacionId: string) => {
  const [loadingPDF,   setLoadingPDF]   = useState(false);
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
      const a   = document.createElement('a');
      a.href     = url;
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
      generateEvaluationPDF({ evaluacionId, reporte });
      toast.success('PDF generado exitosamente con recomendaciones dinamicas');
    } catch (error: any) {
      console.error('Error al generar PDF en frontend:', error);
      toast.error(error.response?.data?.message || error.message || 'Error al generar PDF');
    } finally {
      setLoadingPDF(false);
    }
  };

  return { loadingPDF, loadingExcel, handleExportExcel, handleExportPDF };
};
