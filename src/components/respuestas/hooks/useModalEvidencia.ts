import { useEffect, useMemo, useState } from 'react';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import { documentosApi } from '@/api/endpoints/documentos.api';
import type { Documento, Proceso, TipoDocumento } from '@/types/documentos.types';
import type { VerificacionCodigoResponse } from '@/types/respuestas.types';
import { deriveTipoDocumentoEnum, extractApiErrorMessage } from '@/utils/evidencias';
import toast from 'react-hot-toast';

type ModalModo = 'subir' | 'vincular';
type OpenDropdown = 'tipo' | 'proceso' | null;

interface FormDataState {
  codigo_documento: string;
  tipo_id: string;
  titulo_documento: string;
  objetivo_documento: string;
  archivo: File | null;
}

interface UseModalEvidenciaParams {
  respuestaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const useModalEvidencia = ({ respuestaId, onClose, onSuccess }: UseModalEvidenciaParams) => {
  const [modo, setModo] = useState<ModalModo>('subir');
  const [uploading, setUploading] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [procesosDoc, setProcesosDoc] = useState<Proceso[]>([]);
  const [documentosMaestros, setDocumentosMaestros] = useState<Documento[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState('');
  const [busquedaDoc, setBusquedaDoc] = useState('');
  const [filtroTipoVincular, setFiltroTipoVincular] = useState('');
  const [filtroProcesoVincular, setFiltroProcesoVincular] = useState('');
  const [paginaDocumentos, setPaginaDocumentos] = useState(1);
  const [evidenciasExistentes, setEvidenciasExistentes] = useState<VerificacionCodigoResponse | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    codigo_documento: '',
    tipo_id: '',
    titulo_documento: '',
    objetivo_documento: '',
    archivo: null,
  });

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
            documentosApi.getAll(),
          ]);
          setTiposDoc(tipos);
          setProcesosDoc(procesos);
          setDocumentosMaestros(docsResponse.filter((doc) => doc.estado === 'vigente'));
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast.error('No se pudieron cargar los catálogos');
      } finally {
        setCargandoCatalogos(false);
      }
    };

    cargarDatos();
  }, [modo]);

  useEffect(() => {
    if (modo === 'subir' && formData.codigo_documento.length >= 3) {
      const timer = setTimeout(() => verificarCodigo(), 800);
      return () => clearTimeout(timer);
    }

    setEvidenciasExistentes(null);
    return undefined;
  }, [formData.codigo_documento, modo]);

  useEffect(() => {
    setPaginaDocumentos(1);
  }, [busquedaDoc, filtroTipoVincular, filtroProcesoVincular, modo]);

  const verificarCodigo = async () => {
    try {
      setVerificando(true);
      const result = await respuestasApi.verificarCodigoDocumento(formData.codigo_documento.trim());
      setEvidenciasExistentes(result && result.existe ? result : null);
    } catch (error) {
      console.error('Error verificación:', error);
    } finally {
      setVerificando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo supera los 10MB');
      return;
    }

    setFormData((prev) => ({ ...prev, archivo: file }));
  };

  const PAGE_SIZE = 20;

  const tieneCriteriosBusqueda =
    busquedaDoc.trim().length >= 2 || !!filtroTipoVincular || !!filtroProcesoVincular;

  const documentosFiltrados = useMemo(() => {
    return documentosMaestros.filter((doc) => {
      if (!tieneCriteriosBusqueda) return false;

      const coincideBusqueda =
        doc.titulo.toLowerCase().includes(busquedaDoc.toLowerCase()) ||
        doc.codigo.toLowerCase().includes(busquedaDoc.toLowerCase());
      const coincideTipo = filtroTipoVincular ? doc.tipo === filtroTipoVincular : true;
      const coincideProceso = filtroProcesoVincular ? doc.proceso === filtroProcesoVincular : true;

      return coincideBusqueda && coincideTipo && coincideProceso;
    });
  }, [busquedaDoc, documentosMaestros, filtroProcesoVincular, filtroTipoVincular, tieneCriteriosBusqueda]);

  const totalPaginas = Math.max(1, Math.ceil(documentosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(paginaDocumentos, totalPaginas);
  const inicio = (paginaActual - 1) * PAGE_SIZE;
  const fin = inicio + PAGE_SIZE;
  const documentosPaginados = documentosFiltrados.slice(inicio, fin);

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

      const payload: {
        respuesta_id: string;
        documento_id?: string;
        codigo_documento?: string;
        tipo_documento_enum?: string;
        titulo_documento?: string;
        objetivo_documento?: string;
        archivo?: File | null;
      } = { respuesta_id: respuestaId };

      if (modo === 'vincular') {
        payload.documento_id = documentoSeleccionado;
      } else {
        payload.codigo_documento = formData.codigo_documento.trim().toUpperCase();
        payload.tipo_documento_enum = deriveTipoDocumentoEnum(formData.tipo_id, tiposDoc);
        payload.titulo_documento = formData.titulo_documento.trim();
        payload.objetivo_documento = formData.objetivo_documento.trim();
        payload.archivo = formData.archivo;
      }

      await respuestasApi.subirEvidencia(payload as never);
      toast.success(modo === 'vincular' ? 'Documento vinculado con éxito' : 'Evidencia subida');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(extractApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return {
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
    paginaDocumentos,
    setPaginaDocumentos,
    evidenciasExistentes,
    formData,
    setFormData,
    handleFileChange,
    PAGE_SIZE,
    tieneCriteriosBusqueda,
    documentosFiltrados,
    totalPaginas,
    paginaActual,
    inicio,
    fin,
    documentosPaginados,
    handleSubmit,
  } as const;
};
