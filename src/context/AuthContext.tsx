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
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ✅ SOLUCIÓN AL ERROR: Creamos y exportamos el hook useAuth
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

  const checkSession = async () => {
    try {
      // Nota: DatabaseService.init() ya se llama en App.tsx, no lo duplicamos aquí
      const token = await AsyncStorage.getItem('userToken');
      const email = await AsyncStorage.getItem('userEmail');

      if (token && email) {
        console.log("🔄 Sesión encontrada, cargando usuario...");
        const localUser = await DatabaseService.getLocalUser(email);
        
        if (localUser) {
          setUser({
            id: localUser.id.toString(),
            nombre: localUser.name,
            email: localUser.email,
            role: localUser.role as any,
            nickname: localUser.nickname,
            image: localUser.image ? { uri: localUser.image } : undefined,
            phone: localUser.phone
          });
        }
      }
    } catch (e) {
      console.log("No hay sesión previa o error cargándola");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. LOGIN
  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await DataRepository.login(data.email, data.password);

      if (result.success && result.user) {
        if (result.token) {
           await AsyncStorage.setItem('userToken', result.token);
           await AsyncStorage.setItem('userEmail', result.user.email);
        }

        setUser({
          id: result.user.id ? result.user.id.toString() : '0',
          nombre: result.user.name || '',
          email: result.user.email,
          role: result.user.role as any,
          nickname: result.user.nickname,
          phone: result.user.phone,
          image: result.user.image ? { uri: result.user.image } : undefined 
        });
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

  // 3. LOGOUT
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};