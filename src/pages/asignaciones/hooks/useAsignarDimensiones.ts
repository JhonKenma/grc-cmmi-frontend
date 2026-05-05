// src/pages/asignaciones/hooks/useAsignarDimensiones.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluacionesApi, asignacionesApi } from '@/api/endpoints';
import { usuarioService } from '@/api/usuario.service';
import { DimensionListItem, Usuario } from '@/types';
import { DetalleAsignacion } from '@/api/endpoints/asignaciones.api';
import toast from 'react-hot-toast';

export const useAsignarDimensiones = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [dimensionesDisponibles, setDimensionesDisponibles] = useState<DimensionListItem[]>([]);
  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [detalleAsignaciones, setDetalleAsignaciones] = useState<DetalleAsignacion[]>([]);
  const [infoDimensiones, setInfoDimensiones] = useState({
    total: 0, asignadas: 0, disponibles: 0,
  });

  // Formulario
  const [usuarioId, setUsuarioId]   = useState('');
  const [dimensionesSeleccionadas, setDimensionesSeleccionadas] = useState<string[]>([]);
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [requiereRevision, setRequiereRevision] = useState(false);

  useEffect(() => {
    if (evaluacionId) loadData();
  }, [evaluacionId]);

  const loadData = async () => {
    if (!evaluacionId) return;
    try {
      setLoading(true);
      const evaluacionData = await evaluacionesApi.get(evaluacionId);
      setEvaluacion(evaluacionData);

      const usuariosData = await usuarioService.getUsuariosAsignables();
      setUsuarios(usuariosData);

      const data = await asignacionesApi.getDimensionesDisponibles(evaluacionId);
      setDimensionesDisponibles(data.dimensiones);
      setDetalleAsignaciones(data.detalle_asignaciones || []);
      setInfoDimensiones({
        total:      data.total_dimensiones,
        asignadas:  data.dimensiones_asignadas,
        disponibles: data.dimensiones_disponibles,
      });
    } catch (error: any) {
      toast.error('Error al cargar datos');
      navigate('/asignaciones/mis-evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDimension = (dimensionId: string) => {
    setDimensionesSeleccionadas(prev =>
      prev.includes(dimensionId)
        ? prev.filter(id => id !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  const handleSeleccionarTodas = () => {
    setDimensionesSeleccionadas(
      dimensionesSeleccionadas.length === dimensionesDisponibles.length
        ? []
        : dimensionesDisponibles.map(d => d.id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluacionId || !usuarioId || dimensionesSeleccionadas.length === 0 || !fechaLimite) {
      toast.error('Completa todos los campos y selecciona al menos una dimensión');
      return;
    }
    try {
      setSubmitting(true);
      const response = await asignacionesApi.asignarDimension({
        evaluacion_empresa_id: evaluacionId,
        dimension_ids:         dimensionesSeleccionadas,
        usuario_id:            parseInt(usuarioId),
        fecha_limite:          fechaLimite,
        observaciones:         observaciones || undefined,
        requiere_revision:     requiereRevision,
      });
      const totalAsignadas = response?.data?.total_asignadas || dimensionesSeleccionadas.length;
      const mensajeExtra   = requiereRevision ? ' Estas asignaciones requerirán tu revisión.' : '';
      toast.success(`${totalAsignadas} dimensión(es) asignada(s) exitosamente.${mensajeExtra}`);
      navigate('/asignaciones/mis-evaluaciones');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error  ||
        'Error al asignar dimensiones'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goToLista = () => navigate('/asignaciones/mis-evaluaciones');

  const todasSeleccionadas =
    dimensionesSeleccionadas.length === dimensionesDisponibles.length &&
    dimensionesDisponibles.length > 0;

  return {
    evaluacionId, evaluacion, loading, submitting,
    dimensionesDisponibles, usuarios, detalleAsignaciones, infoDimensiones,
    usuarioId, setUsuarioId,
    dimensionesSeleccionadas, setDimensionesSeleccionadas,
    fechaLimite, setFechaLimite,
    observaciones, setObservaciones,
    requiereRevision, setRequiereRevision,
    todasSeleccionadas,
    handleToggleDimension, handleSeleccionarTodas, handleSubmit, goToLista,
  };
};