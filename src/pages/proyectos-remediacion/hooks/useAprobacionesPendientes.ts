import { useState, useEffect } from 'react';
import { proyectosRemediacionApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

interface Aprobacion {
  proyecto_id: string;
  proyecto_nombre: string;
  estado: string;
  fecha_cierre_solicitado?: string;
  [key: string]: any;
}

export const useAprobacionesPendientes = () => {
  const [loading, setLoading] = useState(true);
  const [aprobaciones, setAprobaciones] = useState<Aprobacion[]>([]);
  const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState<Aprobacion | null>(null);
  const [showModalValidar, setShowModalValidar] = useState(false);

  useEffect(() => {
    loadAprobaciones();
  }, []);

  const loadAprobaciones = async () => {
    try {
      setLoading(true);
      const data = await proyectosRemediacionApi.getAprobacionesPendientes();
      setAprobaciones(data.results || []);
    } catch (error: any) {
      console.error('Error al cargar aprobaciones:', error);
      toast.error('Error al cargar aprobaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const selectAprobacion = async (aprobacion: Aprobacion) => {
    try {
      setLoading(true);
      const projectData = await proyectosRemediacionApi.obtener(aprobacion.proyecto_id);
      setAprobacionSeleccionada({ ...aprobacion, ...projectData });
      setShowModalValidar(true);
    } catch (error: any) {
      console.error('Error al obtener proyecto:', error);
      toast.error('Error al obtener detalles del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModalValidar(false);
    setAprobacionSeleccionada(null);
  };

  const onAprobacionProcessed = () => {
    closeModal();
    loadAprobaciones();
  };

  return {
    loading,
    aprobaciones,
    aprobacionSeleccionada,
    showModalValidar,
    selectAprobacion,
    closeModal,
    onAprobacionProcessed,
  };
};
