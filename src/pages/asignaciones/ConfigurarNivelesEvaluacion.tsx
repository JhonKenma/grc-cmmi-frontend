// src/pages/asignaciones/ConfigurarNivelesEvaluacion.tsx - VERSIÓN CORREGIDA

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, AlertCircle } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { encuestasApi } from '@/api/endpoints/encuestas.api';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { configNivelesApi } from '@/api/endpoints/config-niveles.api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const ConfigurarNivelesEvaluacion: React.FC = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [asignacion, setAsignacion] = useState<any>(null);
  const [encuesta, setEncuesta] = useState<any>(null);
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  useEffect(() => {
    if (asignacionId) {
      loadData();
    }
  }, [asignacionId]);

  const loadData = async () => {
    if (!asignacionId || !user?.empresa) return;

    try {
      setLoading(true);

      // 1. Cargar la asignación
      const asignacionData = await asignacionesApi.get(asignacionId);
      setAsignacion(asignacionData);

      // 2. Cargar la encuesta con sus dimensiones (SIN niveles)
      const encuestaData = await encuestasApi.get(asignacionData.encuesta);
      setEncuesta(encuestaData);

      // 3. Cargar configuraciones existentes de niveles deseados
      const configsResponse = await configNivelesApi.list();
      
      // ⭐ CORREGIR: Manejar respuesta paginada o array directo
      const configs = Array.isArray(configsResponse) 
        ? configsResponse 
        : (configsResponse as any).results || [];
      
      const nivelesMap: Record<string, number> = {};

      configs.forEach((config: any) => {
        nivelesMap[config.dimension] = config.nivel_deseado;
      });

      setNiveles(nivelesMap);
    } catch (error: any) {
      toast.error('Error al cargar datos');
      console.error(error);
      navigate('/mis-tareas');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GUARDAR CONFIGURACIONES
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.empresa || !encuesta) return;

    // Validar que todas las dimensiones tengan nivel
    const dimensionesSinNivel = encuesta.dimensiones.filter(
      (dim: any) => !niveles[dim.id]
    );

    if (dimensionesSinNivel.length > 0) {
      toast.error(
        `Debes configurar el nivel deseado para todas las dimensiones (${dimensionesSinNivel.length} pendientes)`
      );
      return;
    }

    try {
      setSaving(true);

      // Guardar cada dimensión
      const promises = encuesta.dimensiones.map(async (dimension: any) => {
        const nivelDeseado = niveles[dimension.id];

        try {
          // Verificar si existe configuración
          const existente = await configNivelesApi.getPorDimension(
            dimension.id,
            user.empresa!
          );

            if ('id' in existente) {
            // Actualizar
            await configNivelesApi.update(existente.id, {
                nivel_deseado: nivelDeseado as 1 | 2 | 3 | 4 | 5,
                motivo_cambio: motivos[dimension.id] || undefined,
            });
          } else {
            // Crear
            await configNivelesApi.create({
              dimension: dimension.id,
              empresa: user.empresa!,
              nivel_deseado: nivelDeseado as 1 | 2 | 3 | 4 | 5,
              motivo_cambio: motivos[dimension.id] || undefined,
            });
          }
        } catch (error: any) {
        // ⭐ AGREGAR ESTOS CONSOLE.LOGS
        console.error(`Error en dimensión ${dimension.nombre}:`, error);
        console.error('Response data:', error.response?.data);  // ⭐ AGREGAR
        console.error('Request data:', {  // ⭐ AGREGAR
            dimension: dimension.id,
            nivel_deseado: nivelDeseado,
            motivo_cambio: motivos[dimension.id],
        });
        throw error;
        }
      });

      await Promise.all(promises);
      toast.success('Niveles deseados configurados correctamente');
      navigate('/mis-tareas');
    } catch (error: any) {
      toast.error('Error al guardar configuraciones');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // COLORES POR NIVEL
  // ==========================================
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

  if (loading) {
    return <LoadingScreen message="Cargando evaluación..." />;
  }

  if (!encuesta || !asignacion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Evaluación no encontrada
        </h3>
        <Button variant="secondary" onClick={() => navigate('/mis-tareas')}>
          Volver
        </Button>
      </div>
    );
  }

  // Verificar que el usuario sea el asignado
  if (asignacion.usuario_asignado !== user?.id) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes acceso a esta evaluación
        </h3>
        <Button variant="secondary" onClick={() => navigate('/mis-tareas')}>
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
          onClick={() => navigate('/mis-tareas')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurar Niveles Deseados
          </h1>
          <p className="text-gray-600 mt-1">{encuesta.nombre}</p>
        </div>
      </div>

      {/* Información */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              ¿Qué son los niveles deseados?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Define el nivel objetivo que tu empresa quiere alcanzar en cada
                dimensión
              </li>
              <li>
                • Esto permitirá calcular el GAP entre el nivel actual y el
                objetivo
              </li>
              <li>
                • Debes configurar el nivel deseado para TODAS las dimensiones
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {encuesta.dimensiones && encuesta.dimensiones.length > 0 ? (
          encuesta.dimensiones.map((dimension: any, index: number) => (
            <Card
              key={dimension.id}
              className={
                !niveles[dimension.id]
                  ? 'border-2 border-yellow-300 bg-yellow-50'
                  : ''
              }
            >
              <div className="space-y-4">
                {/* Header de dimensión */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dimension.nombre}
                      </h3>
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

                {/* Selector de nivel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel Deseado <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((nivel) => (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() =>
                          setNiveles({ ...niveles, [dimension.id]: nivel })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          niveles[dimension.id] === nivel
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow'
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

                {/* Motivo (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificación (Opcional)
                  </label>
                  <input
                    type="text"
                    value={motivos[dimension.id] || ''}
                    onChange={(e) =>
                      setMotivos({ ...motivos, [dimension.id]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="¿Por qué se eligió este nivel objetivo?"
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-center text-gray-600">
              Esta evaluación no tiene dimensiones configuradas
            </p>
          </Card>
        )}

        {/* Resumen */}
        {encuesta.dimensiones && encuesta.dimensiones.length > 0 && (
          <Card className="bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Progreso de configuración
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {Object.keys(niveles).length} de {encuesta.dimensiones.length}{' '}
                  dimensiones configuradas
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {Math.round(
                    (Object.keys(niveles).length / encuesta.dimensiones.length) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    (Object.keys(niveles).length / encuesta.dimensiones.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </Card>
        )}

        {/* Botones */}
        {encuesta.dimensiones && encuesta.dimensiones.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={
                saving ||
                Object.keys(niveles).length !== encuesta.dimensiones.length
              }
            >
              {saving ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/mis-tareas')}
            >
              Cancelar
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};