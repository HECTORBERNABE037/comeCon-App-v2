import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import DatabaseService from '../services/DatabaseService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
}

export const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Cargar contador inicial cuando cambia el usuario
  useEffect(() => {
    if (user) refreshCart();
    else setCartCount(0);
  }, [user]);

  const refreshCart = async () => {
    if (user) {
      const count = await DatabaseService.getCartCount(Number(user.id));
      setCartCount(count);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (!user) return false;
    try {
      await DatabaseService.addToCart(Number(user.id), productId, quantity);
      await refreshCart(); // Actualizamos el badge global
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};