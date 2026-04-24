// src/router/routes.tsx
/**
 * Definición centralizada de rutas con lazy loading.
 * En App.tsx solo se importa y renderiza este archivo.
 */
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// ── Lazy imports ─────────────────────────────────────────────────────────────

// Auth
const Login        = lazy(() => import('@/pages/Login/Login').then(m => ({ default: m.Login })));
const PlanExpirado = lazy(() => import('@/pages/PlanExpirado').then(m => ({ default: m.PlanExpirado })));
const Perfil       = lazy(() => import('@/pages/Perfil/Perfil').then(m => ({ default: m.Perfil })));

// Dashboard
const Dashboard    = lazy(() => import('@/pages/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));

// Empresas
const Empresas     = lazy(() => import('@/pages/Empresas/Empresas').then(m => ({ default: m.Empresas })));
const EmpresaCreate = lazy(() => import('@/pages/Empresas/EmpresaCreate').then(m => ({ default: m.EmpresaCreate })));
const EmpresaEdit  = lazy(() => import('@/pages/Empresas/EmpresaEdit').then(m => ({ default: m.EmpresaEdit })));

// Usuarios
const Usuarios     = lazy(() => import('@/pages/Usuarios/Usuarios').then(m => ({ default: m.Usuarios })));
const UsuarioCreate = lazy(() => import('@/pages/Usuarios/UsuarioCreate').then(m => ({ default: m.UsuarioCreate })));
const UsuarioEdit  = lazy(() => import('@/pages/Usuarios/UsuarioEdit').then(m => ({ default: m.UsuarioEdit })));

// Proveedores
const ProveedoresPage = lazy(() => import('@/pages/proveedores/ProveedoresPage').then(m => ({ default: m.ProveedoresPage })));

// Encuestas
const ListaEncuestas = lazy(() => import('@/pages/encuestas/ListaEncuestas').then(m => ({ default: m.ListaEncuestas })));
const CargarEncuesta = lazy(() => import('@/pages/encuestas/CargarEncuesta').then(m => ({ default: m.CargarEncuesta })));
const DetalleEncuesta = lazy(() => import('@/pages/encuestas/DetalleEncuesta').then(m => ({ default: m.DetalleEncuesta })));
const EditarEncuesta = lazy(() => import('@/pages/encuestas/EditarEncuesta').then(m => ({ default: m.EditarEncuesta })));
const EditarDimension = lazy(() => import('@/pages/encuestas/EditarDimension').then(m => ({ default: m.EditarDimension })));
const EditarPregunta = lazy(() => import('@/pages/encuestas/EditarPregunta').then(m => ({ default: m.EditarPregunta })));
const EditarNivel  = lazy(() => import('@/pages/encuestas/EditarNivel').then(m => ({ default: m.EditarNivel })));

// Asignaciones
const ListaAsignaciones = lazy(() => import('@/pages/asignaciones/ListaAsignaciones').then(m => ({ default: m.ListaAsignaciones })));
const AsignarEvaluacion = lazy(() => import('@/pages/asignaciones/AsignarEvaluacion').then(m => ({ default: m.AsignarEvaluacion })));
const MisTareas     = lazy(() => import('@/pages/asignaciones/MisTareas').then(m => ({ default: m.MisTareas })));
const MisEvaluaciones = lazy(() => import('@/pages/asignaciones/MisEvaluaciones').then(m => ({ default: m.MisEvaluaciones })));
const PendientesRevision = lazy(() => import('@/pages/asignaciones/PendientesRevision').then(m => ({ default: m.PendientesRevision })));
const ConfigurarNivelesEvaluacion = lazy(() => import('@/pages/asignaciones/ConfigurarNivelesEvaluacion').then(m => ({ default: m.ConfigurarNivelesEvaluacion })));
const AsignarDimensionesEvaluacion = lazy(() => import('@/pages/asignaciones/AsignarDimensionesEvaluacion').then(m => ({ default: m.AsignarDimensionesEvaluacion })));
const ProgresoEvaluacion = lazy(() => import('@/pages/asignaciones/ProgresoEvaluacion').then(m => ({ default: m.ProgresoEvaluacion })));

// Respuestas
const ResponderDimension = lazy(() => import('@/pages/respuestas/ResponderDimension').then(m => ({ default: m.ResponderDimension })));

// Reportes
const ReporteEvaluacion = lazy(() => import('@/pages/reportes/ReporteEvaluacion').then(m => ({ default: m.ReporteEvaluacion })));
const ReporteEvaluacionIQ = lazy(() => import('@/pages/reportes/ReporteEvaluacionIQ').then(m => ({ default: m.ReporteEvaluacionIQ })));

// Riesgos
const RiesgosDashboardPage = lazy(() => import('@/pages/riesgos/RiesgosDashboardPage').then(m => ({ default: m.RiesgosDashboardPage })));
const RiesgosListPage = lazy(() => import('@/pages/riesgos/RiesgosListPage').then(m => ({ default: m.RiesgosListPage })));
const RiesgoDetailPage = lazy(() => import('@/pages/riesgos/RiesgoDetailPage').then(m => ({ default: m.RiesgoDetailPage })));
const PlanesPage = lazy(() => import('@/pages/riesgos/PlanesPage').then(m => ({ default: m.PlanesPage })));
const KrisPage = lazy(() => import('@/pages/riesgos/KrisPage').then(m => ({ default: m.KrisPage })));
const MonitoreoPage = lazy(() => import('@/pages/riesgos/MonitoreoPage').then(m => ({ default: m.MonitoreoPage })));
const CategoriasRiesgoPage = lazy(() => import('@/pages/riesgos/CategoriasRiesgoPage').then(m => ({ default: m.CategoriasRiesgoPage })));
const ActivosPage = lazy(() => import('@/pages/riesgos/ActivosPage').then(m => ({ default: m.ActivosPage })));
const RiesgoActivosPage = lazy(() => import('@/pages/riesgos/RiesgoActivosPage').then(m => ({ default: m.RiesgoActivosPage })));
const EvaluacionesCuantitativasPage = lazy(() => import('@/pages/riesgos/EvaluacionesCuantitativasPage').then(m => ({ default: m.EvaluacionesCuantitativasPage })));
const ReporteSimpleRiesgosPage = lazy(() => import('@/pages/riesgos/ReporteSimpleRiesgosPage').then(m => ({ default: m.ReporteSimpleRiesgosPage })));
const ControlesPage = lazy(() => import('@/pages/riesgos/ControlesPage').then(m => ({ default: m.ControlesPage })));
const ConfiguracionRevisionPage = lazy(() => import('@/pages/riesgos/ConfiguracionRevisionPage').then(m => ({ default: m.ConfiguracionRevisionPage })));
const ConfiguracionFormulasPage = lazy(() => import('@/pages/riesgos/config/ConfiguracionFormulasPage').then(m => ({ default: m.ConfiguracionFormulasPage })));

// Proyectos de remediación
const MisProyectos = lazy(() => import('@/pages/proyectos-remediacion/MisProyectos').then(m => ({ default: m.MisProyectos })));
const DetalleProyecto = lazy(() => import('@/pages/proyectos-remediacion/DetalleProyecto').then(m => ({ default: m.DetalleProyecto })));
const ProyectosPorGAP = lazy(() => import('@/pages/proyectos-remediacion/ProyectosPorGAP').then(m => ({ default: m.ProyectosPorGAP })));
const ProyectosPorDimension = lazy(() => import('@/pages/proyectos-remediacion/ProyectosPorDimension').then(m => ({ default: m.ProyectosPorDimension })));
const AprobacionesPendientes = lazy(() => import('@/pages/proyectos-remediacion/AprobacionesPendientes').then(m => ({ default: m.AprobacionesPendientes })));

// Notificaciones
const HistorialNotificaciones = lazy(() => import('@/pages/notificaciones/HistorialNotificaciones').then(m => ({ default: m.HistorialNotificaciones })));
const EnviarNotificacion = lazy(() => import('@/pages/notificaciones/EnviarNotificacion').then(m => ({ default: m.EnviarNotificacion })));

// Evaluaciones Inteligentes
const DashboardEvaluaciones = lazy(() => import('@/pages/EvaluacionesInteligentes/Dashboard/DashboardEvaluaciones').then(m => ({ default: m.DashboardEvaluaciones })));
const ListaFrameworks = lazy(() => import('@/pages/EvaluacionesInteligentes/Frameworks/ListaFrameworks').then(m => ({ default: m.ListaFrameworks })));
const ImportarFrameworks = lazy(() => import('@/pages/EvaluacionesInteligentes/Frameworks/ImportarFrameworks').then(m => ({ default: m.ImportarFrameworks })));
const DetalleFramework = lazy(() => import('@/pages/EvaluacionesInteligentes/Frameworks/DetalleFramework').then(m => ({ default: m.DetalleFramework })));
const ListaEvaluaciones = lazy(() => import('@/pages/EvaluacionesInteligentes/Evaluaciones/ListaEvaluaciones').then(m => ({ default: m.ListaEvaluaciones })));
const CrearEvaluacion = lazy(() => import('@/pages/EvaluacionesInteligentes/Evaluaciones/CrearEvaluacion').then(m => ({ default: m.CrearEvaluacion })));
const DetalleEvaluacion = lazy(() => import('@/pages/EvaluacionesInteligentes/Evaluaciones/DetalleEvaluacion').then(m => ({ default: m.DetalleEvaluacion })));
const SeleccionarPreguntas = lazy(() => import('@/pages/EvaluacionesInteligentes/Evaluaciones/SeleccionarPreguntas').then(m => ({ default: m.SeleccionarPreguntas })));
const MisFrameworks = lazy(() => import('@/pages/EvaluacionesInteligentes/MisFrameworks/MisFrameworks').then(m => ({ default: m.MisFrameworks })));
const AsignarFrameworks = lazy(() => import('@/pages/EvaluacionesInteligentes/AsignarFrameworks/AsignarFrameworks').then(m => ({ default: m.AsignarFrameworks })));
const AsignarEvaluaciones = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/AsignarEvaluaciones').then(m => ({ default: m.AsignarEvaluaciones })));
const GestionarAsignaciones = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/GestionarAsignaciones').then(m => ({ default: m.GestionarAsignaciones })));
const GestionarAsignacionesDetalle = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/GestionarAsignacionesDetalle').then(m => ({ default: m.GestionarAsignacionesDetalle })));
const MisAsignacionesIQ = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/MisAsignacionesIQ').then(m => ({ default: m.MisAsignacionesIQ })));
const DetalleAsignacion = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/DetalleAsignacion').then(m => ({ default: m.DetalleAsignacion })));
const DetalleAsignacionAdmin = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/DetalleAsignacionAdmin').then(m => ({ default: m.DetalleAsignacionAdmin })));
const VerRespuestasAdmin = lazy(() => import('@/pages/EvaluacionesInteligentes/Asignaciones/VerRespuestasAdmin').then(m => ({ default: m.VerRespuestasAdmin })));
const ResponderEvaluacionIQ = lazy(() => import('@/pages/EvaluacionesInteligentes/ResponderEvaluacion/ResponderEvaluacionIQ').then(m => ({ default: m.ResponderEvaluacionIQ })));

// Auditor
const AuditorRevisiones = lazy(() => import('@/pages/auditor/AuditorRevisiones').then(m => ({ default: m.AuditorRevisiones })));
const AuditorRevisionDetalle = lazy(() => import('@/pages/auditor/AuditorRevisionDetalle').then(m => ({ default: m.AuditorRevisionDetalle })));
const AuditorRevisionesIQ = lazy(() => import('@/pages/auditor/AuditorRevisionesIQ').then(m => ({ default: m.AuditorRevisionesIQ })));
const AuditorRevisionDetalleIQ = lazy(() => import('@/pages/auditor/AuditorRevisionDetalleIQ').then(m => ({ default: m.AuditorRevisionDetalleIQ })));

// Documentos Maestros
const DocumentosMaestrosPage = lazy(() => import('@/pages/documentos-maestros'));
const TiposDocumentoPage = lazy(() => import('@/pages/documentos-maestros/TiposDocumentoPage').then(m => ({ default: m.TiposDocumentoPage })));
const ProcesosList = lazy(() => import('@/pages/documentos-maestros/ProcesosList'));
const NormasList = lazy(() => import('@/pages/documentos-maestros/NormasList'));
const DashboardSGI = lazy(() => import('@/pages/documentos-maestros/DashboardSGI'));

// ── Tipos de ruta ─────────────────────────────────────────────────────────────

import type { Rol } from '@/types';
import DashboardCumplimiento from '@/pages/proyectos-remediacion/DashboardCumplimiento';

export type RouteConfig = {
  path: string;
  element: React.ReactNode;
  layout?: boolean;         // true = envuelto en MainLayout
  roles?: Rol[];            // undefined = cualquier autenticado
  requireSuperAdmin?: boolean;
  isPublic?: boolean;
};

// ── Definición de rutas ───────────────────────────────────────────────────────

export const publicRoutes: RouteConfig[] = [
  { path: '/login',         element: <Login />,        isPublic: true },
  { path: '/plan-expirado', element: <PlanExpirado />, isPublic: true },
];

export const privateRoutes: RouteConfig[] = [
  // Core
  { path: '/dashboard', element: <Dashboard />, layout: true },
  { path: '/perfil',    element: <Perfil />,    layout: true },

  // Empresas
  { path: '/empresas',            element: <Empresas />,     layout: true, requireSuperAdmin: true },
  { path: '/empresas/nuevo',      element: <EmpresaCreate />, layout: true, requireSuperAdmin: true },
  { path: '/empresas/editar/:id', element: <EmpresaEdit />,  layout: true, requireSuperAdmin: true },

  // Usuarios
  { path: '/usuarios',             element: <Usuarios />,      layout: true, roles: ['superadmin', 'administrador', 'auditor'] },
  { path: '/usuarios/nuevo',       element: <UsuarioCreate />, layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/usuarios/editar/:id',  element: <UsuarioEdit />,   layout: true, roles: ['superadmin', 'administrador'] },

  // Proveedores
  { path: '/proveedores', element: <ProveedoresPage />, layout: true, roles: ['superadmin', 'administrador'] },

  // Encuestas
  { path: '/encuestas',                                                    element: <ListaEncuestas />,   layout: true, roles: ['superadmin', 'administrador', 'auditor'] },
  { path: '/encuestas/cargar',                                             element: <CargarEncuesta />,   layout: true, requireSuperAdmin: true },
  { path: '/encuestas/:id',                                                element: <DetalleEncuesta />,  layout: true, roles: ['superadmin', 'administrador', 'auditor'] },
  { path: '/encuestas/:id/editar',                                         element: <EditarEncuesta />,   layout: true, requireSuperAdmin: true },
  { path: '/encuestas/:encuestaId/dimensiones/:dimensionId/editar',        element: <EditarDimension />,  layout: true, requireSuperAdmin: true },
  { path: '/encuestas/:encuestaId/preguntas/:preguntaId/editar',           element: <EditarPregunta />,   layout: true, requireSuperAdmin: true },
  { path: '/encuestas/:encuestaId/niveles/:nivelId/editar',                element: <EditarNivel />,      layout: true, requireSuperAdmin: true },

  // Asignaciones
  { path: '/asignaciones',                                    element: <ListaAsignaciones />,          layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/asignaciones/asignar-evaluacion',                 element: <AsignarEvaluacion />,          layout: true, requireSuperAdmin: true },
  { path: '/asignaciones/pendientes-revision',                element: <PendientesRevision />,         layout: true, roles: ['administrador'] },
  { path: '/asignaciones/mis-evaluaciones',                   element: <MisEvaluaciones />,            layout: true, roles: ['superadmin', 'administrador', 'usuario', 'auditor'] },
  { path: '/asignaciones/:asignacionId/configurar-niveles',   element: <ConfigurarNivelesEvaluacion />, layout: true, roles: ['administrador'] },
  { path: '/evaluaciones/:evaluacionId/configurar-niveles',   element: <ConfigurarNivelesEvaluacion />, layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones/:evaluacionId/asignar-dimensiones',  element: <AsignarDimensionesEvaluacion />, layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones/:evaluacionId/progreso',             element: <ProgresoEvaluacion />,         layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/mis-tareas',                                      element: <MisTareas />,                  layout: true, roles: ['usuario', 'administrador'] },
  { path: '/respuestas/:asignacionId',                        element: <ResponderDimension />,         layout: false },

  // Reportes
  { path: '/reportes/evaluacion',    element: <ReporteEvaluacion />,   layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/reportes/evaluacion-iq', element: <ReporteEvaluacionIQ />, layout: true, roles: ['administrador', 'superadmin'] },

  // Riesgos
  { path: '/riesgos/dashboard',                  element: <RiesgosDashboardPage />,            layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos', 'auditor'] },
  { path: '/riesgos',                            element: <RiesgosListPage />,                 layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos', 'auditor'] },
  { path: '/riesgos/:id',                        element: <RiesgoDetailPage />,                layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos', 'auditor'] },
  { path: '/riesgos/planes',                     element: <PlanesPage />,                      layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/kris',                       element: <KrisPage />,                        layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/monitoreo',                  element: <MonitoreoPage />,                   layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos', 'auditor'] },
  { path: '/riesgos/categorias',                 element: <CategoriasRiesgoPage />,            layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/activos',                    element: <ActivosPage />,                     layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/riesgo-activos',             element: <RiesgoActivosPage />,               layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/evaluaciones-cuantitativas', element: <EvaluacionesCuantitativasPage />,  layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/reporte-simple',             element: <ReporteSimpleRiesgosPage />,        layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos', 'auditor'] },
  { path: '/riesgos/controles',                  element: <ControlesPage />,                   layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/configuracion-revision',     element: <ConfiguracionRevisionPage />,       layout: true, roles: ['superadmin', 'administrador', 'analista_riesgos'] },
  { path: '/riesgos/config/formulas',            element: <ConfiguracionFormulasPage />,       layout: true, roles: ['superadmin', 'administrador'] },

  // Proyectos remediación
  { path: '/mis-proyectos',                                element: <MisProyectos />,           layout: true, roles: ['superadmin', 'administrador', 'usuario'] },
  { path: '/proyectos-remediacion/dashboard',              element: <DashboardCumplimiento />,  layout: true, roles: ['superadmin', 'administrador'] },   // ⭐ NUEVA
  { path: '/proyectos-remediacion/:id',                    element: <DetalleProyecto />,        layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/proyectos-remediacion/gap/:gapId',             element: <ProyectosPorGAP />,        layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/proyectos-remediacion/dimension/:dimensionId', element: <ProyectosPorDimension />,  layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/aprobaciones-pendientes',                      element: <AprobacionesPendientes />, layout: true, roles: ['superadmin', 'administrador'] },
  // Notificaciones
  { path: '/notificaciones',        element: <HistorialNotificaciones />, layout: true },
  { path: '/notificaciones/enviar', element: <EnviarNotificacion />,      layout: true, roles: ['superadmin', 'administrador'] },

  // Evaluaciones Inteligentes
  { path: '/evaluaciones-inteligentes',                                       element: <DashboardEvaluaciones />,      layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/frameworks',                            element: <ListaFrameworks />,            layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/frameworks/importar',                   element: <ImportarFrameworks />,         layout: true, requireSuperAdmin: true },
  { path: '/evaluaciones-inteligentes/frameworks/:codigo',                    element: <DetalleFramework />,           layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/evaluaciones',                          element: <ListaEvaluaciones />,          layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/evaluaciones/crear',                    element: <CrearEvaluacion />,            layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/evaluaciones/:id',                      element: <DetalleEvaluacion />,          layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/evaluaciones/:id/seleccionar-preguntas',element: <SeleccionarPreguntas />,       layout: true, roles: ['superadmin', 'administrador'] },
  { path: '/evaluaciones-inteligentes/asignar-frameworks',                    element: <AsignarFrameworks />,          layout: true, roles: ['superadmin'] },
  { path: '/evaluaciones-inteligentes/mis-frameworks',                        element: <MisFrameworks />,              layout: true, roles: ['administrador'] },
  { path: '/evaluaciones-inteligentes/asignar',                               element: <AsignarEvaluaciones />,        layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones-inteligentes/gestionar-asignaciones',                element: <GestionarAsignaciones />,      layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones-inteligentes/gestionar-asignaciones/:evaluacionId',  element: <GestionarAsignacionesDetalle />, layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones-iq/mis-asignaciones',                                element: <MisAsignacionesIQ />,          layout: true, roles: ['usuario', 'administrador', 'superadmin'] },
  { path: '/evaluaciones-iq/asignacion/:id',                                  element: <DetalleAsignacion />,          layout: true, roles: ['usuario', 'administrador', 'superadmin'] },
  { path: '/evaluaciones-iq/asignacion/:id/admin',                            element: <DetalleAsignacionAdmin />,     layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones-iq/asignacion/:asignacionId/respuestas',             element: <VerRespuestasAdmin />,         layout: true, roles: ['administrador', 'superadmin'] },
  { path: '/evaluaciones-iq/responder/:id',                                   element: <ResponderEvaluacionIQ />,      layout: false, roles: ['usuario', 'administrador', 'superadmin'] },

  // Auditor
  { path: '/auditor/revisiones',              element: <AuditorRevisiones />,      layout: true, roles: ['auditor'] },
  { path: '/auditor/revisiones/:asignacionId',element: <AuditorRevisionDetalle />, layout: true, roles: ['auditor'] },
  { path: '/auditor/revisiones-iq',           element: <AuditorRevisionesIQ />,    layout: true, roles: ['auditor'] },
  { path: '/auditor/revisiones-iq/:asignacionId', element: <AuditorRevisionDetalleIQ />, layout: true, roles: ['auditor', 'administrador', 'superadmin'] },

  // Documentos Maestros
  { path: '/documentos-maestros',              element: <DocumentosMaestrosPage />, layout: true, roles: ['administrador'] },
  { path: '/documentos-maestros/estadisticas', element: <DashboardSGI />,           layout: true, roles: ['administrador'] },
  { path: '/documentos-maestros/tipos',        element: <TiposDocumentoPage />,     layout: true, roles: ['administrador'] },
  { path: '/documentos-maestros/normas',       element: <NormasList />,             layout: true, roles: ['administrador'] },
  { path: '/procesos',                         element: <ProcesosList />,           layout: true, roles: ['administrador'] },
];