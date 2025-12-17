import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = 'http://192.168.1.198:8000/api'; // ⚠️ CAMBIA ESTO POR TU IP LOCAL

// Helper para obtener cabeceras con Token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Token ${token}` : '' // O 'Bearer ${token}' según tu config de Django
  };
};


export const ApiService = {

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: data.error || "Credenciales inválidas" };
    } catch (e) { return { success: false, error: "Error de conexión", isNetworkError: true }; }
  },


  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "Error en registro" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
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

  // === MÉTODOS PROTEGIDOS (USAN TOKEN) ===

  getProducts: async () => {
    try {
      const headers = await getAuthHeaders(); // <--- Token
      const response = await fetch(`${API_URL}/products/`, { method: 'GET', headers });
      const data = await response.json();
      if (response.ok) return { success: true, data: Array.isArray(data) ? data : data.results };
      return { success: false, error: "Error al obtener productos" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  // === TARJETAS ===
  getCards: async () => {
    try {
      const headers = await getAuthHeaders(); // <--- Token
      const response = await fetch(`${API_URL}/cards/`, { method: 'GET', headers });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "Error al obtener tarjetas" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  addCard: async (cardData: any) => {
    try {
      const headers = await getAuthHeaders(); // <--- Token
      const response = await fetch(`${API_URL}/cards/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(cardData),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo guardar la tarjeta" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  deleteCard: async (cardId: number) => {
    try {
      const headers = await getAuthHeaders(); // <--- Token
      const response = await fetch(`${API_URL}/cards/${cardId}/`, { method: 'DELETE', headers });
      if (response.ok) return { success: true };
      return { success: false, error: "No se pudo eliminar" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  // === ÓRDENES ===
  createOrder: async (orderPayload: any) => {
    try {
      const headers = await getAuthHeaders(); // <--- Token CRÍTICO AQUÍ
      const response = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers, // Incluye Authorization: Token ...
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      // Si falla por 401, el data.detail te lo dirá
      return { success: false, error: data.detail || "Error al procesar la orden" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  // VISUALIZAR ORDENES
  getOrders: async () => {
    try {
      const headers = await getAuthHeaders(); // <--- Token
      const response = await fetch(`${API_URL}/orders/`, { 
        method: 'GET', 
        headers 
      });
      const data = await response.json();
      
      if (response.ok) {
        // Django puede devolver paginación ({ count: 5, results: [...] }) o lista directa
        const orders = Array.isArray(data) ? data : (data.results || []);
        return { success: true, data: orders };
      }
      return { success: false, error: "No se pudo cargar el historial" };
    } catch (e) { 
      return { success: false, error: "Error de conexión" }; 
    }
  },
  // === PERFIL Y AJUSTES ===
  getProfile: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/profile/`, { method: 'GET', headers });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo cargar el perfil" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  updateProfile: async (data: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/profile/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (response.ok) return { success: true, data: resData };
      return { success: false, error: "No se pudo actualizar" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  // Método específico para subir imagen (multipart/form-data)
  uploadProfileImage: async (imageUri: string) => {
    try {
      const headers = await getAuthHeaders();
      
      delete (headers as any)['Content-Type']; 

      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: imageUri,
        name: filename || 'profile.jpg',
        type: type,
      } as any);

      const response = await fetch(`${API_URL}/profile/`, {
        method: 'PATCH',
        headers, // Headers sin Content-Type (fetch lo pone automático con boundary)
        body: formData,
      });

      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo subir la imagen" };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Error de conexión" };
    }
  },

  // === GESTIÓN DE PRODUCTOS (ADMIN) ===
  
  createProduct: async (productData: FormData) => {
    try {
      const headers = await getAuthHeaders();
      delete (headers as any)['Content-Type']; // Para FormData

      const response = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers,
        body: productData,
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo crear el producto" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  updateProduct: async (id: number, productData: FormData) => {
    try {
      const headers = await getAuthHeaders();
      delete (headers as any)['Content-Type']; // Para FormData

      const response = await fetch(`${API_URL}/products/${id}/`, {
        method: 'PATCH',
        headers,
        body: productData,
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo actualizar" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  deleteProduct: async (id: number) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/products/${id}/`, { method: 'DELETE', headers });
      if (response.ok) return { success: true };
      return { success: false, error: "No se pudo eliminar" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  // === PROMOCIONES ===
  
  createPromotion: async (promoData: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/promotions/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(promoData),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo crear la promoción" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  updatePromotion: async (id: number, promoData: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/promotions/${id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(promoData),
      });
      const data = await response.json();
      if (response.ok) return { success: true, data };
      return { success: false, error: "No se pudo actualizar la promoción" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

  deletePromotion: async (id: number) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/promotions/${id}/`, { method: 'DELETE', headers });
      if (response.ok) return { success: true };
      return { success: false, error: "No se pudo eliminar" };
    } catch (e) { return { success: false, error: "Error de conexión" }; }
  },

};