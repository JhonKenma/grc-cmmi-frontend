// src/pages/documentos-maestros/DashboardSGI.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, BarChart2, X, Search, FileText, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { documentosApi } from '../../api/endpoints/documentos.api';
import toast from 'react-hot-toast';

const DASHBOARD_CACHE_KEY = 'docs_dashboard_stats_v1';
const DOCS_CACHE_KEY = 'docs_maestros_cache_v1';
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

type CachePayload<T> = {
  timestamp: number;
  data: T;
};

const readCache = <T,>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > DASHBOARD_CACHE_TTL_MS) {
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
    // Ignorar error de storage para no afectar UX.
  }
};

// ----------------------------------------------------------------------
// TIPADO FUERTE
// ----------------------------------------------------------------------

interface DocumentoResumen {
  id: string;
  codigo: string;
  nombre?: string;
  titulo?: string;
  proceso: string;
  responsable: string;
  fecha_vencimiento: string | null;
  estado?: string;
  nombre_proceso?: string;
  tipo?: string;
  nombre_tipo?: string;
  fecha_proxima_revision?: string | null;
}

interface DocumentoCacheItem {
  id: string;
  codigo?: string;
  nombre?: string;
  titulo?: string;
  proceso?: string | { nombre?: string } | null;
  nombre_proceso?: string;
  estado?: string;
  tipo?: string;
  nombre_tipo?: string;
  fecha_vencimiento?: string | null;
  fecha_proxima_revision?: string | null;
}

interface EstadisticasSGI {
  total_documentos: number;
  total_politicas: number;
  vigentes: number;
  borradores: number;
  en_revision: number;
  obsoletos: number;
  salud_sistema: number;

  vencimientos: {
    vencidos: number;
    critico_30d: number;
    alerta_60d: number;
    preventivo_90d: number;
    preventivo_120d: number;
    documentos_vencidos: DocumentoResumen[];
    documentos_critico_30d: DocumentoResumen[];
    documentos_alerta_60d: DocumentoResumen[];
    documentos_preventivo_90d: DocumentoResumen[];
    documentos_preventivo_120d: DocumentoResumen[];
  };

  por_proceso: Array<{ proceso__sigla?: string; proceso__nombre: string; cantidad: number }>;
  por_alcance: Array<{ alcance: string; cantidad: number }>;
  por_tipo: Array<{ tipo: string; cantidad: number }>;
  por_norma: Array<{ norma: string; cantidad: number; color?: string | null }>;
  por_estado: Array<{ estado: string; cantidad: number }>;
}

interface ModalDocumento {
  id: string;
  codigo: string;
  titulo: string;
  proceso: string;
  estado: string;
  fecha_proxima_revision: string;
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

const DashboardSGI: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstadisticasSGI | null>(null);

  // Estados del Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalContext, setModalContext] = useState({ titulo: "", origen: "" });
  const [modalDocs, setModalDocs] = useState<ModalDocumento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mapDocumentoToModal = (d: DocumentoCacheItem): ModalDocumento => ({
    id: d.id,
    codigo: d.codigo || '-',
    titulo: d.titulo || d.nombre || '-',
    proceso:
      d.nombre_proceso ||
      (typeof d.proceso === 'object' && d.proceso ? d.proceso.nombre : d.proceso) ||
      'Sin proceso',
    estado:
      d.estado === 'en_revision'
        ? 'En Revisión'
        : d.estado
          ? d.estado.charAt(0).toUpperCase() + d.estado.slice(1)
          : 'Vigente',
    fecha_proxima_revision: d.fecha_proxima_revision || d.fecha_vencimiento || '-',
  });

  const filterByLabel = (docs: DocumentoCacheItem[], chartTitle: string, label: string): ModalDocumento[] => {
    const normalizedLabel = label.toLowerCase().trim();

    if (chartTitle === 'Documentos por Proceso') {
      return docs
        .filter((d) => {
          const procesoNombre = (
            d.nombre_proceso ||
            (typeof d.proceso === 'object' && d.proceso ? d.proceso.nombre : d.proceso) ||
            ''
          ).toLowerCase();
          return procesoNombre === normalizedLabel || procesoNombre.includes(`(${normalizedLabel})`);
        })
        .map(mapDocumentoToModal);
    }

    if (chartTitle === 'Documentos por Tipo') {
      return docs
        .filter((d) => (d.nombre_tipo || d.tipo || '').toLowerCase() === normalizedLabel)
        .map(mapDocumentoToModal);
    }

    return docs.map(mapDocumentoToModal);
  };

