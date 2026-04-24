// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('Error de renderizado capturado por AppErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
            <h1 className="text-lg font-semibold text-rose-700">Se produjo un error en la interfaz</h1>
            <p className="mt-2 text-sm text-slate-600">
              La vista no se pudo renderizar. Recarga la pagina y, si persiste, comparte este mensaje.
            </p>
            {this.state.message && (
              <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700">
                {this.state.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ⭐ CREAR QUERY CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // No re-fetch al cambiar de pestaña
      retry: 1, // Solo reintentar 1 vez en caso de error
      staleTime: 1000 * 60 * 5, // Los datos son frescos por 5 minutos
    },
  },
})

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontro el elemento root para montar la aplicacion.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      Iniciando aplicacion...
    </div>
  </React.StrictMode>,
)

const renderBootstrapError = (error: unknown) => {
  const message = error instanceof Error ? `${error.message}\n\n${error.stack ?? ''}` : String(error);

  root.render(
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-2xl rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-rose-700">Error de arranque del frontend</h1>
        <p className="mt-2 text-sm text-slate-600">Comparte este mensaje para corregir el fallo exacto.</p>
        <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700 whitespace-pre-wrap">
          {message}
        </pre>
      </div>
    </div>,
  );
};

import('./App')
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        {/* ⭐ ENVOLVER CON QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>

          {/* ⭐ OPCIONAL: DevTools para debugging (solo en desarrollo) */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Error durante bootstrap de App:', error);
    renderBootstrapError(error);
  });