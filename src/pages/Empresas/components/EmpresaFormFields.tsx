import React from 'react';

interface FormData {
  nombre: string;
  razon_social: string;
  ruc: string;
  pais: string;
  pais_otro: string;
  tamanio: string;
  tamanio_otro: string;
  sector: string;
  sector_otro: string;
  direccion: string;
  telefono: string;
  email: string;
  timezone: string;
}

interface EmpresaFormFieldsProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors?: Record<string, string>;
}

export const EmpresaFormFields: React.FC<EmpresaFormFieldsProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
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
    { value: '', label: 'Seleccionar...' },
    { value: 'micro', label: 'Microempresa' },
    { value: 'pequena', label: 'Pequeña Empresa' },
    { value: 'mediana', label: 'Mediana Empresa' },
    { value: 'grande', label: 'Gran Empresa' },
    { value: 'otro', label: 'Otro' },
  ];

  const sectorOptions = [
    { value: '', label: 'Seleccionar...' },
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

  return (
    <div className="space-y-6">
      {/* Sección: Información Básica */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={onChange}
              className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
              placeholder="Ej: Acme Corporation S.A.C."
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Razón Social */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón Social
            </label>
            <input
              type="text"
              name="razon_social"
              value={formData.razon_social}
              onChange={onChange}
              className="input-field"
              placeholder="Razón social completa"
            />
          </div>

          {/* RUC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUC / ID Fiscal
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={onChange}
              className={`input-field ${errors.ruc ? 'border-red-500' : ''}`}
              placeholder="Ej: 20123456789"
            />
            {errors.ruc && (
              <p className="mt-1 text-sm text-red-600">{errors.ruc}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Corporativo <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="contacto@empresa.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Ubicación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País <span className="text-red-500">*</span>
            </label>
            <select
              name="pais"
              value={formData.pais}
              onChange={onChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificar País <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pais_otro"
                value={formData.pais_otro}
                onChange={onChange}
                className={`input-field ${errors.pais_otro ? 'border-red-500' : ''}`}
                placeholder="Ingrese el nombre del país"
              />
              {errors.pais_otro && (
                <p className="mt-1 text-sm text-red-600">{errors.pais_otro}</p>
              )}
            </div>
          )}

          {/* Dirección */}
          <div className={formData.pais === 'OT' ? 'md:col-span-2' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              className="input-field"
              rows={2}
              placeholder="Dirección completa de la empresa"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={onChange}
              className="input-field"
              placeholder="Ej: +51 999 999 999"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona Horaria
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={onChange}
              className="input-field"
            >
              <option value="America/Lima">América/Lima (Perú)</option>
              <option value="America/Bogota">América/Bogotá (Colombia)</option>
              <option value="America/Santiago">América/Santiago (Chile)</option>
              <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (Argentina)</option>
              <option value="America/Mexico_City">América/Ciudad de México (México)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sección: Clasificación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tamaño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño de Empresa
            </label>
            <select
              name="tamanio"
              value={formData.tamanio}
              onChange={onChange}
              className="input-field"
            >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificar Tamaño <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tamanio_otro"
                value={formData.tamanio_otro}
                onChange={onChange}
                className={`input-field ${errors.tamanio_otro ? 'border-red-500' : ''}`}
                placeholder="Ingrese el tamaño de la empresa"
              />
              {errors.tamanio_otro && (
                <p className="mt-1 text-sm text-red-600">{errors.tamanio_otro}</p>
              )}
            </div>
          )}

          {/* Sector */}
          <div className={formData.tamanio === 'otro' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector o Rubro
            </label>
            <select
              name="sector"
              value={formData.sector}
              onChange={onChange}
              className="input-field"
            >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificar Sector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sector_otro"
                value={formData.sector_otro}
                onChange={onChange}
                className={`input-field ${errors.sector_otro ? 'border-red-500' : ''}`}
                placeholder="Ingrese el sector de la empresa"
              />
              {errors.sector_otro && (
                <p className="mt-1 text-sm text-red-600">{errors.sector_otro}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};