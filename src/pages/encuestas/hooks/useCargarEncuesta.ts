// src/pages/encuestas/hooks/useCargarEncuesta.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { ROUTES } from '@/utils/constants';
import { downloadFile } from '@/utils/helpers';

// ── Schema ───────────────────────────────────────────────────────────────────

const cargarEncuestaSchema = z.object({
  archivo: z
    .instanceof(File, { message: 'Debes seleccionar un archivo' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'El archivo no puede superar los 5MB',
    })
    .refine(
      (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'xlsx' || ext === 'xls';
      },
      { message: 'Solo se permiten archivos Excel (.xlsx, .xls)' }
    ),
  nombre_encuesta: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(300, 'El nombre no puede superar los 300 caracteres'),
  version: z.string().max(20, 'La versión no puede superar los 20 caracteres').optional(),
  descripcion: z.string().optional(),
});

export type CargarEncuestaFormData = z.infer<typeof cargarEncuestaSchema>;

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useCargarEncuesta = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const form = useForm<CargarEncuestaFormData>({
    resolver: zodResolver(cargarEncuestaSchema),
    defaultValues: { version: '1.0' },
  });

  const archivo = form.watch('archivo');

  const handleDescargarPlantilla = async () => {
    try {
      setIsDownloadingTemplate(true);
      const blob = await encuestasApi.descargarPlantilla();
      downloadFile(blob, 'plantilla_encuesta.xlsx');
      success('Plantilla descargada correctamente');
    } catch (err: any) {
      showError(err?.message || 'Error al descargar la plantilla');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const onSubmit = async (data: CargarEncuestaFormData) => {
    try {
      const response = await encuestasApi.cargarExcel(data);
      success(response.message || 'Evaluación cargada exitosamente');
      setTimeout(() => navigate(ROUTES.ENCUESTAS), 1500);
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData?.errors) {
        showError(JSON.stringify(errorData.errors, null, 2));
      } else if (errorData?.message) {
        showError(errorData.message);
      } else if (errorData) {
        showError(JSON.stringify(errorData, null, 2));
      } else {
        showError('Error desconocido al cargar la encuesta');
      }
    }
  };

  const goToLista = () => navigate(ROUTES.ENCUESTAS);

  return {
    form,
    archivo,
    isDownloadingTemplate,
    onSubmit: form.handleSubmit(onSubmit),
    handleDescargarPlantilla,
    goToLista,
    // re-exportar Controller para usarlo en el componente con el mismo form
    Controller,
  };
};