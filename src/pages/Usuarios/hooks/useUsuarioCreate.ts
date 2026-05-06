import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import toast from 'react-hot-toast';
import { manejarErrorCrearUsuario } from '@/utils/errorHandler';
import type { Empresa } from '@/types';

export const useUsuarioCreate = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [planInfo, setPlanInfo] = useState<{
    max_usuarios: number;
    max_administradores: number;
    max_auditores: number;
    dias_restantes: number | null;
    tipo: string;
  } | null>(null);

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
    const loadEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        if (isSuperAdmin) {
          const data = await empresaService.getAll();
          setEmpresas(data);
        } else if (user?.empresa_info) {
          setEmpresas([user.empresa_info]);
          setFormData((prev) => ({
            ...prev,
            empresa: user.empresa_info!.id.toString(),
          }));
          if (user.empresa_info.plan) {
            setPlanInfo({
              max_usuarios: user.empresa_info.plan.max_usuarios,
              max_administradores: user.empresa_info.plan.max_administradores,
              max_auditores: user.empresa_info.plan.max_auditores,
              dias_restantes: user.empresa_info.plan.dias_restantes,
              tipo: user.empresa_info.plan.tipo,
            });
          }
        }
      } catch (error) {
        toast.error('Error al cargar empresas');
      } finally {
        setLoadingEmpresas(false);
      }
    };
    loadEmpresas();
  }, [isSuperAdmin, user]);

  useEffect(() => {
    if (!isSuperAdmin || !formData.empresa) {
      setPlanInfo(null);
      return;
    }
    const empresa = empresas.find((e) => e.id === parseInt(formData.empresa));
    if (empresa?.plan) {
      setPlanInfo({
        max_usuarios: empresa.plan.max_usuarios,
        max_administradores: empresa.plan.max_administradores,
        max_auditores: empresa.plan.max_auditores,
        dias_restantes: empresa.plan.dias_restantes,
        tipo: empresa.plan.tipo,
      });
    } else {
      setPlanInfo(null);
    }
  }, [formData.empresa, empresas, isSuperAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'rol' && value === 'superadmin') {
      setFormData((prev) => ({ ...prev, [name]: value, empresa: '' }));
      setPlanInfo(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
    if (!formData.last_name.trim())  newErrors.last_name  = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!formData.rol) newErrors.rol = 'El rol es requerido';
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

    try {
      setLoading(true);

      const dataToSend: any = {
        email:        formData.email,
        password:     formData.password,
        first_name:   formData.first_name,
        last_name:    formData.last_name,
        rol:          formData.rol,
        cargo:        formData.cargo,
        departamento: formData.departamento,
        telefono:     formData.telefono,
      };

      if (formData.rol !== 'superadmin') {
        dataToSend.empresa = parseInt(formData.empresa);
      }

      await usuarioService.create(dataToSend);
      toast.success('Usuario creado correctamente');
      navigate('/usuarios');

    } catch (error: any) {
      manejarErrorCrearUsuario(error, setErrors, toast);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    errors,
    empresas,
    isSuperAdmin,
    isEdit: false,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    loading,
    loadingEmpresas,
    planInfo,
    handleSubmit,
    setFormData,
  } as const;
};
