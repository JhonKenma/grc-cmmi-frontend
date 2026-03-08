// src/pages/documentos-maestros/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, FileText, FileType, 
  Eye, CheckCircle, XCircle, Clock, RefreshCw, Filter, X, FileQuestion, Shield, Calendar, Send,
  Trash2, Edit, Settings, Network, BarChart2, AlertCircle, Timer
} from 'lucide-react';
import { Link } from 'react-router-dom'; 

import { useAuth } from '../../context/AuthContext'; 
import { documentosApi } from '../../api/endpoints/documentos.api'; 
import { Documento, TipoDocumento, Proceso, Norma } from '../../types/documentos.types';
import ModalCrearDocumento from './ModalCrearDocumento';
import ModalEditarDocumento from './ModalEditarDocumento'; 
import toast from 'react-hot-toast';

const DOCS_CACHE_KEY = 'docs_maestros_cache_v1';
const CATALOGOS_CACHE_KEY = 'docs_catalogos_cache_v1';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

type CachePayload<T> = {
  timestamp: number;
  data: T;
};

const readCache = <T,>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = <T,>(key: string, data: T) => {
  try {
    const payload: CachePayload<T> = { timestamp: Date.now(), data };
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Si falla storage (quota o modo privado), no interrumpimos UX
  }
};

