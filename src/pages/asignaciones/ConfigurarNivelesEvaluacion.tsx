// src/pages/evaluaciones/ConfigurarNivelesEvaluacion.tsx - VERSIÓN LIMPIA

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, AlertCircle } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import { configNivelesApi, ConfiguracionMultiple } from '@/api/endpoints/config-niveles.api';
import toast from 'react-hot-toast';

export const ConfigurarNivelesEvaluacion: React.FC = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [dimensiones, setDimensiones] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (evaluacionId) {
      loadData();
    }
  }, [evaluacionId]);

  const loadData = async () => {
    if (!evaluacionId) return;

    try {
      setLoading(true);

      // 1. Cargar evaluación
      const evaluacionData = await evaluacionesApi.get(evaluacionId);
      setEvaluacion(evaluacionData);

      // 2. Cargar dimensiones desde API
      const token = localStorage.getItem('access_token');
      const dimResponse = await fetch(
        `http://localhost:8000/api/encuestas/dimensiones/?encuesta=${evaluacionData.encuesta}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!dimResponse.ok) {
        throw new Error('Error al cargar dimensiones');
      }

      const dimData = await dimResponse.json();
      const dims = Array.isArray(dimData) ? dimData : dimData.results || [];
      setDimensiones(dims);

      // 3. Cargar configuraciones existentes
      try {
        const configsData = await configNivelesApi.getPorEvaluacion(evaluacionId);
        
        const nivelesMap: Record<string, number> = {};
        const motivosMap: Record<string, string> = {};

        configsData.configuraciones.forEach((config: any) => {
          nivelesMap[config.dimension] = config.nivel_deseado;
          if (config.motivo_cambio) {
            motivosMap[config.dimension] = config.motivo_cambio;
          }
        });

        setNiveles(nivelesMap);
        setMotivos(motivosMap);
      } catch (error) {
        // No hay configuraciones previas - esto es normal en primera configuración
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
      navigate('/evaluaciones/mis-evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!evaluacionId) return;

    // Validar que todas las dimensiones tengan nivel
    const dimensionesSinNivel = dimensiones.filter((dim) => !niveles[dim.id]);

    if (dimensionesSinNivel.length > 0) {
      toast.error(
        `Debes configurar el nivel deseado para todas las dimensiones (${dimensionesSinNivel.length} pendientes)`
      );
      return;
    }

    try {
      setSaving(true);

      // Preparar configuraciones
      const configuraciones: ConfiguracionMultiple[] = dimensiones.map((dim) => ({
        dimension_id: dim.id,
        nivel_deseado: niveles[dim.id] as 1 | 2 | 3 | 4 | 5,
        motivo_cambio: motivos[dim.id] || undefined,
      }));

      // Guardar configuraciones
      const resultado = await configNivelesApi.configurarMultiple(
        evaluacionId,
        configuraciones
      );

      if (resultado.errores > 0) {
        toast.error(
          `Se guardaron ${resultado.exitosos} configuraciones, pero ${resultado.errores} tuvieron errores`
        );
        console.error('Errores:', resultado.errores_detalle);
      } else {
        toast.success('Niveles deseados configurados correctamente');
        navigate(`/evaluaciones/${evaluacionId}/asignar-dimensiones`);
      }
    } catch (error: any) {
      toast.error('Error al guardar configuraciones');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getNivelColor = (nivel: number) => {
    const colores = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-blue-500',
      5: 'bg-green-500',
    };
    return colores[nivel as keyof typeof colores] || 'bg-gray-500';
  };

  const getNivelNombre = (nivel: number) => {
    const nombres = {
      1: 'Inicial',
      2: 'Gestionado',
      3: 'Definido',
      4: 'Cuantitativamente Gestionado',
      5: 'Optimizado',
    };
    return nombres[nivel as keyof typeof nombres] || '';
  };

  if (loading) return <LoadingScreen message="Cargando evaluación..." />;

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Evaluación no encontrada
        </h3>
        <Button variant="secondary" onClick={() => navigate('/evaluaciones/mis-evaluaciones')}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/evaluaciones/mis-evaluaciones')}
        >
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

      {/* Formulario */}
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
                      <div
                        className={`w-10 h-10 ${getNivelColor(
                          nivel
                        )} text-white rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-2`}
                      >
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
            <p className="text-2xl font-bold text-primary-600">
              {Math.round((Object.keys(niveles).length / dimensiones.length) * 100)}%
            </p>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(niveles).length / dimensiones.length) * 100}%`,
              }}
            />
          </div>
        </Card>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || Object.keys(niveles).length !== dimensiones.length}
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Guardar y Continuar
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/asignaciones/mis-evaluaciones')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};