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
};