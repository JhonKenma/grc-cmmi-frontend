// src/pages/asignaciones/hooks/usePendientesRevision.ts
import { useState, useEffect } from 'react';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { Asignacion, AsignacionListItem } from '@/types';
import toast from 'react-hot-toast';

export const usePendientesRevision = () => {
  const [loading, setLoading]                             = useState(true);
  const [asignaciones, setAsignaciones]                   = useState<AsignacionListItem[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<Asignacion | null>(null);
  const [modalOpen, setModalOpen]                         = useState(false);

  useEffect(() => { loadPendientes(); }, []);

  const loadPendientes = async () => {
    try {
      setLoading(true);
      const data = await asignacionesApi.getPendientesRevision();
      setAsignaciones(data.results);
    } catch {
      toast.error('Error al cargar asignaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleRevisar = async (id: string) => {
    try {
      const asignacion = await asignacionesApi.get(id);
      setAsignacionSeleccionada(asignacion);
      setModalOpen(true);
    } catch {
      toast.error('Error al cargar detalle de asignación');
    }
  };

  const handleSuccess = async () => {
    await loadPendientes();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAsignacionSeleccionada(null);
  };

  return {
    loading, asignaciones,
    asignacionSeleccionada, modalOpen,
    handleRevisar, handleSuccess, handleCloseModal,
  };
};