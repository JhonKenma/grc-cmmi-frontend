// src/pages/encuestas/EditarNivel.tsx
import React from 'react';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useEditarNivel } from './hooks';

export const EditarNivel: React.FC = () => {
  const { isLoading, nivelNumero, nivelColor, form, onSubmit, goToDetalle } = useEditarNivel();
  const { register, formState: { errors, isSubmitting } } = form;

  if (isLoading) return <LoadingScreen message="Cargando nivel..." />;

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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Editar Nivel {nivelNumero}</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${nivelColor.bg} ${nivelColor.border} border`}>
            <Star size={16} className={nivelColor.text} />
            <span className={`text-sm font-medium ${nivelColor.text}`}>Nivel {nivelNumero}</span>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Actualiza la descripción y recomendaciones del nivel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Nivel de Madurez</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                {...register('descripcion')}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe qué caracteriza este nivel de madurez..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Explica claramente qué significa alcanzar este nivel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recomendaciones (Opcional)
              </label>
              <textarea
                {...register('recomendaciones')}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="¿Qué se recomienda hacer para alcanzar este nivel?"
              />
              <p className="mt-1 text-xs text-gray-500">
                Proporciona acciones concretas para alcanzar este nivel
              </p>
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