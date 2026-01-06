// src/pages/reportes/components/ExportButtons.tsx

import React, { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/common';
import axiosInstance from '@/api/axios'; // ⭐ IMPORTAR DESDE axiosConfig
import toast from 'react-hot-toast';

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
      
      const response = await axiosInstance.get('/reportes/export_pdf_completo/', {
        params: { evaluacion_empresa_id: evaluacionId },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Evaluacion_${evaluacionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error al exportar PDF:', error);
      
      if (error.response?.status === 404) {
        toast.success('Exportación PDF próximamente disponible');
      } else {
        toast.error(error.response?.data?.message || 'Error al generar PDF');
      }
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="md"
        onClick={handleExportExcel}
        disabled={loadingExcel}
        className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20"
      >
        <FileSpreadsheet size={18} className="mr-2" />
        {loadingExcel ? 'Generando...' : 'Descargar Excel'}
      </Button>
      
      <Button
        variant="secondary"
        size="md"
        onClick={handleExportPDF}
        disabled={loadingPDF}
        className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20"
      >
        <FileText size={18} className="mr-2" />
        {loadingPDF ? 'Generando...' : 'Descargar PDF'}
      </Button>
    </div>
  );
};