import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import DatabaseService from './src/services/DatabaseService';
import { CartProvider } from "./src/context/CartContext";

const App: React.FC = () => {
  
  // Inicializamos la bd al arrancar la app
  useEffect(() => {
    const initDB = async () => {
      await DatabaseService.init();
      console.log("App iniciada y BD lista");
    };
    initDB();
  }, []);

  return (
    <AuthProvider>
       <CartProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </CartProvider>
    </AuthProvider>
  );
};
export default App;