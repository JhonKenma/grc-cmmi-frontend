// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/FormularioPregunta.tsx

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Upload, X, FileText, Send } from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import toast from 'react-hot-toast';
import type { PreguntaConRespuesta, CrearRespuestaData, Evidencia } from '@/types/respuesta-iq.types';
import { RESPUESTA_OPCIONES, NIVELES_MADUREZ } from '@/types/respuesta-iq.types';
import api from '@/api/axios';

interface Props {
  pregunta: PreguntaConRespuesta;
  asignacionId: number;
  onRespuestaGuardada: () => void;
}

export const FormularioPregunta = ({ pregunta, asignacionId, onRespuestaGuardada }: Props) => {
  const [formData, setFormData] = useState<CrearRespuestaData>({
    asignacion: asignacionId,
    pregunta: pregunta.id,
    respuesta: 'NO_CUMPLE',
    justificacion: '',
    nivel_madurez: 0,
    justificacion_madurez: '',
    comentarios_adicionales: '',
  });
  
  const [evidencias, setEvidencias] = useState<File[]>([]); // ⭐ Archivos File, no objetos API
  const [evidenciasExistentes, setEvidenciasExistentes] = useState<Evidencia[]>([]); // ⭐ Evidencias ya guardadas
  const [enviando, setEnviando] = useState(false);
  const [respuestaId, setRespuestaId] = useState<number | null>(null);

  // Cargar respuesta existente
  useEffect(() => {
    if (pregunta.respuesta) {
      setFormData({
        asignacion: asignacionId,
        pregunta: pregunta.id,
        respuesta: pregunta.respuesta.respuesta,
        justificacion: pregunta.respuesta.justificacion,
        nivel_madurez: pregunta.respuesta.nivel_madurez,
        justificacion_madurez: pregunta.respuesta.justificacion_madurez || '',
        comentarios_adicionales: pregunta.respuesta.comentarios_adicionales || '',
      });
      setRespuestaId(pregunta.respuesta.id);
      setEvidencias([]); // Reset new files
      setEvidenciasExistentes(pregunta.respuesta.evidencias || []);
    } else {
      setFormData({
        asignacion: asignacionId,
        pregunta: pregunta.id,
        respuesta: 'NO_CUMPLE',
        justificacion: '',
        nivel_madurez: 0,
        justificacion_madurez: '',
        comentarios_adicionales: '',
      });
      setRespuestaId(null);
      setEvidencias([]);
      setEvidenciasExistentes([]);
    }
  }, [pregunta.id]);

  // Auto-guardar en borrador - SILENCIOSO
  const autoGuardarBorrador = async () => {
    if (!formData.justificacion || formData.justificacion.length < 10) {
      return;
    }

    try {
      if (respuestaId) {
        await respuestaIQApi.actualizar(respuestaId, formData);
      } else {
        const nueva = await respuestaIQApi.crear(formData);
        setRespuestaId(nueva.id);
      }
    } catch (error) {
      // ⭐ SILENCIOSO - No mostrar errores de auto-guardado
      console.log('Auto-guardado omitido:', error);
    }
  };

  // Debounce para auto-guardar - DESHABILITADO
  // El auto-guardar está deshabilitado porque las validaciones del backend
  // no permiten guardar borradores parciales
  /*
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.justificacion.length >= 10 && !respuestaId) {
        autoGuardarBorrador();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.justificacion, formData.respuesta, formData.nivel_madurez]);
  */

  const handleSeleccionarArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (evidencias.length + files.length > 3) {
      toast.error('Máximo 3 evidencias');
      return;
    }
    
    // Validar tamaño
    const archivosGrandes = files.filter(f => f.size > 10 * 1024 * 1024);
    if (archivosGrandes.length > 0) {
      toast.error('Algunos archivos superan 10MB');
      return;
    }
    
    setEvidencias([...evidencias, ...files]);
    e.target.value = ''; // Limpiar input
  };
  
  const handleEliminarArchivo = (index: number) => {
    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  const handleEnviar = async () => {
    console.log('=== INICIANDO ENVÍO ===');
    console.log('FormData:', formData);
    console.log('Evidencias seleccionadas:', evidencias);
    console.log('RespuestaId actual:', respuestaId);
    
    // Validaciones finales
    if (!formData.justificacion || formData.justificacion.length < 10) {
      toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }

    if (['SI_CUMPLE', 'CUMPLE_PARCIAL'].includes(formData.respuesta) && formData.nivel_madurez === 0) {
      toast.error('Debes indicar un nivel de madurez mayor a 0');
      return;
    }

    if (['SI_CUMPLE', 'CUMPLE_PARCIAL'].includes(formData.respuesta) && evidencias.length === 0 && evidenciasExistentes.length === 0) {
      toast.error('Debes adjuntar al menos una evidencia');
      return;
    }

    try {
      setEnviando(true);
      toast.loading('Guardando respuesta...', { id: 'save' });

      // 1. Guardar respuesta primero
      console.log('Paso 1: Guardando respuesta...');
      let idRespuesta = respuestaId;
      if (respuestaId) {
        console.log('Actualizando respuesta existente:', respuestaId);
        await respuestaIQApi.actualizar(respuestaId, formData);
      } else {
        console.log('Creando nueva respuesta');
        const nueva = await respuestaIQApi.crear(formData);
        idRespuesta = nueva.id;
        setRespuestaId(nueva.id);
        console.log('Respuesta creada con ID:', nueva.id);
      }

      // 2. Subir evidencias si hay archivos nuevos
      if (evidencias.length > 0 && idRespuesta) {
        console.log(`Paso 2: Subiendo ${evidencias.length} evidencias...`);
        toast.loading(`Subiendo ${evidencias.length} evidencia(s)...`, { id: 'save' });
        
        for (let i = 0; i < evidencias.length; i++) {
          const file = evidencias[i];
          console.log(`Subiendo evidencia ${i + 1}/${evidencias.length}:`, file.name, file.size);
          
          const formDataEvidencia = new FormData();
          formDataEvidencia.append('archivo', file);
          formDataEvidencia.append('respuesta_iq_id', idRespuesta.toString());
          formDataEvidencia.append('codigo_documento', `DOC-${idRespuesta}-${Date.now()}-${i}`);
          formDataEvidencia.append('titulo_documento', file.name);
          formDataEvidencia.append('objetivo_documento', 'Evidencia de cumplimiento');
          formDataEvidencia.append('tipo_documento_enum', 'otro');
          
          console.log('FormData evidencia:', {
            respuesta_iq_id: idRespuesta,
            codigo_documento: `DOC-${idRespuesta}-${Date.now()}-${i}`,
            titulo_documento: file.name,
          });
          
          try {
            const response = await api.post('/evidencias-iq/', formDataEvidencia, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Evidencia subida exitosamente:', response.data);
          } catch (error) {
            console.error('Error al subir evidencia:', error);
            throw error; // Re-lanzar para que se capture en el catch principal
          }
        }
        console.log('Todas las evidencias subidas exitosamente');
      } else {
        console.log('No hay evidencias para subir o no hay respuestaId');
      }

      toast.success('✅ Respuesta enviada correctamente', { id: 'save' });
      
      // Limpiar archivos seleccionados
      console.log('Limpiando evidencias...');
      setEvidencias([]);
      
      // ⭐ IMPORTANTE: Recargar preguntas para actualizar UI
      console.log('Recargando preguntas...');
      await onRespuestaGuardada();
      console.log('=== ENVÍO COMPLETADO ===');
      
    } catch (error: any) {
      console.error('=== ERROR EN ENVÍO ===');
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.error
        || error.response?.data?.message
        || Object.values(error.response?.data || {}).join(', ')
        || 'Error al enviar';
      toast.error(errorMsg, { id: 'save' });
    } finally {
      setEnviando(false);
    }
  };

  const puedeEditar = !pregunta.respuesta || pregunta.respuesta.origen_respuesta.puede_editar;
  const requiereEvidencias = ['SI_CUMPLE', 'CUMPLE_PARCIAL'].includes(formData.respuesta);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Alerta de respuesta importada/propagada */}
      {pregunta.respuesta && !pregunta.respuesta.es_respuesta_original && (
        <div className={`mb-4 p-4 rounded-lg border ${
          pregunta.respuesta.origen_respuesta.tipo === 'importada'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className={
              pregunta.respuesta.origen_respuesta.tipo === 'importada'
                ? 'text-blue-600'
                : 'text-yellow-600'
            } />
            <p className="text-sm">{pregunta.respuesta.origen_respuesta.descripcion}</p>
          </div>
        </div>
      )}

      {/* Información de la Pregunta */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {pregunta.codigo_control}: {pregunta.nombre_control}
        </h3>
        <p className="text-gray-700 mb-2">{pregunta.pregunta}</p>
        <p className="text-sm text-gray-600">
          <strong>Objetivo:</strong> {pregunta.objetivo_evaluacion}
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        {/* Respuesta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Respuesta *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {RESPUESTA_OPCIONES.map((opcion) => (
              <button
                key={opcion.value}
                type="button"
                disabled={!puedeEditar}
                onClick={() => {
                  setFormData({
                    ...formData,
                    respuesta: opcion.value as any,
                    // ⭐ Si cambia a Sí Cumple/Parcial, inicializar con nivel 1.0
                    nivel_madurez: ['SI_CUMPLE', 'CUMPLE_PARCIAL'].includes(opcion.value) 
                      ? (formData.nivel_madurez === 0 ? 1.0 : formData.nivel_madurez)
                      : 0
                  });
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.respuesta === opcion.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <p className="font-medium text-sm">{opcion.label}</p>
                <p className="text-xs text-gray-500">
                  {opcion.puntos !== null ? `${opcion.puntos} pts` : 'Excluido'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Nivel de Madurez */}
        {!['NO_CUMPLE', 'NO_APLICA'].includes(formData.respuesta) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Madurez *
            </label>
            <select
              disabled={!puedeEditar}
              value={formData.nivel_madurez}
              onChange={(e) => setFormData({ ...formData, nivel_madurez: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {NIVELES_MADUREZ.map((nivel) => (
                <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Justificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Justificación * (mínimo 10 caracteres)
          </label>
          <textarea
            disabled={!puedeEditar}
            value={formData.justificacion}
            onChange={(e) => setFormData({ ...formData, justificacion: e.target.value })}
            rows={4}
            placeholder="Explica cómo cumples con este control..."
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.justificacion.length} caracteres
          </p>
        </div>

        {/* Evidencias */}
        {puedeEditar && requiereEvidencias && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencias * (máximo 3 archivos - se subirán al enviar)
            </label>
            
            {evidencias.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handleSeleccionarArchivos}
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Click para seleccionar archivos</p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, PowerPoint, Imágenes (máx. 10MB c/u)
                  </p>
                </label>
              </div>
            )}

            {/* Lista de archivos seleccionados */}
            {evidencias.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                {evidencias.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-primary-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarArchivo(i)}
                      className="text-red-600 hover:text-red-800"
                      type="button"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios Adicionales (opcional)
          </label>
          <textarea
            disabled={!puedeEditar}
            value={formData.comentarios_adicionales}
            onChange={(e) => setFormData({ ...formData, comentarios_adicionales: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Botón Enviar */}
        {puedeEditar && (
          <button
            onClick={handleEnviar}
            disabled={enviando}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>Enviando...</>
            ) : (
              <>
                <Send size={20} />
                Enviar Respuesta
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};