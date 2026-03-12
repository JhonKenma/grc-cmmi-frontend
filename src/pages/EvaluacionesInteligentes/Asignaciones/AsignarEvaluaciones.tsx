// src/pages/EvaluacionesInteligentes/Asignaciones/AsignarEvaluaciones.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Calendar, Users, AlertCircle, CheckCircle2,
  Search, ChevronRight, X, FileText, Shield, Bell, ClipboardCheck,
  ChevronLeft, ChevronDown, Filter,
} from 'lucide-react';
import { evaluacionesInteligentesApi, asignacionIQApi } from '@/api/endpoints';
import { usuarioService } from '@/api/usuario.service';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { EvaluacionList } from '@/types/iqevaluaciones.types';
import type { Usuario } from '@/types';
import type { CrearAsignacionData } from '@/types/asignacion-iq.types';

// ─── Constantes ──────────────────────────────────────────────────────────────

const EVAL_PAGE_SIZE = 6;
const USER_PAGE_SIZE = 8;

const STEPS = [
  { id: 1, label: 'Evaluación',  icon: FileText },
  { id: 2, label: 'Usuarios',    icon: Users },
  { id: 3, label: 'Configurar',  icon: Shield },
];

// ─── Sub-componentes ligeros ──────────────────────────────────────────────────

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((step, idx) => {
      const Icon = step.icon;
      const done    = current > step.id;
      const active  = current === step.id;
      return (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            done   ? 'bg-emerald-100 text-emerald-700' :
            active ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' :
                     'bg-gray-100 text-gray-400'
          }`}>
            {done
              ? <CheckCircle2 size={15} />
              : <Icon size={15} />
            }
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.id}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 h-px mx-1 ${current > step.id ? 'bg-emerald-300' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const AsignarEvaluaciones = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Estado general ─────────────────────────────────────────────────────────
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paso, setPaso]           = useState(1);

  // ── Evaluaciones ───────────────────────────────────────────────────────────
  const [evaluaciones, setEvaluaciones]         = useState<EvaluacionList[]>([]);
  const [evalTotal, setEvalTotal]               = useState(0);
  const [evalPage, setEvalPage]                 = useState(1);
  const [evalSearch, setEvalSearch]             = useState('');
  const [evalSearchInput, setEvalSearchInput]   = useState('');
  const [loadingEval, setLoadingEval]           = useState(false);
  const evalDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios]                 = useState<Usuario[]>([]);
  const [userTotal, setUserTotal]               = useState(0);
  const [userPage, setUserPage]                 = useState(1);
  const [userSearch, setUserSearch]             = useState('');
  const [userSearchInput, setUserSearchInput]   = useState('');
  const [loadingUsers, setLoadingUsers]         = useState(false);
  const userDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<CrearAsignacionData>({
    evaluacion: 0,
    usuarios: [],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    notas_asignacion: '',
    requiere_revision: true,
    notificar_usuario: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const evalSeleccionada = evaluaciones.find(e => e.id === formData.evaluacion);

  // ── Carga inicial ──────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(false); // datos se cargan lazy por paso
  }, []);

  // ── Carga de evaluaciones (server-side paginado) ───────────────────────────

  const cargarEvaluaciones = useCallback(async () => {
    try {
      setLoadingEval(true);
      // Reutilizamos axiosInstance directo para pasar params de paginación
      const { default: axiosInstance } = await import('@/api/axios');
      const params = new URLSearchParams({
        page: evalPage.toString(),
        page_size: EVAL_PAGE_SIZE.toString(),
      });
      // Solo disponibles / en proceso
      params.append('estado__in', 'disponible,en_proceso');
      if (evalSearch) params.append('search', evalSearch);

      const { data } = await axiosInstance.get(`/evaluaciones/evaluaciones/?${params}`);
      const results = Array.isArray(data) ? data : (data.results ?? []);
      const count   = Array.isArray(data) ? data.length : (data.count ?? 0);

      setEvaluaciones(results);
      setEvalTotal(count);
    } catch {
      toast.error('Error al cargar evaluaciones');
    } finally {
      setLoadingEval(false);
    }
  }, [evalPage, evalSearch]);

  useEffect(() => {
    if (paso === 1) cargarEvaluaciones();
  }, [cargarEvaluaciones, paso]);

  useEffect(() => { setEvalPage(1); }, [evalSearch]);

  // ── Carga de usuarios (server-side paginado) ───────────────────────────────

  const cargarUsuarios = useCallback(async () => {
    if (!user?.empresa) return;
    try {
      setLoadingUsers(true);
      // Asumimos que usuarioService soporta search + page
      // Si no, hacemos la llamada directa:
      const { default: axiosInstance } = await import('@/api/axios');
      const params = new URLSearchParams({
        empresa: user.empresa.toString(),
        rol: 'usuario',
        activo: 'true',
        page: userPage.toString(),
        page_size: USER_PAGE_SIZE.toString(),
      });
      if (userSearch) params.append('search', userSearch);

      const { data } = await axiosInstance.get(`/usuarios/?${params}`);
      const results = Array.isArray(data) ? data : (data.results ?? []);
      const count   = Array.isArray(data) ? data.length : (data.count ?? 0);

      setUsuarios(results);
      setUserTotal(count);
    } catch {
      // Fallback: cargar todo y paginar en cliente
      try {
        const all = await usuarioService.getByEmpresa(user.empresa!, 'usuario');
        const active = all.filter(u => u.activo);
        const filtered = userSearch
          ? active.filter(u =>
              `${u.first_name} ${u.last_name} ${u.email}`
                .toLowerCase().includes(userSearch.toLowerCase())
            )
          : active;
        setUserTotal(filtered.length);
        const start = (userPage - 1) * USER_PAGE_SIZE;
        setUsuarios(filtered.slice(start, start + USER_PAGE_SIZE));
      } catch {
        toast.error('Error al cargar usuarios');
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [user, userPage, userSearch]);

  useEffect(() => {
    if (paso === 2) cargarUsuarios();
  }, [cargarUsuarios, paso]);

  useEffect(() => { setUserPage(1); }, [userSearch]);

  // ── Debounce helpers ───────────────────────────────────────────────────────

  const handleEvalSearch = (val: string) => {
    setEvalSearchInput(val);
    if (evalDebounce.current) clearTimeout(evalDebounce.current);
    evalDebounce.current = setTimeout(() => setEvalSearch(val.trim()), 400);
  };

  const handleUserSearch = (val: string) => {
    setUserSearchInput(val);
    if (userDebounce.current) clearTimeout(userDebounce.current);
    userDebounce.current = setTimeout(() => setUserSearch(val.trim()), 400);
  };

  // ── Paginación helper ──────────────────────────────────────────────────────

  const Pagination = ({
    current, total, pageSize, onChange,
  }: { current: number; total: number; pageSize: number; onChange: (p: number) => void }) => {
    const pages = Math.ceil(total / pageSize);
    if (pages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {((current - 1) * pageSize) + 1}–{Math.min(current * pageSize, total)} de {total}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
            // ventana de 5 páginas centrada en current
            let p = i + 1;
            if (pages > 5) {
              const start = Math.max(1, Math.min(current - 2, pages - 4));
              p = start + i;
            }
            return (
              <button key={p} onClick={() => onChange(p)}
                className={`w-7 h-7 rounded text-xs font-medium ${
                  current === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => onChange(Math.min(pages, current + 1))} disabled={current === pages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ── Validación ─────────────────────────────────────────────────────────────

  const validar = (p: number) => {
    const e: Record<string, string> = {};
    if (p === 1 && !formData.evaluacion)
      e.evaluacion = 'Selecciona una evaluación para continuar';
    if (p === 2 && formData.usuarios.length === 0)
      e.usuarios = 'Selecciona al menos un usuario';
    if (p === 3) {
      if (!formData.fecha_limite)
        e.fecha_limite = 'La fecha límite es obligatoria';
      else if (formData.fecha_limite <= formData.fecha_inicio)
        e.fecha_limite = 'Debe ser posterior a la fecha de inicio';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSiguiente = () => {
    if (!validar(paso)) return;
    if (paso < 3) { setPaso(paso + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await asignacionIQApi.crear(formData);
      toast.success(`${response.asignaciones.length} asignación(es) creada(s) correctamente`);
      navigate('/evaluaciones-inteligentes/gestionar-asignaciones');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear asignaciones');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUsuario = (id: number) =>
    setFormData(prev => ({
      ...prev,
      usuarios: prev.usuarios.includes(id)
        ? prev.usuarios.filter(u => u !== id)
        : [...prev.usuarios, id],
    }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div>
        <button onClick={() => navigate('/evaluaciones-inteligentes')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Asignación</h1>
        <p className="text-sm text-gray-500 mt-1">Asigna evaluaciones a uno o más usuarios de tu empresa</p>
      </div>

      <StepIndicator current={paso} />

      {/* ══ PASO 1 — Evaluación ══════════════════════════════════════════════ */}
      {paso === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Selecciona la evaluación</h2>
            {evalTotal > 0 && (
              <span className="text-xs text-gray-400">{evalTotal} disponibles</span>
            )}
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={evalSearchInput}
              onChange={e => handleEvalSearch(e.target.value)}
              placeholder="Buscar por nombre o framework..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
            />
            {evalSearchInput && (
              <button onClick={() => { setEvalSearchInput(''); setEvalSearch(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>

          {errors.evaluacion && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={13} />{errors.evaluacion}
            </p>
          )}

          {/* Lista */}
          {loadingEval ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
          ) : evaluaciones.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              No hay evaluaciones disponibles
            </div>
          ) : (
            <div className="space-y-2">
              {evaluaciones.map(ev => (
                <button key={ev.id}
                  onClick={() => setFormData(prev => ({ ...prev, evaluacion: ev.id }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    formData.evaluacion === ev.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{ev.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{ev.frameworks_nombres}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClipboardCheck size={12} />{ev.total_preguntas} preguntas
                        </span>
                        <span>Nivel {ev.nivel_deseado}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          ev.estado === 'disponible'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>{ev.estado}</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      formData.evaluacion === ev.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.evaluacion === ev.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <Pagination current={evalPage} total={evalTotal}
            pageSize={EVAL_PAGE_SIZE} onChange={setEvalPage} />
        </div>
      )}

      {/* ══ PASO 2 — Usuarios ════════════════════════════════════════════════ */}
      {paso === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Selecciona los usuarios</h2>
            {formData.usuarios.length > 0 && (
              <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                {formData.usuarios.length} seleccionado{formData.usuarios.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={userSearchInput}
              onChange={e => handleUserSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
            />
            {userSearchInput && (
              <button onClick={() => { setUserSearchInput(''); setUserSearch(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>

          {errors.usuarios && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={13} />{errors.usuarios}
            </p>
          )}

          {/* Acciones rápidas */}
          {usuarios.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  usuarios: [...new Set([...prev.usuarios, ...usuarios.map(u => u.id)])],
                }))}
                className="text-primary-600 hover:underline"
              >
                Seleccionar página
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={() => {
                  const ids = new Set(usuarios.map(u => u.id));
                  setFormData(prev => ({
                    ...prev,
                    usuarios: prev.usuarios.filter(id => !ids.has(id)),
                  }));
                }}
                className="text-gray-500 hover:underline"
              >
                Deseleccionar página
              </button>
              {formData.usuarios.length > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, usuarios: [] }))}
                    className="text-red-500 hover:underline"
                  >
                    Limpiar todo
                  </button>
                </>
              )}
            </div>
          )}

          {/* Lista */}
          {loadingUsers ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              No se encontraron usuarios
            </div>
          ) : (
            <div className="space-y-1.5">
              {usuarios.map(u => {
                const selected = formData.usuarios.includes(u.id);
                return (
                  <button key={u.id} onClick={() => toggleUsuario(u.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      selected
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    {/* Avatar inicial */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      selected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.first_name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {selected && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Pagination current={userPage} total={userTotal}
            pageSize={USER_PAGE_SIZE} onChange={setUserPage} />
        </div>
      )}

      {/* ══ PASO 3 — Configurar ══════════════════════════════════════════════ */}
      {paso === 3 && (
        <div className="space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Configura la asignación</h2>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Fecha de inicio
              </label>
              <input type="date" value={formData.fecha_inicio}
                onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Fecha límite <span className="text-red-400">*</span>
              </label>
              <input type="date" value={formData.fecha_limite}
                onChange={e => {
                  setFormData({ ...formData, fecha_limite: e.target.value });
                  if (errors.fecha_limite) setErrors({ ...errors, fecha_limite: '' });
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none ${
                  errors.fecha_limite ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.fecha_limite && (
                <p className="text-xs text-red-500 mt-1">{errors.fecha_limite}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Notas para los usuarios <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.notas_asignacion}
              onChange={e => setFormData({ ...formData, notas_asignacion: e.target.value })}
              rows={3}
              placeholder="Instrucciones o contexto adicional..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none resize-none"
            />
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            {[
              {
                key: 'requiere_revision',
                label: 'Requiere revisión del administrador',
                desc: 'Deberás aprobar o rechazar manualmente cuando el usuario complete la evaluación.',
                icon: ClipboardCheck,
              },
              {
                key: 'notificar_usuario',
                label: 'Notificar por email',
                desc: 'Envía una notificación a los usuarios asignados.',
                icon: Bell,
              },
            ].map(({ key, label, desc, icon: Icon }) => {
              const checked = formData[key as keyof CrearAsignacionData] as boolean;
              return (
                <button key={key} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, [key]: !checked }))}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    checked ? 'border-primary-400 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    checked ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <Icon size={15} className={checked ? 'text-primary-600' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    checked ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                    {checked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Resumen compacto */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Resumen de asignación
            </p>
            {[
              { label: 'Evaluación', value: evalSeleccionada?.nombre ?? '—' },
              { label: 'Usuarios', value: `${formData.usuarios.length} usuario${formData.usuarios.length !== 1 ? 's' : ''}` },
              { label: 'Preguntas', value: evalSeleccionada ? `${evalSeleccionada.total_preguntas} preguntas` : '—' },
              { label: 'Fecha límite', value: formData.fecha_limite || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ Navegación ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => paso > 1 ? setPaso(paso - 1) : navigate('/evaluaciones-inteligentes')}
          disabled={submitting}
          className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 text-gray-700"
        >
          {paso === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        <button
          onClick={handleSiguiente}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Asignando...</>
          ) : paso === 3 ? (
            <><CheckCircle2 size={15} /> Crear Asignación</>
          ) : (
            <>Siguiente <ChevronRight size={15} /></>
          )}
        </button>
      </div>
    </div>
  );
};