// src/pages/Empresas/EmpresaModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import toast from 'react-hot-toast';

interface EmpresaModalProps {
  empresa: Empresa | null;
  onClose: () => void;
  onSave: () => void;
}

export const EmpresaModal: React.FC<EmpresaModalProps> = ({
  empresa,
  onClose,
  onSave,
}) => {
  const isEdit = !!empresa;
  
  const [loading, setLoading] = useState(false);
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
  // CARGAR DATOS SI ES EDICIÓN
  // ==========================================
  useEffect(() => {
    if (empresa) {
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
    }
  }, [empresa]);

  // ==========================================
  // OPCIONES DE SELECTS
  // ==========================================
  const paisesOptions = [
    { value: 'PE', label: 'Perú' },
    { value: 'CO', label: 'Colombia' },
    { value: 'CL', label: 'Chile' },
    { value: 'AR', label: 'Argentina' },
    { value: 'MX', label: 'México' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'BR', label: 'Brasil' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'ES', label: 'España' },
    { value: 'OT', label: 'Otro' },
  ];

  const tamanioOptions = [
    { value: 'micro', label: 'Microempresa' },
    { value: 'pequena', label: 'Pequeña Empresa' },
    { value: 'mediana', label: 'Mediana Empresa' },
    { value: 'grande', label: 'Gran Empresa' },
    { value: 'otro', label: 'Otro' },
  ];

  const sectorOptions = [
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'financiero', label: 'Financiero y Seguros' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'retail', label: 'Retail y Comercio' },
    { value: 'servicios', label: 'Servicios Profesionales' },
    { value: 'salud', label: 'Salud y Farmacéutico' },
    { value: 'educacion', label: 'Educación' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'energia', label: 'Energía y Utilities' },
    { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
    { value: 'agricultura', label: 'Agricultura y Ganadería' },
    { value: 'mineria', label: 'Minería' },
    { value: 'transporte', label: 'Transporte y Logística' },
    { value: 'turismo', label: 'Turismo y Hospitalidad' },
    { value: 'inmobiliario', label: 'Inmobiliario' },
    { value: 'medios', label: 'Medios y Entretenimiento' },
    { value: 'gobierno', label: 'Gobierno y Sector Público' },
    { value: 'ong', label: 'ONG y Sin Fines de Lucro' },
    { value: 'otro', label: 'Otro' },
  ];

  // ==========================================
  // MANEJAR CAMBIOS
  // ==========================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }

    // Validar campos "otro"
    if (formData.pais === 'OT' && !formData.pais_otro.trim()) {
      toast.error('Debe especificar el país');
      return;
    }

    if (formData.tamanio === 'otro' && !formData.tamanio_otro.trim()) {
      toast.error('Debe especificar el tamaño');
      return;
    }

    if (formData.sector === 'otro' && !formData.sector_otro.trim()) {
      toast.error('Debe especificar el sector');
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await empresaService.update(empresa.id, formData);
        toast.success('Empresa actualizada correctamente');
      } else {
        await empresaService.create(formData);
        toast.success('Empresa creada correctamente');
      }

      onSave();
    } catch (error: any) {
      console.error('Error al guardar empresa:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key]}`);
        });
      } else {
        toast.error('Error al guardar la empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Razón Social */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* RUC y Email en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUC / ID Fiscal
                  </label>
                  <input
                    type="text"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {paisesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* País Otro (condicional) */}
              {formData.pais === 'OT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especificar País <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pais_otro"
                    value={formData.pais_otro}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese el nombre del país"
                  />
                </div>
              )}

              {/* Tamaño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño de Empresa
                </label>
                <select
                  name="tamanio"
                  value={formData.tamanio}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Seleccionar...</option>
                  {tamanioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tamaño Otro (condicional) */}
              {formData.tamanio === 'otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especificar Tamaño <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tamanio_otro"
                    value={formData.tamanio_otro}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese el tamaño de la empresa"
                  />
                </div>
              )}

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector o Rubro
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Seleccionar...</option>
                  {sectorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector Otro (condicional) */}
              {formData.sector === 'otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especificar Sector <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sector_otro"
                    value={formData.sector_otro}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese el sector de la empresa"
                  />
                </div>
              )}

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona Horaria
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="America/Lima">América/Lima (Perú)</option>
                  <option value="America/Bogota">América/Bogotá (Colombia)</option>
                  <option value="America/Santiago">América/Santiago (Chile)</option>
                  <option value="America/Argentina/Buenos_Aires">
                    América/Buenos Aires (Argentina)
                  </option>
                  <option value="America/Mexico_City">América/Ciudad de México</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};