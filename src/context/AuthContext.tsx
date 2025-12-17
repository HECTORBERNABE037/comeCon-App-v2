import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataRepository } from '../services/DataRepository';
import DatabaseService from '../services/DatabaseService';
import { Usuario, LoginFormData } from '../../types';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshUser: () => Promise<void>; // <--- NUEVA FUNCIONALIDAD
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. CARGAR SESIÓN AL INICIAR LA APP
  useEffect(() => {
    checkSession();
  }, []);

  // Helper para mapear el usuario de SQLite al Estado de la App
  const mapUserToState = (localUser: any) => {
    setUser({
      id: localUser.id.toString(),
      nombre: localUser.name,
      email: localUser.email,
      role: localUser.role as any,
      nickname: localUser.nickname,
      phone: localUser.phone,
      address: localUser.address,
      gender: localUser.gender,
      country: localUser.country,
      image: localUser.image ? { uri: localUser.image } : undefined,
      // Mapeo de configuraciones (SQLite guarda 1/0, App usa true/false)
      allowNotifications: localUser.allowNotifications === 1,
      allowCamera: localUser.allowCamera === 1
    });
  };

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const email = await AsyncStorage.getItem('userEmail');

      if (token && email) {
        console.log("🔄 Sesión encontrada, cargando usuario...");
        const localUser = await DatabaseService.getLocalUser(email);
        
        if (localUser) {
          mapUserToState(localUser);
        }
      }
    } catch (e) {
      console.log("No hay sesión previa o error cargándola");
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVO: Refrescar datos desde la nube (Usado en Settings)
  const refreshUser = async () => {
    if (!user) return;
    // No ponemos isLoading(true) global para no bloquear toda la UI, 
    // pero podrías hacerlo si prefieres.
    try {
      console.log("🔄 Refrescando perfil desde la nube...");
      // 1. Intentar bajar datos frescos del Backend -> SQLite
      await DataRepository.syncProfile();
      
      // 2. Recargar desde SQLite (la fuente de verdad)
      const localUser = await DatabaseService.getLocalUser(user.email);
      if (localUser) {
        mapUserToState(localUser);
      }
    } catch (error) {
      console.error("Error refrescando usuario:", error);
    }
  };

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await DataRepository.login(data.email, data.password);

      if (result.success && result.user) {
        if (result.token) {
           await AsyncStorage.setItem('userToken', result.token);
           await AsyncStorage.setItem('userEmail', result.user.email);
        }

        // Al hacer login, los datos frescos ya vienen en result.user o se guardaron en SQLite
        // Por seguridad, leemos de SQLite para usar el mismo mapeo consistente
        const localUser = await DatabaseService.getLocalUser(result.user.email);
        if (localUser) {
            mapUserToState(localUser);
        } else {
            // Fallback si SQLite falló (raro), usamos lo que vino del login
            setUser({
                id: result.user.id.toString(),
                nombre: result.user.name || '',
                email: result.user.email,
                role: result.user.role as any,
                nickname: result.user.nickname,
                phone: result.user.phone,
                // ... otros campos básicos
                image: undefined,
                address: '',
                gender: '',
                country: '',
                allowNotifications: true,
                allowCamera: true
            });
        }
        return { success: true };
      } else {
        return { success: false, error: result.error || "Error al iniciar sesión" };
      }
    } catch (error) {
      return { success: false, error: "Error inesperado" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};