const DocumentosMaestrosPage = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [documentoAEditar, setDocumentoAEditar] = useState<Documento | null>(null);
  const [documentoAVer, setDocumentoAVer] = useState<Documento | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  
  const [catalogos, setCatalogos] = useState<{
    tipos: TipoDocumento[];
    procesos: Proceso[];
    normas: Norma[];
  }>({ tipos: [], procesos: [], normas: [] });

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroProceso, setFiltroProceso] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroVencimiento, setFiltroVencimiento] = useState(''); // 'critico' | 'alerta' | ''

  const [publicandoId, setPublicandoId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  // Carga de datos
  const cargarDatos = async () => {
    setLoading(true);

    const cachedDocs = readCache<Documento[]>(DOCS_CACHE_KEY);
    const cachedCatalogos = readCache<{ tipos: TipoDocumento[]; procesos: Proceso[]; normas: Norma[] }>(
      CATALOGOS_CACHE_KEY
    );

    if (cachedDocs) {
      setDocumentos(cachedDocs);
      setLoading(false);
    }

    if (cachedCatalogos) {
      setCatalogos(cachedCatalogos);
    }

    try {
      const docsPromise = documentosApi.getAll();
      const catalogosPromise = Promise.all([
        documentosApi.getTipos(),
        documentosApi.getProcesos(),
        documentosApi.getNormas(),
      ]);

      const docsData = await docsPromise;
      setDocumentos(docsData);
      writeCache(DOCS_CACHE_KEY, docsData);
      setLoading(false);

      const [tiposData, procesosData, normasData] = await catalogosPromise;
      const catalogosData = { tipos: tiposData, procesos: procesosData, normas: normasData };
      setCatalogos(catalogosData);
      writeCache(CATALOGOS_CACHE_KEY, catalogosData);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      if (!cachedDocs) {
        toast.error("Error al cargar los documentos");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Publicar documento
  const handlePublicar = async (id: string, titulo: string) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de PUBLICAR el documento "${titulo}"?\n\nPasará a estado VIGENTE y será visible para todos los usuarios.`
    );
    if (!confirmacion) return;

    setPublicandoId(id);
    try {
      await documentosApi.update(id, { estado: 'vigente' } as any);
      setDocumentos(prev => prev.map(d => d.id === id ? { ...d, estado: 'vigente' } : d));
      toast.success("Documento publicado correctamente");
    } catch (error) {
      console.error("Error al publicar:", error);
      toast.error("Error al publicar el documento");
    } finally {
      setPublicandoId(null);
    }
  };

  // Eliminar documento
  const handleDelete = async (id: string) => {
    if (!window.confirm('⚠️ ¿Estás seguro de eliminar este documento?\nEsta acción no se puede deshacer.')) return;
    setEliminandoId(id);
    try {
      await documentosApi.delete(id); 
      setDocumentos(prev => prev.filter(d => d.id !== id));
      toast.success('Documento eliminado');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar');
    } finally {
      setEliminandoId(null);
    }
  };

  // --- CÁLCULO DE KPIs EN TIEMPO REAL ---
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let countCriticos = 0; // < 30 días o vencidos
  let countAlertas = 0;  // 30 a 90 días
  let countVigentes = 0;
  let countPendientes = 0; // Borradores o en revisión

  documentos.forEach(doc => {
    if (doc.estado === 'vigente') {
      countVigentes++;
      if (doc.fecha_proxima_revision) {
        // T12:00:00 evita desfases de zona horaria
        const rev = new Date(`${doc.fecha_proxima_revision}T12:00:00`);
        const diffDays = (rev.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 30) countCriticos++;
        else if (diffDays <= 90) countAlertas++;
      }
    } else if (doc.estado === 'borrador' || doc.estado === 'en_revision') {
      countPendientes++;
    }
  });

  // Acciones Rápidas desde los KPIs (Click en tarjetas)
  const filtrarCriticos = () => {
    setFiltroVencimiento('critico'); setFiltroEstado('vigente'); setFiltroTipo(''); setFiltroProceso('');
  };
  const filtrarAlertas = () => {
    setFiltroVencimiento('alerta'); setFiltroEstado('vigente'); setFiltroTipo(''); setFiltroProceso('');
  };
  const filtrarVigentes = () => {
    setFiltroVencimiento(''); setFiltroEstado('vigente'); setFiltroTipo(''); setFiltroProceso('');
  };
  const filtrarPendientes = () => {
    setFiltroVencimiento(''); setFiltroEstado('pendientes'); setFiltroTipo(''); setFiltroProceso('');
  };

  // Filtrado de la tabla
  let documentosFiltrados = documentos.filter(doc => {
    const texto = filtroTexto.toLowerCase();
    const coincideTexto = (doc.titulo || '').toLowerCase().includes(texto) || (doc.codigo || '').toLowerCase().includes(texto);
    const coincideTipo = filtroTipo ? doc.tipo === filtroTipo : true;
    const coincideProceso = filtroProceso ? doc.proceso === filtroProceso : true;
    
    // Filtro Estado (Con soporte especial para 'pendientes')
    let coincideEstado = true;
    if (filtroEstado === 'pendientes') {
      coincideEstado = doc.estado === 'borrador' || doc.estado === 'en_revision';
    } else if (filtroEstado) {
      coincideEstado = doc.estado === filtroEstado;
    }

    // Filtro Vencimiento (Semáforo)
    let coincideVenc = true;
    if (filtroVencimiento) {
      if (doc.estado !== 'vigente' || !doc.fecha_proxima_revision) {
        coincideVenc = false;
      } else {
        const rev = new Date(`${doc.fecha_proxima_revision}T12:00:00`);
        const diffDays = (rev.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        if (filtroVencimiento === 'critico') coincideVenc = diffDays <= 30;
        else if (filtroVencimiento === 'alerta') coincideVenc = diffDays > 30 && diffDays <= 90;
      }
    }

    return coincideTexto && coincideTipo && coincideProceso && coincideEstado && coincideVenc;
  });

  // Si estamos viendo pendientes, ordenar por antigüedad (los más viejos primero)
  if (filtroEstado === 'pendientes') {
    documentosFiltrados.sort((a, b) => {
      const dateA = new Date(a.fecha_emision || 0).getTime();
      const dateB = new Date(b.fecha_emision || 0).getTime();
      return dateA - dateB;
    });
  }

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'vigente': return <span className="flex w-fit items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700"><CheckCircle size={12}/> Vigente</span>;
      case 'en_revision': return <span className="flex w-fit items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700"><Clock size={12}/> En Revisión</span>;
      case 'obsoleto': return <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700"><XCircle size={12}/> Obsoleto</span>;
      case 'borrador': return <span className="flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600"><FileQuestion size={12}/> Borrador</span>;
      default: return <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-600">{estado}</span>;
    }
  };

  const getNivelJerarquico = (nombreTipo: string | undefined) => {
    if (!nombreTipo) return null;
    const tipoEncontrado = catalogos.tipos.find(t => t.nombre === nombreTipo);
    const nivel = tipoEncontrado?.nivel_jerarquico; 
    if (nivel === 1) return <span className="rounded border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">NIVEL 1</span>;
    if (nivel === 2) return <span className="rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">NIVEL 2</span>;
    if (nivel && nivel >= 3) return <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">NIVEL {nivel}</span>;
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            Maestro de Documentos
            {loading && <RefreshCw className="animate-spin text-blue-500" size={20}/>}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Gestión centralizada de la documentación del sistema (SGI)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/documentos-maestros/estadisticas" 
            className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100"
          >
            <BarChart2 size={20} />
            Centro Analítico
          </Link>

          <div className="mx-1 h-8 w-px bg-gray-200"></div>

          <Link 
            to="/procesos" 
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            <Network size={20} className="text-gray-500" />
            Procesos
          </Link>

          <Link 
            to="/documentos-maestros/tipos" 
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            <Settings size={20} className="text-gray-500" />
            Tipos
          </Link>

          <button 
            onClick={() => setMostrarModalCrear(true)}
            className="ml-2 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus size={20} /> Nuevo Documento
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-8 py-6">
        
        {/* KPI CARDS (SEMÁFORO DE RIESGO) */}
        {!loading && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                
                {/* 1. Críticos / Vencidos (ROJO) */}
                <div 
                    onClick={filtrarCriticos}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${filtroVencimiento === 'critico' ? 'border-red-500 bg-red-50/30' : 'border-gray-200 bg-white hover:border-red-300'}`}
                >
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase text-red-500">Vencidos / &lt; 30 Días</p>
                        <h3 className="text-2xl font-black text-gray-800">{countCriticos}</h3>
                    </div>
                    <div className="rounded-lg bg-red-100 p-3 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                </div>

                {/* 2. Preventivo 30-90 días (NARANJA) */}
                <div 
                    onClick={filtrarAlertas}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${filtroVencimiento === 'alerta' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 bg-white hover:border-orange-300'}`}
                >
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase text-orange-500">Vencen 30-90 Días</p>
                        <h3 className="text-2xl font-black text-gray-800">{countAlertas}</h3>
                    </div>
                    <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                        <Clock size={24} />
                    </div>
                </div>

                {/* 3. Vigentes (VERDE) */}
                <div 
                    onClick={filtrarVigentes}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${filtroEstado === 'vigente' && !filtroVencimiento ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white hover:border-green-300'}`}
                >
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase text-green-600 transition-colors">Doc. Vigentes</p>
                        <h3 className="text-2xl font-black text-gray-800">{countVigentes}</h3>
                    </div>
                    <div className="rounded-lg bg-green-100 p-3 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                </div>

                {/* 4. Pendientes de Publicación (AZUL/CIAN) */}
                <div 
                    onClick={filtrarPendientes}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${filtroEstado === 'pendientes' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase text-blue-600 transition-colors">Pendientes / Revisión</p>
                        <h3 className="text-2xl font-black text-gray-800">{countPendientes}</h3>
                    </div>
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                        <Timer size={24} />
                    </div>
                </div>
            </div>
        )}

        {/* FILTROS */}
        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="min-w-[250px] flex-1">
            <label className="mb-1.5 ml-1 block text-xs font-bold uppercase text-gray-500">Buscar</label>
            <div className="group relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por código o título..." 
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
              />
            </div>
          </div>

          <div className="w-48">
            <label className="mb-1.5 ml-1 block text-xs font-bold uppercase text-gray-500">Tipo</label>
            <select 
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              {catalogos.tipos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="mb-1.5 ml-1 block text-xs font-bold uppercase text-gray-500">Proceso</label>
            <select 
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={filtroProceso}
              onChange={e => setFiltroProceso(e.target.value)}
            >
              <option value="">Todos los Procesos</option>
              {catalogos.procesos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="mb-1.5 ml-1 block text-xs font-bold uppercase text-gray-500">Estado</label>
            <select 
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={filtroEstado}
              onChange={e => { setFiltroEstado(e.target.value); setFiltroVencimiento(''); }}
            >
              <option value="">Todos</option>
              <option value="vigente">Vigente</option>
              <option value="pendientes">Pendientes (Borrador/Revisión)</option>
              <option value="obsoleto">Obsoleto</option>
            </select>
          </div>

          {(filtroTexto || filtroTipo || filtroProceso || filtroEstado || filtroVencimiento) && (
            <button 
              onClick={() => { setFiltroTexto(''); setFiltroTipo(''); setFiltroProceso(''); setFiltroEstado(''); setFiltroVencimiento(''); }}
              className="flex h-[38px] items-center gap-1 rounded-lg border border-transparent px-4 text-sm font-medium text-red-500 transition-colors hover:border-red-100 hover:bg-red-50"
            >
              <X size={16} /> Limpiar
            </button>
          )}
        </div>

        {/* TABLA */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Si hay un filtro de vencimiento activo, mostramos un aviso en la tabla */}
          {filtroVencimiento === 'critico' && (
            <div className="bg-red-50 px-4 py-2 text-sm font-bold text-red-700 border-b border-red-100 flex items-center gap-2">
              <AlertCircle size={16}/> Mostrando documentos vencidos o que vencen en menos de 30 días.
            </div>
          )}
          {filtroVencimiento === 'alerta' && (
            <div className="bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 border-b border-orange-100 flex items-center gap-2">
              <Clock size={16}/> Mostrando documentos que entrarán en fase crítica (30-90 días).
            </div>
          )}
          {filtroEstado === 'pendientes' && (
            <div className="bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border-b border-blue-100 flex items-center gap-2">
              <Timer size={16}/> Mostrando cuellos de botella (Ordenados por antigüedad).
            </div>
          )}

          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="w-36 border-b p-4">Código</th>
                <th className="border-b p-4">Documento</th>
                <th className="w-40 border-b p-4">Atributos</th>
                <th className="w-24 border-b p-4 text-center">Versión</th>
                <th className="w-32 border-b p-4">Estado</th>
                <th className="w-32 border-b p-4 text-center">Archivos</th>
                <th className="w-40 border-b p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="animate-pulse p-10 text-center text-gray-500">Cargando maestro documental...</td></tr>
              ) : documentosFiltrados.length > 0 ? (
                documentosFiltrados.map((doc) => (
                  <tr key={doc.id} className="group transition-colors hover:bg-blue-50/30">
                    <td className="p-4">
                      <span className="rounded bg-blue-50 px-2 py-1 font-mono text-sm font-bold text-blue-700">{doc.codigo}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-800">{doc.titulo}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {doc.nombre_tipo || 'Sin Tipo'}
                        </span>
                        {getNivelJerarquico(doc.nombre_tipo)}
                        <span className="ml-1 flex items-center gap-1 text-xs text-gray-500">
                          • {doc.nombre_proceso || 'Proceso General'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600" title="Confidencialidad">
                          <Shield size={12} className="text-gray-400"/>
                          <span className="capitalize">{doc.nivel_confidencialidad || 'Interno'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600" title="Frecuencia Revisión">
                          <Calendar size={12} className="text-gray-400"/>
                          <span className="capitalize">{doc.frecuencia_revision?.replace('_', ' ') || 'Anual'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="bg-gray-50/50 p-4 text-center text-sm font-bold text-gray-600">v{doc.version}</td>
                    <td className="p-4">{getEstadoBadge(doc.estado)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {doc.url_pdf ? (
                          <a href={doc.url_pdf} target="_blank" rel="noopener noreferrer" className="rounded-md bg-red-50 p-1 text-red-500 transition-transform hover:scale-110 hover:text-red-700" title="Ver PDF Oficial">
                            <FileText size={18} />
                          </a>
                        ) : <span className="text-gray-200" title="No disponible"><FileText size={18}/></span>}
                        {doc.url_editable ? (
                          <a href={doc.url_editable} target="_blank" rel="noopener noreferrer" className="rounded-md bg-blue-50 p-1 text-blue-500 transition-transform hover:scale-110 hover:text-blue-700" title="Descargar Editable">
                            <FileType size={18} />
                          </a>
                        ) : <span className="text-gray-200" title="No disponible"><FileType size={18}/></span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDocumentoAVer(doc)}
                          className="rounded-full p-1.5 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <button
                          onClick={() => setDocumentoAEditar(doc)}
                          className="rounded-full p-1.5 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                          title="Editar documento"
                        >
                          <Edit size={18} />
                        </button>

                        {doc.estado === 'borrador' && (
                          <button
                            onClick={() => handlePublicar(doc.id, doc.titulo)}
                            disabled={publicandoId === doc.id}
                            className={`
                              rounded-full p-1.5 transition-all
                              ${publicandoId === doc.id ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700'}
                            `}
                            title="Publicar Documento"
                          >
                            {publicandoId === doc.id ? <RefreshCw size={18} className="animate-spin"/> : <Send size={18} />}
                          </button>
                        )}

                        {user?.rol === 'superadmin' && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={eliminandoId === doc.id}
                            className="ml-1 rounded-full p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                            title="Eliminar documento (Solo SuperAdmin)"
                          >
                            {eliminandoId === doc.id ? <RefreshCw size={18} className="animate-spin"/> : <Trash2 size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="mb-3 rounded-full bg-gray-100 p-4">
                        <Filter size={32} className="text-gray-400"/>
                      </div>
                      <p className="text-lg font-medium text-gray-600">No se encontraron documentos</p>
                      <p className="text-sm">Intenta cambiar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modales */}
      {mostrarModalCrear && (
        <ModalCrearDocumento
          onClose={() => setMostrarModalCrear(false)}
          onSuccess={() => {
            setMostrarModalCrear(false);
            cargarDatos();
          }}
          catalogos={catalogos}
        />
      )}

      {documentoAEditar && (
        <ModalEditarDocumento
          documento={documentoAEditar}
          soloLectura={false}
          onClose={() => setDocumentoAEditar(null)}
          onSuccess={() => {
            setDocumentoAEditar(null);
            cargarDatos();
          }}
          catalogos={catalogos}
        />
      )}

      {documentoAVer && (
        <ModalEditarDocumento
          documento={documentoAVer}
          soloLectura={true}
          onClose={() => setDocumentoAVer(null)}
          onSuccess={() => {
            setDocumentoAVer(null);
            cargarDatos();
          }}
          catalogos={catalogos}
          onEdit={() => {
            setDocumentoAVer(null);
            setDocumentoAEditar(documentoAVer);
          }}
        />
      )}
    </div>
  );
};

export default DocumentosMaestrosPage;