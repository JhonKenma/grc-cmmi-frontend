import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, Search, X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import { documentosApi } from '@/api/endpoints/documentos.api';
import { usuarioService } from '@/api/usuario.service';
import {
  useCausasRiesgo,
  useCreateRiesgo,
  useDeleteRiesgo,
  useNaturalezasConsecuencia,
  useTiposRiesgo,
  useUnidadesPerdida,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRiesgoPayload, EstadoRiesgo, Id } from '@/types';

const DESCRIPCION_MAX_LENGTH = 500;

const formatEstadoLabel = (estado: string): string =>
  estado
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getNivelColor = (nivel: number): string => {
  if (nivel <= 5) return 'bg-green-100 text-green-800';
  if (nivel <= 10) return 'bg-yellow-100 text-yellow-800';
  if (nivel <= 15) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

type RiesgoFormData = CreateRiesgoPayload & {
  tipo_riesgo: string;
  naturaleza_causa: string;
  naturaleza_consecuencia: string;
  fecha_identificacion: string;
  proxima_revision_fecha: string;
  evaluacion_cuantitativa_activa: boolean;
  unidad_perdida: string;
  monto_perdida: string;
  valor_activo: string;
  factor_exposicion: string;
  impacto_financiero: number;
  impacto_operacional: number;
  impacto_reputacional: number;
  peso_financiero: number;
  peso_operacional: number;
  peso_reputacional: number;
};

const createInitialFormData = (): RiesgoFormData => ({
  titulo: '',
  codigo: '',
  descripcion: '',
  categoria: '',
  categoria_coso: 'Operacional',
  probabilidad: 3,
  impacto: 3,
  causa_raiz: '',
  consecuencia: '',
  fecha_identificacion: new Date().toISOString().slice(0, 16),
  fecha_revision: '',
  controles_asociados: '',
  estado_tratamiento: 'Pendiente',
  dueno_riesgo: '',
  tipo_riesgo: '',
  naturaleza_causa: '',
  naturaleza_consecuencia: '',
  proxima_revision_fecha: '',
  proceso_texto: '',
  evaluacion_cuantitativa_activa: false,
  unidad_perdida: '',
  monto_perdida: '',
  valor_activo: '',
  factor_exposicion: '',
  impacto_financiero: 3,
  impacto_operacional: 3,
  impacto_reputacional: 3,
  peso_financiero: 0.5,
  peso_operacional: 0.3,
  peso_reputacional: 0.2,
});

export function RiesgosListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState<RiesgoFormData>(createInitialFormData);

  const riesgosQuery = useRiesgosList({
    search: search || undefined,
    estado: (estado || undefined) as EstadoRiesgo | undefined,
  });

  const tiposRiesgoQuery = useTiposRiesgo();
  const causasQuery = useCausasRiesgo();
  const consecuenciasQuery = useNaturalezasConsecuencia();
  const unidadesPerdidaQuery = useUnidadesPerdida();
  const procesosQuery = useQuery({
    queryKey: ['documentos-procesos', 'riesgos-form'],
    queryFn: () => documentosApi.getProcesos(),
  });
  const usuariosQuery = useQuery({
    queryKey: ['usuarios-riesgos-form'],
    queryFn: () => usuarioService.getAll(),
  });
  const createMutation = useCreateRiesgo();
  const deleteMutation = useDeleteRiesgo();

  const riesgos = useMemo(() => {
    const base = riesgosQuery.data?.results ?? [];
    if (!categoria) return base;
    return base.filter((item) => String(item.categoria ?? item.tipo_riesgo ?? '') === categoria);
  }, [categoria, riesgosQuery.data]);

  const categorias = useMemo(
    () =>
      (tiposRiesgoQuery.data ?? []).map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
      })),
    [tiposRiesgoQuery.data],
  );
  const procesos = useMemo(() => procesosQuery.data ?? [], [procesosQuery.data]);
  const usuarios = useMemo(() => usuariosQuery.data ?? [], [usuariosQuery.data]);

  return (
    <div className="space-y-5">
      <section className="mb-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Regresar
        </button>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registro operativo</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Lista de Riesgos</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo, codigo o proceso"
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"
            />
          </div>

          <div className="relative">
            <Filter size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="en_revision">En revision</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="">Todas las categorias</option>
            {categorias.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-cyan-700" />
            <h2 className="text-base font-semibold text-slate-900">Riesgos</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Crear riesgo
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear riesgo</h3>
                  <p className="mt-1 text-sm text-slate-500">Completa la información del riesgo en esta ventana.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                  aria-label="Cerrar formulario"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                className="space-y-6 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const code = formData.codigo.trim() || `RSG-${Date.now().toString().slice(-6)}`;
                  const procesoTexto = formData.proceso_texto?.trim() || '';

                  createMutation.mutate(
                    {
                      ...formData,
                      codigo: code,
                      categoria: undefined,
                      tipo_riesgo: formData.categoria || formData.tipo_riesgo || undefined,
                      proceso: formData.proceso || undefined,
                      proceso_texto: procesoTexto || undefined,
                    } as CreateRiesgoPayload,
                    {
                      onSuccess: () => {
                        setFormData(createInitialFormData());
                        setShowCreateForm(false);
                      },
                    }
                  );
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información Básica</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Código</label>
                      <input
                        value={formData.codigo}
                        onChange={(event) => setFormData((prev) => ({ ...prev, codigo: event.target.value.toUpperCase() }))}
                        placeholder="Ej: RSG-001"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Categoría COSO</label>
                      <select
                        value={formData.categoria_coso ?? 'Operacional'}
                        onChange={(event) => setFormData((prev) => ({ ...prev, categoria_coso: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="Operacional">Operacional</option>
                        <option value="Financiero">Financiero</option>
                        <option value="Cumplimiento">Cumplimiento</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Categoría / Tipo de Riesgo <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.categoria || '')}
                        onChange={(event) => setFormData((prev) => ({ ...prev, categoria: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar tipo de riesgo...</option>
                        {categorias.map((item) => (
                          <option key={String(item.id)} value={String(item.id)}>
                            {item.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600">Título del Riesgo <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.titulo}
                        onChange={(event) => setFormData((prev) => ({ ...prev, titulo: event.target.value }))}
                        placeholder="Ej: Pérdida de datos por ransomware"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600">Proceso Asociado</label>
                      <select
                        value={formData.proceso ?? ''}
                        onChange={(event) => {
                          const procesoId = event.target.value;
                          const procesoSeleccionado = procesos.find((item) => String(item.id) === procesoId);
                          setFormData((prev) => ({
                            ...prev,
                            proceso: procesoId,
                            proceso_texto:
                              procesoSeleccionado?.nombre ?? prev.proceso_texto,
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar proceso (opcional)</option>
                        {procesos.map((proceso) => (
                          <option key={proceso.id} value={proceso.id}>
                            {proceso.sigla ? `${proceso.sigla} - ` : ''}
                            {proceso.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600">Proceso/Área Propietaria</label>
                      <input
                        type="text"
                        value={formData.proceso_texto ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, proceso_texto: event.target.value }))}
                        placeholder="Ej: Gestión TI / Operaciones"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Puedes escribir el área manualmente o seleccionar un proceso asociado.</p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-600">Descripción del Riesgo <span className="text-red-500">*</span></label>
                      <span className="text-xs text-slate-500">{formData.descripcion.length}/{DESCRIPCION_MAX_LENGTH}</span>
                    </div>
                    <textarea
                      required
                      maxLength={DESCRIPCION_MAX_LENGTH}
                      value={formData.descripcion}
                      onChange={(event) => setFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                      placeholder="Describe en detalle el riesgo identificado..."
                      className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                    <p className="text-xs text-slate-500">Máximo 500 caracteres</p>
                  </div>
                </div>

                {/* Causa y Consecuencia */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Análisis Básico</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Causa</label>
                      <select
                        value={formData.causa_raiz ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, causa_raiz: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar causa...</option>
                        {causasQuery.data?.map((causa) => (
                          <option key={causa.id} value={causa.descripcion || causa.nombre} title={causa.descripcion}>
                            {causa.numero}. {causa.nombre}
                          </option>
                        ))}
                      </select>
                      {formData.causa_raiz && (
                        <p className="mt-2 rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-xs text-cyan-800">
                          {formData.causa_raiz}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Consecuencia</label>
                      <select
                        value={formData.consecuencia ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, consecuencia: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar consecuencia...</option>
                        {consecuenciasQuery.data?.map((consecuencia) => (
                          <option key={consecuencia.id} value={consecuencia.descripcion || consecuencia.nombre} title={consecuencia.descripcion}>
                            {consecuencia.numero}. {consecuencia.nombre}
                          </option>
                        ))}
                      </select>
                      {formData.consecuencia && (
                        <p className="mt-2 rounded-lg border border-violet-100 bg-violet-50 p-3 text-xs text-violet-800">
                          {formData.consecuencia}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seguimiento básico */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Seguimiento</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha de identificación <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.fecha_identificacion ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha_identificacion: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha de revisión <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={formData.fecha_revision ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha_revision: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Controles Asociados</label>
                      <input
                        value={formData.controles_asociados ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, controles_asociados: event.target.value }))}
                        placeholder="Ej: C001,C002"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Estado de Tratamiento <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={formData.estado_tratamiento ?? 'Pendiente'}
                        onChange={(event) => setFormData((prev) => ({ ...prev, estado_tratamiento: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Mitigado">Mitigado</option>
                        <option value="Aceptado">Aceptado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Identificación y Clasificación</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Tipo de Riesgo</label>
                      <select
                        value={formData.tipo_riesgo}
                        onChange={(event) => setFormData((prev) => ({ ...prev, tipo_riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar tipo...</option>
                        {tiposRiesgoQuery.data?.map((tipo) => (
                          <option key={tipo.id} value={tipo.id} title={tipo.descripcion}>
                            {tipo.numero}. {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Naturaleza de la Causa</label>
                      <select
                        value={formData.naturaleza_causa}
                        onChange={(event) => setFormData((prev) => ({ ...prev, naturaleza_causa: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar causa...</option>
                        {causasQuery.data?.map((causa) => (
                          <option key={causa.id} value={causa.id} title={causa.descripcion}>
                            {causa.numero}. {causa.nombre}
                          </option>
                        ))}
                      </select>
                      {formData.naturaleza_causa && (
                        <p className="mt-1 text-xs text-slate-500">
                          {causasQuery.data?.find((causa) => causa.id === formData.naturaleza_causa)?.descripcion}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Naturaleza de la Consecuencia</label>
                      <select
                        value={formData.naturaleza_consecuencia}
                        onChange={(event) => setFormData((prev) => ({ ...prev, naturaleza_consecuencia: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Seleccionar consecuencia...</option>
                        {consecuenciasQuery.data?.map((consecuencia) => (
                          <option key={consecuencia.id} value={consecuencia.id} title={consecuencia.descripcion}>
                            {consecuencia.numero}. {consecuencia.nombre}
                          </option>
                        ))}
                      </select>
                      {formData.naturaleza_consecuencia && (
                        <p className="mt-1 text-xs text-slate-500">
                          {consecuenciasQuery.data?.find((consecuencia) => consecuencia.id === formData.naturaleza_consecuencia)?.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Evaluación Cuantitativa</h3>
                      <p className="text-xs text-slate-500">Opcional - activa cálculo de pérdidas monetarias</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, evaluacion_cuantitativa_activa: !prev.evaluacion_cuantitativa_activa }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.evaluacion_cuantitativa_activa ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.evaluacion_cuantitativa_activa ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.evaluacion_cuantitativa_activa && (
                    <div className="space-y-3 rounded-lg bg-blue-50 p-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Unidad de Pérdida</label>
                        <select
                          value={formData.unidad_perdida}
                          onChange={(event) => setFormData((prev) => ({ ...prev, unidad_perdida: event.target.value }))}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar unidad...</option>
                          {['tiempo', 'volumen', 'persona', 'activo', 'regulatorio', 'ambiental'].map((categoria) => {
                            const grupo = unidadesPerdidaQuery.data?.filter((unidad) => unidad.categoria === categoria) ?? [];
                            if (!grupo.length) return null;
                            return (
                              <optgroup key={categoria} label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}>
                                {grupo.map((unidad) => (
                                  <option key={unidad.id} value={unidad.id}>
                                    {unidad.nombre}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Monto de Pérdida (USD)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.monto_perdida}
                          onChange={(event) => setFormData((prev) => ({ ...prev, monto_perdida: event.target.value }))}
                          placeholder="Ej: 50000"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="border-t border-blue-200 pt-3">
                        <p className="mb-2 text-xs font-semibold text-blue-700">F2: SLE = Valor Activo × Factor Exposición</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Valor del Activo (USD)</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={formData.valor_activo}
                              onChange={(event) => setFormData((prev) => ({ ...prev, valor_activo: event.target.value }))}
                              placeholder="Ej: 2000000"
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Factor de Exposición (0-1)</label>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={formData.factor_exposicion}
                              onChange={(event) => setFormData((prev) => ({ ...prev, factor_exposicion: event.target.value }))}
                              placeholder="Ej: 0.40"
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                        {formData.valor_activo && formData.factor_exposicion && (
                          <div className="mt-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                            <span className="text-xs font-semibold text-green-700">
                              SLE = ${(Number(formData.valor_activo) * Number(formData.factor_exposicion)).toLocaleString('es', { minimumFractionDigits: 2 })} USD
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-blue-200 pt-3">
                        <p className="mb-2 text-xs font-semibold text-blue-700">F3: NRC ponderado</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Imp. Financiero</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.impacto_financiero}
                              onChange={(event) => setFormData((prev) => ({ ...prev, impacto_financiero: Number(event.target.value) }))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Imp. Operacional</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.impacto_operacional}
                              onChange={(event) => setFormData((prev) => ({ ...prev, impacto_operacional: Number(event.target.value) }))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Imp. Reputacional</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.impacto_reputacional}
                              onChange={(event) => setFormData((prev) => ({ ...prev, impacto_reputacional: Number(event.target.value) }))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                        {formData.probabilidad && formData.impacto_financiero && (
                          <div className="mt-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                            <span className="text-xs font-semibold text-green-700">
                              NRC = {(
                                formData.probabilidad * (
                                  formData.impacto_financiero * 0.5 +
                                  formData.impacto_operacional * 0.3 +
                                  formData.impacto_reputacional * 0.2
                                )
                              ).toFixed(2)} (escala 1-25)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Evaluación de Riesgo */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Evaluación de Riesgo</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Probabilidad (1-5) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        required
                        value={formData.probabilidad}
                        onChange={(event) => setFormData((prev) => ({ ...prev, probabilidad: Number(event.target.value) }))}
                        placeholder="1-5"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Cuán probable es que ocurra</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Impacto (1-5) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        required
                        value={formData.impacto}
                        onChange={(event) => setFormData((prev) => ({ ...prev, impacto: Number(event.target.value) }))}
                        placeholder="1-5"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Consecuencias si ocurre</p>
                    </div>
                  </div>
                </div>

                {/* Asignación y Responsable */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Asignación</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Dueño/Responsable del Riesgo</label>
                      <select
                        value={String(formData.dueno_riesgo ?? '')}
                        onChange={(event) => setFormData((prev) => ({ ...prev, dueno_riesgo: event.target.value || undefined }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="">Asignar responsable (opcional)</option>
                        {usuarios.map((usuario) => (
                          <option key={String(usuario.id)} value={String(usuario.id)}>
                            {usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-500">Usuario responsable de monitorear este riesgo</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-800">
                  <p className="font-semibold">Trazabilidad automática</p>
                  <p>
                    Al guardar, el sistema registra automáticamente quién creó el riesgo y la fecha/hora exacta de creación.
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 lg:flex-row lg:items-center lg:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Guardar riesgo'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {riesgosQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando riesgos...</div>
        ) : riesgos.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">No hay riesgos con los filtros actuales.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">COSO</th>
                  <th className="px-4 py-3">P × I</th>
                  <th className="px-4 py-3">Inherente</th>
                  <th className="px-4 py-3">Residual</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Tratamiento</th>
                  <th className="px-4 py-3">Registrado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {riesgos.map((riesgo) => {
                  const nivel = (riesgo.probabilidad ?? 1) * (riesgo.impacto ?? 1);
                  let clasificacionBadge = '🟢 Bajo';
                  let badgeClass = 'bg-emerald-100 text-emerald-800';
                  
                  if (nivel >= 15) {
                    clasificacionBadge = '🔴 Crítico';
                    badgeClass = 'bg-red-100 text-red-800';
                  } else if (nivel >= 10) {
                    clasificacionBadge = '🟠 Alto';
                    badgeClass = 'bg-orange-100 text-orange-800';
                  } else if (nivel >= 5) {
                    clasificacionBadge = '🟡 Moderado';
                    badgeClass = 'bg-yellow-100 text-yellow-800';
                  }

                  const fechaCreacion = riesgo.fecha_creacion
                    ? new Date(riesgo.fecha_creacion).toLocaleDateString('es-ES')
                    : '-';

                  return (
                    <tr key={String(riesgo.id)} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700 font-mono text-xs">{riesgo.codigo}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{riesgo.titulo ?? riesgo.nombre}</td>
                      <td className="px-4 py-3 text-slate-700">{riesgo.categoria_nombre ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{riesgo.categoria_coso ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>
                          {clasificacionBadge}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getNivelColor(riesgo.nivel_inherente ?? nivel)}`}>
                          {(riesgo.nivel_inherente ?? nivel).toFixed(1)} ({riesgo.clasificacion ?? 'N/A'})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {riesgo.riesgo_residual_calculado != null ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getNivelColor(riesgo.riesgo_residual_calculado)}`}>
                            {riesgo.riesgo_residual_calculado.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Sin tratar</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">
                        {riesgo.responsable_riesgo_nombre
                          ? `👤 ${riesgo.responsable_riesgo_nombre}`
                          : riesgo.propietario_nombre
                          ? riesgo.propietario_nombre
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{riesgo.estado_tratamiento ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">
                        <div>
                          <div>{fechaCreacion}</div>
                          {riesgo.identificado_por_nombre && (
                            <div className="text-slate-500 text-xs">por {riesgo.identificado_por_nombre}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-xs font-medium">
                          {formatEstadoLabel(String(riesgo.estado))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/riesgos/${riesgo.id}`)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 transition"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(riesgo.id as Id)}
                            className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 transition"
                          >
                            × Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
