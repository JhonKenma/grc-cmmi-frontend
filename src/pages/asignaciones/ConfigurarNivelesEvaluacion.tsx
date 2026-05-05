// src/pages/evaluaciones/ConfigurarNivelesEvaluacion.tsx
import React from 'react';
import { ArrowLeft, Target, Save, AlertCircle } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { useConfigurarNiveles, getNivelColor, getNivelNombre } from '../asignaciones/hooks';

export const ConfigurarNivelesEvaluacion: React.FC = () => {
  const {
    evaluacion, loading, saving,
    dimensiones, niveles, setNiveles, motivos, setMotivos,
    progreso, todasConfiguradas,
    handleSubmit, goToLista,
  } = useConfigurarNiveles();

  if (loading) return <LoadingScreen message="Cargando evaluación..." />;

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluación no encontrada</h3>
        <Button variant="secondary" onClick={goToLista}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={goToLista}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar Niveles Deseados</h1>
          <p className="text-gray-600 mt-1">
            {evaluacion.encuesta_info?.nombre} - {evaluacion.empresa_info?.nombre}
          </p>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Target size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">¿Qué son los niveles deseados?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Define el nivel objetivo que tu empresa quiere alcanzar en cada dimensión</li>
              <li>• Esto permitirá calcular el GAP entre el nivel actual y el objetivo</li>
              <li>• Debes configurar el nivel deseado para TODAS las dimensiones</li>
            </ul>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {dimensiones.map((dimension, index) => (
          <Card
            key={dimension.id}
            className={!niveles[dimension.id] ? 'border-2 border-yellow-300 bg-yellow-50' : ''}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{dimension.nombre}</h3>
                    {!niveles[dimension.id] && (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {dimension.codigo} • {dimension.total_preguntas} preguntas
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel Deseado <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((nivel) => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setNiveles({ ...niveles, [dimension.id]: nivel })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        niveles[dimension.id] === nivel
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 ${getNivelColor(nivel)} text-white rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-2`}>
                        {nivel}
                      </div>
                      <p className="text-xs text-gray-900 font-medium text-center">
                        {getNivelNombre(nivel)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificación (Opcional)
                </label>
                <input
                  type="text"
                  value={motivos[dimension.id] || ''}
                  onChange={(e) => setMotivos({ ...motivos, [dimension.id]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="¿Por qué se eligió este nivel objetivo?"
                />
              </div>
            </div>
          </Card>
        ))}

        {/* Resumen */}
        <Card className="bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Progreso de configuración</p>
              <p className="text-xs text-gray-600 mt-1">
                {Object.keys(niveles).length} de {dimensiones.length} dimensiones configuradas
              </p>
            </div>
            <p className="text-2xl font-bold text-primary-600">{progreso}%</p>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </Card>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={saving || !todasConfiguradas}>
            {saving ? 'Guardando...' : (
              <><Save size={18} className="mr-2" /> Guardar y Continuar</>
            )}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={goToLista}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};