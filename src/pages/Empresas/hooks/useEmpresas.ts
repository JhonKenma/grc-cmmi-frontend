// src/pages/Empresas/hooks/useEmpresas.ts
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import toast from 'react-hot-toast';

export const useEmpresas = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [empresas, setEmpresas]         = useState<Empresa[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [menuOpen, setMenuOpen]         = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [planModal, setPlanModal]       = useState<Empresa | null>(null);

  useEffect(() => {
    if (isSuperAdmin) loadEmpresas();
  }, [isSuperAdmin]);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const data = await empresaService.getAll();
      setEmpresas(data);
    } catch {
      toast.error('Error al cargar empresas');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = useMemo(
    () =>
      empresas.filter((e) =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ruc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [empresas, searchTerm]
  );

  const stats = useMemo(
    () => ({
      total:     empresas.length,
      activas:   empresas.filter((e) => e.activo).length,
      inactivas: empresas.filter((e) => !e.activo).length,
      demo:      empresas.filter((e) => e.plan?.tipo === 'demo').length,
    }),
    [empresas]
  );

  // Acciones
  const handleCreate = () => navigate('/empresas/nuevo');
  const handleEdit   = (id: number) => { navigate(`/empresas/editar/${id}`); setMenuOpen(null); };
  const handleCloseMenu    = () => setMenuOpen(null);
  const handleOpenDelete   = (id: number) => { setDeleteConfirm(id); setMenuOpen(null); };
  const handleCancelDelete = () => setDeleteConfirm(null);
  const handleOpenPlanModal  = (empresa: Empresa) => { setPlanModal(empresa); setMenuOpen(null); };
  const handleClosePlanModal = () => setPlanModal(null);
  const handleSavePlan       = () => { setPlanModal(null); loadEmpresas(); };

  const handleToggleStatus = async (empresa: Empresa) => {
    try {
      await empresaService.toggleStatus(empresa.id);
      toast.success(`Empresa ${empresa.activo ? 'desactivada' : 'activada'} correctamente`);
      loadEmpresas();
      setMenuOpen(null);
    } catch {
      toast.error('Error al cambiar estado de la empresa');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await empresaService.delete(id);
      toast.success('Empresa eliminada correctamente');
      loadEmpresas();
      setDeleteConfirm(null);
      setMenuOpen(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la empresa');
    }
  };

  return {
    isSuperAdmin, loading,
    filteredEmpresas, stats,
    searchTerm, setSearchTerm,
    menuOpen, setMenuOpen,
    deleteConfirm, planModal,
    handleCreate, handleEdit, handleCloseMenu,
    handleToggleStatus,
    handleDelete, handleOpenDelete, handleCancelDelete,
    handleOpenPlanModal, handleClosePlanModal, handleSavePlan,
    navigate,
  };
};