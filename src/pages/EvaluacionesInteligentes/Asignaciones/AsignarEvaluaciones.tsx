// src/pages/EvaluacionesInteligentes/Asignaciones/AsignarEvaluaciones.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { evaluacionesInteligentesApi, asignacionIQApi } from '@/api/endpoints';
import { usuarioService } from '@/api/usuario.service';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { EvaluacionList } from '@/types/iqevaluaciones.types';
import type { Usuario } from '@/types';
import type { CrearAsignacionData } from '@/types/asignacion-iq.types';

export const AsignarEvaluaciones = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paso, setPaso] = useState(1);
  
  // Datos
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionList[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Formulario
  const [formData, setFormData] = useState<CrearAsignacionData>({
    evaluacion: 0,
    usuarios: [],
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    notas_asignacion: '',
    requiere_revision: true,  // ⭐ NUEVO - Por defecto TRUE
    notificar_usuario: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const evaluacionSeleccionada = evaluaciones.find(e => e.id === formData.evaluacion);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar evaluaciones disponibles
      const evaluacionesData = await evaluacionesInteligentesApi.evaluaciones.listar();
      
      // Filtrar solo evaluaciones activas y disponibles
      const evaluacionesDisponibles = evaluacionesData.filter(
        e => e.estado === 'disponible' || e.estado === 'en_proceso'
      );
      
      setEvaluaciones(evaluacionesDisponibles);
      
      // Cargar usuarios de la empresa (si es Admin)
      let usuariosData: Usuario[] = [];
      if (user?.empresa) {
        // Obtener usuarios de la empresa con rol 'usuario'
        usuariosData = await usuarioService.getByEmpresa(user.empresa, 'usuario');
        
        // Filtrar solo usuarios activos
        usuariosData = usuariosData.filter(u => u.activo);
      }
      
      setUsuarios(usuariosData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioToggle = (usuarioId: number) => {
    setFormData(prev => ({
      ...prev,
      usuarios: prev.usuarios.includes(usuarioId)
        ? prev.usuarios.filter(id => id !== usuarioId)
        : [...prev.usuarios, usuarioId],
    }));
    if (errors.usuarios) {
      setErrors(prev => ({ ...prev, usuarios: '' }));
    }
  };

  const validarPaso1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.evaluacion) {
      newErrors.evaluacion = 'Debes seleccionar una evaluación';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarPaso2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.usuarios.length === 0) {
      newErrors.usuarios = 'Debes seleccionar al menos un usuario';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarPaso3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fecha_limite) {
      newErrors.fecha_limite = 'Debes especificar una fecha límite';
    } else if (formData.fecha_limite <= formData.fecha_inicio) {
      newErrors.fecha_limite = 'La fecha límite debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSiguiente = () => {
    if (paso === 1 && validarPaso1()) {
      setPaso(2);
    } else if (paso === 2 && validarPaso2()) {
      setPaso(3);
    } else if (paso === 3 && validarPaso3()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await asignacionIQApi.crear(formData);
      
      toast.success(
        `✅ ${response.asignaciones.length} asignación(es) creada(s) correctamente`
      );
      
      navigate('/evaluaciones-inteligentes/gestionar-asignaciones');
      
    } catch (error: any) {
      console.error('Error al asignar:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al crear asignaciones';
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Asignar Evaluación a Usuarios
        </h1>
        <p className="text-gray-600 mt-2">
          Asigna evaluaciones a usuarios de tu empresa
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  paso >= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {paso > step ? <CheckCircle size={20} /> : step}
              </div>
              
              <div className="ml-3 text-sm">
                <p className={`font-medium ${paso >= step ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step === 1 && 'Evaluación'}
                  {step === 2 && 'Usuarios'}
                  {step === 3 && 'Fechas'}
                </p>
              </div>
              
              {step < 3 && (
                <div className={`flex-1 h-1 mx-4 ${paso > step ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido por paso */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
        
        {/* PASO 1: Seleccionar Evaluación */}
        {paso === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selecciona la Evaluación
            </h2>
            
            {errors.evaluacion && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-sm text-red-600">{errors.evaluacion}</p>
              </div>
            )}
            
            {evaluaciones.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">No hay evaluaciones disponibles para asignar</p>
                <button
                  onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Crear nueva evaluación
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluaciones.map((evaluacion) => (
                  <label
                    key={evaluacion.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.evaluacion === evaluacion.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="evaluacion"
                      checked={formData.evaluacion === evaluacion.id}
                      onChange={() => setFormData({ ...formData, evaluacion: evaluacion.id })}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {evaluacion.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {evaluacion.frameworks_nombres}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📊 {evaluacion.total_preguntas} preguntas</span>
                          <span>🎯 Nivel {evaluacion.nivel_deseado}</span>
                        </div>
                      </div>
                      {formData.evaluacion === evaluacion.id && (
                        <CheckCircle className="text-primary-600 ml-3" size={24} />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 2: Seleccionar Usuarios */}
        {paso === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Selecciona los Usuarios
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Puedes seleccionar múltiples usuarios para asignarles la misma evaluación
            </p>
            
            {errors.usuarios && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <p className="text-sm text-red-600">{errors.usuarios}</p>
              </div>
            )}
            
            {usuarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No hay usuarios disponibles en tu empresa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {usuarios.map((usuario) => (
                  <label
                    key={usuario.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.usuarios.includes(usuario.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.usuarios.includes(usuario.id)}
                      onChange={() => handleUsuarioToggle(usuario.id)}
                      className="w-5 h-5 text-primary-600 rounded mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {usuario.first_name} {usuario.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {formData.usuarios.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ {formData.usuarios.length} usuario(s) seleccionado(s)
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Fechas y Notas */}
        {paso === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Configura las Fechas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Límite *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_limite}
                    onChange={(e) => {
                      setFormData({ ...formData, fecha_limite: e.target.value });
                      if (errors.fecha_limite) setErrors({ ...errors, fecha_limite: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      errors.fecha_limite ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fecha_limite && (
                    <p className="text-sm text-red-600 mt-1">{errors.fecha_limite}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas para los Usuarios (Opcional)
              </label>
              <textarea
                value={formData.notas_asignacion}
                onChange={(e) => setFormData({ ...formData, notas_asignacion: e.target.value })}
                rows={4}
                placeholder="Instrucciones o comentarios para los usuarios..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requiere_revision}
                onChange={(e) => setFormData({ ...formData, requiere_revision: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Requiere revisión del administrador
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Si está marcado, deberás aprobar/rechazar la evaluación cuando el usuario la complete.
                  Si no está marcado, se aprobará automáticamente al completarse.
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notificar_usuario}
                onChange={(e) => setFormData({ ...formData, notificar_usuario: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded mr-3"
              />
              <span className="text-sm text-gray-700">
                Enviar notificación por email a los usuarios
              </span>
            </label>

            {/* Resumen */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen de Asignación</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Evaluación:</span> {evaluacionSeleccionada?.nombre}</p>
                <p><span className="font-medium">Usuarios:</span> {formData.usuarios.length}</p>
                <p><span className="font-medium">Total preguntas:</span> {evaluacionSeleccionada?.total_preguntas}</p>
                <p><span className="font-medium">Fecha límite:</span> {formData.fecha_limite}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => paso > 1 ? setPaso(paso - 1) : navigate('/evaluaciones-inteligentes')}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          {paso === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        <button
          onClick={handleSiguiente}
          disabled={submitting || (paso === 1 && evaluaciones.length === 0)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Asignando...
            </>
          ) : paso === 3 ? (
            'Asignar Evaluación'
          ) : (
            'Siguiente'
          )}
        </button>
      </div>
    </div>
  );
};