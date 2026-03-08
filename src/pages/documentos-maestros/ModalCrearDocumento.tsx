import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, FileText, FileType, Trash2, LucideIcon, RefreshCw, Info, Calendar } from 'lucide-react';
import { documentosApi } from '../../api/endpoints/documentos.api';
import { TipoDocumento, Proceso, Norma, DocumentoForm } from '../../types/documentos.types';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  catalogos: { 
    tipos: TipoDocumento[]; 
    procesos: Proceso[]; 
    normas: Norma[]; 
  };
}

const ModalCrearDocumento: React.FC<Props> = ({ onClose, onSuccess, catalogos }) => {
  const [loading, setLoading] = useState(false);
  const [sugiriendo, setSugiriendo] = useState(false);
   
  // Reglas de negocio dinámicas
  const [requiereWord, setRequiereWord] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [esPolitica, setEsPolitica] = useState(false); 
  const [nivelJerarquico, setNivelJerarquico] = useState<number | null>(null);

  // Estado inicial
  const [form, setForm] = useState<DocumentoForm>({
    tipo: '',
    proceso: '',
    norma: '',
    codigo: '',
    titulo: '',
    version: '1.0',                     
    estado: 'borrador',
    
    // Campos SGI
    objetivo: '',
    alcance: '', 
    nivel_confidencialidad: 'interno',
    frecuencia_revision: 'anual',
    periodo_retencion: 5,
    
    // Fechas 
    fecha_emision: new Date().toISOString().split('T')[0], 
    
    // Archivos
    fichero_pdf: null,
    fichero_editable: null
  });

  const [fechaProximaRevision, setFechaProximaRevision] = useState('');

  // Refs para archivos
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // 1. Control de reglas de negocio al cambiar TIPO
  useEffect(() => {
    if (form.tipo) {
      const tipoSeleccionado = catalogos?.tipos?.find(t => t.id === form.tipo);
      
      if (tipoSeleccionado) {
        const nombreTipo = (tipoSeleccionado.nombre || '').toLowerCase();
        
        const isReg = tipoSeleccionado.abreviatura === 'REG' || nombreTipo.includes('registro');
        setEsRegistro(isReg);

        const isPol = tipoSeleccionado.abreviatura === 'POL' || nombreTipo.includes('política');
        setEsPolitica(isPol);

        if (isPol) {
            setForm(prev => ({ ...prev, alcance: 'Organizacional' }));
        }

        // La obligatoriedad de editable depende unicamente de la configuracion del tipo.
        const obligatorio = !!tipoSeleccionado.requiere_word_y_pdf;
        setRequiereWord(obligatorio);
        
        if (!obligatorio) {
          setForm(prev => ({ ...prev, fichero_editable: null }));
        }

        if (tipoSeleccionado.nivel_jerarquico) {
            setNivelJerarquico(tipoSeleccionado.nivel_jerarquico);
        } else {
            setNivelJerarquico(null);
        }
      }
    } else {
      setRequiereWord(false);
      setEsRegistro(false);
      setEsPolitica(false);
      setNivelJerarquico(null);
    }
  }, [form.tipo, catalogos?.tipos]);

  // 2. Sugerencia de código automática
  useEffect(() => {
    const obtenerSugerencia = async () => {
      if (form.tipo && form.proceso) {
        setSugiriendo(true);
        try {
          const codigoSugerido = await documentosApi.sugerirCodigo(form.tipo, form.proceso);
          if (codigoSugerido) {
            setForm(prev => ({ ...prev, codigo: codigoSugerido }));
          }
        } catch (error) {
          console.error("Error obteniendo sugerencia", error);
        } finally {
          setSugiriendo(false);
        }
      }
    };
    obtenerSugerencia();
  }, [form.tipo, form.proceso]);

  // 3. Cálculo automático de Fecha Próxima Revisión
  useEffect(() => {
    if (form.frecuencia_revision === 'no_aplica' || esRegistro || !form.fecha_emision) {
        setFechaProximaRevision('');
        return;
    }

    const fechaBase = new Date(`${form.fecha_emision}T12:00:00`);
    if (isNaN(fechaBase.getTime())) return;

    const nuevaFecha = new Date(fechaBase);
    
    switch(form.frecuencia_revision) {
        case 'anual': nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1); break;
        case 'semestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 6); break;
        case 'trimestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 3); break;
        case 'mensual': nuevaFecha.setMonth(nuevaFecha.getMonth() + 1); break;
        default: return;
    }
    
    setFechaProximaRevision(nuevaFecha.toISOString().split('T')[0]);
  }, [form.fecha_emision, form.frecuencia_revision, esRegistro]);


  // Guardado
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.tipo) return toast.error("Selecciona el tipo de documento");
    if (!form.proceso) return toast.error("Selecciona el proceso dueño");
    if (!form.titulo) return toast.error("El título es obligatorio");
    if (!form.codigo) return toast.error("El código es obligatorio");
    if (!form.fecha_emision) return toast.error("La fecha de emisión es obligatoria");
    if (!form.alcance) return toast.error("El alcance es obligatorio para SGI");
    if (!form.fichero_pdf) return toast.error("El archivo PDF es obligatorio (Versión oficial)");
    if (requiereWord && !form.fichero_editable) return toast.error("Es OBLIGATORIO subir el archivo Editable (Word/Excel)");

    try {
      setLoading(true);
      const datosFinales = {
          ...form,
          fecha_proxima_revision: fechaProximaRevision || undefined
      };

      await documentosApi.create(datosFinales);
      toast.success("Documento maestro creado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || error.response?.data?.message || "Error al guardar el documento.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SOLUCIÓN: inputRef ahora es 'any' para evitar conflictos de TypeScript con useRef
  const renderFileUploadBox = (
    label: string, 
    accept: string, 
    file: any, 
    setFile: (file: File | null) => void, 
    inputRef: any, // <- Flexibilidad máxima para quitar el error rojo
    colorClass: string, 
    Icon: LucideIcon, 
    required?: boolean
  ) => (
    <div className="w-full">
      <label className={`block mb-2 text-xs font-bold uppercase ${colorClass}`}>
        {label} {required && <span className="text-red-500">*</span>}
        {file && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-600">Listo</span>}
      </label>
      
      <div 
        onClick={() => inputRef.current?.click()}
        className={`group flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${file ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}
      >
        <input 
          type="file" 
          accept={accept} 
          className="hidden" 
          ref={inputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        
        {file ? (
          <div className="flex w-full items-center gap-3 overflow-hidden px-2">
            <div className={`shrink-0 rounded-full p-2 text-white ${colorClass.replace('text-', 'bg-')}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-bold text-gray-800">{file.name || 'Archivo cargado'}</p>
              {file.size && <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <UploadCloud className="mx-auto text-gray-400 transition-colors group-hover:text-blue-500" size={28} />
            <p className="text-xs font-medium text-gray-600">Click para subir</p>
            <p className="text-[10px] text-gray-400">{accept}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="flex w-full max-w-4xl max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 animate-in fade-in zoom-in">
        
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Documento Maestro</h2>
            <div className="mt-0.5 flex items-center gap-2">
                <p className="text-xs text-gray-500">Gestión Documental SGI</p>
                {nivelJerarquico && (
                    <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        NIVEL {nivelJerarquico}
                    </span>
                )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 transition-all hover:bg-red-100 hover:text-red-600" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            
            <div className="space-y-6">
              <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                <h3 className="text-sm font-bold text-gray-700">Identificación del Documento</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Tipo Documento <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    value={form.tipo}
                    onChange={(e) => setForm({...form, tipo: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Seleccione...</option>
                    {catalogos?.tipos?.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} {t.abreviatura ? `(${t.abreviatura})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Proceso Dueño <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    value={form.proceso}
                    onChange={(e) => setForm({...form, proceso: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Seleccione...</option>
                    {catalogos?.procesos?.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.sigla})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="flex justify-between text-xs font-bold uppercase text-gray-500">
                    Código <span className="text-red-500">*</span>
                    {sugiriendo && <span className="animate-pulse text-[10px] text-blue-500">Generando...</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-blue-100"
                      value={form.codigo}
                      onChange={(e) => setForm({...form, codigo: e.target.value.toUpperCase()})}
                      placeholder="Ej: POL-TI-001"
                      disabled={loading} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Versión</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-center text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    value={form.version}
                    onChange={(e) => setForm({...form, version: e.target.value})}
                    disabled={loading}
                    placeholder="Ej: 1.0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Título <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej: Política de Seguridad de la Información"
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                  disabled={loading}
                />
              </div>

              <div className={`rounded-xl border p-4 ${requiereWord ? 'border-orange-100 bg-orange-50/50' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <UploadCloud size={16}/> Archivos del Documento
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {renderFileUploadBox("PDF Vigente", ".pdf", form.fichero_pdf, (f) => setForm({...form, fichero_pdf: f}), pdfInputRef, "text-red-600", FileText, true)}
                  
                  {requiereWord ? (
                    renderFileUploadBox("Editable (Word)", ".doc,.docx,.xlsx", form.fichero_editable, (f) => setForm({...form, fichero_editable: f}), wordInputRef, "text-blue-600", FileType, true)
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 text-center opacity-60">
                      <p className="text-xs italic text-gray-400">No requiere archivo editable</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">2</span>
                <h3 className="text-sm font-bold text-gray-700">Atributos de Control (SGI)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500">
                        <Calendar size={12}/> Fecha Emisión <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date"
                        className="w-full rounded border border-gray-300 p-2 text-sm outline-none"
                        value={form.fecha_emision}
                        onChange={(e) => setForm({...form, fecha_emision: e.target.value})}
                      />
                  </div>
                  
                  {!esRegistro && (
                      <div className="space-y-1">
                          {/* 🔥 SOLUCIÓN LINTER TAILWIND: Clases en el orden correcto */}
                          <label className="flex items-center gap-1 text-xs font-bold uppercase text-purple-600">
                             <Calendar size={12}/> Prox. Revisión
                          </label>
                          <input 
                            type="date"
                            className="w-full rounded border border-purple-200 bg-purple-50 p-2 font-semibold text-purple-700 text-sm outline-none"
                            value={fechaProximaRevision}
                            readOnly
                            title="Calculada automáticamente según frecuencia"
                          />
                      </div>
                  )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Frecuencia Revisión</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                    value={form.frecuencia_revision}
                    onChange={(e) => setForm({...form, frecuencia_revision: e.target.value})}
                    disabled={esRegistro} 
                  >
                    <option value="anual">Anual</option>
                    <option value="semestral">Semestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="mensual">Mensual</option>
                    <option value="no_aplica">No Aplica</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Norma</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                    value={form.norma}
                    onChange={(e) => setForm({...form, norma: e.target.value})}
                  >
                    <option value="">Ninguna</option>
                    {catalogos?.normas?.map(n => (
                      <option key={n.id} value={n.id}>{n.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Confidencialidad</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                    value={form.nivel_confidencialidad}
                    onChange={(e) => setForm({...form, nivel_confidencialidad: e.target.value})}
                  >
                    <option value="publico">Público</option>
                    <option value="interno">Uso Interno</option>
                    <option value="confidencial">Confidencial</option>
                    <option value="estrategico">Estratégico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Retención (Años)</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                    value={form.periodo_retencion}
                    onChange={(e) => setForm({...form, periodo_retencion: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Objetivo del Documento</label>
                <textarea 
                  className="h-16 w-full resize-none rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                  placeholder="Describa el propósito..."
                  value={form.objetivo}
                  onChange={(e) => setForm({...form, objetivo: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="flex justify-between text-xs font-bold uppercase text-gray-500">
                    Alcance <span className="text-red-500">*</span>
                    {esPolitica && <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">Fijo por Política</span>}
                </label>
                <select 
                  className={`w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 ${esPolitica ? 'border-purple-200 bg-purple-50 font-medium text-purple-800' : 'border-gray-300 bg-white focus:ring-purple-100'}`}
                  value={form.alcance}
                  onChange={(e) => setForm({...form, alcance: e.target.value})}
                  disabled={esPolitica || loading}
                >
                  <option value="">Seleccione un nivel...</option>
                  <option value="Organizacional">Organizacional</option>
                  <option value="Departamental">Departamental</option>
                  <option value="Proceso">Por Proceso</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={14}/>
            <span>El documento iniciará como <strong>Borrador</strong> hasta su publicación.</span>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-white"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw className="animate-spin" size={16}/> Guardando...</>
              ) : (
                "Guardar Documento"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearDocumento;