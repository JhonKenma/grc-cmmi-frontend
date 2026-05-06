import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import toast from 'react-hot-toast';
import { manejarErrorCrearUsuario } from '@/utils/errorHandler';
import type { Empresa } from '@/types';

export const useUsuarioEdit = (id?: string | undefined) => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    empresa: '',
    rol: 'usuario',
    cargo: '',
    departamento: '',
    telefono: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoadingData(true);
        const usuario = await usuarioService.getById(parseInt(id));
        let empresasData: Empresa[] = [];
        if (isSuperAdmin) {
          empresasData = await empresaService.getAll();
        } else if (user?.empresa_info) {
          empresasData = [user.empresa_info];
        }
        setEmpresas(empresasData);
        setFormData({
          email: usuario.email || '',
          password: '',
          first_name: usuario.first_name || '',
          last_name: usuario.last_name || '',
          empresa: usuario.empresa?.toString() || '',
          rol: usuario.rol || 'usuario',
          cargo: usuario.cargo || '',
          departamento: usuario.departamento || '',
          telefono: usuario.telefono || '',
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos del usuario');
        navigate('/usuarios');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, navigate, isSuperAdmin, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'rol' && value === 'superadmin') {
      setFormData((prev) => ({ ...prev, [name]: value, empresa: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }
    if (formData.rol !== 'superadmin' && !formData.empresa) {
      newErrors.empresa = 'La empresa es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }
    if (!id) return;

    try {
      setLoading(true);
      const dataToSend: any = {
        email:        formData.email,
        first_name:   formData.first_name,
        last_name:    formData.last_name,
        rol:          formData.rol,
        cargo:        formData.cargo,
        departamento: formData.departamento,
        telefono:     formData.telefono,
      };
      if (formData.rol !== 'superadmin') {
        dataToSend.empresa = parseInt(formData.empresa);
      } else {
        dataToSend.empresa = null;
      }
      await usuarioService.update(parseInt(id), dataToSend);
      toast.success('Usuario actualizado correctamente');
      navigate('/usuarios');
    } catch (error: any) {
      manejarErrorCrearUsuario(error, setErrors, toast);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    validateForm,
    handleSubmit,
    errors,
    setErrors,
    empresas,
    loading,
    loadingData,
  } as const;
};
