// src/components/respuestas/ModalEvidencia.tsx - VERSIÓN COMPLETA ACTUALIZADA

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints';
import { EvidenciaCreate, VerificacionCodigoResponse } from '@/types';
import toast from 'react-hot-toast';

interface ModalEvidenciaProps {
  respuestaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalEvidencia: React.FC<ModalEvidenciaProps> = ({
  respuestaId,
  onClose,
  onSuccess
}) => {
  const [uploading, setUploading] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [evidenciasExistentes, setEvidenciasExistentes] = useState<VerificacionCodigoResponse | null>(null);
  const [formData, setFormData] = useState({
    codigo_documento: '',  // ⭐ NUEVO - PRIMER CAMPO
    tipo_documento_enum: 'otro' as 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro',
    titulo_documento: '',
    objetivo_documento: '',
    fecha_ultima_actualizacion: '',
    archivo: null as File | null,
  });

  // ⭐ NUEVO: Verificar código cuando el usuario termina de escribir
  useEffect(() => {
    if (formData.codigo_documento.length >= 3) {
      const timer = setTimeout(() => {
        verificarCodigo();
      }, 800); // Espera 800ms después de que el usuario deja de escribir

      return () => clearTimeout(timer);
    } else {
      setEvidenciasExistentes(null);
    }
  }, [formData.codigo_documento]);

  const verificarCodigo = async () => {
    if (formData.codigo_documento.trim().length < 3) return;

    try {
      setVerificando(true);
      const result = await respuestasApi.verificarCodigoDocumento(formData.codigo_documento.trim());
      
      if (result.existe) {
        setEvidenciasExistentes(result);
      } else {
        setEvidenciasExistentes(null);
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
    } finally {
      setVerificando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 10MB');
        return;
      }
      
      // Validar extensión
      const extensionesPermitidas = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.zip', '.rar', '.txt'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!extensionesPermitidas.includes(extension)) {
        toast.error(`Extensión no permitida. Use: ${extensionesPermitidas.join(', ')}`);
        return;
      }
      
      setFormData(prev => ({ ...prev, archivo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⭐ Validar código de documento
    if (!formData.codigo_documento.trim()) {
      toast.error('El código de documento es obligatorio');
      return;
    }

    if (!formData.archivo) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    if (formData.titulo_documento.trim().length === 0) {
      toast.error('El título del documento es obligatorio');
      return;
    }

    if (formData.objetivo_documento.trim().length === 0) {
      toast.error('El objetivo del documento es obligatorio');
      return;
    }

    if (!formData.fecha_ultima_actualizacion) {
      toast.error('La fecha de actualización es obligatoria');
      return;
    }

    try {
      setUploading(true);

      const evidenciaData: EvidenciaCreate = {
        respuesta: respuestaId,
        codigo_documento: formData.codigo_documento.trim().toUpperCase(),  // ⭐ NUEVO
        tipo_documento_enum: formData.tipo_documento_enum,
        titulo_documento: formData.titulo_documento.trim(),
        objetivo_documento: formData.objetivo_documento.trim(),
        fecha_ultima_actualizacion: formData.fecha_ultima_actualizacion,
        archivo: formData.archivo,
      };

      await respuestasApi.subirEvidencia(evidenciaData);
      
      toast.success('Evidencia subida exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al subir evidencia:', error);
      const errorMsg = error.response?.data?.message || 'Error al subir la evidencia';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Agregar Evidencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ⭐ CAMPO 1: Código de Documento (NUEVO) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Documento <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">
                (ej: POL-SEG-001, PROC-TI-045)
              </span>
            </label>
            <input
              type="text"
              value={formData.codigo_documento}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                codigo_documento: e.target.value.toUpperCase()
              }))}
              maxLength={50}
              placeholder="POL-SEG-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
              required
            />
            {verificando && (
              <p className="text-xs text-blue-600 mt-1">
                🔍 Verificando código...
              </p>
            )}
          </div>

          {/* ⭐ ALERTA: Documentos Existentes con el mismo código */}
          {evidenciasExistentes && evidenciasExistentes.existe && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-amber-800">
                    {evidenciasExistentes.mensaje}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {evidenciasExistentes.evidencias_encontradas.map((ev) => (
                      <div key={ev.id} className="bg-white p-3 rounded border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {ev.tipo_documento_display}: {ev.titulo_documento}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              📍 Pregunta: {ev.pregunta_codigo} ({ev.dimension_nombre})
                            </p>
                            <p className="text-xs text-gray-500">
                              👤 Subido por: {ev.subido_por} • {ev.fecha_creacion}
                            </p>
                          </div>
                          {ev.url_archivo && (
                            <a
                              href={ev.url_archivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 ml-2"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    💡 Puedes continuar con la carga si deseas crear una nueva versión o referencia del mismo documento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CAMPO 2: Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo_documento_enum}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tipo_documento_enum: e.target.value as any
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="politica">Política</option>
              <option value="norma">Norma</option>
              <option value="procedimiento">Procedimiento</option>
              <option value="formato_interno">Formato Interno</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* CAMPO 3: Título del Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Documento <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">
                (máximo 60 caracteres)
              </span>
            </label>
            <input
              type="text"
              value={formData.titulo_documento}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                titulo_documento: e.target.value.slice(0, 60)
              }))}
              maxLength={60}
              placeholder="Ej: Política de Seguridad de la Información"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.titulo_documento.length}/60 caracteres
            </p>
          </div>

          {/* Objetivo del Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo del Documento <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">
                (máximo 180 caracteres)
              </span>
            </label>
            <textarea
              value={formData.objetivo_documento}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                objetivo_documento: e.target.value.slice(0, 180)
              }))}
              maxLength={180}
              rows={3}
              placeholder="Describe el objetivo de este documento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.objetivo_documento.length}/180 caracteres
            </p>
          </div>

          {/* Fecha de Última Actualización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Última Actualización <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha_ultima_actualizacion}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fecha_ultima_actualizacion: e.target.value
              }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">
                (máximo 10MB)
              </span>
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar,.txt"
              />
              
              {formData.archivo ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={32} className="text-primary-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {formData.archivo.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, archivo: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    Click para seleccionar o arrastra el archivo aquí
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, PowerPoint, Imágenes, ZIP (máx. 10MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="submit"
              variant="primary"
              disabled={uploading || !formData.archivo || verificando}
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Subiendo...' : 'Subir Evidencia'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};