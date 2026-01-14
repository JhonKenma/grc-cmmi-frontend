// src/pages/respuestas/ResponderDimension.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { asignacionesApi, respuestasApi } from '@/api/endpoints';
import { Asignacion, Pregunta, RespuestaListItem } from '@/types';
import { PreguntaCard } from '@/components/respuestas/PreguntaCard';
import { dimensionesApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

export const ResponderDimension: React.FC = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Map<string, RespuestaListItem>>(new Map());

  useEffect(() => {
    if (asignacionId) {
      loadData();
    }
  }, [asignacionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Cargar asignación
      const asignacionData = await asignacionesApi.get(asignacionId!);
      setAsignacion(asignacionData);

      // 2️⃣ Validar que la asignación tenga dimensión
      if (!asignacionData.dimension) {
        toast.error('La asignación no tiene una dimensión asociada');
        return;
      }

      // 3️⃣ Cargar dimensión con preguntas
      const dimensionData = await dimensionesApi.conPreguntas(
        asignacionData.dimension
      );

      // 4️⃣ Guardar solo preguntas activas
      setPreguntas(
        dimensionData.preguntas.filter(p => p.activo)
      );

      // 5️⃣ Cargar respuestas existentes
      const response = await respuestasApi.list(asignacionId!);
      
      // DRF suele devolver { results: [] } o directamente []
      // Usamos una lógica robusta para extraer el array
      const respuestasArray = Array.isArray(response) 
        ? response 
        : (response as any).results || [];

      // ⭐ IMPORTANTE: Verificar que estamos usando el ID de la PREGUNTA como llave
      const respuestasMap = new Map<string, RespuestaListItem>();
      
      respuestasArray.forEach((r: any) => {
        // Si el backend devuelve el objeto pregunta completo, usamos r.pregunta.id
        // Si devuelve solo el UUID, usamos r.pregunta
        const preguntaKey = typeof r.pregunta === 'object' ? r.pregunta.id : r.pregunta;
        if (preguntaKey) {
          respuestasMap.set(preguntaKey, r);
        }
      });

      setRespuestas(respuestasMap);

    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaChange = (preguntaId: string, respuestaData: RespuestaListItem) => {
    // ⭐ VALIDAR datos antes de guardar
    if (!respuestaData || !respuestaData.id) {
      console.error('handleRespuestaChange: datos inválidos', respuestaData);
      return;
    }
    
    setRespuestas(prev => {
      const newMap = new Map(prev);
      newMap.set(preguntaId, respuestaData);
      return newMap;
    });
  };

  const calcularProgreso = () => {
    const totalPreguntas = preguntas.length;
    
    // ⭐ FIX: Filtrar valores undefined/null antes de acceder a propiedades
    const preguntasRespondidas = Array.from(respuestas.values())
      .filter((r): r is RespuestaListItem => r !== undefined && r !== null)
      .filter(r => r.estado === 'enviado')
      .length;
    
    return totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;
  };

  if (loading) {
    return <LoadingScreen message="Cargando preguntas..." />;
  }

  if (!asignacion) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">No se encontró la asignación</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/asignaciones/mis-tareas')}
          className="mt-4"
        >
          Volver a Mis Tareas
        </Button>
      </div>
    );
  }

  const progreso = calcularProgreso();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/asignaciones/mis-tareas')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Responder Evaluación
          </h1>
          <p className="text-gray-600 mt-1">
            {asignacion.dimension_nombre || asignacion.encuesta_nombre}
          </p>
        </div>
      </div>

      {/* Barra de Progreso */}
      <Card className="bg-blue-50 border-blue-200">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Progreso General
            </span>
            <span className="text-sm font-bold text-blue-900">
              {progreso.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            {Array.from(respuestas.values()).filter((r): r is RespuestaListItem => r !== undefined && r !== null).filter(r => r.estado === 'enviado').length} de {preguntas.length} preguntas completadas
          </p>
        </div>
      </Card>

      {/* Lista de Preguntas */}
      <div className="space-y-4">
        {preguntas.map((pregunta, index) => (
          <PreguntaCard
            key={pregunta.id}
            pregunta={pregunta}
            numero={index + 1}
            asignacionId={asignacionId!}
            respuestaExistente={respuestas.get(pregunta.id)}
            onRespuestaChange={(respuestaData) => handleRespuestaChange(pregunta.id, respuestaData)}
          />
        ))}
      </div>

      {/* Mensaje si no hay preguntas */}
      {preguntas.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No hay preguntas disponibles para esta dimensión
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};