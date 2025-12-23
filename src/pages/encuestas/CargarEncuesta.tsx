// src/pages/encuestas/CargarEncuesta.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FileUpload } from '@/components/common/FileUpload';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { ROUTES } from '@/utils/constants';
import { downloadFile } from '@/utils/helpers';

/**
 * Schema de validación
 */
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

type CargarEncuestaFormData = z.infer<typeof cargarEncuestaSchema>;

/**
 * Página para cargar encuesta desde Excel
 */
export const CargarEncuesta: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CargarEncuestaFormData>({
    resolver: zodResolver(cargarEncuestaSchema),
    defaultValues: {
      version: '1.0',
    },
  });

  const archivo = watch('archivo');

  /**
   * Descargar plantilla Excel
   */
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

  /**
   * Procesar formulario
   */
  const onSubmit = async (data: CargarEncuestaFormData) => {
    try {
      const response = await encuestasApi.cargarExcel(data);
      
      success(response.message || 'Evaluación cargada exitosamente');
      
      setTimeout(() => {
        navigate(ROUTES.ENCUESTAS);
      }, 1500);
    } catch (err: any) {
      // ✅ AGREGAR ESTOS LOGS DETALLADOS
      console.error('❌ ERROR COMPLETO:', err);
      console.error('❌ ERROR RESPONSE:', err?.response);
      console.error('❌ ERROR DATA:', err?.response?.data);
      console.error('❌ ERROR STATUS:', err?.response?.status);
      
      // Mostrar el error completo en la notificación
      const errorData = err?.response?.data;
      
      if (errorData) {
        // Si hay errores de validación
        if (errorData.errors) {
          console.error('📋 Errores de validación:', errorData.errors);
          showError(JSON.stringify(errorData.errors, null, 2));
        } 
        // Si hay un mensaje
        else if (errorData.message) {
          showError(errorData.message);
        }
        // Mostrar el objeto completo
        else {
          showError(JSON.stringify(errorData, null, 2));
        }
      } else {
        showError('Error desconocido al cargar la encuesta');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(ROUTES.ENCUESTAS)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Encuestas
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileSpreadsheet className="mr-3 text-primary-600" size={32} />
          Cargar Evaluación desde Excel
        </h1>
        <p className="text-gray-600 mt-2">
          Sube un archivo Excel con la estructura de tu evaluación de madurez
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre de la encuesta */}
                <Input
                  {...register('nombre_encuesta')}
                  label="Nombre de la Evaluación"
                  placeholder="Ej: Evaluación de Madurez Digital 2025"
                  error={errors.nombre_encuesta?.message}
                  required
                />

                {/* Versión */}
                <Input
                  {...register('version')}
                  label="Versión"
                  placeholder="Ej: 1.0"
                  error={errors.version?.message}
                  helperText="Puedes usar números o letras (Ej: 1.0, v2.5, 2025-Q1)"
                />

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    {...register('descripcion')}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe brevemente esta evaluación..."
                  />
                </div>

                {/* Upload de archivo */}
                <Controller
                  name="archivo"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Archivo Excel"
                      accept=".xlsx,.xls"
                      maxSize={5}
                      onChange={field.onChange}
                      value={field.value}
                      error={errors.archivo?.message}
                      helperText="Sube tu archivo Excel con la estructura de la evaluación de madurez."
                    />
                  )}
                />

                {/* Botones */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(ROUTES.ENCUESTAS)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={!archivo || isSubmitting}
                  >
                    <Upload size={18} className="mr-2" />
                    Cargar Evaluación
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con instrucciones */}
        <div className="space-y-6">
          {/* Descargar plantilla */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Download size={18} className="mr-2 text-primary-600" />
                Plantilla Excel
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Descarga la plantilla para ver el formato correcto
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleDescargarPlantilla}
                isLoading={isDownloadingTemplate}
              >
                <Download size={16} className="mr-2" />
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Estructura del Excel
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Cada pregunta debe tener 5 niveles (1, 2, 3, 4, 5)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Los niveles se colocan en filas separadas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Agrupa preguntas por secciones/dimensiones</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Usa códigos únicos para cada pregunta</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Advertencias */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <AlertTriangle size={18} className="mr-2" />
                Importante
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>No modifiques los nombres de las columnas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>Tamaño máximo: 5MB</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>Solo archivos .xlsx o .xls</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};