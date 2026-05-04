// src/pages/Empresas/hooks/useEmpresaForm.ts
import { useState } from 'react';
import { EmpresaFormData, EMPRESA_FORM_INITIAL } from './empresaConstants';

// ── Validación reutilizable ───────────────────────────────────────────────────

export const validateEmpresaForm = (
  formData: EmpresaFormData
): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';

  if (!formData.email.trim()) {
    newErrors.email = 'El email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email inválido';
  }

  if (formData.pais === 'OT' && !formData.pais_otro.trim())
    newErrors.pais_otro = 'Debe especificar el país';

  if (formData.tamanio === 'otro' && !formData.tamanio_otro.trim())
    newErrors.tamanio_otro = 'Debe especificar el tamaño';

  if (formData.sector === 'otro' && !formData.sector_otro.trim())
    newErrors.sector_otro = 'Debe especificar el sector';

  return newErrors;
};

// ── Hook base del formulario ──────────────────────────────────────────────────

export const useEmpresaForm = (initial: EmpresaFormData = EMPRESA_FORM_INITIAL) => {
  const [formData, setFormData] = useState<EmpresaFormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validate = (): boolean => {
    const newErrors = validateEmpresaForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setBackendErrors = (backendErrors: Record<string, any>) => {
    const errorMessages: Record<string, string> = {};
    Object.keys(backendErrors).forEach((key) => {
      const value = backendErrors[key];
      errorMessages[key] = Array.isArray(value) ? value[0] : value;
    });
    setErrors(errorMessages);
  };

  return { formData, setFormData, errors, setErrors, handleChange, validate, setBackendErrors };
};