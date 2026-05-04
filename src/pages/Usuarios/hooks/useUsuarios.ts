// src/pages/Usuarios/hooks/useUsuarios.ts
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Usuario, Empresa } from '@/types';
import toast from 'react-hot-toast';

export const ITEMS_POR_PAGINA = 10;

export const useUsuarios = () => {
  const { isSuperAdmin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const canManageUsers = isAdmin || isSuperAdmin;
  const canViewUsers   = canManageUsers || user?.rol === 'auditor';

  const [usuarios, setUsuarios]           = useState<Usuario[]>([]);
  const [empresas, setEmpresas]           = useState<Empresa[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterRol, setFilterRol]         = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [menuOpen, setMenuOpen]           = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [paginaActual, setPaginaActual]   = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const empresaParam = params.get('empresa');
    if (empresaParam) setFilterEmpresa(empresaParam);
    loadData();
  }, []);

  useEffect(() => { setPaginaActual(1); }, [searchTerm, filterRol, filterEmpresa]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosData, empresasData] = await Promise.all([
        usuarioService.getAll(),
        isSuperAdmin ? empresaService.getAll() : Promise.resolve([]),
      ]);
      setUsuarios(usuariosData.map((u: any) => ({
        ...u,
        empresa_info: u.empresa_info || { nombre: u.empresa_nombre || '' },
      })));
      setEmpresas(empresasData);
    } catch {
      toast.error('Error al cargar usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = useMemo(
    () => usuarios.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (!filterRol || u.rol === filterRol) && (!filterEmpresa || u.empresa_info?.nombre === filterEmpresa);
    }),
    [usuarios, searchTerm, filterRol, filterEmpresa]
  );

  const totalPaginas = Math.ceil(filteredUsuarios.length / ITEMS_POR_PAGINA);
  const usuariosPaginados = useMemo(
    () => filteredUsuarios.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA),
    [filteredUsuarios, paginaActual]
  );

  const stats = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter((u) => u.activo).length,
    inactivos: usuarios.filter((u) => !u.activo).length,
    administradores: usuarios.filter((u) => u.rol === 'administrador').length,
  }), [usuarios]);

  const countRol = (rol: string) => usuarios.filter((u) => u.rol === rol && u.activo).length;

  const plan = user?.empresa_info?.plan;
  const planExpirado  = plan && !plan.esta_activo;
  const planPorVencer = plan && plan.dias_restantes !== null && plan.dias_restantes <= 15;
  const planBannerColor = planExpirado ? 'bg-red-50 border-red-300' : planPorVencer ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200';
  const planIconColor   = planExpirado ? 'text-red-600' : planPorVencer ? 'text-yellow-600' : 'text-blue-600';

  const handleCreate       = () => navigate('/usuarios/nuevo');
  const handleEdit         = (id: number) => { navigate(`/usuarios/editar/${id}`); setMenuOpen(null); };
  const handleCloseMenu    = () => setMenuOpen(null);
  const handleOpenDelete   = (id: number) => { setDeleteConfirm(id); setMenuOpen(null); };
  const handleCancelDelete = () => setDeleteConfirm(null);

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      await usuarioService.toggleStatus(usuario.id);
      toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`);
      loadData(); setMenuOpen(null);
    } catch { toast.error('Error al cambiar estado del usuario'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      toast.success('Usuario eliminado correctamente');
      loadData(); setDeleteConfirm(null); setMenuOpen(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

  const tableColSpan = 4 + (isSuperAdmin ? 1 : 0) + (canManageUsers ? 1 : 0);

  return {
    isSuperAdmin, canManageUsers, canViewUsers, user,
    loading, usuarios, empresas, stats, countRol,
    searchTerm, setSearchTerm, filterRol, setFilterRol, filterEmpresa, setFilterEmpresa,
    filteredUsuarios, usuariosPaginados, paginaActual, setPaginaActual, totalPaginas,
    tableColSpan, ITEMS_POR_PAGINA, menuOpen, setMenuOpen, deleteConfirm,
    plan, planExpirado, planPorVencer, planBannerColor, planIconColor,
    handleCreate, handleEdit, handleToggleStatus, handleDelete,
    handleOpenDelete, handleCancelDelete, handleCloseMenu,
  };
};