import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import {
  useControlesDeRiesgo,
  useControlesList,
  useEvaluacionesCuantitativasList,
  usePlanesTratamientoList,
  useRiesgoDetail,
  useRiesgoFlowActions,
  useUpdateRiesgo,
  useVincularControl,
} from '@/hooks/useRiesgosModule';

type RiesgoTab = 'informacion' | 'controles' | 'planes' | 'cuantitativo';

export const useRiesgoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const riesgoQuery = useRiesgoDetail(id ?? '');
  const flowActions = useRiesgoFlowActions();
  const updateMutation = useUpdateRiesgo();
  const controlesRiesgoQuery = useControlesDeRiesgo(id);
  const controlesBibliotecaQuery = useControlesList();
  const planesQuery = usePlanesTratamientoList({ riesgo: id });
  const evaluacionesQuery = useEvaluacionesCuantitativasList({ riesgo: id });
  const vincularControlMutation = useVincularControl();
  const [tabActivo, setTabActivo] = useState<RiesgoTab>('informacion');
  const [showVincularControl, setShowVincularControl] = useState(false);
  const [controlSeleccionado, setControlSeleccionado] = useState('');
  const [editData, setEditData] = useState({
    titulo: '',
    descripcion: '',
    probabilidad: 1,
    impacto: 1,
    categoria_coso: 'Operacional',
    causa_raiz: '',
    consecuencia: '',
    fecha_identificacion: '',
    fecha_revision: '',
    controles_asociados: '',
    estado_tratamiento: 'Pendiente',
  });

  const canExecuteActions = useMemo(() => Boolean(id), [id]);

  const riesgo = riesgoQuery.data;

  const estadoRiesgo = String(riesgo?.estado ?? '');
  const canEdit = !['cerrado', 'mitigado', 'aceptado', 'en_revision'].includes(estadoRiesgo);
  const esAdmin = ['administrador', 'superadmin'].includes(String(user?.rol ?? ''));
  const puedeEnviarRevision = estadoRiesgo === 'borrador';
  const puedeAprobar = esAdmin && estadoRiesgo === 'en_revision';
  const puedeRechazar = esAdmin && estadoRiesgo === 'en_revision';
  const puedeCerrar = esAdmin && ['aprobado', 'en_tratamiento', 'mitigado', 'aceptado'].includes(estadoRiesgo);

  const riesgoDetalle = riesgo as NonNullable<typeof riesgo>;
  const riesgoRaw = riesgoDetalle as unknown as Record<string, unknown>;
  const categoriaDetail =
    typeof riesgoRaw.categoria_detail === 'object' && riesgoRaw.categoria_detail !== null
      ? (riesgoRaw.categoria_detail as Record<string, unknown>)
      : null;
  const categoriaNombre =
    riesgoDetalle.categoria_nombre ??
    (categoriaDetail && typeof categoriaDetail.nombre === 'string' ? categoriaDetail.nombre : '-');
  const procesoNombre =
    (typeof riesgoRaw.proceso_nombre === 'string' && riesgoRaw.proceso_nombre) ||
    (typeof riesgoDetalle.proceso === 'string' && !riesgoDetalle.proceso.includes('-') ? riesgoDetalle.proceso : '') ||
    '-';

  useEffect(() => {
    if (!riesgo) return;

    const fechaIdentificacion =
      typeof riesgo.fecha_identificacion === 'string' && riesgo.fecha_identificacion
        ? riesgo.fecha_identificacion.slice(0, 10)
        : '';
    const fechaRevision =
      (typeof riesgo.fecha_revision === 'string' && riesgo.fecha_revision) ||
      (typeof riesgo.proxima_revision_fecha === 'string' && riesgo.proxima_revision_fecha) ||
      '';

    setEditData({
      titulo: riesgoDetalle.titulo ?? riesgoDetalle.nombre ?? '',
      descripcion: riesgoDetalle.descripcion ?? '',
      probabilidad: Number(riesgoDetalle.probabilidad ?? 1),
      impacto: Number(riesgoDetalle.impacto ?? 1),
      categoria_coso: riesgoDetalle.categoria_coso ?? 'Operacional',
      causa_raiz: riesgoDetalle.causa_raiz ?? '',
      consecuencia: riesgoDetalle.consecuencia ?? '',
      fecha_identificacion: fechaIdentificacion,
      fecha_revision: fechaRevision,
      controles_asociados: riesgoDetalle.controles_asociados ?? '',
      estado_tratamiento: riesgoDetalle.estado_tratamiento ?? 'Pendiente',
    });
  }, [riesgo]);

  return {
    id,
    navigate,
    user,
    riesgoQuery,
    flowActions,
    updateMutation,
    controlesRiesgoQuery,
    controlesBibliotecaQuery,
    planesQuery,
    evaluacionesQuery,
    vincularControlMutation,
    tabActivo,
    setTabActivo,
    showVincularControl,
    setShowVincularControl,
    controlSeleccionado,
    setControlSeleccionado,
    editData,
    setEditData,
    canExecuteActions,
    riesgo: riesgoDetalle,
    estadoRiesgo,
    canEdit,
    esAdmin,
    puedeEnviarRevision,
    puedeAprobar,
    puedeRechazar,
    puedeCerrar,
    categoriaNombre,
    procesoNombre,
  } as const;
};
