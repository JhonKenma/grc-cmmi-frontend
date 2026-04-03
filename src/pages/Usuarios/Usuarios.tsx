// src/pages/Usuarios/Usuarios.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Usuario, Empresa } from '@/types';
import { useLocation } from 'react-router-dom';
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
  UserCog,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Usuarios = () => {
  const { isSuperAdmin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const canManageUsers = isAdmin || isSuperAdmin;
  const canViewUsers = canManageUsers || user?.rol === 'auditor';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const location = useLocation();

  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  useEffect(() => {
    // Leer filtro de empresa desde query params (cuando viene de Empresas)
    const params = new URLSearchParams(location.search);
    const empresaParam = params.get('empresa');
    if (empresaParam) {
      setFilterEmpresa(empresaParam);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosData, empresasData] = await Promise.all([
        usuarioService.getAll(),
        isSuperAdmin ? empresaService.getAll() : Promise.resolve([]),
      ]);

      const usuariosAdaptados = usuariosData.map((u: any) => ({
        ...u,
        empresa_info: u.empresa_info || { nombre: u.empresa_nombre || '' },
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

  // ── Filtrado ───────────────────────────────────────────
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

  // Reset página cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filterRol, filterEmpresa]);

  // ── Acciones ───────────────────────────────────────────
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
      loadData();
      setMenuOpen(null);
    } catch (error) {
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
      toast.error(
        error.response?.data?.message || 'Error al eliminar el usuario'
      );
    }
  };

  // ── Helpers de UI ──────────────────────────────────────
  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'superadmin':    return <Shield   className="w-4 h-4 text-purple-600" />;
      case 'administrador': return <UserCog  className="w-4 h-4 text-blue-600"   />;
      case 'auditor':       return <Eye      className="w-4 h-4 text-orange-600" />;
      default:              return <User     className="w-4 h-4 text-gray-600"   />;
    }
  };

  const getRolBadge = (rol: string) => {
    const styles: Record<string, string> = {
      superadmin:    'bg-purple-100 text-purple-800',
      administrador: 'bg-blue-100   text-blue-800',
      auditor:       'bg-orange-100 text-orange-800',
      usuario:       'bg-gray-100   text-gray-800',
    };
    const labels: Record<string, string> = {
      superadmin:    'Super Admin',
      administrador: 'Admin',
      auditor:       'Auditor',
      usuario:       'Usuario',
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

  // ── Info del plan para el admin ────────────────────────
  const plan = user?.empresa_info?.plan;
  const planExpirado  = plan && !plan.esta_activo;
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

  // Contadores actuales por rol (de la lista de usuarios)
  const countRol = (rol: string) =>
    usuarios.filter((u) => u.rol === rol && u.activo).length;

  const tableColSpan =
    4 + (isSuperAdmin ? 1 : 0) + (canManageUsers ? 1 : 0);

  // ── Guards ─────────────────────────────────────────────
  if (!canViewUsers) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">
          No tienes permisos para acceder a esta sección
        </p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        {canManageUsers && (
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
            disabled={!!planExpirado}
            title={planExpirado ? 'El plan de tu empresa ha expirado' : ''}
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* ── Banner de plan (solo para admin, no superadmin) ── */}
      {!isSuperAdmin && plan && (
        <div className={`rounded-lg border p-4 ${planBannerColor}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className={`${planIconColor} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Plan {plan.tipo_display}
                  {planExpirado && (
                    <span className="ml-2 text-red-600 font-semibold">· EXPIRADO</span>
                  )}
                  {!planExpirado && plan.dias_restantes !== null && (
                    <span
                      className={`ml-2 font-normal ${
                        plan.dias_restantes <= 7 ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      · {plan.dias_restantes} días restantes
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3 mt-1">
                  {/* Usuarios */}
                  <span className={`text-xs ${
                    countRol('usuario') >= plan.max_usuarios
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600'
                  }`}>
                    👤 Usuarios: {countRol('usuario')}/{plan.max_usuarios}
                  </span>
                  {/* Administradores */}
                  <span className={`text-xs ${
                    countRol('administrador') >= plan.max_administradores
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600'
                  }`}>
                    🛡 Admins: {countRol('administrador')}/{plan.max_administradores}
                  </span>
                  {/* Auditores */}
                  <span className={`text-xs ${
                    countRol('auditor') >= plan.max_auditores
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600'
                  }`}>
                    👁 Auditores: {countRol('auditor')}/{plan.max_auditores}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón renovar si expira pronto o ya expiró */}
            {(planExpirado || planPorVencer) && (
              <a
                href="mailto:soporte@shieldgrid365.com"
                className="flex-shrink-0 text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                Renovar plan
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

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
      
      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–
            {Math.min(paginaActual * ITEMS_POR_PAGINA, filteredUsuarios.length)} de{' '}
            {filteredUsuarios.length} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((p) =>
                p === 1 ||
                p === totalPaginas ||
                Math.abs(p - paginaActual) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPaginaActual(item as number)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      paginaActual === item
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
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

      {/* ── Tabla ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Empresa
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                {canManageUsers && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColSpan}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || filterRol || filterEmpresa
                      ? 'No se encontraron usuarios con ese criterio'
                      : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                          <p className="font-medium text-gray-900">
                            {usuario.nombre_completo}
                          </p>
                          <p className="text-sm text-gray-500">{usuario.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">{getRolBadge(usuario.rol)}</td>

                    {/* Empresa (solo superadmin) */}
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {usuario.empresa_info?.nombre || '-'}
                      </td>
                    )}

                    {/* Cargo */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {usuario.cargo || '-'}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    {canManageUsers && (
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setMenuOpen(
                                menuOpen === usuario.id ? null : usuario.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {menuOpen === usuario.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button
                                  onClick={() => handleEdit(usuario.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit size={16} />
                                  Editar
                                </button>

                                {usuario.id !== user?.id && (
                                  <>
                                    <button
                                      onClick={() => handleToggleStatus(usuario)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      {usuario.activo ? (
                                        <><X size={16} /> Desactivar</>
                                      ) : (
                                        <><Check size={16} /> Activar</>
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
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Eliminar ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ¿Eliminar usuario?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Se perderán todos sus datos y asignaciones.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
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
