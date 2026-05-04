// src/pages/encuestas/EditarPregunta.tsx
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useEditarPregunta } from './hooks';

export const EditarPregunta: React.FC = () => {
  const { isLoading, form, onSubmit, goToDetalle } = useEditarPregunta();
  const { register, formState: { errors, isSubmitting } } = form;

  if (isLoading) return <LoadingScreen message="Cargando pregunta..." />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={goToDetalle}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la Evaluación
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Pregunta</h1>
        <p className="text-gray-600 mt-2">Actualiza los datos de la pregunta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Pregunta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              {...register('codigo')}
              label="Código"
              placeholder="Ej: GOB-1.1"
              error={errors.codigo?.message}
              required
              helperText="Código único de la pregunta dentro de su dimensión"
            />

            <Input
              {...register('titulo')}
              label="Título"
              placeholder="Ej: Política de Seguridad"
              error={errors.titulo?.message}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto de la Pregunta *
              </label>
              <textarea
                {...register('texto')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="¿Existe una política de seguridad documentada y aprobada?"
              />
              {errors.texto && (
                <p className="mt-1 text-sm text-red-600">{errors.texto.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('peso')}
                type="text"
                label="Peso"
                placeholder="1.0"
                error={errors.peso?.message}
                required
                helperText="Ponderación de la pregunta"
              />
              <Input
                {...register('orden')}
                type="text"
                label="Orden"
                placeholder="1"
                error={errors.orden?.message}
                required
                helperText="Orden de aparición"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register('obligatoria')}
                type="checkbox"
                id="obligatoria"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="obligatoria" className="text-sm font-medium text-gray-700">
                Pregunta obligatoria
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={goToDetalle}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Save size={18} className="mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};