// src/pages/Empresas/hooks/useEmpresaEdit.ts
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { empresaService } from '@/api/empresa.service';
import toast from 'react-hot-toast';
import { useEmpresaForm } from './useEmpresaForm';

export const useEmpresaEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { formData, setFormData, errors, handleChange, validate, setBackendErrors } = useEmpresaForm();

  useEffect(() => {
    const loadEmpresa = async () => {
      if (!id) return;
      try {
        setLoadingData(true);
        const empresa = await empresaService.getById(parseInt(id));
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
      } catch {
        toast.error('Error al cargar los datos de la empresa');
        navigate('/empresas');
      } finally {
        setLoadingData(false);
      }
    };
    loadEmpresa();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
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
      if (error.response?.data) {
        setBackendErrors(error.response.data);
        toast.error('Error al actualizar la empresa. Revise los campos');
      } else {
        toast.error('Error al actualizar la empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLista = () => navigate('/empresas');

  return { formData, errors, loading, loadingData, handleChange, handleSubmit, goToLista };
};