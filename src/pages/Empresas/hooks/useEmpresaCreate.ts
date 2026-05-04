// src/pages/Empresas/hooks/useEmpresaCreate.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresaService } from '@/api/empresa.service';
import toast from 'react-hot-toast';
import { useEmpresaForm } from './useEmpresaForm';

export const useEmpresaCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { formData, errors, handleChange, validate, setBackendErrors } = useEmpresaForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }
    try {
      setLoading(true);
      const empresa = await empresaService.create(formData);

      // Plan demo: hoy + 60 días
      const fechaDemo = new Date();
      fechaDemo.setDate(fechaDemo.getDate() + 60);
      const fechaDemoStr = fechaDemo.toISOString().slice(0, 10);

      await empresaService.asignarPlan(empresa.id, {
        tipo:                'demo',
        max_usuarios:        3,
        max_administradores: 1,
        max_auditores:       1,
        fecha_expiracion:    fechaDemoStr,
        sin_expiracion:      false,
      });

      toast.success('Empresa creada con plan demo (60 días)');
      navigate('/empresas');
    } catch (error: any) {
      if (error.response?.data) {
        setBackendErrors(error.response.data);
        toast.error('Error al crear la empresa. Revise los campos');
      } else {
        toast.error('Error al crear la empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLista = () => navigate('/empresas');

  return { formData, errors, loading, handleChange, handleSubmit, goToLista };
};