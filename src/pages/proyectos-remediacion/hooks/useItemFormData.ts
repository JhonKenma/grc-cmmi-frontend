import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ItemFormData {
  nombre: string;
  descripcion: string;
  usuario_responsable_id: string;
  proveedor_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_estimado: number;
}

interface FormError {
  [key: string]: string;
}

export const useItemFormData = () => {
  const [formData, setFormData] = useState<ItemFormData>({
    nombre: '',
    descripcion: '',
    usuario_responsable_id: '',
    proveedor_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    costo_estimado: 0,
  });

  const [errors, setErrors] = useState<FormError>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    field: keyof ItemFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormError = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.usuario_responsable_id) newErrors.usuario_responsable_id = 'Seleccione un responsable';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    if (!formData.fecha_fin) newErrors.fecha_fin = 'La fecha de fin es requerida';

    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    if (formData.costo_estimado < 0) {
      newErrors.costo_estimado = 'El costo estimado no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      usuario_responsable_id: '',
      proveedor_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      costo_estimado: 0,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    loading,
    setLoading,
    handleChange,
    validate,
    reset,
    setFormData,
  };
};
