// src/pages/proyectos-remediacion/AprobacionesPendientes.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, LoadingScreen } from '@/components/common';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FileText,
  ChevronRight
} from 'lucide-react';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { ModalValidarAprobacion } from './components/proyectos-remediacion/ModalValidarAprobacion';
import toast from 'react-hot-toast';
import type { AprobacionGAP, AprobacionGAPDetail } from '@/types/proyecto-remediacion.types';
import { formatearFecha, getEstadoAprobacionColor, getEstadoAprobacionLabel } from '@/types/proyecto-remediacion.types';

export const AprobacionesPendientes: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [aprobaciones, setAprobaciones] = useState<AprobacionGAP[]>([]);
  const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState<AprobacionGAPDetail | null>(null);
  const [showModalValidar, setShowModalValidar] = useState(false);
  
  useEffect(() => {
    loadAprobaciones();
  }, []);
  
  const loadAprobaciones = async () => {
    try {
      setLoading(true);
      const response = await proyectosRemediacionApi.getAprobacionesPendientes();
      setAprobaciones(response.aprobaciones);
    } catch (err) {
      console.error('Error al cargar aprobaciones:', err);
      toast.error('Error al cargar las aprobaciones pendientes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerDetalles = async (aprobacion: AprobacionGAP) => {
    try {
      // Cargar el detalle completo de la aprobación
      const proyecto = await proyectosRemediacionApi.obtener(aprobacion.proyecto);
      
      // Construir AprobacionGAPDetail con los datos disponibles
      const aprobacionDetalle: AprobacionGAPDetail = {
        ...aprobacion,
        proyecto_info: proyecto,
        solicitado_por_info: {
          id: aprobacion.solicitado_por,
          nombre_completo: aprobacion.solicitado_por_nombre,
          email: '',
        },
        validador_info: {
          id: aprobacion.validador,
          nombre_completo: aprobacion.validador_nombre,
          email: '',
        },
        comentarios_solicitud: '',
        observaciones: '',
        documentos_adjuntos: [],
        fue_aprobado: false,
        fue_rechazado: false,
      };
      
      setAprobacionSeleccionada(aprobacionDetalle);
      setShowModalValidar(true);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      toast.error('Error al cargar los detalles de la aprobación');
    }
  };
  
  if (loading) {
    return <LoadingScreen message="Cargando aprobaciones pendientes..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aprobaciones Pendientes</h1>
        <p className="text-gray-600 mt-1">
          Solicitudes de cierre de GAP que requieren tu validación
        </p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {aprobaciones.filter(a => a.esta_pendiente).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Urgentes (&gt;7 días)</p>
              <p className="text-2xl font-bold text-red-600">
                {aprobaciones.filter(a => a.dias_pendiente > 7).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Promedio Completitud</p>
              <p className="text-2xl font-bold text-blue-600">
                {aprobaciones.length > 0
                  ? Math.round(
                      aprobaciones.reduce((sum, a) => sum + a.porcentaje_completitud, 0) /
                        aprobaciones.length
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Lista de Aprobaciones */}
      <div className="grid gap-4">
        {aprobaciones.length > 0 ? (
          aprobaciones.map((aprobacion) => (
            <Card 
              key={aprobacion.id} 
              className="p-0 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
              onClick={() => handleVerDetalles(aprobacion)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Información Principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {aprobacion.proyecto_nombre}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                            {aprobacion.proyecto_codigo}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getEstadoAprobacionColor(aprobacion.estado)}`}>
                            {getEstadoAprobacionLabel(aprobacion.estado)}
                          </span>
                          {aprobacion.dias_pendiente > 7 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                              <AlertCircle size={12} />
                              Urgente ({aprobacion.dias_pendiente} días)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 ml-11">
                      <div>
                        <p className="text-xs text-gray-500">Solicitado por</p>
                        <p className="text-sm font-medium text-gray-900">
                          {aprobacion.solicitado_por_nombre}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatearFecha(aprobacion.fecha_solicitud)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Completitud</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${aprobacion.porcentaje_completitud}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {Math.round(aprobacion.porcentaje_completitud)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">GAP Original</p>
                        <p className="text-sm font-medium text-gray-900">
                          {aprobacion.gap_original}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Flecha */}
                  <div className="flex items-center text-gray-300 hover:text-blue-600 transition-all hover:translate-x-1">
                    <ChevronRight size={24} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No hay aprobaciones pendientes
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Todas las solicitudes han sido revisadas
            </p>
          </div>
        )}
      </div>
      
      {/* Modal de Validación */}
      {showModalValidar && aprobacionSeleccionada && (
        <ModalValidarAprobacion
          aprobacion={aprobacionSeleccionada}
          onClose={() => {
            setShowModalValidar(false);
            setAprobacionSeleccionada(null);
          }}
          onSuccess={() => {
            loadAprobaciones(); // Recargar lista
            setShowModalValidar(false);
            setAprobacionSeleccionada(null);
          }}
        />
      )}
    </div>
  );
};