import React, { useState, useEffect } from 'react';
import { 
  X, Upload, FileText, AlertTriangle, 
  Link as LinkIcon, Search, Trash2, CheckCircle, ChevronDown
} from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints/respuestas.api'; 
import { documentosApi } from '@/api/endpoints/documentos.api'; 
import { TipoDocumento, Documento, Proceso } from '@/types/documentos.types';
import { VerificacionCodigoResponse } from '@/types/respuestas.types'; 
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
  // --- Estados de Control ---
  const [modo, setModo] = useState<'subir' | 'vincular'>('subir');
  const [uploading, setUploading] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

  // --- Estado para Dropdowns Personalizados ---
  const [openDropdown, setOpenDropdown] = useState<'tipo' | 'proceso' | null>(null);

  // --- Datos Dinámicos ---
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [procesosDoc, setProcesosDoc] = useState<Proceso[]>([]);
  const [documentosMaestros, setDocumentosMaestros] = useState<Documento[]>([]);

  // --- Estado para Modo: Vincular ---
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string>('');
  const [busquedaDoc, setBusquedaDoc] = useState<string>('');
  const [filtroTipoVincular, setFiltroTipoVincular] = useState<string>('');
  const [filtroProcesoVincular, setFiltroProcesoVincular] = useState<string>('');

  // --- Estado para Modo: Subir Nuevo ---
  const [evidenciasExistentes, setEvidenciasExistentes] = useState<VerificacionCodigoResponse | null>(null);
  const [formData, setFormData] = useState({
    codigo_documento: '',
    tipo_id: '',
    titulo_documento: '',
    objetivo_documento: '',
    archivo: null as File | null,
  });

  // 1. CARGA DE DATOS según el modo
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoCatalogos(true);
      try {
        if (modo === 'subir') {
          const datosTipos = await documentosApi.getTipos();
          setTiposDoc(datosTipos);
        } else {
          const [tipos, procesos, docsResponse] = await Promise.all([
            documentosApi.getTipos(),
            documentosApi.getProcesos(),
            documentosApi.getAll()
          ]);
          setTiposDoc(tipos);
          setProcesosDoc(procesos);
          const vigentes = docsResponse.filter(doc => doc.estado === 'vigente');
          setDocumentosMaestros(vigentes);
        }
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        toast.error("No se pudieron cargar los catálogos");
      } finally {
        setCargandoCatalogos(false);
      }
    };
    cargarDatos();
  }, [modo]);

  // 2. VERIFICACIÓN DE CÓDIGO (Solo modo subir)
  useEffect(() => {
    if (modo === 'subir' && formData.codigo_documento.length >= 3) {
      const timer = setTimeout(() => verificarCodigo(), 800);
      return () => clearTimeout(timer);
    } else {
      setEvidenciasExistentes(null);
    }
  }, [formData.codigo_documento, modo]);

  const verificarCodigo = async () => {
    try {
      setVerificando(true);
      const result = await respuestasApi.verificarCodigoDocumento(formData.codigo_documento.trim());
      if (result && result.existe) {
        setEvidenciasExistentes(result);
      } else {
        setEvidenciasExistentes(null);
      }
    } catch (error) {
      console.error('Error verificación:', error);
    } finally {
      setVerificando(false);
    }
  };

  // 3. MANEJO DE ARCHIVO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo supera los 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, archivo: file }));
    }
  };

  // Filtrado combinado (búsqueda + tipo + proceso)
  const documentosFiltrados = documentosMaestros.filter(doc => {
    const coincideBusqueda = 
      doc.titulo.toLowerCase().includes(busquedaDoc.toLowerCase()) ||
      doc.codigo.toLowerCase().includes(busquedaDoc.toLowerCase());
    const coincideTipo = filtroTipoVincular ? doc.tipo === filtroTipoVincular : true;
    const coincideProceso = filtroProcesoVincular ? doc.proceso === filtroProcesoVincular : true;
    return coincideBusqueda && coincideTipo && coincideProceso;
  });

  // 4. ENVÍO DEL FORMULARIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modo === 'vincular') {
      if (!documentoSeleccionado) {
        toast.error('Selecciona un documento maestro');
        return;
      }
    } else {
      if (!formData.codigo_documento) return toast.error('El código es obligatorio');
      if (!formData.tipo_id) return toast.error('Selecciona el tipo de documento');
      if (!formData.titulo_documento) return toast.error('El título es obligatorio');
      if (!formData.objetivo_documento) return toast.error('El objetivo es obligatorio');
      if (!formData.archivo) return toast.error('Debes adjuntar un archivo');
    }

    try {
      setUploading(true);

      const payload: any = {
        respuesta_id: respuestaId
      };

      if (modo === 'vincular') {
        payload.documento_id = documentoSeleccionado;
      } else {
        payload.codigo_documento = formData.codigo_documento.trim().toUpperCase();
        payload.tipo_documento_enum = formData.tipo_id;
        payload.titulo_documento = formData.titulo_documento.trim();
        payload.objetivo_documento = formData.objetivo_documento.trim();
        payload.archivo = formData.archivo;
      }

      await respuestasApi.subirEvidencia(payload);
      
      toast.success(modo === 'vincular' ? 'Documento vinculado con éxito' : 'Evidencia subida');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la evidencia');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
        
        {/* HEADER */}
        <div className="p-5 border-b flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Agregar Evidencia</h2>
            <p className="text-sm text-gray-500">Sustenta tu respuesta con documentación</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 pt-6">
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setModo('subir')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
                modo === 'subir' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={uploading}
            >
              <Upload size={18} /> Subir Nuevo
            </button>
            <button
              type="button"
              onClick={() => setModo('vincular')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${
                modo === 'vincular' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={uploading}
            >
              <LinkIcon size={18} /> Vincular Oficial
            </button>
          </div>
        </div>

        {/* CONTENIDO FORMULARIO */}
        <div className="flex-1 p-6">
          {cargandoCatalogos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando catálogos...</span>
            </div>
          ) : (
            <form id="evidencia-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- MODO: VINCULAR --- */}
              {modo === 'vincular' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full h-fit">
                      <LinkIcon className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Vincular Documento Oficial</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Busca y selecciona un documento que ya esté aprobado en el Maestro de Documentos.
                      </p>
                    </div>
                  </div>

                  {/* === FILTROS ESTÁTICOS (FUERA DEL SCROLL) === */}
                  <div className="space-y-3">
                    {/* Buscador */}
                    <div className="relative z-10">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por código o título..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={busquedaDoc}
                        onChange={(e) => setBusquedaDoc(e.target.value)}
                        disabled={uploading}
                      />
                    </div>

                    {/* Filtros de tipo y proceso */}
                    <div className="flex flex-wrap items-end gap-3">
                      
                      {/* Custom Select para Tipo */}
                      <div className="flex-1 min-w-[180px] relative z-20">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tipo</label>
                        <div
                          className={`w-full p-2 border ${openDropdown === 'tipo' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center transition-all`}
                          onClick={() => !uploading && setOpenDropdown(openDropdown === 'tipo' ? null : 'tipo')}
                        >
                          <span className="truncate text-gray-700">
                            {filtroTipoVincular
                              ? tiposDoc.find(t => t.id === filtroTipoVincular)?.nombre
                              : 'Todos los tipos'}
                          </span>
                          <ChevronDown size={16} className={`text-gray-500 transition-transform ${openDropdown === 'tipo' ? 'rotate-180' : ''}`} />
                        </div>

                        {openDropdown === 'tipo' && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              <div
                                className="p-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-gray-100"
                                onClick={() => { setFiltroTipoVincular(''); setOpenDropdown(null); }}
                              >
                                Todos los tipos
                              </div>
                              {tiposDoc.map(t => (
                                <div
                                  key={t.id}
                                  className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${filtroTipoVincular === t.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                  onClick={() => { setFiltroTipoVincular(t.id); setOpenDropdown(null); }}
                                >
                                  {t.nombre}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Custom Select para Proceso */}
                      <div className="flex-1 min-w-[180px] relative z-20">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Proceso</label>
                        <div
                          className={`w-full p-2 border ${openDropdown === 'proceso' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center transition-all`}
                          onClick={() => !uploading && setOpenDropdown(openDropdown === 'proceso' ? null : 'proceso')}
                        >
                          <span className="truncate text-gray-700">
                            {filtroProcesoVincular
                              ? procesosDoc.find(p => p.id === filtroProcesoVincular)?.nombre
                              : 'Todos los procesos'}
                          </span>
                          <ChevronDown size={16} className={`text-gray-500 transition-transform ${openDropdown === 'proceso' ? 'rotate-180' : ''}`} />
                        </div>

                        {openDropdown === 'proceso' && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              <div
                                className="p-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-gray-100"
                                onClick={() => { setFiltroProcesoVincular(''); setOpenDropdown(null); }}
                              >
                                Todos los procesos
                              </div>
                              {procesosDoc.map(p => (
                                <div
                                  key={p.id}
                                  className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${filtroProcesoVincular === p.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                  onClick={() => { setFiltroProcesoVincular(p.id); setOpenDropdown(null); }}
                                >
                                  {p.nombre}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {(filtroTipoVincular || filtroProcesoVincular) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFiltroTipoVincular('');
                            setFiltroProcesoVincular('');
                          }}
                          className="h-[38px] px-4 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-red-100 z-10"
                        >
                          <X size={16} /> Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de documentos con scroll independiente */}
                  <div className="max-h-[300px] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50 relative z-0">
                    {documentosFiltrados.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-8">
                        {documentosMaestros.length === 0 
                          ? 'No hay documentos vigentes en el sistema.' 
                          : 'No se encontraron documentos con esos filtros.'}
                      </p>
                    ) : (
                      documentosFiltrados.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => setDocumentoSeleccionado(doc.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            documentoSeleccionado === doc.id 
                              ? 'bg-blue-50 border-blue-500 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">{doc.codigo}</span>
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                Vigente
                              </span>
                            </div>
                            {documentoSeleccionado === doc.id && (
                              <CheckCircle size={18} className="text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.titulo}</p>
                          <p className="text-xs text-gray-400 mt-1 font-mono">v{doc.version}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* --- MODO: SUBIR NUEVO --- */}
              {modo === 'subir' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {/* Código y Tipo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Documento <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.codigo_documento}
                          onChange={(e) => setFormData(prev => ({ ...prev, codigo_documento: e.target.value.toUpperCase() }))}
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                          placeholder="POL-SEG-001"
                          maxLength={50}
                          disabled={uploading}
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                          {verificando ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                          ) : (
                            <Search size={20} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.tipo_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo_id: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        disabled={uploading}
                      >
                        <option value="">Seleccione...</option>
                        {tiposDoc.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} {t.abreviatura ? `(${t.abreviatura})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Alerta Duplicados */}
                  {evidenciasExistentes?.existe && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
                      <div className="flex items-start">
                        <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-amber-800">{evidenciasExistentes.mensaje}</h3>
                          {evidenciasExistentes.evidencias_encontradas && evidenciasExistentes.evidencias_encontradas.length > 0 && (
                            <div className="mt-2 text-xs text-gray-700 bg-white/50 p-2 rounded">
                              Este código ya está en uso por: <b>{evidenciasExistentes.evidencias_encontradas[0].titulo_documento}</b>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Documento <span className="text-red-500">*</span> 
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.titulo_documento}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo_documento: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Política de Seguridad de la Información"
                      disabled={uploading}
                    />
                  </div>

                  {/* Objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objetivo del Documento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={180}
                      value={formData.objetivo_documento}
                      onChange={(e) => setFormData(prev => ({ ...prev, objetivo_documento: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe el objetivo de este documento..."
                      disabled={uploading}
                    />
                  </div>

                  {/* Archivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo <span className="text-red-500">*</span>
                    </label>
                    
                    {!formData.archivo ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer relative group">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                          disabled={uploading}
                        />
                        <div className="pointer-events-none">
                          <Upload className="mx-auto text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" size={40} />
                          <p className="text-sm font-medium text-gray-700">Haz clic o arrastra el archivo aquí</p>
                          <p className="text-xs text-gray-500 mt-2">Formatos: PDF, Word, Excel, Img</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <FileText className="text-blue-600" size={24} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{formData.archivo.name}</p>
                            <p className="text-xs text-gray-500">{(formData.archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, archivo: null }))} 
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                          disabled={uploading}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={uploading || cargandoCatalogos}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="evidencia-form" 
            variant="primary" 
            disabled={uploading || verificando || cargandoCatalogos} 
            isLoading={uploading} 
            className="min-w-[140px]"
          >
            {modo === 'vincular' ? 'Vincular' : 'Guardar Evidencia'}
          </Button>
        </div>

      </Card>
    </div>
  );
};