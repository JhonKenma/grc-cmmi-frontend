// src/pages/Empresas/EmpresaModal.tsx
import { X } from 'lucide-react';
import { Empresa } from '@/types';
import { useEmpresaModal } from './hooks';
import { PAISES_OPTIONS, TAMANIO_OPTIONS, SECTOR_OPTIONS } from './hooks/empresaConstants';

interface EmpresaModalProps {
  empresa: Empresa | null;
  onClose: () => void;
  onSave: () => void;
}

export const EmpresaModal: React.FC<EmpresaModalProps> = ({ empresa, onClose, onSave }) => {
  const { formData, loading, isEdit, handleChange, handleSubmit } = useEmpresaModal(empresa, onSave);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                <input type="text" name="razon_social" value={formData.razon_social} onChange={handleChange} className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUC / ID Fiscal</label>
                  <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País <span className="text-red-500">*</span></label>
                <select name="pais" value={formData.pais} onChange={handleChange} className="input-field" required>
                  {PAISES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {formData.pais === 'OT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificar País <span className="text-red-500">*</span></label>
                  <input type="text" name="pais_otro" value={formData.pais_otro} onChange={handleChange} className="input-field" placeholder="Ingrese el nombre del país" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de Empresa</label>
                <select name="tamanio" value={formData.tamanio} onChange={handleChange} className="input-field">
                  <option value="">Seleccionar...</option>
                  {TAMANIO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {formData.tamanio === 'otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificar Tamaño <span className="text-red-500">*</span></label>
                  <input type="text" name="tamanio_otro" value={formData.tamanio_otro} onChange={handleChange} className="input-field" placeholder="Ingrese el tamaño de la empresa" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector o Rubro</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className="input-field">
                  <option value="">Seleccionar...</option>
                  {SECTOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {formData.sector === 'otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificar Sector <span className="text-red-500">*</span></label>
                  <input type="text" name="sector_otro" value={formData.sector_otro} onChange={handleChange} className="input-field" placeholder="Ingrese el sector de la empresa" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                <select name="timezone" value={formData.timezone} onChange={handleChange} className="input-field">
                  <option value="America/Lima">América/Lima (Perú)</option>
                  <option value="America/Bogota">América/Bogotá (Colombia)</option>
                  <option value="America/Santiago">América/Santiago (Chile)</option>
                  <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (Argentina)</option>
                  <option value="America/Mexico_City">América/Ciudad de México</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};