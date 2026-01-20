// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login/Login';
import { Dashboard } from '@/pages/Dashboard/Dashboard';

// Empresas
import { Empresas } from '@/pages/Empresas/Empresas';
import { EmpresaCreate } from '@/pages/Empresas/EmpresaCreate';
import { EmpresaEdit } from '@/pages/Empresas/EmpresaEdit';

// Usuarios
import { Usuarios } from '@/pages/Usuarios/Usuarios';
import { UsuarioCreate } from '@/pages/Usuarios/UsuarioCreate';
import { UsuarioEdit } from '@/pages/Usuarios/UsuarioEdit';

// Encuestas
import { CargarEncuesta } from '@/pages/encuestas/CargarEncuesta';
import { ListaEncuestas } from '@/pages/encuestas/ListaEncuestas';
import { DetalleEncuesta } from '@/pages/encuestas/DetalleEncuesta';
import { EditarEncuesta } from '@/pages/encuestas/EditarEncuesta';

import { EditarDimension } from '@/pages/encuestas/EditarDimension';    // ⭐ NUEVO
import { EditarPregunta } from '@/pages/encuestas/EditarPregunta';      // ⭐ NUEVO
import { EditarNivel } from '@/pages/encuestas/EditarNivel';            // ⭐ NUEVO

// ⭐ IMPORTAR ESTOS COMPONENTES
import { AsignarEvaluacion } from '@/pages/asignaciones/AsignarEvaluacion';
//import { AsignarDimensiones } from '@/pages/asignaciones/AsignarDimensiones'; //quitar esto
import { ListaAsignaciones } from '@/pages/asignaciones/ListaAsignaciones';
import { MisTareas } from '@/pages/asignaciones/MisTareas';
import { ConfigurarNivelesEvaluacion } from '@/pages/asignaciones/ConfigurarNivelesEvaluacion';
import { AsignarDimensionesEvaluacion } from '@/pages/asignaciones/AsignarDimensionesEvaluacion';
import { ProgresoEvaluacion } from '@/pages/asignaciones/ProgresoEvaluacion';

import { PendientesRevision } from '@/pages/asignaciones/PendientesRevision';
import { ResponderDimension } from '@/pages/respuestas/ResponderDimension';
import { MisEvaluaciones } from '@/pages/asignaciones/MisEvaluaciones';
import { ReporteEvaluacion } from '@/pages/reportes/ReporteEvaluacion';
import { DetalleProyecto } from '@/pages/proyectos-remediacion/DetalleProyecto';
import { ProyectosPorGAP } from '@/pages/proyectos-remediacion/ProyectosPorGAP';
import { ProyectosPorDimension } from '@/pages/proyectos-remediacion/ProyectosPorDimension';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ========================================
                RUTAS DE EMPRESAS - Solo SuperAdmin
                ======================================== */}
            <Route
              path="/empresas"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <Empresas />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresas/nuevo"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EmpresaCreate />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresas/editar/:id"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EmpresaEdit />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ========================================
                RUTAS DE USUARIOS - SuperAdmin y Admin
                ======================================== */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <Usuarios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/nuevo"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <UsuarioCreate />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/editar/:id"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <UsuarioEdit />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ========================================
                RUTAS DE ENCUESTAS
                ======================================== */}
            <Route
              path="/encuestas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ListaEncuestas />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/encuestas/cargar"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <CargarEncuesta />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/encuestas/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DetalleEncuesta />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ✅ AGREGAR AQUÍ - DENTRO DE LAS RUTAS DE ENCUESTAS */}
            <Route
              path="/encuestas/:id/editar"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EditarEncuesta />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ⭐ NUEVAS RUTAS - para  EditarPregunta, EditarNivel, EditarDimension*/}
            <Route
              path="/encuestas/:encuestaId/dimensiones/:dimensionId/editar"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EditarDimension />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/encuestas/:encuestaId/preguntas/:preguntaId/editar"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EditarPregunta />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/encuestas/:encuestaId/niveles/:nivelId/editar"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <EditarNivel />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ========================================
                RUTAS DE ASIGNACIONES - ACTUALIZADO
                ======================================== */}
            <Route
              path="/asignaciones"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <ListaAsignaciones />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* SuperAdmin: Asignar evaluación completa */}
            <Route
              path="/asignaciones/asignar-evaluacion"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <MainLayout>
                    <AsignarEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ⭐ NUEVA RUTA: Pendientes de Revisión */}
            <Route
              path="/asignaciones/pendientes-revision"
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <MainLayout>
                    <PendientesRevision />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mis-tareas"
              element={
                <ProtectedRoute allowedRoles={['usuario', 'administrador']}>
                  <MainLayout>
                    <MisTareas />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asignaciones/:asignacionId/configurar-niveles"
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <MainLayout>
                    <ConfigurarNivelesEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/respuestas/:asignacionId" 
              element={
                <ProtectedRoute>
                  <ResponderDimension />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/asignaciones/mis-evaluaciones"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador', 'usuario', 'auditor']}>
                  <MainLayout>
                    <MisEvaluaciones />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/evaluaciones/:evaluacionId/configurar-niveles"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'superadmin']}>
                  <MainLayout>
                    <ConfigurarNivelesEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluaciones/:evaluacionId/asignar-dimensiones"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'superadmin']}>
                  <MainLayout>
                    <AsignarDimensionesEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluaciones/:evaluacionId/progreso"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'superadmin']}>
                  <MainLayout>
                    <ProgresoEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes/evaluacion"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'superadmin']}>
                  <MainLayout>
                    <ReporteEvaluacion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ========================================
                RUTAS DE PROYECTOS DE REMEDIACIÓN
                ======================================== */}
            <Route
              path="/proyectos-remediacion/gap/:gapId"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <ProyectosPorGAP />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/proyectos-remediacion/:id" // Detalle individual
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <DetalleProyecto />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ⭐ CORREGIR ESTA RUTA */}
            <Route 
              path="/proyectos-remediacion/dimension/:dimensionId" 
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
                  <MainLayout>
                    <ProyectosPorDimension />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;