// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/auth.service';
import { Usuario, LoginCredentials, AuthContextType } from '@/types';
import toast from 'react-hot-toast';

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER DEL CONTEXTO
// ==========================================
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ==========================================
  // CARGAR USUARIO AL INICIAR
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Intentar obtener datos actualizados del usuario
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error al cargar usuario:', error);
          // Si falla, usar los datos guardados
          setUser(JSON.parse(savedUser));
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

// ==========================================
// LOGIN - ACTUALIZAR REDIRECCIÓN
// ==========================================
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);

      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`¡Bienvenido ${userData.nombre_completo}!`);

      // ✅ REDIRIGIR SEGÚN ROL ACTUALIZADO
      if (userData.rol === 'superadmin' || userData.rol === 'administrador') {
        navigate('/dashboard');
      } else if (userData.rol === 'usuario') {
        navigate('/mis-tareas');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.response?.status === 401) {
        toast.error('Email o contraseña incorrectos');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Error al iniciar sesión. Intenta nuevamente.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

    // ==========================================
    // COMPUTED PROPERTIES
    // ==========================================
    const isAuthenticated = !!user;
    const isSuperAdmin = user?.rol === 'superadmin';
    const isAdmin = user?.rol === 'administrador';
    const isAuditor = user?.rol === 'auditor';
    const isUsuario = user?.rol === 'usuario';

  // ==========================================
  // VALUE DEL CONTEXTO
  // ==========================================
  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isAuditor,
    isUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==========================================
// HOOK PARA USAR EL CONTEXTO
// ==========================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};