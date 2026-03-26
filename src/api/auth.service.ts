// src/api/auth.service.ts
import api from './axios';
import { LoginCredentials, LoginResponse, Usuario } from '@/types';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  // Obtener usuario actual
  async getMe(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/usuarios/me/');
    return response.data;
  },

  // Refrescar token
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Cambiar contraseña
  async changePassword(data: {
    password_actual: string;
    password_nuevo: string;
    password_confirmacion: string; 
  }): Promise<void> {
    await api.post('/auth/usuarios/cambiar_password/', data);
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken });
    }
  },

};