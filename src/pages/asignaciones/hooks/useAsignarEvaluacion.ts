// src/pages/asignaciones/hooks/useAsignarEvaluacion.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encuestasApi } from '@/api/endpoints/encuestas.api';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import { empresaService } from '@/api/empresa.service';
import { usuarioService } from '@/api/usuario.service';
import { EncuestaListItem, Usuario, Empresa } from '@/types';
import toast from 'react-hot-toast';

export const useAsignarEvaluacion = () => {
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting]  = useState(false);
  const [encuestas, setEncuestas]    = useState<EncuestaListItem[]>([]);
  const [empresas, setEmpresas]      = useState<Empresa[]>([]);
  const [administradores, setAdministradores] = useState<Usuario[]>([]);

  // Formulario
  const [encuestaId, setEncuestaId]           = useState('');
  const [empresaId, setEmpresaId]             = useState('');
  const [administradorId, setAdministradorId] = useState('');
  const [fechaLimite, setFechaLimite]         = useState('');
  const [observaciones, setObservaciones]     = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (empresaId) {
      loadAdministradoresPorEmpresa(parseInt(empresaId));
    } else {
      setAdministradores([]);
      setAdministradorId('');
    }
  }, [empresaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const encuestasData = await encuestasApi.list();
      const encuestasArray = Array.isArray(encuestasData)
        ? encuestasData
        : (encuestasData as any).results || [];
      setEncuestas(encuestasArray.filter((e: EncuestaListItem) => e.activo));

      const empresasData = await empresaService.getAll();
      setEmpresas(empresasData.filter((e: Empresa) => e.activo));
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadAdministradoresPorEmpresa = async (empresaIdNum: number) => {
    try {
      const admins = await usuarioService.getByEmpresa(empresaIdNum, 'administrador');
      setAdministradores(admins);
    } catch {
      toast.error('Error al cargar administradores');
      setAdministradores([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encuestaId || !empresaId || !administradorId || !fechaLimite) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      const response = await evaluacionesApi.asignar({
        encuesta_id:       encuestaId,
        empresa_id:        parseInt(empresaId),
        administrador_id:  parseInt(administradorId),
        fecha_limite:      fechaLimite,
        observaciones:     observaciones || undefined,
      });
      toast.success(response.message || 'Evaluación asignada exitosamente');
      navigate('/asignaciones/mis-evaluaciones');
    } catch (error: any) {
      const d = error.response?.data;
      const msg =
        d?.message || d?.error ||
        d?.encuesta_id?.[0] || d?.empresa_id?.[0] || d?.administrador_id?.[0] ||
        Object.values(d || {}).flat().join(', ') ||
        'Error al asignar evaluación';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const goToLista = () => navigate('/asignaciones/mis-evaluaciones');

  return {
    loading, submitting,
    encuestas, empresas, administradores,
    encuestaId, setEncuestaId,
    empresaId, setEmpresaId,
    administradorId, setAdministradorId,
    fechaLimite, setFechaLimite,
    observaciones, setObservaciones,
    handleSubmit, goToLista,
  };
};