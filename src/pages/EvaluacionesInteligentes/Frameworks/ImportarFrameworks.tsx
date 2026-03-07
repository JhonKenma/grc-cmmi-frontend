// src/pages/EvaluacionesInteligentes/Frameworks/ImportarFrameworks.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { ImportarFrameworkResponse } from '@/types/iqevaluaciones.types';

export const ImportarFrameworks = () => {
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultado, setResultado] = useState<ImportarFrameworkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validar extensión
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResultado(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await evaluacionesInteligentesApi.frameworks.importarExcel(file);
      
      setResultado(response);
      toast.success('Frameworks importados correctamente');
      
    } catch (error: any) {
      console.error('Error al importar:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al importar el archivo';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultado(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/frameworks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Importar Frameworks
          </h1>
          <p className="text-gray-600 mt-1">
            Importa frameworks desde un archivo Excel
          </p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Instrucciones de Importación
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>El archivo debe ser formato Excel (.xlsx o .xls)</li>
              <li>Cada hoja representa un framework diferente</li>
              <li>Las hojas deben tener 11 columnas: Correlativo, Framework Base, Código Control, etc.</li>
              <li>Las hojas con "NIST" en el nombre serán omitidas automáticamente</li>
              <li>El sistema parseará automáticamente las evidencias y relaciones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!resultado && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar Archivo
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              id="file-upload"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-900 font-medium mb-2">
                  Haz clic para seleccionar un archivo
                </p>
                <p className="text-sm text-gray-600">
                  o arrastra y suelta aquí
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Excel (.xlsx, .xls) • Máximo 10MB
                </p>
              </label>
            ) : (
              <div>
                <FileSpreadsheet className="mx-auto text-primary-600 mb-4" size={48} />
                <p className="text-gray-900 font-medium mb-1">
                  {file.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cambiar archivo
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-900">Error de Importación</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => navigate('/evaluaciones-inteligentes/frameworks')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Importar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  ¡Importación Exitosa!
                </h3>
                <p className="text-sm text-green-800">
                  {resultado.message}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Resumen de Importación
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">
                  {resultado.estadisticas.total_frameworks}
                </p>
                <p className="text-sm text-blue-700">Frameworks</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">
                  {resultado.estadisticas.total_preguntas.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Preguntas</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-900">
                  {resultado.estadisticas.total_evidencias.toLocaleString()}
                </p>
                <p className="text-sm text-purple-700">Evidencias</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-900">
                  {resultado.estadisticas.total_relaciones.toLocaleString()}
                </p>
                <p className="text-sm text-orange-700">Relaciones</p>
              </div>
            </div>

            {/* Frameworks Importados */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Frameworks Importados
              </h4>
              <div className="space-y-2">
                {resultado.frameworks_importados.map((fw, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {fw.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {fw.codigo} • v{fw.version}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {fw.preguntas} preguntas
                      </p>
                      <p className="text-xs text-gray-600">
                        {fw.evidencias} evidencias • {fw.relaciones} relaciones
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hojas Procesadas */}
            {resultado.estadisticas.hojas_procesadas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Hojas Procesadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resultado.estadisticas.hojas_procesadas.map((hoja, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {hoja}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hojas Omitidas */}
            {resultado.estadisticas.hojas_omitidas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Hojas Omitidas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resultado.estadisticas.hojas_omitidas.map((hoja, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                    >
                      {hoja}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Importar Otro
            </button>
            <button
              onClick={() => navigate('/evaluaciones-inteligentes/frameworks')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver Frameworks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};