import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useControlesList,
  useCreateControl,
  useDeleteControl,
  useFrecuenciasControl,
  useTiposControl,
  useUpdateControl,
  useVincularControl,
} from '@/hooks/useMaestros';
import { useRiesgosList } from '@/hooks/useRiesgosModule';
import type { Control, CreateControlPayload } from '@/types';

const initialForm = (): CreateControlPayload => ({
  nombre: '',
  descripcion: '',
  tipo: '',
  modo: 'manual',
  frecuencia: '',
  efectividad_diseno: 3,
  efectividad_operativa: 3,
  evidencia_requerida: '',
  estado: 'activo',
});

export const useControlesPage = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [tipoFilter, setTipoFilter] = useState('');
  const [linkControl, setLinkControl] = useState<Control | null>(null);
  const [riesgoId, setRiesgoId] = useState('');
  const [formData, setFormData] = useState<CreateControlPayload>(initialForm);

  const controlesQuery = useControlesList(tipoFilter ? { tipo: tipoFilter } : undefined);
  const tiposControlQuery = useTiposControl();
  const frecuenciasQuery = useFrecuenciasControl();
  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const createMutation = useCreateControl();
  const updateMutation = useUpdateControl(selectedControl?.id ?? '');
  const deleteMutation = useDeleteControl();
  const vincularMutation = useVincularControl();

  const controles = useMemo(() => controlesQuery.data ?? [], [controlesQuery.data]);
  const riesgos = useMemo(() => riesgosQuery.data?.results ?? [], [riesgosQuery.data]);

  useEffect(() => {
    if (!selectedControl) return;

    setFormData({
      nombre: selectedControl.nombre,
      descripcion: selectedControl.descripcion ?? '',
      tipo: selectedControl.tipo ?? '',
      modo: selectedControl.modo,
      frecuencia: selectedControl.frecuencia ?? '',
      efectividad_diseno: selectedControl.efectividad_diseno,
      efectividad_operativa: selectedControl.efectividad_operativa,
      evidencia_requerida: selectedControl.evidencia_requerida ?? '',
      estado: selectedControl.estado,
    });
  }, [selectedControl]);

  const openCreate = () => {
    setSelectedControl(null);
    setFormData(initialForm());
    setShowCreate(true);
  };

  const submitControl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedControl) {
      updateMutation.mutate(formData, {
        onSuccess: () => {
          setShowCreate(false);
          setSelectedControl(null);
          setFormData(initialForm());
        },
      });
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreate(false);
        setFormData(initialForm());
      },
    });
  };

  const closeCreate = () => {
    setShowCreate(false);
    setSelectedControl(null);
    setFormData(initialForm());
  };

  const openLink = (control: Control) => {
    setLinkControl(control);
    setRiesgoId('');
    setShowLink(true);
  };

  const closeLink = () => {
    setShowLink(false);
    setLinkControl(null);
    setRiesgoId('');
  };

  const submitLink = () => {
    if (!linkControl || !riesgoId) return;

    vincularMutation.mutate(
      { control_id: String(linkControl.id), riesgo_id: riesgoId },
      {
        onSuccess: () => {
          closeLink();
        },
      },
    );
  };

  return {
    navigate,
    showCreate,
    setShowCreate,
    showLink,
    setShowLink,
    selectedControl,
    setSelectedControl,
    tipoFilter,
    setTipoFilter,
    linkControl,
    setLinkControl,
    riesgoId,
    setRiesgoId,
    formData,
    setFormData,
    controlesQuery,
    tiposControlQuery,
    frecuenciasQuery,
    riesgosQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    vincularMutation,
    controles,
    riesgos,
    openCreate,
    closeCreate,
    submitControl,
    openLink,
    closeLink,
    submitLink,
    initialForm,
  } as const;
};
