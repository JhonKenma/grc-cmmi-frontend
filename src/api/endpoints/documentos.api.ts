// src/api/endpoints/documentos.api.ts

import axiosInstance from '../axios';
import { 
    Documento, 
    DocumentoForm, 
    TipoDocumento, 
    Proceso, 
    Norma 
} from '../../types/documentos.types';

interface CatalogScopeOptions {
    empresaId?: number | null;
}

const getEmpresaIdFromSession = (): number | null => {
    try {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return null;

        const parsedUser = JSON.parse(rawUser);
        if (typeof parsedUser?.empresa === 'number') {
            return parsedUser.empresa;
        }

        return null;
    } catch (error) {
        console.warn('No se pudo leer empresa del usuario en localStorage', error);
        return null;
    }
};

const buildEmpresaParams = (options?: CatalogScopeOptions): Record<string, number> | undefined => {
    const empresaId = options?.empresaId ?? getEmpresaIdFromSession();

    if (typeof empresaId !== 'number') {
        return undefined;
    }

    return { empresa_id: empresaId };
};

// ========================================================================
// INTERFACES PARA EL DASHBOARD (Tipado Estricto)
// ========================================================================

export interface DocResumen {
    id: string;
    codigo: string;
    nombre: string;
    proceso: string;
    responsable: string;
    fecha_vencimiento: string | null;
}

export interface VencimientosDetalle {
    vencidos: number;
    critico_30d: number;
    alerta_60d: number;
    preventivo_90d: number;
    preventivo_120d: number;
    documentos_vencidos: DocResumen[];
    documentos_critico_30d: DocResumen[];
    documentos_alerta_60d: DocResumen[];
    documentos_preventivo_90d: DocResumen[];
    documentos_preventivo_120d: DocResumen[];
}

export interface EstadisticasDashboard {
    total_documentos: number;
    total_politicas: number;
    vigentes: number;
    borradores: number;
    en_revision: number;
    obsoletos: number;
    sin_archivo: number;
    
    salud_sistema: number;
    riesgo_critico: number;
    cuello_botella: number;
    calidad_archivos: number;
    
    vencimientos: VencimientosDetalle;
    
    por_proceso: { proceso__nombre: string; proceso__sigla: string; cantidad: number }[];
    por_estado: { estado: string; cantidad: number }[];
    por_alcance: { alcance: string; cantidad: number }[];
    por_nivel: { nivel: string; cantidad: number }[];
    por_norma: { norma: string; cantidad: number; color: string | null }[];
}

