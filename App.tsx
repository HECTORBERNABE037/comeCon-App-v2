import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import DatabaseService from './src/services/DatabaseService';

const App: React.FC = () => {
  
  // Inicializamos la BD al arrancar la app
  useEffect(() => {
    const initDB = async () => {
      await DatabaseService.init();
      console.log("App iniciada y BD lista");
    };
    initDB();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};
export default App;