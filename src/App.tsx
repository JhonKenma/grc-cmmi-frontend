// src/App.tsx
import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlobalCopilotChat } from '@/components/chat/GlobalCopilotChat';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { DashboardSkeleton } from '@/pages/Dashboard/components/shared/DashboardSkeleton';
import { privateRoutes, publicRoutes } from '@/router/routes';

const PageLoader = () => (
  <div className="p-6">
    <DashboardSkeleton />
  </div>
);

const toastConfig = {
  position: 'top-right' as const,
  toastOptions: {
    duration: 4000,
    style: {
      background: '#fff',
      color: '#363636',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
  },
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster {...toastConfig} />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {publicRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              {privateRoutes.map(({ path, element, layout, roles, requireSuperAdmin }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute allowedRoles={roles} requireSuperAdmin={requireSuperAdmin}>
                      {layout ? <MainLayout>{element}</MainLayout> : element}
                    </ProtectedRoute>
                  }
                />
              ))}

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>

          <GlobalCopilotChat />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
