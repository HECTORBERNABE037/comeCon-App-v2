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
};