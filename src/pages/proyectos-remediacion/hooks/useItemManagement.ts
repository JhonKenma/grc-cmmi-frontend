import { useState, useEffect, useCallback } from 'react';
import { proyectosRemediacionApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

interface Item {
  id: string;
  nombre: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  [key: string]: any;
}

export const useItemManagement = (projectId: string | undefined) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);

  const loadItems = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await proyectosRemediacionApi.listarItems(projectId);
      setItems(data.results || []);
    } catch (error: any) {
      console.error('Error al cargar items:', error);
      toast.error('Error al cargar items del proyecto');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadItems();
  }, [projectId, loadItems]);

  const handleReloadItems = async () => {
    await loadItems();
  };

  const deleteItem = useCallback(
    async (itemId: string) => {
      try {
        await proyectosRemediacionApi.eliminarItem(itemId);
        toast.success('Item eliminado correctamente');
        await loadItems();
      } catch (error: any) {
        console.error('Error al eliminar item:', error);
        toast.error('Error al eliminar item');
      }
    },
    [loadItems]
  );

  const completeItem = useCallback(
    async (itemId: string) => {
      try {
        await proyectosRemediacionApi.actualizarItem(itemId, { estado: 'completado' });
        toast.success('Item completado');
        await loadItems();
      } catch (error: any) {
        console.error('Error al completar item:', error);
        toast.error('Error al completar item');
      }
    },
    [loadItems]
  );

  const startItem = useCallback(
    async (itemId: string) => {
      try {
        await proyectosRemediacionApi.actualizarItem(itemId, { estado: 'en_progreso', fecha_inicio: new Date().toISOString() });
        toast.success('Item iniciado');
        await loadItems();
      } catch (error: any) {
        console.error('Error al iniciar item:', error);
        toast.error('Error al iniciar item');
      }
    },
    [loadItems]
  );

  const openEditModal = (item: Item) => {
    setItemSeleccionado(item);
    setShowModalEditar(true);
  };

  const closeEditModal = () => {
    setShowModalEditar(false);
    setItemSeleccionado(null);
  };

  const closeAddModal = () => {
    setShowModalAgregar(false);
  };

  return {
    items,
    loading,
    showModalAgregar,
    showModalEditar,
    itemSeleccionado,
    setShowModalAgregar,
    loadItems: handleReloadItems,
    deleteItem,
    completeItem,
    startItem,
    openEditModal,
    closeEditModal,
    closeAddModal,
  };
};
