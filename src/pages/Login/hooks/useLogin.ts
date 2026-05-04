// src/pages/login/hooks/useLogin.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Validación
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Mínimo 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData);
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      setErrors({ password: msg });
    }
  };

  // Cambio de campo — limpia el error del campo editado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    formData,
    showPassword,
    errors,
    loading,
    handleSubmit,
    handleChange,
    togglePassword,
  };
};