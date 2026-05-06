import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import toast from 'react-hot-toast';
import type { Empresa, Usuario } from '@/types';

export const useUsuariosList = () => {
  const { isSuperAdmin, isAdmin, user } = useAuth();
  const canManageUsers = isAdmin || isSuperAdmin;
  const canViewUsers = canManageUsers || user?.rol === 'auditor';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadData();
  }, [isSuperAdmin]);

  const reload = async () => {
    setLoading(true);
    try {
      const usuariosData = await usuarioService.getAll();
      const usuariosAdaptados = usuariosData.map((u: any) => ({
        ...u,
        empresa_info: u.empresa_info || { nombre: u.empresa_nombre || '' },
      }));
      setUsuarios(usuariosAdaptados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    usuarios,
    empresas,
    loading,
    canManageUsers,
    canViewUsers,
    reload,
  } as const;
};
