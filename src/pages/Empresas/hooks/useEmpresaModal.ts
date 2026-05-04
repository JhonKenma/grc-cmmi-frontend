// src/pages/Empresas/hooks/useEmpresaModal.ts
import { useState, useEffect } from 'react';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import toast from 'react-hot-toast';
import { useEmpresaForm } from './useEmpresaForm';
import { EMPRESA_FORM_INITIAL } from './empresaConstants';

export const useEmpresaModal = (
  empresa: Empresa | null,
  onSave: () => void
) => {
  const isEdit = !!empresa;
  const [loading, setLoading] = useState(false);
  const { formData, setFormData, handleChange } = useEmpresaForm();

  // Cargar datos si es edición
  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre:       empresa.nombre       || '',
        razon_social: empresa.razon_social || '',
        ruc:          empresa.ruc          || '',
        pais:         empresa.pais         || 'PE',
        pais_otro:    empresa.pais_otro    || '',
        tamanio:      empresa.tamanio      || '',
        tamanio_otro: empresa.tamanio_otro || '',
        sector:       empresa.sector       || '',
        sector_otro:  empresa.sector_otro  || '',
        direccion:    empresa.direccion    || '',
        telefono:     empresa.telefono     || '',
        email:        empresa.email        || '',
        timezone:     empresa.timezone     || 'America/Lima',
      });
    } else {
      setFormData(EMPRESA_FORM_INITIAL);
    }
  }, [empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (!formData.email.trim())  { toast.error('El email es requerido');  return; }
    if (formData.pais === 'OT'    && !formData.pais_otro.trim())    { toast.error('Debe especificar el país');    return; }
    if (formData.tamanio === 'otro' && !formData.tamanio_otro.trim()) { toast.error('Debe especificar el tamaño'); return; }
    if (formData.sector === 'otro'  && !formData.sector_otro.trim())  { toast.error('Debe especificar el sector'); return; }

    try {
      setLoading(true);
      if (isEdit) {
        await empresaService.update(empresa!.id, formData);
        toast.success('Empresa actualizada correctamente');
      } else {
        await empresaService.create(formData);
        toast.success('Empresa creada correctamente');
      }
      onSave();
    } catch (error: any) {
      if (error.response?.data) {
        const errors = error.response.data;
        Object.keys(errors).forEach((key) => toast.error(`${key}: ${errors[key]}`));
      } else {
        toast.error('Error al guardar la empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, isEdit, handleChange, handleSubmit };
};