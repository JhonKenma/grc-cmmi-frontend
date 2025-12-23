import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { empresaService } from '@/api/empresa.service';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmpresaFormFields } from './components/EmpresaFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const EmpresaEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nombre: '',
    razon_social: '',
    ruc: '',
    pais: 'PE',
    pais_otro: '',
    tamanio: '',
    tamanio_otro: '',
    sector: '',
    sector_otro: '',
    direccion: '',
    telefono: '',
    email: '',
    timezone: 'America/Lima',
  });

  // ==========================================
  // CARGAR DATOS DE LA EMPRESA
  // ==========================================
  useEffect(() => {
    const loadEmpresa = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);
        const empresa = await empresaService.getById(parseInt(id));
        
        setFormData({
          nombre: empresa.nombre || '',
          razon_social: empresa.razon_social || '',
          ruc: empresa.ruc || '',
          pais: empresa.pais || 'PE',
          pais_otro: empresa.pais_otro || '',
          tamanio: empresa.tamanio || '',
          tamanio_otro: empresa.tamanio_otro || '',
          sector: empresa.sector || '',
          sector_otro: empresa.sector_otro || '',
          direccion: empresa.direccion || '',
          telefono: empresa.telefono || '',
          email: empresa.email || '',
          timezone: empresa.timezone || 'America/Lima',
        });
      } catch (error) {
        console.error('Error al cargar empresa:', error);
        toast.error('Error al cargar los datos de la empresa');
        navigate('/empresas');
      } finally {
        setLoadingData(false);
      }
    };

    loadEmpresa();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.pais === 'OT' && !formData.pais_otro.trim()) {
      newErrors.pais_otro = 'Debe especificar el país';
    }

    if (formData.tamanio === 'otro' && !formData.tamanio_otro.trim()) {
      newErrors.tamanio_otro = 'Debe especificar el tamaño';
    }

    if (formData.sector === 'otro' && !formData.sector_otro.trim()) {
      newErrors.sector_otro = 'Debe especificar el sector';
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
      await empresaService.update(parseInt(id), formData);
      toast.success('Empresa actualizada correctamente');
      navigate('/empresas');
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages: Record<string, string> = {};
        
        Object.keys(backendErrors).forEach((key) => {
          const value = backendErrors[key];
          errorMessages[key] = Array.isArray(value) ? value[0] : value;
        });
        
        setErrors(errorMessages);
        toast.error('Error al actualizar la empresa. Revise los campos');
      } else {
        toast.error('Error al actualizar la empresa');
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
            onClick={() => navigate('/empresas')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Empresa</h1>
            <p className="text-gray-600 mt-1">Modifique los datos de la empresa</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <EmpresaFormFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/empresas')}
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
                Actualizar Empresa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};