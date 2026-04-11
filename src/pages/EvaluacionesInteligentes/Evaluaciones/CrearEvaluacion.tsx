// src/pages/EvaluacionesInteligentes/Evaluaciones/CrearEvaluacion.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { evaluacionesInteligentesApi, empresaFrameworkApi } from '@/api/endpoints';
import { FrameworkCard } from '@/components/iqevaluaciones/FrameworkCard';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { Framework, CrearEvaluacionData } from '@/types/iqevaluaciones.types';

export const CrearEvaluacion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworksDisponibles, setFrameworksDisponibles] = useState<number[]>([]);
  
  // ⭐ NUEVO: Estado del formulario completo
  const [formData, setFormData] = useState({
    frameworks: [] as number[],
    nombre: '',
    descripcion: '',
    nivel_deseado: 3,  // ⭐ NUEVO - default nivel 3
    usar_todas_preguntas: true,
    sugerir_preguntas_ia: false,
    usar_respuestas_compartidas: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarFrameworks();
  }, []);

  const cargarFrameworks = async () => {
    try {
      setLoading(true);
      
      // ⭐ Si es Admin, solo cargar frameworks asignados a su empresa
      if (user?.rol === 'administrador') {
        const misFrameworksData = await empresaFrameworkApi.misFrameworks();
        const frameworksIds = misFrameworksData.frameworks.map(fw => fw.framework_id);
        setFrameworksDisponibles(frameworksIds);
        
        // Cargar detalles de todos los frameworks para mostrarlos
        const todosFrameworks = await evaluacionesInteligentesApi.frameworks.listar();
        // Filtrar solo los asignados
        const frameworksFiltrados = todosFrameworks.filter(fw => 
          frameworksIds.includes(fw.id)
        );
        setFrameworks(frameworksFiltrados);
      } else {
        // SuperAdmin ve todos los frameworks
        const data = await evaluacionesInteligentesApi.frameworks.listar();
        setFrameworks(data);
        setFrameworksDisponibles(data.map(fw => fw.id));
      }
    } catch (error) {
      console.error('Error al cargar frameworks:', error);
      toast.error('Error al cargar los frameworks');
    } finally {
      setLoading(false);
    }
  };

  const handleFrameworkToggle = (frameworkId: number) => {
    setFormData((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(frameworkId)
        ? prev.frameworks.filter((id) => id !== frameworkId)
        : [...prev.frameworks, frameworkId],
    }));
    if (errors.frameworks) {
      setErrors((prev) => ({ ...prev, frameworks: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (formData.frameworks.length === 0) {
      newErrors.frameworks = 'Debe seleccionar al menos un framework';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);

      // ⭐ Preparar datos
      const dataToSend: any = {
        frameworks: formData.frameworks,
        nombre: formData.nombre.trim(),
        nivel_deseado: formData.nivel_deseado,  // ⭐ NUEVO
        usar_todas_preguntas: formData.usar_todas_preguntas,
        usar_respuestas_compartidas: formData.usar_respuestas_compartidas,
      };

      // ⭐ Si es SuperAdmin, debe enviar empresa (opcional, puede enviarlo manualmente)
      // Si es Admin, el backend asigna automáticamente la empresa
      
      if (formData.descripcion?.trim()) {
        dataToSend.descripcion = formData.descripcion.trim();
      }

      console.log('Enviando datos:', dataToSend);

      const evaluacion = await evaluacionesInteligentesApi.evaluaciones.crear(dataToSend);

      toast.success('Evaluación creada correctamente');

      // Redirigir según el modo
      if (!formData.usar_todas_preguntas) {
        const query = formData.sugerir_preguntas_ia ? '?autoSuggest=1' : '';
        navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}/seleccionar-preguntas${query}`);
      } else {
        navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}`);
      }
    } catch (error: any) {
      console.error('Error al crear evaluación:', error);
      console.error('Response data:', error.response?.data);
      
      let errorMessage = 'Error al crear la evaluación';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          const firstError = Object.entries(errorData)[0];
          if (firstError) {
            const [field, message] = firstError;
            errorMessage = `Error en ${field}: ${Array.isArray(message) ? message[0] : message}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  // ⭐ Si es Admin y no tiene frameworks asignados
  if (user?.rol === 'administrador' && frameworks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto text-yellow-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes frameworks asignados
          </h2>
          <p className="text-gray-700 mb-6">
            Para crear evaluaciones, necesitas tener al menos un framework asignado.
            Contacta con el SuperAdmin para que te asigne los frameworks necesarios.
          </p>
          <button
            onClick={() => navigate('/evaluaciones-inteligentes')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Evaluaciones
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Crear Nueva Evaluación
        </h1>
        <p className="text-gray-600 mt-2">
          Define una evaluación basada en uno o múltiples frameworks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Información Básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Evaluación *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Evaluación GRC Q1 2026"
              />
              {errors.nombre && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe el propósito de esta evaluación..."
              />
            </div>

            {/* ⭐ NUEVO: Nivel Deseado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Deseado *
              </label>
              <select
                value={formData.nivel_deseado}
                onChange={(e) => setFormData({ ...formData, nivel_deseado: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>Nivel 1 - Inicial</option>
                <option value={2}>Nivel 2 - Gestionado</option>
                <option value={3}>Nivel 3 - Definido</option>
                <option value={4}>Nivel 4 - Cuantitativamente Gestionado</option>
                <option value={5}>Nivel 5 - Optimizado</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nivel de madurez que tu empresa quiere alcanzar con esta evaluación
              </p>
            </div>
          </div>
        </div>

        {/* Selección de Frameworks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Frameworks a Incluir *
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona uno o más frameworks para esta evaluación
          </p>

          {errors.frameworks && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.frameworks}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frameworks.map((framework) => (
              <FrameworkCard
                key={framework.id}
                framework={framework}
                selected={formData.frameworks.includes(framework.id)}
                onClick={() => handleFrameworkToggle(framework.id)}
              />
            ))}
          </div>
        </div>

        {/* Modo de Preguntas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Modo de Preguntas
          </h2>

          <div className="space-y-3">
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.usar_todas_preguntas 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="modo_preguntas"
                checked={formData.usar_todas_preguntas}
                onChange={() => setFormData({ ...formData, usar_todas_preguntas: true })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Usar todas las preguntas</p>
                <p className="text-sm text-gray-600">
                  Se incluirán automáticamente todas las preguntas de los frameworks seleccionados
                </p>
                {formData.usar_todas_preguntas && (
                  <p className="text-xs text-primary-700 mt-2 font-medium">
                    ✓ La evaluación se creará inmediatamente con todas las preguntas
                  </p>
                )}
              </div>
            </label>

            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              !formData.usar_todas_preguntas 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="modo_preguntas"
                checked={!formData.usar_todas_preguntas}
                onChange={() => setFormData({ ...formData, usar_todas_preguntas: false })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Seleccionar preguntas manualmente</p>
                <p className="text-sm text-gray-600">
                  Podrás elegir preguntas específicas o usar sugerencias de IA
                </p>
                {!formData.usar_todas_preguntas && (
                  <p className="text-xs text-primary-700 mt-2 font-medium">
                    → Siguiente paso: seleccionar preguntas específicas
                  </p>
                )}
              </div>
            </label>

            {!formData.usar_todas_preguntas && (
              <label className="flex items-start p-3 rounded-lg border border-indigo-200 bg-indigo-50">
                <input
                  type="checkbox"
                  checked={formData.sugerir_preguntas_ia}
                  onChange={(e) =>
                    setFormData({ ...formData, sugerir_preguntas_ia: e.target.checked })
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="font-medium text-indigo-900">Activar sugerencia automática con IA</p>
                  <p className="text-sm text-indigo-700">
                    Al continuar, la IA preseleccionará preguntas recomendadas según framework y contexto.
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Opciones Adicionales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Opciones Adicionales
          </h2>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.usar_respuestas_compartidas}
              onChange={(e) => setFormData({ ...formData, usar_respuestas_compartidas: e.target.checked })}
              className="mt-1 mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">Usar respuestas compartidas</p>
              <p className="text-sm text-gray-600">
                Las respuestas se propagarán automáticamente entre preguntas relacionadas
              </p>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {formData.usar_todas_preguntas ? 'Creando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {formData.usar_todas_preguntas 
                  ? 'Crear Evaluación' 
                  : 'Continuar a Seleccionar Preguntas'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};