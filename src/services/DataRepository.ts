// src/services/DataRepository.ts
import NetInfo from '@react-native-community/netinfo';
import { ApiService } from './ApiService';
import DatabaseService from './DatabaseService';

export const DataRepository = {
  
  login: async (email: string, password: string) => {
    // 1. Verificar internet
    const state = await NetInfo.fetch();
    const isOnline = state.isConnected && state.isInternetReachable;

    // 2. ESCENARIO ONLINE: Intentar API primero
    if (isOnline) {
      console.log("🌐 Intentando login Online...");
      const apiResult = await ApiService.login(email, password);
      
      if (apiResult.success) {
        // ¡Éxito! Guardamos copia en SQLite para el futuro (Sync)
        // OJO: Aquí enviamos la contraseña que ingresó el usuario para guardarla localmente
        await DatabaseService.syncUser(apiResult.data.user, password);
        return { 
          success: true, 
          user: apiResult.data.user, 
          token: apiResult.data.token, 
          mode: 'online' 
        };
      } 
      
      // Si el error NO es de conexión (ej. contraseña mal), fallamos directo.
      if (!apiResult.isNetworkError) {
        return { success: false, error: apiResult.error };
      }
    }

    // 3. ESCENARIO OFFLINE (o Fallo de red): Usar SQLite
    console.log("📂 Usando login Offline...");
    
    // CORRECCIÓN AQUÍ: Usamos checkLocalCredentials en lugar de loginUser
    const localUser = await DatabaseService.checkLocalCredentials(email, password);
    
    if (localUser) {
      return { 
        success: true, 
        user: localUser, 
        token: 'OFFLINE_TOKEN', 
        mode: 'offline' 
      };
    }

    return { success: false, error: "Sin conexión y credenciales no guardadas." };
  },
  register: async (userData: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Necesitas internet para registrarte." };
    
    return await ApiService.register(userData);
  },

  // Cambiar contraseña metodos
  checkUserExists: async (email: string) => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      // ONLINE: Preguntar al backend
      const result = await ApiService.checkEmail(email);
      if (result.success) return result.exists;
    }
    // OFFLINE: No se puede verificar cuentas que no están en el dispositivo,
    // o podrías buscar en SQLite si quisieras permitir reset local (arriesgado).
    return false; 
  },

  updatePassword: async (email: string, newPassword: string) => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      // ONLINE: Actualizar en backend
      return await ApiService.resetPassword(email, newPassword);
    }
    return { success: false, error: "Necesitas internet para cambiar tu contraseña." };
  },

  //METODOS PARA PRODUCTOS
  getProducts: async () => {
    const state = await NetInfo.fetch();
    
    // 1. ONLINE: Intentar actualizar desde la nube
    if (state.isConnected) {
      try {
        const apiResult = await ApiService.getProducts();
        if (apiResult.success) {
          await DatabaseService.syncProducts(apiResult.data);
        }
      } catch (e) {
        console.log("⚠️ Error sync productos, usando caché local.");
      }
    }
    
    // 2. SIEMPRE devolver desde SQLite (Single Source of Truth)
    return await DatabaseService.getProducts();
  },

  // Cards (Online Only)
  getCards: async (userId: number) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return []; // O podrías retornar cacheadas si quisieras
    const res = await ApiService.getCards();
    // Filtramos por usuario si el backend devuelve todas (aunque el backend debería filtrar por user en request.user)
    return res.success ? res.data.filter((c: any) => c.user === userId || true) : []; 
  },

  addCard: async (cardData: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Se requiere internet" };
    return await ApiService.addCard(cardData);
  },

  deleteCard: async (cardId: number) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Se requiere internet" };
    return await ApiService.deleteCard(cardId);
  },

  // Orders (Online Only)
  createOrder: async (orderData: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Se requiere internet para pedir" };
    
    // Formatear payload para Django (snake_case)
    const payload = {
      user: orderData.userId,
      total: orderData.total,
      payment_method: orderData.paymentMethod, // Asegúrate que tu backend tenga este campo o ponlo en 'status'/'notes'
      address: orderData.address,
      items: orderData.items.map((item: any) => ({
        product_id: item.productId || item.id,
        quantity: item.quantity,
        price_at_moment: item.price // O promotionalPrice
      }))
    };
    return await ApiService.createOrder(payload);
  },
  //ORDENES PENDIENTE HACERLAR OFFLINE
  getOrders: async () => {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      return { success: false, error: "Necesitas internet para ver tu historial actualizado." };
      
      // return { success: true, data: await DatabaseService.getOrdersLocal(...) };
    }
    
    return await ApiService.getOrders();
  },
  // Sincronizar perfil (Descargar de nube -> Guardar en SQLite)
  syncProfile: async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      const res = await ApiService.getProfile();
      if (res.success) {
        await DatabaseService.updateLocalUser(res.data);
        return true; // Sincronización exitosa
      }
    }
    return false; // Sin internet o error
  },

  // Actualizar un ajuste (Subir a nube -> Guardar en SQLite)
  updateSetting: async (data: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Necesitas internet para guardar cambios." };
    
    const res = await ApiService.updateProfile(data);
    if (res.success) {
      await DatabaseService.updateLocalUser(res.data);
    }
    return res;
  },

  //ACTUALIZAR PERFIL
  updateProfile: async (userData: any) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return { success: false, error: "Necesitas internet para actualizar tus datos." };
    }
    
    // Reutilizamos el endpoint de profile que ya creamos en ApiService
    const res = await ApiService.updateProfile(userData);
    
    if (res.success) {
      // Si el servidor responde OK, actualizamos SQLite para reflejar cambios offline
      await DatabaseService.updateLocalUser(res.data);
    }
    return res;
  },
  uploadProfileImage: async (uri: string) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return { success: false, error: "Necesitas internet para cambiar tu foto." };
    }

    const res = await ApiService.uploadProfileImage(uri);
    
    if (res.success) {
      // Si subió bien, actualizamos la referencia local en SQLite para que se vea offline
      // El backend nos devuelve el usuario actualizado con la URL de la imagen
      await DatabaseService.updateLocalUser(res.data);
    }
    return res;
  },

  // === ADMIN ACTIONS ===

  getAdminProducts: async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      // 1. Sincronizar desde la API (Trae visibles y ocultos si el backend lo permite)
      const res = await ApiService.getProducts();
      if (res.success) {
        await DatabaseService.syncProducts(res.data);
      }
    }
    // 2. Leer todo desde SQLite (incluyendo ocultos)
    return await DatabaseService.getAllProductsAdmin();
  },

  saveProduct: async (data: any, id?: number) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Requiere internet" };

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('category', data.category || 'General');
    
    // ✅ CORRECCIÓN: Agregar el subtítulo al FormData
    formData.append('subtitle', data.subtitle || ''); 

    formData.append('visible', data.visible !== false ? 'true' : 'false'); 

    if (data.image && data.image !== 'logoApp' && !data.image.startsWith('http')) {
       const filename = data.image.split('/').pop();
       const match = /\.(\w+)$/.exec(filename || '');
       const type = match ? `image/${match[1]}` : `image/jpeg`;
       formData.append('image', { uri: data.image, name: filename, type } as any);
    }

    let res;
    if (id) {
      res = await ApiService.updateProduct(id, formData);
    } else {
      res = await ApiService.createProduct(formData);
    }

    if (res.success) {
      const productsRes = await ApiService.getProducts();
      if (productsRes.success) await DatabaseService.syncProducts(productsRes.data);
    }
    return res;
  },

  deleteProductAdmin: async (id: number) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, error: "Requiere internet" };

    const res = await ApiService.deleteProduct(id);
    if (res.success) {
      await DatabaseService.deleteProduct(id); // Borrar de SQLite
    }
    return res;
  },
  
  toggleVisibility: async (id: number, currentVisible: boolean) => {
     // Usamos updateProduct enviando solo el campo visible
     const formData = new FormData();
     formData.append('visible', (!currentVisible).toString());
     return await ApiService.updateProduct(id, formData);
  }
};