import { useEffect, useState } from 'react';
import { Ban, CheckCircle, FileText, XCircle, AlertCircle, Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import type { Evidencia, Pregunta, Respuesta, RespuestaListItem } from '@/types';

type ModoUsuario = 'SI' | 'NO' | 'NO_APLICA' | '';

interface UsePreguntaCardParams {
  pregunta: Pregunta;
  asignacionId: string;
  respuestaExistente?: RespuestaListItem;
  onRespuestaChange: (respuesta: RespuestaListItem) => void;
}

interface RespuestaApiDetalle extends Respuesta {
  evidencias?: Evidencia[];
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const errorObject = error as { response?: { data?: unknown } };
  const data = errorObject?.response?.data as
    | {
        errors?: Record<string, unknown>;
        detail?: unknown;
        message?: unknown;
      }
    | undefined;

  if (!data) return fallback;

  if (data.errors && typeof data.errors === 'object') {
    const detalle = data.errors.detalle;
    if (typeof detalle === 'string' && detalle.trim()) return detalle;

    const respuesta = data.errors.respuesta;
    if (Array.isArray(respuesta) && respuesta.length > 0) return String(respuesta[0]);
    if (typeof respuesta === 'string' && respuesta.trim()) return respuesta;

    const firstKey = Object.keys(data.errors)[0];
    const firstValue = data.errors[firstKey];
    if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
    if (typeof firstValue === 'string') return firstValue;
  }

  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
  if (typeof data.message === 'string' && data.message.trim()) return data.message;

  return fallback;
};

export const usePreguntaCard = ({
  pregunta,
  asignacionId,
  respuestaExistente,
  onRespuestaChange,
}: UsePreguntaCardParams) => {
  const [modoSeleccionado, setModoSeleccionado] = useState<ModoUsuario>('');
  const [justificacion, setJustificacion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [respuestaId, setRespuestaId] = useState<string | null>(null);
  const [estado, setEstado] = useState<RespuestaListItem['estado']>('borrador');
  const [saving, setSaving] = useState(false);
  const [mostrarModalEvidencia, setMostrarModalEvidencia] = useState(false);

  const puedeEditar = estado === 'borrador';
  const yaEnviada = estado !== 'borrador';

  useEffect(() => {
    if (!respuestaExistente) return;

    setRespuestaId(respuestaExistente.id);
    setEstado(respuestaExistente.estado);
    setJustificacion(respuestaExistente.justificacion || '');
    setComentarios(respuestaExistente.comentarios_adicionales || '');

    if (respuestaExistente.respuesta === 'NO_APLICA') {
      setModoSeleccionado('NO_APLICA');
    } else if (respuestaExistente.respuesta === 'NO_CUMPLE') {
      setModoSeleccionado('NO');
    } else if (respuestaExistente.respuesta === null) {
      setModoSeleccionado('SI');
    }

    if (respuestaExistente.id) {
      void loadEvidencias(respuestaExistente.id);
    }
  }, [respuestaExistente]);

  const loadEvidencias = async (id: string) => {
    try {
      const detalle = (await respuestasApi.get(id)) as RespuestaApiDetalle;
      if (detalle?.evidencias) setEvidencias(detalle.evidencias);
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
    }
  };

  const handleCambiarModo = (modo: ModoUsuario) => {
    setModoSeleccionado(modo);
    if (modo === 'NO' || modo === 'NO_APLICA') {
      setEvidencias([]);
    }
  };

  const sincronizarEstado = (data: RespuestaApiDetalle) => {
    setJustificacion(data.justificacion || '');
    setComentarios(data.comentarios_adicionales || '');
    setEstado(data.estado || 'borrador');
    if (data.evidencias) setEvidencias(data.evidencias);

    if (data.respuesta === 'NO_APLICA') {
      setModoSeleccionado('NO_APLICA');
    } else if (data.respuesta === 'NO_CUMPLE') {
      setModoSeleccionado('NO');
    } else if (data.respuesta === null || data.respuesta === undefined) {
      setModoSeleccionado('SI');
    }
  };

  const mapToListItem = (data: RespuestaApiDetalle): RespuestaListItem => ({
    id: data?.id || '',
    asignacion: data?.asignacion || '',
    pregunta: data?.pregunta || '',
    pregunta_codigo: data?.pregunta_codigo || '',
    pregunta_texto: data?.pregunta_texto || '',
    respuesta: data?.respuesta ?? null,
    justificacion: data?.justificacion || '',
    comentarios_adicionales: data?.comentarios_adicionales || '',
    calificacion_auditor: data?.calificacion_auditor || null,
    calificacion_display: data?.calificacion_display || '',
    nivel_madurez: Number(data?.nivel_madurez) || 0,
    estado: data?.estado || 'borrador',
    estado_display: data?.estado_display || '',
    respondido_por: Number(data?.respondido_por) || 0,
    respondido_por_nombre: data?.respondido_por_nombre || '',
    respondido_at: data?.respondido_at || '',
    total_evidencias: data?.evidencias?.length ?? data?.total_evidencias ?? 0,
    version: data?.version || 0,
  });

  const handleGuardarBorrador = async () => {
    if (!modoSeleccionado) {
      toast.error('Selecciona una opción primero');
      return;
    }

    if (justificacion.trim().length < 10) {
      toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);

      const respuestaValor =
        modoSeleccionado === 'NO_APLICA' ? ('NO_APLICA' as const)
        : modoSeleccionado === 'NO' ? ('NO_CUMPLE' as const)
        : null;

      const payload = {
        respuesta: respuestaValor,
        justificacion,
        comentarios_adicionales: comentarios,
      };

      if (respuestaId) {
        await respuestasApi.update(respuestaId, payload);
        const actualizada = (await respuestasApi.get(respuestaId)) as RespuestaApiDetalle;
        sincronizarEstado(actualizada);
        onRespuestaChange(mapToListItem(actualizada));
        toast.success('Borrador guardado');
      } else {
        const res = await respuestasApi.create({
          asignacion: asignacionId,
          pregunta: pregunta.id,
          ...payload,
        });

        let creada = res as unknown as RespuestaApiDetalle | { data?: RespuestaApiDetalle };
        if ('data' in creada && creada.data) creada = creada.data;
        if (!('id' in creada) || !creada.id) {
          throw new Error('El servidor no devolvió una respuesta válida');
        }

        setRespuestaId(creada.id);
        const completa = (await respuestasApi.get(creada.id)) as RespuestaApiDetalle;
        sincronizarEstado(completa);
        onRespuestaChange(mapToListItem(completa));
        toast.success('Respuesta creada como borrador');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(getApiErrorMessage(error, 'Error al guardar la respuesta'));
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!respuestaId) {
      toast.error('Primero guarda la respuesta como borrador');
      return;
    }

    if (modoSeleccionado === 'SI' && evidencias.filter((evidencia) => evidencia.activo).length === 0) {
      toast.error('Debes subir al menos una evidencia antes de enviar');
      return;
    }

    try {
      setSaving(true);
      const res = await respuestasApi.enviar(respuestaId);
      const data = (res as { data?: { asignacion_completa?: boolean } }).data || res;
      const asignacionCompleta = data?.asignacion_completa || false;

      setEstado('enviado');

      if (asignacionCompleta) {
        toast.success('¡Evaluación completada! Se notificó al auditor para revisión.', { duration: 5000 });
      } else {
        toast.success('Respuesta enviada exitosamente');
      }

      const actualizada = (await respuestasApi.get(respuestaId)) as RespuestaApiDetalle;
      onRespuestaChange(mapToListItem(actualizada));
    } catch (error) {
      console.error('Error al enviar:', error);
      toast.error(getApiErrorMessage(error, 'Error al enviar la respuesta'));
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!globalThis.confirm('¿Eliminar esta evidencia?')) return;

    try {
      await respuestasApi.eliminarEvidencia(evidenciaId);
      setEvidencias((prev) => prev.filter((evidencia) => evidencia.id !== evidenciaId));
      toast.success('Evidencia eliminada');
    } catch {
      toast.error('Error al eliminar la evidencia');
    }
  };

  const getEstadoBadge = () => {
    switch (estado) {
      case 'enviado':
      case 'pendiente_auditoria':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={11} /> Enviada — Esperando auditor
          </span>
        );
      case 'auditado':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={11} /> Auditada
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            Borrador
          </span>
        );
    }
  };

  const getModoLecturaInfo = () => {
    const respuesta = respuestaExistente?.respuesta;
    if (respuesta === 'NO_APLICA') return { icon: <Ban size={15} className="text-gray-500" />, texto: 'Marcada como No Aplica', color: 'bg-gray-100 border-gray-200 text-gray-700' };
    if (respuesta === 'NO_CUMPLE') return { icon: <XCircle size={15} className="text-red-500" />, texto: 'Respondida como No', color: 'bg-red-50 border-red-200 text-red-700' };
    return { icon: <FileText size={15} className="text-primary-500" />, texto: 'Enviada con evidencias', color: 'bg-blue-50 border-blue-200 text-blue-700' };
  };

  const cardBorder =
    estado === 'auditado' ? 'border-green-300 bg-green-50/40'
      : yaEnviada ? 'border-blue-200 bg-blue-50/30'
      : '';

  const reloadEvidencias = async () => {
    if (respuestaId) {
      await loadEvidencias(respuestaId);
    }
  };

  return {
    modoSeleccionado,
    justificacion,
    setJustificacion,
    comentarios,
    setComentarios,
    evidencias,
    respuestaId,
    estado,
    saving,
    mostrarModalEvidencia,
    setMostrarModalEvidencia,
    puedeEditar,
    yaEnviada,
    handleCambiarModo,
    handleGuardarBorrador,
    handleEnviar,
    handleEliminarEvidencia,
    reloadEvidencias,
    getEstadoBadge,
    getModoLecturaInfo,
    cardBorder,
  } as const;
};
