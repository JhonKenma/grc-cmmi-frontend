// src/components/proyectos-remediacion/ModalCrearDesdeGAP.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  Target,
  Save,
  Loader2,
  FileText,
  ListChecks,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { Button } from '@/components/common';
import { useCrearProyectoDesdeGAP } from '@/hooks/useProyectosRemediacion';
import { usuarioService } from '@/api/usuario.service';
import { CrearDesdeGAPFormData, ModoPresupuesto } from '@/types/proyecto-remediacion.types';
import { Usuario } from '@/types';
import toast from 'react-hot-toast';
import axiosInstance from '@/api/axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RespuestaAuditada {
  id: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  justificacion: string;
  calificacion_auditor: string | null;
  calificacion_display: string;
  comentarios_auditor: string | null;
  recomendaciones_auditor: string | null;
  nivel_madurez: number | null;
  auditado_por_nombre: string | null;
  fecha_auditoria: string | null;
}

interface ModalCrearDesdeGAPProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  calculoNivelId: string;
  /** asignacion_id para cargar las respuestas auditadas */
  asignacionId?: string;
  gapInfo: {
    dimension_nombre: string;
    dimension_codigo: string;
    gap: number;
    clasificacion_gap: string;
    nivel_actual: number;
    nivel_deseado: number;
  };
}

// ─── Helpers visuales ────────────────────────────────────────────────────────

