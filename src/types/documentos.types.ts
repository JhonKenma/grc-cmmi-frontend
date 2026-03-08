// src/types/documentos.types.ts

// ==========================================
// 1. CATÁLOGOS (Auxiliares)
// ==========================================

export interface Proceso {
    id: string;
    nombre: string;
    sigla?: string;        // El '?' significa que es opcional
    descripcion?: string;  // El '?' significa que es opcional
    empresa?: string;
}

export interface Norma {
    id: string;
    nombre: string;
    descripcion?: string;
}

export interface TipoDocumento {
    id: string;
    nombre: string;
    abreviatura: string;        // Ej "POL"
    requiere_word_y_pdf: boolean; // Controla validaciones del modal
    categoria?: string;
    nivel_jerarquico?: number;  // Importante para la UI (badges de nivel)
}

// ==========================================
// 2. INTERFAZ PRINCIPAL (Listado/Lectura)
// ==========================================

export interface Documento {
    id: string;
    codigo: string;
    titulo: string;
    version: string;                // <--- Cambiado a string (ej: "1.0", "1.1")
    estado: 'borrador' | 'en_revision' | 'vigente' | 'obsoleto';
    
    // Relaciones (Expandidas para mostrar nombres en la tabla)
    tipo: string;           // UUID del tipo
    nombre_tipo?: string;   // Nombre legible (ej: "Política")
    abreviatura_tipo?: string;

    proceso?: string;       // UUID del proceso
    nombre_proceso?: string;
    sigla_proceso?: string;

    norma?: string;         // UUID de la norma
    nombre_norma?: string;

    // Metadatos SGI
    objetivo?: string;
    alcance?: string;
    nivel_confidencialidad?: 'publico' | 'interno' | 'confidencial' | 'secreto' | 'estrategico';
    frecuencia_revision?: 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'no_aplica';
    periodo_retencion?: number;
    
    // Fechas
    fecha_emision?: string;
    fecha_proxima_revision?: string;
    fecha_creacion: string;

    // Archivos (URLs y Rutas)
    archivo_pdf?: string;      // Ruta en DB
    archivo_editable?: string; // Ruta en DB
    url_pdf?: string;          // URL temporal firmada (AWS/Supabase)
    url_editable?: string;     // URL temporal firmada
}

// ==========================================
// 3. INTERFAZ FORMULARIO (Crear/Editar)
// ==========================================

export interface DocumentoForm {
    codigo: string;
    titulo: string;
    version: string;                // <--- Cambiado a string
    tipo: string;          // UUID obligatorio
    proceso?: string;      // UUID opcional
    norma?: string;        // UUID opcional
    estado: string;
    
    objetivo: string;
    alcance: string;
    nivel_confidencialidad: string;
    frecuencia_revision: string;
    periodo_retencion: number;
    fecha_emision?: string;

    // Archivos físicos (File object de JS para el upload)
    fichero_pdf?: File | null;
    fichero_editable?: File | null;
}