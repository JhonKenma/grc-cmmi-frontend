// src/pages/encuestas/CargarEncuesta.tsx
import React from 'react';
import { Controller } from 'react-hook-form';
import {
  FileSpreadsheet, Download, Upload, ArrowLeft, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FileUpload } from '@/components/common/FileUpload';
import { useCargarEncuesta } from './hooks';

export const CargarEncuesta: React.FC = () => {
  const {
    form,
    archivo,
    isDownloadingTemplate,
    onSubmit,
    handleDescargarPlantilla,
    goToLista,
  } = useCargarEncuesta();

  const { register, control, formState: { errors, isSubmitting } } = form;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={goToLista}
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
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <Input
                  {...register('nombre_encuesta')}
                  label="Nombre de la Evaluación"
                  placeholder="Ej: Evaluación de Madurez Digital 2025"
                  error={errors.nombre_encuesta?.message}
                  required
                />

                <Input
                  {...register('version')}
                  label="Versión"
                  placeholder="Ej: 1.0"
                  error={errors.version?.message}
                  helperText="Puedes usar números o letras (Ej: 1.0, v2.5, 2025-Q1)"
                />

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

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={goToLista}>
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

        {/* Sidebar */}
        <div className="space-y-6">
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

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Estructura del Excel
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start"><span className="mr-2">•</span><span>Cada pregunta debe tener 5 niveles (1, 2, 3, 4, 5)</span></li>
                <li className="flex items-start"><span className="mr-2">•</span><span>Los niveles se colocan en filas separadas</span></li>
                <li className="flex items-start"><span className="mr-2">•</span><span>Agrupa preguntas por secciones/dimensiones</span></li>
                <li className="flex items-start"><span className="mr-2">•</span><span>Usa códigos únicos para cada pregunta</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <AlertTriangle size={18} className="mr-2" />
                Importante
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start"><span className="mr-2">⚠️</span><span>No modifiques los nombres de las columnas</span></li>
                <li className="flex items-start"><span className="mr-2">⚠️</span><span>Tamaño máximo: 5MB</span></li>
                <li className="flex items-start"><span className="mr-2">⚠️</span><span>Solo archivos .xlsx o .xls</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};