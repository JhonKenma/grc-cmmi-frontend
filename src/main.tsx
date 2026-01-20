// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './index.css'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ⭐ ENVOLVER CON QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* ⭐ OPCIONAL: DevTools para debugging (solo en desarrollo) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)