export const documentosApi = {
    
    // ========================================================================
    // 1. CATÁLOGOS (Dropdowns del Formulario y CRUD de Tipos/Procesos)
    // ========================================================================

    /**
     * Obtener tipos de documento para selects
     * GET /api/documentos/tipos/
     */
    getTipos: async (options?: CatalogScopeOptions): Promise<TipoDocumento[]> => {
        try {
            const response = await axiosInstance.get('/documentos/tipos/', {
                params: buildEmpresaParams(options),
            });
            console.log('✅ [API] Tipos cargados:', response.data);
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('❌ [API] Error cargando tipos:', error);
            return [];
        }
    },

    /**
     * Crear un nuevo tipo de documento
     * POST /api/documentos/tipos/
     */
    createTipo: async (data: Partial<TipoDocumento>): Promise<TipoDocumento> => {
        const response = await axiosInstance.post('/documentos/tipos/', data);
        return response.data;
    },

    /**
     * Actualizar un tipo de documento existente
     * PATCH /api/documentos/tipos/:id/
     */
    updateTipo: async (id: string, data: Partial<TipoDocumento>): Promise<TipoDocumento> => {
        const response = await axiosInstance.patch(`/documentos/tipos/${id}/`, data);
        return response.data;
    },

    /**
     * Eliminar un tipo de documento
     * DELETE /api/documentos/tipos/:id/
     */
    deleteTipo: async (id: string): Promise<void> => {
        const response = await axiosInstance.delete(`/documentos/tipos/${id}/`);
        return response.data;
    },

    // --- NUEVO CRUD DE PROCESOS ---

    /**
     * Obtener procesos para selects y tabla
     * GET /api/documentos/procesos/
     */
    getProcesos: async (options?: CatalogScopeOptions): Promise<Proceso[]> => {
        try {
            const response = await axiosInstance.get('/documentos/procesos/', {
                params: buildEmpresaParams(options),
            });
            console.log('✅ [API] Procesos cargados:', response.data);
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('❌ [API] Error cargando procesos:', error);
            return [];
        }
    },

    /**
     * Crear un nuevo proceso
     * POST /api/documentos/procesos/
     */
    createProceso: async (data: Partial<Proceso>): Promise<Proceso> => {
        const response = await axiosInstance.post('/documentos/procesos/', data);
        return response.data;
    },

    /**
     * Actualizar un proceso existente
     * PATCH /api/documentos/procesos/:id/
     */
    updateProceso: async (id: string, data: Partial<Proceso>): Promise<Proceso> => {
        const response = await axiosInstance.patch(`/documentos/procesos/${id}/`, data);
        return response.data;
    },

    /**
     * Eliminar un proceso
     * DELETE /api/documentos/procesos/:id/
     */
    deleteProceso: async (id: string): Promise<void> => {
        const response = await axiosInstance.delete(`/documentos/procesos/${id}/`);
        return response.data;
    },

    /**
     * Obtener normas para selects
     * GET /api/documentos/normas/
     */
    getNormas: async (): Promise<Norma[]> => {
        try {
            const response = await axiosInstance.get('/documentos/normas/');
            console.log('✅ [API] Normas cargadas:', response.data);
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('❌ [API] Error cargando normas:', error);
            return [];
        }
    },

    // ========================================================================
    // 2. GESTIÓN CRUD DE DOCUMENTOS
    // ========================================================================

    /**
     * Obtener lista completa de documentos maestros
     * GET /api/documentos/documentos/
     */
    getAll: async (params?: any): Promise<Documento[]> => {
        try {
            const response = await axiosInstance.get('/documentos/documentos/', { params });
            console.log('✅ [API] Documentos cargados:', response.data);
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('❌ [API] Error cargando documentos:', error);
            return [];
        }
    },

    /**
     * NUEVO: Obtener documentos filtrados para los clics del Dashboard
     * GET /api/documentos/documentos/?filtro=valor
     */
    obtenerFiltrados: async (filtros: Record<string, any>): Promise<Documento[]> => {
        try {
            const response = await axiosInstance.get('/documentos/documentos/', { params: filtros });
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('❌ [API] Error obteniendo documentos filtrados:', error);
            return [];
        }
    },

    /**
     * Obtener detalle de un documento específico
     */
    getById: async (id: string): Promise<Documento> => {
        const response = await axiosInstance.get(`/documentos/documentos/${id}/`);
        return response.data;
    },

    /**
     * Crear un nuevo documento maestro
     */
    create: async (data: DocumentoForm): Promise<Documento> => {
        const formData = new FormData();

        // Campos de Texto Obligatorios
        formData.append('codigo', data.codigo);
        formData.append('titulo', data.titulo);
        formData.append('version', data.version.toString());
        formData.append('tipo', data.tipo);
        formData.append('estado', data.estado);
        
        // Campos SGI
        formData.append('objetivo', data.objetivo || '');
        formData.append('alcance', data.alcance || '');
        formData.append('nivel_confidencialidad', data.nivel_confidencialidad);
        formData.append('frecuencia_revision', data.frecuencia_revision);
        formData.append('periodo_retencion', data.periodo_retencion.toString());
        
        // Campos Relacionales Opcionales
        if (data.proceso) formData.append('proceso', data.proceso);
        if (data.norma) formData.append('norma', data.norma);
        if (data.fecha_emision) formData.append('fecha_emision', data.fecha_emision);

        // Archivos Físicos
        if (data.fichero_pdf instanceof File) {
            formData.append('fichero_pdf', data.fichero_pdf);
        }
        if (data.fichero_editable instanceof File) {
            formData.append('fichero_editable', data.fichero_editable);
        }

        const response = await axiosInstance.post('/documentos/documentos/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Actualizar documento existente
     */
    update: async (id: string, data: Partial<DocumentoForm>): Promise<Documento> => {
        const formData = new FormData();

        // Solo agregar campos que existen
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axiosInstance.patch(`/documentos/documentos/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Eliminar un documento
     */
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/documentos/documentos/${id}/`);
    },

    // ========================================================================
    // 3. UTILIDADES SGI
    // ========================================================================

    /**
     * Solicita al backend un código sugerido
     */
    sugerirCodigo: async (tipoId: string, procesoId?: string): Promise<string> => {
        const params: any = { tipo_id: tipoId };
        if (procesoId) params.proceso_id = procesoId;

        try {
            const response = await axiosInstance.get<{ codigo_sugerido: string }>(
                '/documentos/documentos/sugerir_codigo/', 
                { params }
            );
            return response.data.codigo_sugerido;
        } catch (error) {
            console.error("Error sugiriendo código", error);
            return "";
        }
    },

    // ========================================================================
    // 4. ESTADÍSTICAS DASHBOARD SGI (NUEVO)
    // ========================================================================
    
    /**
     * Obtiene los indicadores y datos agrupados para el Dashboard
     */
    getEstadisticas: async (): Promise<EstadisticasDashboard> => {
        try {
            const response = await axiosInstance.get('/documentos/documentos/estadisticas/');
            return response.data;
        } catch (error) {
            console.error("❌ [API] Error obteniendo estadísticas SGI:", error);
            throw error;
        }
    }
};