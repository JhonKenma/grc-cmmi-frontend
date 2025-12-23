import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Usuario, Empresa } from '@/types';
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  Edit, 
  Trash2,
  MoreVertical,
  X,
  Check,
  AlertTriangle,
  User,
  Shield,
  Eye,
  UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Usuarios = () => {
  const { isSuperAdmin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

    const loadData = async () => {
    try {
        setLoading(true);
        const [usuariosData, empresasData] = await Promise.all([
        usuarioService.getAll(),
        isSuperAdmin ? empresaService.getAll() : Promise.resolve([])
        ]);

        // 🔧 Adaptar datos de usuarios para que coincidan con el formato esperado
        const usuariosAdaptados = usuariosData.map((u: any) => ({
        ...u,
        empresa_info: { nombre: u.empresa_nombre || '' },
        }));

        setUsuarios(usuariosAdaptados);
        setEmpresas(empresasData);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar usuarios');
        setUsuarios([]);
    } finally {
        setLoading(false);
    }
    };


  // ==========================================
  // FILTRADO
  // ==========================================
  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchSearch = 
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRol = !filterRol || usuario.rol === filterRol;
    const matchEmpresa = !filterEmpresa || usuario.empresa_info?.nombre === filterEmpresa;


    return matchSearch && matchRol && matchEmpresa;
  });

  // ==========================================
  // ACCIONES
  // ==========================================
  const handleCreate = () => {
    navigate('/usuarios/nuevo');
  };

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
      loadData();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      toast.success('Usuario eliminado correctamente');
      loadData();
      setDeleteConfirm(null);
      setMenuOpen(null);
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
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
    const styles = {
      superadmin: 'bg-purple-100 text-purple-800',
      administrador: 'bg-blue-100 text-blue-800',
      auditor: 'bg-orange-100 text-orange-800',
      usuario: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      superadmin: 'Super Admin',
      administrador: 'Admin',
      auditor: 'Auditor',
      usuario: 'Usuario',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[rol as keyof typeof styles]}`}>
        {getRolIcon(rol)}
        {labels[rol as keyof typeof labels]}
      </span>
    );
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">
          No tienes permisos para acceder a esta sección
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro por Rol */}
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los roles</option>
            {isSuperAdmin && <option value="superadmin">Super Admin</option>}
            <option value="administrador">Administrador</option>
            <option value="usuario">Usuario</option>
            <option value="auditor">Auditor</option>
          </select>

          {/* Filtro por Empresa (solo superadmin) */}
          {isSuperAdmin && empresas.length > 0 && (
            <select
                value={filterEmpresa}
                onChange={(e) => setFilterEmpresa(e.target.value)}
                className="input-field"
            >
                <option value="">Todas las empresas</option>
                {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.nombre}>
                    {empresa.nombre}
                </option>
                ))}
            </select>
            )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{usuarios.length}</p>
            </div>
            <UsersIcon className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {usuarios.filter((u) => u.activo).length}
              </p>
            </div>
            <Check className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {usuarios.filter((u) => u.rol === 'administrador').length}
              </p>
            </div>
            <UserCog className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {usuarios.filter((u) => !u.activo).length}
              </p>
            </div>
            <X className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterRol || filterEmpresa
                      ? 'No se encontraron usuarios con ese criterio'
                      : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {usuario.avatar ? (
                            <img
                              src={usuario.avatar}
                              alt={usuario.nombre_completo}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={20} className="text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{usuario.nombre_completo}</p>
                          <p className="text-sm text-gray-500">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRolBadge(usuario.rol)}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {usuario.empresa_info?.nombre || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">{usuario.cargo || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === usuario.id ? null : usuario.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuOpen === usuario.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => handleEdit(usuario.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={16} />
                                Editar
                              </button>
                              
                              {/* No permitir cambiar estado del usuario actual */}
                              {usuario.id !== user?.id && (
                                <>
                                  <button
                                    onClick={() => handleToggleStatus(usuario)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {usuario.activo ? (
                                      <>
                                        <X size={16} />
                                        Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <Check size={16} />
                                        Activar
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteConfirm(usuario.id);
                                      setMenuOpen(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setDeleteConfirm(null)} />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">¿Eliminar usuario?</h3>
                <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? Se perderán todos sus datos y asignaciones.
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};