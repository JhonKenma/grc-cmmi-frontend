import { X, Upload, FileText, AlertTriangle, Link as LinkIcon, Search, Trash2, CheckCircle, ChevronDown } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { useModalEvidencia } from './hooks/useModalEvidencia';

interface ModalEvidenciaProps {
  respuestaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalEvidencia = ({ respuestaId, onClose, onSuccess }: ModalEvidenciaProps) => {
  const {
    modo,
    setModo,
    uploading,
    verificando,
    cargandoCatalogos,
    openDropdown,
    setOpenDropdown,
    tiposDoc,
    procesosDoc,
    documentosMaestros,
    documentoSeleccionado,
    setDocumentoSeleccionado,
    busquedaDoc,
    setBusquedaDoc,
    filtroTipoVincular,
    setFiltroTipoVincular,
    filtroProcesoVincular,
    setFiltroProcesoVincular,
    paginaActual,
    setPaginaDocumentos,
    evidenciasExistentes,
    formData,
    setFormData,
    handleFileChange,
    PAGE_SIZE,
    tieneCriteriosBusqueda,
    documentosFiltrados,
    totalPaginas,
    inicio,
    fin,
    documentosPaginados,
    handleSubmit,
  } = useModalEvidencia({ respuestaId, onClose, onSuccess });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
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

        <div className="flex-1 p-6">
          {cargandoCatalogos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-600">Cargando catálogos...</span>
            </div>
          ) : (
            <form id="evidencia-form" onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="space-y-3">
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

                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[180px] relative z-20">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tipo</label>
                        <div
                          className={`w-full p-2 border ${openDropdown === 'tipo' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center transition-all`}
                          onClick={() => !uploading && setOpenDropdown(openDropdown === 'tipo' ? null : 'tipo')}
                        >
                          <span className="truncate text-gray-700">
                            {filtroTipoVincular ? tiposDoc.find((tipo) => tipo.id === filtroTipoVincular)?.nombre : 'Todos los tipos'}
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
                              {tiposDoc.map((tipo) => (
                                <div
                                  key={tipo.id}
                                  className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${filtroTipoVincular === tipo.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                  onClick={() => { setFiltroTipoVincular(tipo.id); setOpenDropdown(null); }}
                                >
                                  {tipo.nombre}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex-1 min-w-[180px] relative z-20">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Proceso</label>
                        <div
                          className={`w-full p-2 border ${openDropdown === 'proceso' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center transition-all`}
                          onClick={() => !uploading && setOpenDropdown(openDropdown === 'proceso' ? null : 'proceso')}
                        >
                          <span className="truncate text-gray-700">
                            {filtroProcesoVincular ? procesosDoc.find((proceso) => proceso.id === filtroProcesoVincular)?.nombre : 'Todos los procesos'}
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
                              {procesosDoc.map((proceso) => (
                                <div
                                  key={proceso.id}
                                  className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${filtroProcesoVincular === proceso.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                  onClick={() => { setFiltroProcesoVincular(proceso.id); setOpenDropdown(null); }}
                                >
                                  {proceso.nombre}
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

                  <div className="max-h-[300px] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50 relative z-0">
                    {!tieneCriteriosBusqueda ? (
                      <p className="text-center text-gray-500 text-sm py-8">
                        Aplica al menos un filtro o escribe 2+ caracteres para buscar documentos.
                      </p>
                    ) : documentosFiltrados.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-8">
                        {documentosMaestros.length === 0 ? 'No hay documentos vigentes en el sistema.' : 'No se encontraron documentos con esos filtros.'}
                      </p>
                    ) : (
                      documentosPaginados.map((doc) => (
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
                            {documentoSeleccionado === doc.id && <CheckCircle size={18} className="text-blue-600" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.titulo}</p>
                          <p className="text-xs text-gray-400 mt-1 font-mono">v{doc.version}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {tieneCriteriosBusqueda && documentosFiltrados.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                      <span>
                        Mostrando {inicio + 1}-{Math.min(fin, documentosFiltrados.length)} de {documentosFiltrados.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPaginaDocumentos((prev) => Math.max(1, prev - 1))}
                          disabled={paginaActual === 1}
                          className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                          Anterior
                        </button>
                        <span>Página {paginaActual} / {totalPaginas}</span>
                        <button
                          type="button"
                          onClick={() => setPaginaDocumentos((prev) => Math.min(totalPaginas, prev + 1))}
                          disabled={paginaActual === totalPaginas}
                          className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modo === 'subir' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Documento <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.codigo_documento}
                          onChange={(e) => setFormData((prev) => ({ ...prev, codigo_documento: e.target.value.toUpperCase() }))}
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                          placeholder="POL-SEG-001"
                          maxLength={50}
                          disabled={uploading}
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                          {verificando ? <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" /> : <Search size={20} />}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.tipo_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tipo_id: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        disabled={uploading}
                      >
                        <option value="">Seleccione...</option>
                        {tiposDoc.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre} {tipo.abreviatura ? `(${tipo.abreviatura})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.titulo_documento}
                      onChange={(e) => setFormData((prev) => ({ ...prev, titulo_documento: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Política de Seguridad de la Información"
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objetivo del Documento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={180}
                      value={formData.objetivo_documento}
                      onChange={(e) => setFormData((prev) => ({ ...prev, objetivo_documento: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe el objetivo de este documento..."
                      disabled={uploading}
                    />
                  </div>

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
                          onClick={() => setFormData((prev) => ({ ...prev, archivo: null }))}
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

        <div className="p-5 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
          <Button variant="secondary" onClick={onClose} disabled={uploading || cargandoCatalogos}>
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
