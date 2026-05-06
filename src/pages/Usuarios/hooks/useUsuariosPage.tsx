import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import toast from 'react-hot-toast';
import { Eye, Shield, User, UserCog } from 'lucide-react';
import type { Usuario } from '@/types';
import { useUsuariosList } from './useUsuariosList';

export const useUsuariosPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    usuarios,
    empresas,
    loading,
    canManageUsers,
    canViewUsers,
    reload,
  } = useUsuariosList();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const ITEMS_POR_PAGINA = 10;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const empresaParam = params.get('empresa');
    if (empresaParam) setFilterEmpresa(empresaParam);
  }, [location.search]);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filterRol, filterEmpresa]);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchSearch =
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cargo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRol = !filterRol || usuario.rol === filterRol;
    const matchEmpresa =
      !filterEmpresa || usuario.empresa_info?.nombre === filterEmpresa;

    return matchSearch && matchRol && matchEmpresa;
  });

  const totalPaginas = Math.ceil(filteredUsuarios.length / ITEMS_POR_PAGINA);
  const usuariosPaginados = filteredUsuarios.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const handleCreate = () => navigate('/usuarios/nuevo');

  const handleEdit = (id: number) => {
    navigate(`/usuarios/editar/${id}`);
    setMenuOpen(null);
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      await usuarioService.toggleStatus(usuario.id);
      toast.success(
        `Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`
      );
      reload();
      setMenuOpen(null);
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      toast.success('Usuario eliminado correctamente');
      reload();
      setDeleteConfirm(null);
      setMenuOpen(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al eliminar el usuario'
      );
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'superadmin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'administrador':
        return <UserCog className="w-4 h-4 text-blue-600" />;
      case 'auditor':
        return <Eye className="w-4 h-4 text-orange-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRolBadge = (rol: string) => {
    const styles: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-800',
      administrador: 'bg-blue-100 text-blue-800',
      auditor: 'bg-orange-100 text-orange-800',
      usuario: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      superadmin: 'Super Admin',
      administrador: 'Admin',
      auditor: 'Auditor',
      usuario: 'Usuario',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[rol] ?? 'bg-gray-100 text-gray-800'
        }`}
      >
        {getRolIcon(rol)}
        {labels[rol] ?? rol}
      </span>
    );
  };

  const plan = user?.empresa_info?.plan;
  const planExpirado = plan && !plan.esta_activo;
  const planPorVencer = plan && plan.dias_restantes !== null && plan.dias_restantes <= 15;

  const planBannerColor = planExpirado
    ? 'bg-red-50 border-red-300'
    : planPorVencer
    ? 'bg-yellow-50 border-yellow-300'
    : 'bg-blue-50 border-blue-200';

  const planIconColor = planExpirado
    ? 'text-red-600'
    : planPorVencer
    ? 'text-yellow-600'
    : 'text-blue-600';

  const countRol = (rol: string) =>
    usuarios.filter((u) => u.rol === rol && u.activo).length;

  const tableColSpan = 4 + (canManageUsers ? 1 : 0) + 1;

  return {
    isSuperAdmin,
    currentUserId: user?.id,
    usuarios,
    empresas,
    loading,
    canManageUsers,
    canViewUsers,
    searchTerm,
    setSearchTerm,
    filterRol,
    setFilterRol,
    filterEmpresa,
    setFilterEmpresa,
    menuOpen,
    setMenuOpen,
    deleteConfirm,
    setDeleteConfirm,
    paginaActual,
    setPaginaActual,
    ITEMS_POR_PAGINA,
    filteredUsuarios,
    totalPaginas,
    usuariosPaginados,
    handleCreate,
    handleEdit,
    handleToggleStatus,
    handleDelete,
    getRolBadge,
    plan,
    planExpirado,
    planPorVencer,
    planBannerColor,
    planIconColor,
    countRol,
    tableColSpan,
  } as const;
};
