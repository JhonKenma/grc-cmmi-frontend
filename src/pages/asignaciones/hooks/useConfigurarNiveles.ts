// src/pages/asignaciones/hooks/useConfigurarNiveles.ts
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import { configNivelesApi, ConfiguracionMultiple } from '@/api/endpoints/config-niveles.api';
import axiosInstance from '@/api/axios';
import toast from 'react-hot-toast';
import { getNivelColor, getNivelNombre } from './asignacionesConstants';

export { getNivelColor, getNivelNombre };

export const useConfigurarNiveles = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [dimensiones, setDimensiones] = useState<any[]>([]);
  const [niveles, setNiveles]       = useState<Record<string, number>>({});
  const [motivos, setMotivos]       = useState<Record<string, string>>({});

  useEffect(() => {
    if (evaluacionId) loadData();
  }, [evaluacionId]);

  const loadData = async () => {
    if (!evaluacionId) return;
    try {
      setLoading(true);
      const evaluacionData = await evaluacionesApi.get(evaluacionId);
      setEvaluacion(evaluacionData);

      const dimResponse = await axiosInstance.get('/encuestas/dimensiones/', {
        params: { encuesta: evaluacionData.encuesta },
      });
      const dims = Array.isArray(dimResponse.data)
        ? dimResponse.data
        : dimResponse.data.results || [];
      setDimensiones(dims);

      try {
        const configsData = await configNivelesApi.getPorEvaluacion(evaluacionId);
        const nivelesMap: Record<string, number> = {};
        const motivosMap: Record<string, string> = {};
        configsData.configuraciones.forEach((config: any) => {
          nivelesMap[config.dimension] = config.nivel_deseado;
          if (config.motivo_cambio) motivosMap[config.dimension] = config.motivo_cambio;
        });
        setNiveles(nivelesMap);
        setMotivos(motivosMap);
      } catch {
        // Sin configuraciones previas — normal
      }
    } catch {
      toast.error('Error al cargar datos');
      navigate('/evaluaciones/mis-evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluacionId) return;

    const dimensionesSinNivel = dimensiones.filter(dim => !niveles[dim.id]);
    if (dimensionesSinNivel.length > 0) {
      toast.error(`Debes configurar el nivel deseado para todas las dimensiones (${dimensionesSinNivel.length} pendientes)`);
      return;
    }

    try {
      setSaving(true);
      const configuraciones: ConfiguracionMultiple[] = dimensiones.map(dim => ({
        dimension_id:  dim.id,
        nivel_deseado: niveles[dim.id] as 1 | 2 | 3 | 4 | 5,
        motivo_cambio: motivos[dim.id] || undefined,
      }));

      const resultado = await configNivelesApi.configurarMultiple(evaluacionId, configuraciones);

      if (resultado.errores > 0) {
        toast.error(`Se guardaron ${resultado.exitosos} configuraciones, pero ${resultado.errores} tuvieron errores`);
      } else {
        toast.success('Niveles deseados configurados correctamente');
        navigate(`/evaluaciones/${evaluacionId}/asignar-dimensiones`);
      }
    } catch {
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  // Progreso derivado
  const progreso = useMemo(() => {
    if (!dimensiones.length) return 0;
    return Math.round((Object.keys(niveles).length / dimensiones.length) * 100);
  }, [niveles, dimensiones]);

  const todasConfiguradas = Object.keys(niveles).length === dimensiones.length;

  const goToLista = () => navigate('/asignaciones/mis-evaluaciones');

  return {
    evaluacionId, evaluacion, loading, saving,
    dimensiones, niveles, setNiveles, motivos, setMotivos,
    progreso, todasConfiguradas,
    handleSubmit, goToLista,
  };
};