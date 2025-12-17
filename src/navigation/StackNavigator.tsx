import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { RootStackParamList } from '../../types';

// Pantallas de Autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetCodeScreen from '../screens/auth/ResetCodeScreen';
import SetNewPasswordScreen from '../screens/auth/SetNewPasswordScreen';

// Navegadores Principales (Tabs)
import {ClientTabs} from './ClientTabs';
import {AdminTabs} from './AdminTabs';

// Pantallas Comunes / Cliente
import { ProductDetailScreen } from "../screens/Product/ProducDetailsScreen";
import CartScreen from '../screens/client/CartScreen';        
import CheckoutScreen from '../screens/client/CheckoutScreen'; 
import AddCardScreen from '../screens/client/AddCardScreen';
import EditClientProfileScreen from '../screens/client/EditClientProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  // 1. ESCUCHAMOS EL ESTADO DEL USUARIO
  const { user, isLoading } = useContext(AuthContext);

  // 2. MIENTRAS CARGA (Splash screen opcional)
  if (isLoading) {
    return null; // O un componente <SplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {user ? (
        // ==================================================
        //              ZONA PRIVADA (USUARIO LOGUEADO)
        // ==================================================
        <>
          {/* Validamos el ROL para mostrar el Home correcto */}
          {user.role === 'administrador' ? (
            <Stack.Screen name="AdminRoot" component={AdminTabs} />
          ) : (
            <Stack.Screen name="ClientRoot" component={ClientTabs} />
          )}

          {/* Pantallas compartidas o adicionales que no están en el TabBar pero son parte del stack de navegación */}
          <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="AddCard" component={AddCardScreen} />
          <Stack.Screen name="EditClientProfile" component={EditClientProfileScreen} />
        </>
      ) : (
        // ==================================================
        //              ZONA PÚBLICA (NO LOGUEADO)
        // ==================================================
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetCode" component={ResetCodeScreen} />
          <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;