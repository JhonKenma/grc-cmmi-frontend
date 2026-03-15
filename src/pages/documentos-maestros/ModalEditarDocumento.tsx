import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, FileText, FileType, Trash2, RefreshCw, 
  Save, Calendar, PenTool, Download, Info, Eye 
} from 'lucide-react';
import { documentosApi } from '../../api/endpoints/documentos.api';
import { TipoDocumento, Proceso, Norma, Documento, DocumentoForm } from '../../types/documentos.types';
import toast from 'react-hot-toast';

interface Props {
  documento: Documento;
  soloLectura?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  catalogos: { tipos: TipoDocumento[]; procesos: Proceso[]; normas: Norma[] };
  onEdit?: () => void;
}

const ModalEditarDocumento: React.FC<Props> = ({
  documento,
  soloLectura = false,
  onClose,
  onSuccess,
  catalogos,
  onEdit
}) => {
  const [loading, setLoading] = useState(false);
  
  // Reglas de Negocio
  const [requiereWord, setRequiereWord] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [nivelJerarquico, setNivelJerarquico] = useState<number | null>(null);

  // Formulario
  const [form, setForm] = useState<DocumentoForm>({
    tipo: '',
    proceso: '',
    norma: '',
    codigo: '',
    titulo: '',
    version: "1",
    estado: 'borrador',
    objetivo: '',
    alcance: '',
    nivel_confidencialidad: 'interno',
    frecuencia_revision: 'anual',
    periodo_retencion: 5,
    fecha_emision: new Date().toISOString().split('T')[0],
    fichero_pdf: null,      
    fichero_editable: null  
  });

  const [fechaProximaRevision, setFechaProximaRevision] = useState('');
  
  // Refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar datos
  useEffect(() => {
    if (documento) {
      setForm({
        tipo: documento.tipo || '',
        proceso: documento.proceso || '',
        norma: documento.norma || '',
        codigo: documento.codigo || '',
        titulo: documento.titulo || '',
        version: documento.version ||"1",
        estado: documento.estado || 'borrador',
        objetivo: documento.objetivo || '',
        alcance: documento.alcance || '',
        nivel_confidencialidad: documento.nivel_confidencialidad || 'interno',
        frecuencia_revision: documento.frecuencia_revision || 'anual',
        periodo_retencion: documento.periodo_retencion || 5,
        fecha_emision: documento.fecha_emision?.split('T')[0] || new Date().toISOString().split('T')[0],
        fichero_pdf: null, 
        fichero_editable: null,
      });
    }
  }, [documento]);

  // 2. Reglas de tipo
  useEffect(() => {
    if (form.tipo) {
      const tipoSeleccionado = catalogos.tipos.find(t => t.id === form.tipo);
      if (tipoSeleccionado) {
        const isReg = tipoSeleccionado.abreviatura === 'REG' || tipoSeleccionado.nombre.toLowerCase().includes('registro');
        setEsRegistro(isReg);
        // La obligatoriedad de editable depende unicamente de la configuracion del tipo.
        setRequiereWord(!!tipoSeleccionado.requiere_word_y_pdf);
        
        if (tipoSeleccionado.nivel_jerarquico) {
            setNivelJerarquico(tipoSeleccionado.nivel_jerarquico);
        }
      }
    } else {
        setNivelJerarquico(null);
    }
  }, [form.tipo, catalogos.tipos]);

  // 3. Fecha revisión
  useEffect(() => {
    if (form.frecuencia_revision === 'no_aplica' || esRegistro || !form.fecha_emision) {
      setFechaProximaRevision('');
      return;
    }
    const fechaBase = new Date(`${form.fecha_emision}T12:00:00`);
    if (isNaN(fechaBase.getTime())) return;
    const nuevaFecha = new Date(fechaBase);
    
    switch (form.frecuencia_revision) {
      case 'anual': nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1); break;
      case 'semestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 6); break;
      case 'trimestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 3); break;
      case 'mensual': nuevaFecha.setMonth(nuevaFecha.getMonth() + 1); break;
      default: return;
    }
    setFechaProximaRevision(nuevaFecha.toISOString().split('T')[0]);
  }, [form.fecha_emision, form.frecuencia_revision, esRegistro]);

  const handleSubmit = async () => {
    if (soloLectura) return;
    try {
      setLoading(true);
      const datosFinales = {
        ...form,
        fecha_proxima_revision: fechaProximaRevision || undefined
      };
      await documentosApi.update(documento.id, datosFinales);
      toast.success("Documento actualizado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Error al actualizar el documento");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO DE ARCHIVOS CON PREVISUALIZACIÓN ---
  const renderFileSection = (
    label: string, 
    tipo: 'pdf' | 'editable', 
    newFile: File | null | undefined, 
    existingUrl: string | undefined | null,
    existingFileName: string | undefined | null,
    inputRef: any,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
    colorClass: string,
    Icon: any
  ) => {
    const hasExisting = !!existingUrl;
    const hasNew = !!newFile;
    const fileActive = hasNew || hasExisting;

    return (
      <div className="w-full">
        <label className={`block text-xs font-bold uppercase mb-2 ${colorClass}`}>
          {label} {hasNew && <span className="text-green-600 ml-2 text-[10px] bg-green-50 px-2 py-0.5 rounded-full">Nuevo archivo listo</span>}
        </label>
        
        <div 
          onClick={() => (!soloLectura && !hasNew) ? inputRef.current?.click() : undefined}
          className={`
            border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group h-32 relative
            ${fileActive ? (hasNew ? 'border-green-500 bg-green-50/50' : 'border-blue-300 bg-blue-50/30') : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'}
            ${(!soloLectura && !hasNew) ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            accept={tipo === 'pdf' ? ".pdf" : ".doc,.docx,.xlsx"} 
            onChange={onChange} 
            disabled={soloLectura}
          />
          
          {hasNew ? (
            // ESTADO 1: NUEVO ARCHIVO SELECCIONADO PARA SUBIR
            <div className="flex items-center gap-3 w-full overflow-hidden px-2 z-10">
              <div className={`p-2 rounded-full text-white shrink-0 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{newFile.name}</p>
                <p className="text-[10px] text-gray-500">{(newFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : hasExisting ? (
            // ESTADO 2: ARCHIVO YA EXISTENTE EN EL SERVIDOR
            <div className="flex flex-col items-center gap-2 w-full z-10">
              <div className="flex items-center gap-2">
                 <Icon size={24} className={colorClass} />
                 <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]" title={existingFileName || 'Archivo actual'}>
                    {existingFileName || 'Archivo actual'}
                 </p>
              </div>
              <div className="flex gap-2 mt-1">
                 {/* BOTÓN PREVISUALIZAR */}
                 <a 
                    href={existingUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-purple-600 hover:bg-purple-50 font-bold shadow-sm"
                 >
                    <Eye size={12}/> Ver
                 </a>
                 {/* BOTÓN DESCARGAR */}
                 <a 
                    href={existingUrl} 
                    download
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 font-bold shadow-sm"
                 >
                    <Download size={12}/> Bajar
                 </a>
                 {/* BOTÓN REEMPLAZAR */}
                 {!soloLectura && (
                   <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                      className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-50 font-bold shadow-sm"
                   >
                      Cambiar
                   </button>
                 )}
              </div>
            </div>
          ) : (
            // ESTADO 3: VACÍO (SIN ARCHIVO)
            <div className="space-y-1">
              <UploadCloud className="mx-auto text-gray-400 group-hover:text-blue-500 transition-colors" size={28} />
              <p className="text-xs text-gray-600 font-medium">{soloLectura ? 'Sin archivo' : 'Click para subir'}</p>
              {!soloLectura && <p className="text-[10px] text-gray-400">{tipo === 'pdf' ? '.pdf' : '.doc, .docx, .xlsx'}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
               {soloLectura ? 'Detalle del Documento Maestro' : 'Editar Documento Maestro'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">Gestión Documental SGI</p>
                {nivelJerarquico && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                        NIVEL {nivelJerarquico}
                    </span>
                )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: Identificación */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-gray-700">Identificación del Documento</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tipo Documento</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.tipo}
                    onChange={(e) => setForm({...form, tipo: e.target.value})}
                    disabled={soloLectura || loading}
                  >
                    <option value="">Seleccione...</option>
                    {catalogos.tipos.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} {t.abreviatura ? `(${t.abreviatura})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Proceso Dueño</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.proceso}
                    onChange={(e) => setForm({...form, proceso: e.target.value})}
                    disabled={soloLectura || loading}
                  >
                    <option value="">Seleccione...</option>
                    {catalogos.procesos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.sigla})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Código</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-mono bg-gray-100 outline-none"
                    value={form.codigo}
                    readOnly
                    disabled
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Versión</label>
                  <input 
                    type="number"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.version}
                    onChange={(e) => setForm({...form, version: e.target.value as any})}
                    disabled={soloLectura || loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                <input 
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                  disabled={soloLectura || loading}
                />
              </div>

              {/* SECCIÓN ARCHIVOS */}
              <div className={`p-4 rounded-xl border ${requiereWord ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <UploadCloud size={16}/> Archivos del Documento
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {renderFileSection(
                    "PDF Vigente",
                    "pdf",
                    form.fichero_pdf,
                    documento.url_pdf,
                    (documento as any).nombre_archivo_pdf || "Documento_Actual.pdf", 
                    pdfInputRef,
                    (e) => setForm(p => ({...p, fichero_pdf: e.target.files?.[0]})),
                    () => setForm(p => ({...p, fichero_pdf: null})),
                    "text-red-600",
                    FileText
                  )}

                  {requiereWord ? renderFileSection(
                    "Editable (Word)",
                    "editable",
                    form.fichero_editable,
                    documento.url_editable,
                    (documento as any).nombre_archivo_editable || "Documento_Editable", 
                    wordInputRef,
                    (e) => setForm(p => ({...p, fichero_editable: e.target.files?.[0]})),
                    () => setForm(p => ({...p, fichero_editable: null})),
                    "text-blue-600",
                    FileType
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-center p-4 bg-gray-50/50 opacity-60 h-32">
                      <p className="text-xs text-gray-400 italic">No requiere archivo editable</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Atributos y Fechas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-gray-700">Atributos de Control (SGI)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Calendar size={12}/> Fecha Emisión
                      </label>
                      <input 
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded text-sm outline-none disabled:opacity-70 disabled:bg-gray-100"
                        value={form.fecha_emision}
                        onChange={(e) => setForm({...form, fecha_emision: e.target.value})}
                        disabled={soloLectura || loading}
                      />
                  </div>
                  
                  {!esRegistro && (
                      <div className="space-y-1">
                          <label className="flex items-center gap-1 text-xs font-bold uppercase text-purple-600">
                             <Calendar size={12}/> Prox. Revisión
                          </label>
                          <input 
                            type="date"
                            className="w-full p-2 border border-purple-200 bg-purple-50 text-purple-700 rounded text-sm outline-none font-semibold"
                            value={fechaProximaRevision}
                            readOnly
                            title="Calculada automáticamente"
                          />
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Frecuencia Revisión</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.frecuencia_revision}
                    onChange={(e) => setForm({...form, frecuencia_revision: e.target.value})}
                    disabled={soloLectura || esRegistro || loading}
                  >
                    <option value="anual">Anual</option>
                    <option value="semestral">Semestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="mensual">Mensual</option>
                    <option value="no_aplica">No Aplica</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Norma</label>
                  {soloLectura ? (
                    <input
                      type="text"
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-100 outline-none"
                      value={
                        catalogos.normas.find(n => n.id === form.norma)?.nombre ||
                        documento.nombre_norma ||
                        'Ninguna'
                      }
                      disabled
                      readOnly
                    />
                  ) : (
                    <select 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                      value={form.norma}
                      onChange={(e) => setForm({...form, norma: e.target.value})}
                      disabled={loading}
                    >
                      <option value="">Ninguna</option>
                      {catalogos.normas.map(n => (
                        <option key={n.id} value={n.id}>{n.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Confidencialidad</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.nivel_confidencialidad}
                    onChange={(e) => setForm({...form, nivel_confidencialidad: e.target.value})}
                    disabled={soloLectura || loading}
                  >
                    <option value="publico">Público</option>
                    <option value="interno">Uso Interno</option>
                    <option value="confidencial">Confidencial</option>
                    <option value="estrategico">Estratégico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Retención (Años)</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                    value={form.periodo_retencion}
                    onChange={(e) => setForm({...form, periodo_retencion: Number(e.target.value)})}
                    disabled={soloLectura || loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Objetivo del Documento</label>
                <textarea 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm h-16 resize-none focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  placeholder="Describa el propósito..."
                  value={form.objetivo}
                  onChange={(e) => setForm({...form, objetivo: e.target.value})}
                  disabled={soloLectura || loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Alcance</label>
                <textarea 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm h-16 resize-none focus:ring-2 focus:ring-purple-100 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  placeholder="Ej: Aplica a todas las sedes o al departamento de TI..."
                  value={form.alcance}
                  onChange={(e) => setForm({...form, alcance: e.target.value})}
                  disabled={soloLectura || loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center sticky bottom-0 z-10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={14}/>
            <span>{soloLectura ? 'Estás en modo solo lectura.' : 'Modificando un documento existente.'}</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-all text-sm"
              disabled={loading}
            >
              {soloLectura ? 'Cerrar Detalle' : 'Cancelar'}
            </button>
            
            {soloLectura ? (
              onEdit && (
                <button 
                  onClick={onEdit}
                  className="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  <PenTool size={16}/> Habilitar Edición
                </button>
              )
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <><RefreshCw className="animate-spin" size={16}/> Guardando...</>
                ) : (
                  <><Save size={16}/> Guardar Cambios</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarDocumento;