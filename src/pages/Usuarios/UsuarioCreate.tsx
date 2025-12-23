// src/pages/Usuarios/UsuarioCreate.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { UsuarioFormFields } from './components/UsuarioFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const UsuarioCreate = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  
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

  // ==========================================
  // CARGAR EMPRESAS
  // ==========================================
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        if (isSuperAdmin) {
          const data = await empresaService.getAll();
          setEmpresas(data);
        } else if (user?.empresa_info) {
          // Si es admin, solo cargar su empresa
          setEmpresas([user.empresa_info]);
          setFormData((prev) => ({ ...prev, empresa: user.empresa_info!.id.toString() }));
        }
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        toast.error('Error al cargar empresas');
      } finally {
        setLoadingEmpresas(false);
      }
    };

    loadEmpresas();
  }, [isSuperAdmin, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el rol a superadmin, limpiar empresa
    if (name === 'rol' && value === 'superadmin') {
      setFormData((prev) => ({ ...prev, [name]: value, empresa: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo
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

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    // Validar empresa (excepto para superadmin)
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
      
      // Preparar datos para enviar
      const dataToSend: any = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        rol: formData.rol,
        cargo: formData.cargo,
        departamento: formData.departamento,
        telefono: formData.telefono,
      };

      // Solo incluir empresa si no es superadmin
      if (formData.rol !== 'superadmin') {
        dataToSend.empresa = parseInt(formData.empresa);
      }

      await usuarioService.create(dataToSend);
      toast.success('Usuario creado correctamente');
      navigate('/usuarios');
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages: Record<string, string> = {};
        
        Object.keys(backendErrors).forEach((key) => {
          const value = backendErrors[key];
          errorMessages[key] = Array.isArray(value) ? value[0] : value;
        });
        
        setErrors(errorMessages);
        toast.error('Error al crear el usuario. Revise los campos');
      } else {
        toast.error('Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmpresas) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/usuarios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
            <p className="text-gray-600 mt-1">Complete los datos del nuevo usuario</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <UsuarioFormFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
          empresas={empresas}
          isSuperAdmin={isSuperAdmin}
          isEdit={false}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          userEmpresaId={user?.empresa}
        />

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};