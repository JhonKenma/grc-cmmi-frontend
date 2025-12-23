import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresaService } from '@/api/empresa.service';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmpresaFormFields } from './components/EmpresaFormFields';

export const EmpresaCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
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

    try {
      setLoading(true);
      await empresaService.create(formData);
      toast.success('Empresa creada correctamente');
      navigate('/empresas');
    } catch (error: any) {
      console.error('Error al crear empresa:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages: Record<string, string> = {};
        
        Object.keys(backendErrors).forEach((key) => {
          const value = backendErrors[key];
          errorMessages[key] = Array.isArray(value) ? value[0] : value;
        });
        
        setErrors(errorMessages);
        toast.error('Error al crear la empresa. Revise los campos');
      } else {
        toast.error('Error al crear la empresa');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Nueva Empresa</h1>
            <p className="text-gray-600 mt-1">Complete los datos de la nueva empresa</p>
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
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Crear Empresa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};