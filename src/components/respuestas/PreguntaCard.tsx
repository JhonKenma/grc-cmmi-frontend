// src/components/respuestas/PreguntaCard.tsx - CÓDIGO COMPLETO CORREGIDO

import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, Send } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints';
import { Pregunta, RespuestaListItem, Evidencia } from '@/types';
import { ModalEvidencia } from './ModalEvidencia';
import { SelectorCumplimiento } from './SelectorCumplimiento';
import { SelectorNivelMadurez } from './SelectorNivelMadurez';
import { SeccionEvidencias } from './SeccionEvidencias';
import { RespuestaTipo } from './types';
import toast from 'react-hot-toast';

interface PreguntaCardProps {
  pregunta: Pregunta;
  numero: number;
  asignacionId: string;
  respuestaExistente?: RespuestaListItem;
  onRespuestaChange: (respuesta: RespuestaListItem) => void;
}

export const PreguntaCard: React.FC<PreguntaCardProps> = ({
  pregunta,
  numero,
  asignacionId,
  respuestaExistente,
  onRespuestaChange
}) => {
  const [respuesta, setRespuesta] = useState<RespuestaTipo>('');
  const [justificacion, setJustificacion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [nivelMadurez, setNivelMadurez] = useState<number>(0);
  const [justificacionMadurez, setJustificacionMadurez] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [respuestaId, setRespuestaId] = useState<string | null>(null);
  const [estado, setEstado] = useState<'borrador' | 'enviado' | 'modificado_admin'>('borrador');
  const [saving, setSaving] = useState(false);
  const [mostrarModalEvidencia, setMostrarModalEvidencia] = useState(false);

  // Lógica
  const puedeSubirEvidencias = respuesta === 'SI_CUMPLE' || respuesta === 'CUMPLE_PARCIAL';
  const requiereNivelMadurez = respuesta === 'SI_CUMPLE' || respuesta === 'CUMPLE_PARCIAL';
  const esNoImplementado = respuesta === 'NO_CUMPLE' || respuesta === 'NO_APLICA';
  const puedeEditar = estado === 'borrador';

  // ⭐ FIX 4: Mejorar carga inicial de datos
  useEffect(() => {
    if (respuestaExistente) {
      console.log('📥 Cargando respuesta existente:', respuestaExistente);
      
      setRespuesta(respuestaExistente.respuesta);
      setJustificacion(respuestaExistente.justificacion || '');
      setComentarios(respuestaExistente.comentarios_adicionales || '');
      setRespuestaId(respuestaExistente.id);
      setEstado(respuestaExistente.estado);
      
      // ⭐ FIX: Asegurar que nivel_madurez sea número válido
      const nivelCargado = Number(respuestaExistente.nivel_madurez);
      setNivelMadurez(isNaN(nivelCargado) ? 0 : nivelCargado);
      
      setJustificacionMadurez(respuestaExistente.justificacion_madurez || '');
      
      // Cargar evidencias
      if (respuestaExistente.id) {
        loadEvidencias(respuestaExistente.id);
      }
    }
  }, [respuestaExistente]);

  // Auto-reset nivel de madurez
  useEffect(() => {
    if (esNoImplementado) {
      setNivelMadurez(0);
      setJustificacionMadurez('');
    }
  }, [respuesta, esNoImplementado]);

  const loadEvidencias = async (respuestaId: string) => {
    try {
      const respuestaDetalle = await respuestasApi.get(respuestaId);
      if (respuestaDetalle.evidencias) {
        setEvidencias(respuestaDetalle.evidencias);
      }
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
    }
  };

  const handleGuardarBorrador = async () => {
    // Validaciones
    if (!respuesta || justificacion.trim().length < 10) {
      toast.error('Completa la respuesta y justificación (mín 10 caracteres)');
      return;
    }

    if (requiereNivelMadurez && nivelMadurez === 0) {
      toast.error('Debes indicar un nivel de madurez mayor a 0');
      return;
    }

    try {
      setSaving(true);
      const data = {
        respuesta,
        justificacion,
        comentarios_adicionales: comentarios,
        nivel_madurez: nivelMadurez,
        justificacion_madurez: justificacionMadurez.trim(),
      };

      if (respuestaId) {
        // ════════════════════════════════════════════════════
        // UPDATE EXISTENTE
        // ════════════════════════════════════════════════════
        console.log('📝 Actualizando respuesta existente:', respuestaId);
        await respuestasApi.update(respuestaId, data);
        
        // Recargar la respuesta completa desde el servidor
        const respuestaCompleta = await respuestasApi.get(respuestaId);
        console.log('✅ Respuesta actualizada y recargada:', respuestaCompleta);
        
        // Actualizar estados locales
        setRespuesta(respuestaCompleta.respuesta);
        setJustificacion(respuestaCompleta.justificacion);
        setNivelMadurez(Number(respuestaCompleta.nivel_madurez) || 0);
        setJustificacionMadurez(respuestaCompleta.justificacion_madurez || '');
        setComentarios(respuestaCompleta.comentarios_adicionales || '');
        setEstado(respuestaCompleta.estado);
        
        // Recargar evidencias
        if (respuestaCompleta.evidencias) {
          setEvidencias(respuestaCompleta.evidencias);
        }
        
        // Notificar al padre
        onRespuestaChange(mapToListItem(respuestaCompleta));
        
        toast.success('Respuesta guardada como borrador');
        
      } else {
        // ════════════════════════════════════════════════════
        // CREATE NUEVA
        // ════════════════════════════════════════════════════
        console.log('🆕 Creando nueva respuesta para pregunta:', pregunta.id);
        console.log('📤 Datos a enviar:', { asignacion: asignacionId, pregunta: pregunta.id, ...data });
        
        const createResponse = await respuestasApi.create({
          asignacion: asignacionId,
          pregunta: pregunta.id,
          ...data,
        });
        
        console.log('📥 createResponse COMPLETO:', createResponse); // ⭐ DEBUG
        console.log('📥 createResponse.data:', createResponse.data); // ⭐ DEBUG
        console.log('📥 Tipo de createResponse.data:', typeof createResponse.data); // ⭐ DEBUG
        console.log('📥 createResponse.data tiene id?:', createResponse.data?.id); // ⭐ DEBUG
        
        // ⭐ Intentar diferentes formas de extraer el data
        let createdData = createResponse.data;
        
        // Si viene envuelto en { success, data, message }
        if (createdData && typeof createdData === 'object' && 'data' in createdData) {
          console.log('⚠️ Respuesta envuelta, extrayendo data...');
          createdData = (createdData as any).data;
        }
        
        console.log('📦 createdData final:', createdData); // ⭐ DEBUG
        
        if (!createdData || !createdData.id) {
          console.error('❌ createdData inválido:', createdData);
          console.error('❌ createResponse completo:', JSON.stringify(createResponse, null, 2));
          throw new Error('No se recibió respuesta válida del servidor');
        }
        
        console.log('✅ ID de respuesta creada:', createdData.id);
        setRespuestaId(createdData.id);
        
        // Recargar la respuesta completa desde el servidor
        const respuestaCompleta = await respuestasApi.get(createdData.id);
        console.log('✅ Respuesta creada y recargada:', respuestaCompleta);
        
        // Actualizar estados locales
        setRespuesta(respuestaCompleta.respuesta);
        setJustificacion(respuestaCompleta.justificacion);
        setNivelMadurez(Number(respuestaCompleta.nivel_madurez) || 0);
        setJustificacionMadurez(respuestaCompleta.justificacion_madurez || '');
        setComentarios(respuestaCompleta.comentarios_adicionales || '');
        setEstado(respuestaCompleta.estado);
        
        // Recargar evidencias
        if (respuestaCompleta.evidencias) {
          setEvidencias(respuestaCompleta.evidencias);
        }
        
        // Notificar al padre
        onRespuestaChange(mapToListItem(respuestaCompleta));
        
        toast.success('Respuesta creada como borrador');
      }

    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
      console.error('❌ Error.response:', error.response);
      console.error('❌ Error.response.data:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Error al guardar la respuesta');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!respuestaId) {
      toast.error('Primero debes guardar la respuesta como borrador');
      return;
    }

    if (puedeSubirEvidencias && evidencias.length === 0) {
      toast.error(`Las respuestas "Sí Cumple" o "Cumple Parcial" requieren al menos una evidencia`);
      return;
    }

    if (requiereNivelMadurez && nivelMadurez === 0) {
      toast.error('Debes indicar un nivel de madurez mayor a 0 antes de enviar');
      return;
    }

    try {
      setSaving(true);
      await respuestasApi.enviar(respuestaId);
      setEstado('enviado');
      toast.success('✅ Respuesta enviada exitosamente');
      
      const respuestaActualizada = await respuestasApi.get(respuestaId);
      onRespuestaChange(mapToListItem(respuestaActualizada));
    } catch (error: any) {
      console.error('Error al enviar:', error);
      toast.error(error.response?.data?.message || 'Error al enviar la respuesta');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return;

    try {
      await respuestasApi.eliminarEvidencia(evidenciaId);
      setEvidencias(prev => prev.filter(e => e.id !== evidenciaId));
      toast.success('Evidencia eliminada');
    } catch (error) {
      toast.error('Error al eliminar la evidencia');
    }
  };

  // ⭐ FIX 3: Mejorar mapToListItem para manejar valores null/undefined
  const mapToListItem = (data: any): RespuestaListItem => {
    console.log('📋 mapToListItem input:', data);

    return {
      id: data?.id || '',
      asignacion: data?.asignacion || '',
      pregunta: data?.pregunta || '',
      pregunta_codigo: data?.pregunta_codigo || '',
      pregunta_texto: data?.pregunta_texto || '',
      respuesta: data?.respuesta || 'NO_APLICA',
      respuesta_display: data?.respuesta_display || '',
      justificacion: data?.justificacion || '',
      nivel_madurez: Number(data?.nivel_madurez) || 0,  // ⭐ Convertir a número
      nivel_madurez_display: data?.nivel_madurez_display || '',
      justificacion_madurez: data?.justificacion_madurez || '',
      comentarios_adicionales: data?.comentarios_adicionales || '',  // ⭐ AGREGAR
      estado: data?.estado || 'borrador',
      estado_display: data?.estado_display || '',
      respondido_por: Number(data?.respondido_por) || 0,
      respondido_por_nombre: data?.respondido_por_nombre || '',
      respondido_at: data?.respondido_at || '',
      total_evidencias: data?.evidencias?.length || data?.total_evidencias || 0,
      version: data?.version || 0,
    };
  };

  return (
    <>
      <Card className={estado === 'enviado' ? 'border-green-300 bg-green-50' : ''}>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                  {numero}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {pregunta.codigo}
                </span>
                {estado === 'enviado' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={12} />
                    Enviada
                  </span>
                )}
              </div>
              
              <h3 className="text-base font-semibold text-gray-900">
                {pregunta.titulo}
              </h3>
              
              {pregunta.texto && (
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {pregunta.texto}
                </p>
              )}
            </div>
          </div>

          {/* Selector de cumplimiento */}
          <SelectorCumplimiento
            valor={respuesta}
            onChange={setRespuesta}
            disabled={!puedeEditar}
          />

          {/* Selector de nivel de madurez */}
          {requiereNivelMadurez && (
            <SelectorNivelMadurez
              nivelMadurez={nivelMadurez}
              onNivelChange={setNivelMadurez}
              justificacion={justificacionMadurez}
              onJustificacionChange={setJustificacionMadurez}
              modoLectura={!puedeEditar}
            />
          )}

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificación <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2 text-xs">
                (mínimo 10 caracteres)
              </span>
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              disabled={!puedeEditar}
              rows={4}
              placeholder="Proporcione una justificación detallada de su respuesta..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {justificacion.length} caracteres
            </p>
          </div>

          {/* Evidencias */}
          {puedeSubirEvidencias && (
            <SeccionEvidencias
              evidencias={evidencias}
              puedeEditar={puedeEditar}
              respuestaId={respuestaId}
              onAgregarEvidencia={() => setMostrarModalEvidencia(true)}
              onEliminarEvidencia={handleEliminarEvidencia}
            />
          )}

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios Adicionales <span className="text-gray-500 font-normal text-xs">(Opcional)</span>
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={!puedeEditar}
              rows={3}
              placeholder="Observaciones o notas adicionales..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botones */}
          {puedeEditar && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGuardarBorrador}
                disabled={
                  saving || 
                  !respuesta || 
                  justificacion.trim().length < 10 ||
                  (requiereNivelMadurez && nivelMadurez === 0)
                }
                type="button"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleEnviar}
                disabled={
                  saving ||
                  !respuestaId ||
                  (puedeSubirEvidencias && evidencias.length === 0) ||
                  (requiereNivelMadurez && nivelMadurez === 0)
                }
                type="button"
              >
                <Send size={16} className="mr-2" />
                {saving ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      {mostrarModalEvidencia && respuestaId && (
        <ModalEvidencia
          respuestaId={respuestaId}
          onClose={() => setMostrarModalEvidencia(false)}
          onSuccess={() => loadEvidencias(respuestaId)}
        />
      )}
    </>
  );
};