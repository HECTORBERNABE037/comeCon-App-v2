// src/services/ApiService.ts
const API_URL = 'http://192.168.1.198:8000/api'; // ⚠️ CAMBIA ESTO POR TU IP LOCAL

export const ApiService = {
  login: async (email: string, password: string) => {
    try {
      // Intentamos conectar con Django (Timeout de 5s para no bloquear la app)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, error: data.error || "Credenciales inválidas" };
      }
    } catch (error) {
      return { success: false, error: "Error de conexión", isNetworkError: true };
    }
  },
  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/register/`, { // Asegúrate que tu URL de Django sea correcta
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      
      // Manejo de errores de Django (ej: "Este email ya existe")
      const errorMsg = data.email ? data.email[0] : (data.detail || "Error en el registro");
      return { success: false, error: errorMsg };
    } catch (e) { 
      return { success: false, error: "Error de conexión", isNetworkError: true }; 
    }
  },
  //cambiar contraseña metodos
  checkEmail: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/check-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) return { success: true, exists: data.exists };
      return { success: false, error: "Error al verificar email" };
    } catch (e) {
      return { success: false, error: "Error de conexión", isNetworkError: true };
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_URL}/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword }),
      });
      if (response.ok) return { success: true };
      return { success: false, error: "No se pudo actualizar la contraseña" };
    } catch (e) {
      return { success: false, error: "Error de conexión", isNetworkError: true };
    }
  },
  getProducts: async () => {
    try {
      // Nota: Django suele paginar. Si usas DefaultRouter, tal vez devuelva { results: [...] } o un array directo.
      // Asumiremos que devuelve un array o extraemos 'results'.
      const response = await fetch(`${API_URL}/products/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        // Soporte para paginación de Django (si devuelve { count: ..., results: [...] })
        const products = Array.isArray(data) ? data : data.results;
        return { success: true, data: products };
      }
      return { success: false, error: "Error al obtener productos" };
    } catch (e) {
      return { success: false, error: "Error de conexión", isNetworkError: true };
    }
  },
};