const calificacionConfig: Record<string, { icon: React.ReactNode; badge: string; bg: string; border: string }> = {
  SI_CUMPLE: {
    icon: <CheckCircle size={13} />,
    badge: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  CUMPLE_PARCIAL: {
    icon: <MinusCircle size={13} />,
    badge: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  NO_CUMPLE: {
    icon: <XCircle size={13} />,
    badge: 'bg-red-100 text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

const getCfg = (cal: string | null) =>
  (cal && calificacionConfig[cal]) || {
    icon: <AlertCircle size={13} />,
    badge: 'bg-gray-100 text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  };

// ─── Componente ───────────────────────────────────────────────────────────────

export const ModalCrearDesdeGAP: React.FC<ModalCrearDesdeGAPProps> = ({
  isOpen,
  onClose,
  onSuccess,
  calculoNivelId,
  asignacionId,
  gapInfo,
}) => {
  // ── State general ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // ── State auditoría ────────────────────────────────────────────────────────
  const [respuestasAuditadas, setRespuestasAuditadas] = useState<RespuestaAuditada[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(false);
  const [auditoriAbierta, setAuditoriaAbierta] = useState(false);

  // ── Form ───────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<CrearDesdeGAPFormData>({
    calculo_nivel_id: calculoNivelId,
    nombre_proyecto: `Remediación: ${gapInfo.dimension_nombre}`,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin_estimada: '',
    dueno_proyecto_id: 0,
    responsable_implementacion_id: 0,
    modo_presupuesto: 'global',
    moneda: 'USD',
    presupuesto_global: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: crearProyecto, isPending } = useCrearProyectoDesdeGAP();

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      loadUsuarios();
      calcularFechaEstimada();
      if (asignacionId) loadRespuestasAuditadas();
    }
  }, [isOpen]);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      // Solo trae usuarios con rol 'usuario' de la empresa del admin
      const lista = await usuarioService.getUsuariosAsignables();
      setUsuarios(lista);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const loadRespuestasAuditadas = async () => {
    if (!asignacionId) return;
    try {
      setLoadingAuditoria(true);
      const response = await axiosInstance.get('/respuestas/revision/', {
        params: { asignacion: asignacionId },
      });
      setRespuestasAuditadas(response.data.results ?? []);
    } catch {
      // silencioso — la sección simplemente no muestra datos
    } finally {
      setLoadingAuditoria(false);
    }
  };

  const calcularFechaEstimada = () => {
    const hoy = new Date();
    const dias: Record<string, number> = { critico: 30, alto: 60, medio: 90, bajo: 120 };
    const d = dias[gapInfo.clasificacion_gap] ?? 90;
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + d);
    setFormData((prev) => ({ ...prev, fecha_fin_estimada: fecha.toISOString().split('T')[0] }));
  };

  // ── Validaciones ───────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!(formData.nombre_proyecto ?? '').trim()) e.nombre_proyecto = 'El nombre es requerido';
    if (!formData.fecha_inicio) e.fecha_inicio = 'La fecha de inicio es requerida';
    if (!formData.fecha_fin_estimada) e.fecha_fin_estimada = 'La fecha de fin es requerida';
    if (formData.fecha_inicio && formData.fecha_fin_estimada) {
      if (new Date(formData.fecha_fin_estimada) <= new Date(formData.fecha_inicio))
        e.fecha_fin_estimada = 'La fecha de fin debe ser posterior a la de inicio';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.dueno_proyecto_id) e.dueno_proyecto_id = 'Debes seleccionar un dueño del proyecto';
    if (!formData.responsable_implementacion_id) e.responsable_implementacion_id = 'Debes seleccionar un responsable';
    if (formData.modo_presupuesto === 'global' && (!formData.presupuesto_global || formData.presupuesto_global <= 0))
      e.presupuesto_global = 'Debe especificar un presupuesto mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (field: keyof CrearDesdeGAPFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleModoPresupuestoChange = (modo: ModoPresupuesto) => {
    setFormData((prev) => ({
      ...prev,
      modo_presupuesto: modo,
      ...(modo === 'por_items' && { presupuesto_global: 0 }),
    }));
    if (errors.presupuesto_global) setErrors((prev) => ({ ...prev, presupuesto_global: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    crearProyecto(formData, {
      onSuccess: () => {
        toast.success(
          formData.modo_presupuesto === 'por_items'
            ? 'Proyecto creado. Ahora puedes agregar ítems individuales.'
            : 'Proyecto creado exitosamente desde GAP'
        );
        onClose();
        if (onSuccess) onSuccess();
      },
    });
  };

  if (!isOpen) return null;

  // Conteo rápido para el badge del acordeón
  const totalConComentario = respuestasAuditadas.filter(
    (r) => r.comentarios_auditor || r.recomendaciones_auditor
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Crear Proyecto de Remediación</h2>
            <p className="text-sm text-gray-600 mt-1">Desde GAP: {gapInfo.dimension_nombre}</p>
          </div>
          <button onClick={onClose} disabled={isPending} className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* ── Info del GAP ── */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-orange-600" />
            <h3 className="font-semibold text-gray-900">Brecha Identificada</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-600">Dimensión</p>
              <p className="font-semibold text-gray-900">{gapInfo.dimension_codigo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">GAP</p>
              <p className="font-semibold text-red-600">{gapInfo.gap.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Clasificación</p>
              <p className={`font-semibold capitalize ${
                gapInfo.clasificacion_gap === 'critico' ? 'text-red-600' :
                gapInfo.clasificacion_gap === 'alto' ? 'text-orange-600' :
                gapInfo.clasificacion_gap === 'medio' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {gapInfo.clasificacion_gap}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Nivel</p>
              <p className="font-semibold text-blue-600">
                {gapInfo.nivel_actual} → {gapInfo.nivel_deseado}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN AUDITORÍA (acordeón) ── */}
        {asignacionId && (
          <div className="border-b border-gray-200">
            <button
              type="button"
              onClick={() => setAuditoriaAbierta((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800">
                  Ver detalle de la auditoría
                </span>
                {!loadingAuditoria && totalConComentario > 0 && (
                  <span className="bg-indigo-200 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {totalConComentario} con comentarios
                  </span>
                )}
                {!loadingAuditoria && respuestasAuditadas.length > 0 && (
                  <span className="text-xs text-indigo-500">
                    ({respuestasAuditadas.length} respuestas)
                  </span>
                )}
              </div>
              {auditoriAbierta ? (
                <ChevronUp size={16} className="text-indigo-600" />
              ) : (
                <ChevronDown size={16} className="text-indigo-600" />
              )}
            </button>

            {auditoriAbierta && (
              <div className="px-6 py-4 bg-gray-50 max-h-80 overflow-y-auto space-y-3">
                {loadingAuditoria && (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    <span className="text-sm">Cargando respuestas…</span>
                  </div>
                )}

                {!loadingAuditoria && respuestasAuditadas.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">
                    No hay respuestas auditadas disponibles.
                  </p>
                )}

                {!loadingAuditoria &&
                  respuestasAuditadas.map((resp, idx) => {
                    const cfg = getCfg(resp.calificacion_auditor);
                    return (
                      <div key={resp.id} className={`rounded-lg border ${cfg.border} overflow-hidden`}>
                        <div className={`flex items-start justify-between px-3 py-2 ${cfg.bg}`}>
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-xs font-mono text-gray-400 shrink-0 mt-0.5">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-medium">{resp.pregunta_codigo}</p>
                              <p className="text-xs font-medium text-gray-800 leading-snug mt-0.5">
                                {resp.pregunta_texto}
                              </p>
                            </div>
                          </div>
                          <span className={`shrink-0 ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                            {cfg.icon}
                            {resp.calificacion_display || 'Sin calificar'}
                          </span>
                        </div>

                        {(resp.comentarios_auditor || resp.recomendaciones_auditor) && (
                          <div className="px-3 py-2 bg-white space-y-2">
                            {resp.comentarios_auditor && (
                              <div className="flex gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                                <MessageSquare size={13} className="text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-500 mb-0.5">
                                    Comentario del auditor
                                  </p>
                                  <p className="text-xs text-blue-800">{resp.comentarios_auditor}</p>
                                </div>
                              </div>
                            )}
                            {resp.recomendaciones_auditor && (
                              <div className="flex gap-2 p-2 bg-amber-50 rounded border border-amber-100">
                                <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-500 mb-0.5">
                                    Recomendaciones
                                  </p>
                                  <p className="text-xs text-amber-800">{resp.recomendaciones_auditor}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── Wizard steps ── */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            {[
              { n: 1, label: 'Información Básica' },
              { n: 2, label: 'Responsables y Presupuesto' },
            ].map(({ n, label }, i, arr) => (
              <React.Fragment key={n}>
                <div className={`flex items-center gap-2 ${step === n ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === n ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {n}
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                </div>
                {i < arr.length - 1 && <div className="h-px w-16 bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 py-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_proyecto}
                  onChange={(e) => handleChange('nombre_proyecto', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre_proyecto ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej: Remediación de Seguridad de Red"
                />
                {errors.nombre_proyecto && <p className="text-xs text-red-600 mt-1">{errors.nombre_proyecto}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin Estimada <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.fecha_fin_estimada}
                      onChange={(e) => handleChange('fecha_fin_estimada', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.fecha_fin_estimada ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.fecha_fin_estimada && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin_estimada}</p>}
                  <p className="text-xs text-gray-500 mt-1">Sugerido para GAP {gapInfo.clasificacion_gap}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-gray-500 text-xs">(Opcional)</span>
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Proporcione detalles adicionales del proyecto..."
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Dueño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Dueño del Proyecto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dueno_proyecto_id}
                  onChange={(e) => handleChange('dueno_proyecto_id', Number(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.dueno_proyecto_id ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loadingUsuarios}
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre_completo} - {u.email}</option>
                  ))}
                </select>
                {errors.dueno_proyecto_id && <p className="text-xs text-red-600 mt-1">{errors.dueno_proyecto_id}</p>}
                <p className="text-xs text-gray-500 mt-1">Responsable general del éxito del proyecto</p>
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target size={16} className="inline mr-1" />
                  Responsable de Implementación <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.responsable_implementacion_id}
                  onChange={(e) => handleChange('responsable_implementacion_id', Number(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.responsable_implementacion_id ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loadingUsuarios}
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre_completo} - {u.email}</option>
                  ))}
                </select>
                {errors.responsable_implementacion_id && <p className="text-xs text-red-600 mt-1">{errors.responsable_implementacion_id}</p>}
                <p className="text-xs text-gray-500 mt-1">Quien ejecuta las tareas técnicas</p>
              </div>

              {/* Modo presupuesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Modo de Presupuesto <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { modo: 'global' as ModoPresupuesto, icon: <FileText size={24} />, title: 'Presupuesto Global', desc: 'Un monto único para todo el proyecto' },
                    { modo: 'por_items' as ModoPresupuesto, icon: <ListChecks size={24} />, title: 'Presupuesto por Ítems', desc: 'Desglosado en tareas individuales' },
                  ].map(({ modo, icon, title, desc }) => (
                    <button
                      key={modo}
                      type="button"
                      onClick={() => handleModoPresupuestoChange(modo)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${formData.modo_presupuesto === modo ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${formData.modo_presupuesto === modo ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{desc}</p>
                        </div>
                        {formData.modo_presupuesto === modo && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {formData.modo_presupuesto === 'por_items' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">💡 Podrás agregar ítems individuales después de crear el proyecto</p>
                  </div>
                )}
              </div>

              {/* Presupuesto global */}
              {formData.modo_presupuesto === 'global' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Presupuesto Asignado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.presupuesto_global}
                      onChange={(e) => handleChange('presupuesto_global', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.presupuesto_global ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                    {errors.presupuesto_global && <p className="text-xs text-red-600 mt-1">{errors.presupuesto_global}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {['USD', 'EUR', 'PEN', 'COP', 'MXN'].map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Moneda por ítems */}
              {formData.modo_presupuesto === 'por_items' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moneda <span className="text-red-500">*</span></label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {['USD', 'EUR', 'PEN', 'COP', 'MXN'].map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Moneda para los ítems del proyecto</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t mt-6">
            {step === 1 ? (
              <>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={() => validateStep1() && setStep(2)} disabled={isPending}>Siguiente</Button>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isPending}>Anterior</Button>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? (
                    <><Loader2 size={16} className="animate-spin mr-2" />Creando...</>
                  ) : (
                    <><Save size={16} className="mr-2" />Crear Proyecto</>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};