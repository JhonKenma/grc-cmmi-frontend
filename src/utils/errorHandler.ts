// src/utils/errorHandler.ts

/**
 * Extrae errores del backend considerando el ResponseMixin de Django
 * que envuelve errores en { success, message, errors: {...} }
 */
export const extraerErrores = (error: any): Record<string, string> => {
  const errores: Record<string, string> = {};

  if (!error.response?.data) return errores;

  const data = error.response.data;
  // ResponseMixin wrappea en { errors: {...} } o directamente el objeto
  const fuente = data.errors || data;

  if (typeof fuente !== 'object') return errores;

  Object.keys(fuente).forEach((key) => {
    const val = fuente[key];
    errores[key] = Array.isArray(val) ? val[0] : String(val);
  });

  return errores;
};

/**
 * Muestra el error de plan/límite con toast especial,
 * o setea errores de formulario si son errores de campo.
 * Retorna true si fue un error de plan (para que el componente
 * no haga nada más).
 */
export const manejarErrorCrearUsuario = (
  error: any,
  setErrors: (e: Record<string, string>) => void,
  toast: any
): boolean => {
  const errores = extraerErrores(error);

  // Error de límite de plan
  if (errores.rol?.includes('Límite') || errores.rol?.includes('limite')) {
    toast.error(`⚠️ ${errores.rol}`, {
      duration: 6000,
      icon: '🚫',
    });
    return true;
  }

  // Error de plan expirado o sin plan
  if (errores.empresa?.includes('plan') || errores.empresa?.includes('expirado')) {
    toast.error(`⚠️ ${errores.empresa}`, {
      duration: 6000,
      icon: '⏰',
    });
    return true;
  }

  // Errores de formulario normales
  if (Object.keys(errores).length > 0) {
    setErrors(errores);
    toast.error('Error al guardar. Revise los campos marcados');
    return false;
  }

  // Error genérico
  toast.error('Error inesperado. Intente nuevamente');
  return false;
};