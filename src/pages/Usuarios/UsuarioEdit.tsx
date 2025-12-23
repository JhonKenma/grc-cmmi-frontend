import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { UsuarioFormFields } from './components/UsuarioFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const UsuarioEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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

  // ==========================================
  // CARGAR DATOS DEL USUARIO Y EMPRESAS
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);
        
        // Cargar usuario
        const usuario = await usuarioService.getById(parseInt(id));
        
        // Cargar empresas
        let empresasData: Empresa[] = [];
        if (isSuperAdmin) {
          empresasData = await empresaService.getAll();
        } else if (user?.empresa_info) {
          empresasData = [user.empresa_info];
        }
        
        setEmpresas(empresasData);
        
        // Llenar formulario
        setFormData({
          email: usuario.email || '',
          password: '', // No se carga la contraseña
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
    
    // Si cambia el rol a superadmin, limpiar empresa
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

    if (!id) return;

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const dataToSend: any = {
        email: formData.email,
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
      } else {
        dataToSend.empresa = null;
      }

      await usuarioService.update(parseInt(id), dataToSend);
      toast.success('Usuario actualizado correctamente');
      navigate('/usuarios');
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages: Record<string, string> = {};
        
        Object.keys(backendErrors).forEach((key) => {
          const value = backendErrors[key];
          errorMessages[key] = Array.isArray(value) ? value[0] : value;
        });
        
        setErrors(errorMessages);
        toast.error('Error al actualizar el usuario. Revise los campos');
      } else {
        toast.error('Error al actualizar el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
            <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
            <p className="text-gray-600 mt-1">Modifique los datos del usuario</p>
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
          isEdit={true}
          userEmpresaId={user?.empresa}
        />

        {/* Nota sobre contraseña */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> La contraseña no se puede cambiar desde aquí. 
            Si el usuario necesita cambiarla, debe usar la opción "Cambiar contraseña" en su perfil.
          </p>
        </div>

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
                Actualizando...
              </>
            ) : (
              <>
                <Save size={20} />
                Actualizar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};