  const cargarEstadisticas = async () => {
    setLoading(true);

    const cachedStats = readCache<EstadisticasSGI>(DASHBOARD_CACHE_KEY);
    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
    }

    try {
      const data = await documentosApi.getEstadisticas();
      const typedData = data as unknown as EstadisticasSGI;
      setStats(typedData);
      writeCache(DASHBOARD_CACHE_KEY, typedData);
    } catch (error) {
      console.error('Error al cargar dashboard', error);
      if (!cachedStats) {
        toast.error('Error al cargar las estadísticas del SGI');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // --------------------------------------------------------------------
  // PROCESAMIENTO DE DATOS PARA LAS GRÁFICAS
  // --------------------------------------------------------------------
  
  // 1. Vencimientos
  const dataVencimientos = useMemo(() => {
    if (!stats) return [];
    
    const totalEnPeligro = 
      (stats.vencimientos?.vencidos ?? 0) + 
      (stats.vencimientos?.critico_30d ?? 0) + 
      (stats.vencimientos?.alerta_60d ?? 0) + 
      (stats.vencimientos?.preventivo_90d ?? 0) + 
      (stats.vencimientos?.preventivo_120d ?? 0);
    
    const sanos = Math.max(0, stats.total_documentos - totalEnPeligro);

    return [
      { name: '0 - 30 días', cantidad: (stats.vencimientos?.vencidos ?? 0) + (stats.vencimientos?.critico_30d ?? 0), fill: '#ef4444' },
      { name: '31 - 60 días', cantidad: stats.vencimientos?.alerta_60d ?? 0, fill: '#f97316' },
      { name: '61 - 90 días', cantidad: stats.vencimientos?.preventivo_90d ?? 0, fill: '#eab308' },
      { name: '91 - 120 días', cantidad: stats.vencimientos?.preventivo_120d ?? 0, fill: '#84cc16' },
      { name: 'Más de 120', cantidad: sanos, fill: '#22c55e' },
    ];
  }, [stats]);

  // 2. Estado General
  const dataEstado = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Vigente', cantidad: stats.vigentes ?? 0, fill: '#22c55e' },
      { name: 'En Revisión', cantidad: stats.en_revision ?? 0, fill: '#3b82f6' },
      { name: 'Borrador', cantidad: stats.borradores ?? 0, fill: '#94a3b8' },
      { name: 'Obsoleto', cantidad: stats.obsoletos ?? 0, fill: '#ef4444' },
    ].filter(item => item.cantidad > 0);
  }, [stats]);

  const TOTAL_ESTADO = stats?.total_documentos || 0;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 3. Procesos
  const dataProcesos = useMemo(() => {
    if (!stats?.por_proceso) return [];
    return [...stats.por_proceso]
      .sort((a, b) => b.cantidad - a.cantidad)
      .map(p => ({
        name: p.proceso__sigla || p.proceso__nombre || 'General',
        cantidad: p.cantidad,
        fill: '#0369a1'
      }));
  }, [stats]);

  const chartProcesosMinWidth = Math.max(100, dataProcesos.length * 70); 

  // 4. Documentos por Tipo
  const dataTipos = useMemo(() => {
    const fuente = stats?.por_tipo || (stats as any)?.por_tipo_documento || [];
    if (!fuente.length) return [];
    
    return [...fuente]
      .sort((a, b) => a.cantidad - b.cantidad)
      .map(n => ({
        name: n.tipo || n.tipo__nombre || n.nombre || 'Sin tipo',
        cantidad: n.cantidad || 0,
        fill: '#8b5cf6' 
      }));
  }, [stats]);

  // --------------------------------------------------------------------
  // MANEJO DEL CLICK Y MODAL INTERACTIVO
  // --------------------------------------------------------------------

  const handleChartClick = async (data: any, tituloGrafica: string) => {
    if (!stats) return;
    const label = data?.name || data?.activePayload?.[0]?.payload?.name || "Detalle";
    
    setModalContext({ titulo: label, origen: tituloGrafica });
    setModalDocs([]); 
    setSearchTerm("");
    setFiltroEstado("Todos");
    setCurrentPage(1);
    setModalOpen(true);
    setLoadingModal(true);

    try {
      let params: any = {};
      const docsFromCache = readCache<DocumentoCacheItem[]>(DOCS_CACHE_KEY) || [];

      // 1. LÓGICA PARA CONTROL DE VENCIMIENTOS
      if (tituloGrafica === "Control de Vencimientos") {
        const v = stats.vencimientos;
        let docsLocales: any[] = [];
        let usarLocal = false;

        if (label.includes("30")) { docsLocales = [...(v.documentos_vencidos||[]), ...(v.documentos_critico_30d||[])]; usarLocal = true; }
        else if (label.includes("60")) { docsLocales = v.documentos_alerta_60d || []; usarLocal = true; }
        else if (label.includes("90")) { docsLocales = v.documentos_preventivo_90d || []; usarLocal = true; }
        else if (label.includes("120") && !label.includes("Más")) { docsLocales = v.documentos_preventivo_120d || []; usarLocal = true; }
        else if (label === "Más de 120") {
          // IDs de documentos en riesgo
          const enRiesgoIds = new Set([
            ...(v.documentos_vencidos||[]),
            ...(v.documentos_critico_30d||[]),
            ...(v.documentos_alerta_60d||[]),
            ...(v.documentos_preventivo_90d||[]),
            ...(v.documentos_preventivo_120d||[])
          ].map(d => d.id));

          // Preferimos cache local para responder instantaneo y evitar descargas pesadas.
          const responseAll = docsFromCache.length > 0
            ? docsFromCache
            : await documentosApi.getAll({ page_size: 1000 });
          
          // Filtramos excluyendo los que están en riesgo
          const docsSanos = responseAll.filter((d: any) => !enRiesgoIds.has(d.id));

          if (docsFromCache.length === 0) {
            writeCache(DOCS_CACHE_KEY, responseAll as DocumentoCacheItem[]);
          }

          setModalDocs(docsSanos.map((d: any) => mapDocumentoToModal(d)));
          
          setLoadingModal(false);
          return; // Salimos temprano
        }

        if (usarLocal) {
          setModalDocs(docsLocales.map((d) => mapDocumentoToModal(d)));
          setLoadingModal(false);
          return; 
        } 
      } 
      // 2. LÓGICA PARA ESTADO
      else if (tituloGrafica === "Estado de los Documentos") {
        const mapaEstados: Record<string, string> = {
          'Vigente': 'vigente',
          'En Revisión': 'en_revision',
          'Borrador': 'borrador',
          'Obsoleto': 'obsoleto'
        };
        params.estado = mapaEstados[label] || label;
      } 
      // 3. LÓGICA PARA PROCESOS
      else if (tituloGrafica === "Documentos por Proceso") {
        if (docsFromCache.length > 0) {
          setModalDocs(filterByLabel(docsFromCache, tituloGrafica, label));
          setLoadingModal(false);
          return;
        }
        params.search = label;
      } 
      // 4. LÓGICA PARA TIPOS
      else if (tituloGrafica === "Documentos por Tipo") {
        if (docsFromCache.length > 0) {
          setModalDocs(filterByLabel(docsFromCache, tituloGrafica, label));
          setLoadingModal(false);
          return;
        }
        params.search = label;
      }

      const response = await documentosApi.getAll(params);
      if (response.length > 0 && docsFromCache.length === 0) {
        writeCache(DOCS_CACHE_KEY, response as DocumentoCacheItem[]);
      }
      
      const docsMapeados = response.map((d: any) => mapDocumentoToModal(d));

      setModalDocs(docsMapeados);

    } catch (error) {
      console.error("Error cargando detalles del gráfico", error);
      toast.error("Ocurrió un error al cargar el detalle de documentos.");
    } finally {
      setLoadingModal(false);
    }
  };

  // Filtrado interno del modal
  const docsFiltrados = useMemo(() => {
    return modalDocs.filter(doc => {
      const matchSearch = doc.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let estadoLocal = doc.estado;
      if (doc.estado === 'vigente' || doc.estado === 'Vigente') estadoLocal = 'Vigente';
      if (doc.estado === 'en_revision' || doc.estado === 'En Revisión') estadoLocal = 'En Revisión';
      if (doc.estado === 'borrador' || doc.estado === 'Borrador') estadoLocal = 'Borrador';
      if (doc.estado === 'obsoleto' || doc.estado === 'Obsoleto') estadoLocal = 'Obsoleto';

      const matchEstado = filtroEstado === "Todos" || estadoLocal === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [modalDocs, searchTerm, filtroEstado]);

  const totalPages = Math.ceil(docsFiltrados.length / itemsPerPage);
  const paginatedDocs = docsFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-500 mb-4" size={40} />
        <h2 className="text-xl font-bold text-gray-700">Calculando inteligencia documental...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10 font-sans text-slate-800">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex flex-wrap justify-between items-center shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="text-indigo-600" /> Centro de Analítica Documental
          </h1>
          <p className="text-sm text-gray-500 mt-1">Panel interactivo de documentos. Haz clic en las gráficas para ver detalles.</p>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <button onClick={cargarEstadisticas} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all" title="Actualizar datos">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/documentos-maestros" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all">
            <ArrowLeft size={20} /> Volver al Maestro
          </Link>
        </div>
      </header>

      {/* GRID DE GRÁFICAS */}
      <main className="flex-1 px-8 py-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Control de Vencimientos */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-700">Control de Vencimientos</h3>
              <p className="text-xs text-gray-500">Documentos clasificados por su cercanía a la fecha de próxima revisión.</p>
            </div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataVencimientos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px'}}/>
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={45} cursor="pointer" onClick={(data) => handleChartClick(data, "Control de Vencimientos")}>
                    {dataVencimientos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-85 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Estado de los Documentos */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-700">Estado de los Documentos</h3>
              <p className="text-xs text-gray-500">Proporción de documentos aprobados frente a borradores u obsoletos.</p>
            </div>
            <div className="h-64 relative flex justify-center items-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataEstado} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={2} dataKey="cantidad" cursor="pointer" onClick={(data) => handleChartClick(data, "Estado de los Documentos")} labelLine={false} label={renderCustomizedLabel}>
                    {dataEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-85 transition-opacity" />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{TOTAL_ESTADO}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Docs</span>
              </div>
            </div>
          </div>

          {/* 3. Documentos por Proceso */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-700">Documentos por Proceso</h3>
              <p className="text-xs text-gray-500">Distribución de documentos por proceso.</p>
            </div>
            <div className="h-64 mt-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              <div style={{ minWidth: `${chartProcesosMinWidth}px`, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataProcesos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px'}}/>
                    <Bar dataKey="cantidad" fill="#0369a1" radius={[4, 4, 0, 0]} barSize={40} cursor="pointer" onClick={(data) => handleChartClick(data, "Documentos por Proceso")} className="hover:opacity-85 transition-opacity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Documentos por Tipo */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-700">Documentos por Tipo</h3>
              <p className="text-xs text-gray-500">Distribución según el tipo de documento (Manual, Procedimiento, etc.).</p>
            </div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataTipos} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#475569', fontWeight: 600}} axisLine={false} tickLine={false} width={140} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px'}}/>
                  <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={22} cursor="pointer" onClick={(data) => handleChartClick(data, "Documentos por Tipo")}>
                    {dataTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-85 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL INTERACTIVO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Filtrado por: {modalContext.origen}</p>
                <h2 className="text-2xl font-black text-slate-800">{modalContext.titulo}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-100 flex gap-4 bg-white">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar código o título..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="relative w-48">
                <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <select className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white appearance-none" value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1); }}>
                  <option value="Todos">Todos los estados</option>
                  <option value="Vigente">Solo Vigentes</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Borrador">Borradores</option>
                  <option value="Obsoleto">Obsoletos</option>
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 bg-white relative" style={{ minHeight: '300px' }}>
              {loadingModal ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                  <RefreshCw className="animate-spin text-blue-500 mb-3" size={30} />
                  <p className="text-gray-500 text-sm font-medium">Extrayendo documentos...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Código</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-2/5">Título del Documento</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Proceso</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Próx. Revisión</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDocs.length > 0 ? (
                      paginatedDocs.map((doc, idx) => {
                        const esVigente = doc.estado === 'Vigente' || doc.estado === 'vigente';
                        const esRevision = doc.estado === 'En Revisión' || doc.estado === 'en_revision';
                        const esObsoleto = doc.estado === 'Obsoleto' || doc.estado === 'obsoleto';

                        return (
                          <tr key={doc.id || idx} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-3 px-6 text-sm font-bold text-blue-600 whitespace-nowrap">{doc.codigo}</td>
                            <td className="py-3 px-6 text-sm text-slate-700 font-medium">{doc.titulo}</td>
                            <td className="py-3 px-6 text-sm text-gray-500">{doc.proceso}</td>
                            <td className="py-3 px-6 text-sm text-gray-500">{doc.fecha_proxima_revision}</td>
                            <td className="py-3 px-6 text-sm">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${esVigente ? 'bg-green-100 text-green-700' : esRevision ? 'bg-amber-100 text-amber-700' : esObsoleto ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {doc.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          <FileText size={48} className="mx-auto mb-3 opacity-20" />
                          No hay documentos para mostrar con estos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between mt-auto">
              <span className="text-sm text-gray-500">
                Mostrando <span className="font-bold text-slate-700">{docsFiltrados.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, docsFiltrados.length)}</span> de <span className="font-bold text-slate-700">{docsFiltrados.length}</span> resultados
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || loadingModal} className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-700 px-2">Página {currentPage} de {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0 || loadingModal} className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardSGI;