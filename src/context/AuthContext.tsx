import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Usuario } from '../../types';
import DatabaseService from '../services/DatabaseService';

// Definimos qué datos y funciones tendrá nuestro contexto
interface AuthContextData {
  user: Usuario | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  refreshUser: () => Promise<void>; // Para recargar datos si editamos perfil
}

// Creamos el contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider: El componente que envolverá a toda la app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para iniciar sesión
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const dbUser = await DatabaseService.loginUser(email, password);
      
      if (dbUser) {
        // Mapeamos lo que viene de la BD (raw) a nuestra interfaz Usuario
        const mappedUser: Usuario = {
          id: dbUser.id,
          nombre: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as "cliente" | "administrador",
          telefono: dbUser.phone,
          nickname: dbUser.nickname,
          gender: dbUser.gender,
          country: dbUser.country,
          address: dbUser.address,
          image: dbUser.image
        };
        setUser(mappedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = () => {
    setUser(null);
  };

  // Función para recargar los datos del usuario actual (útil después de editar perfil)
  const refreshUser = async () => {
    if (!user) return;
    try {
      const dbUser = await DatabaseService.getUserByEmail(user.email);
      if (dbUser) {
        setUser({
          ...user,
          nombre: dbUser.name,
          nickname: dbUser.nickname,
          telefono: dbUser.phone,
          gender: dbUser.gender,
          country: dbUser.country,
          address: dbUser.address,
        });
      }
    } catch (error) {
      console.error("Error refrescando usuario:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácil
export const useAuth = () => useContext(AuthContext);