import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { COLORS, RootStackParamList } from "../../types";

// Importar Auth y flujos secundarios
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen"; 
import { ResetCodeScreen } from "../screens/auth/ResetCodeScreen";
import { SetNewPasswordScreen } from "../screens/auth/SetNewPasswordScreen";
import { ProductDetailScreen } from "../screens/Product/ProducDetailsScreen";
import { EditAdminProfileScreen } from "../screens/admin/EditAdminProfileScreen";
import { EditClientProfileScreen } from "../screens/client/EditClientProfileScreen";
import { CartScreen } from "../screens/client/CartScreen";
import { CheckoutScreen } from "../screens/client/CheckoutScreen";
import { AddCardScreen } from "../screens/client/AddCardScreen";

// IMPORTAR LOS NUEVOS NAVEGADORES DE PESTAÑAS
import { AdminTabs } from "./AdminTabs";
import { ClientTabs } from "./ClientTabs";

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" },
        headerShown: false // Por defecto ocultamos headers en el stack
      }}
    >
      {/* Flujo de Autenticación */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
      <Stack.Screen name='ResetCode' component={ResetCodeScreen} />
      <Stack.Screen name='SetNewPassword' component={SetNewPasswordScreen} />

      {/* PESTAÑAS PRINCIPALES (Aquí sucede la magia) */}
      <Stack.Screen name="AdminTabsNavigator" component={AdminTabs} />
      <Stack.Screen name="ClientTabsNavigator" component={ClientTabs} />

      {/* Pantallas secundarias (se abren sobre las pestañas, sin barra inferior) */}
      <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="EditAdminProfile" component={EditAdminProfileScreen} />
      <Stack.Screen name="EditClientProfile" component={EditClientProfileScreen} />
      
    </Stack.Navigator>
  );
};

export default StackNavigator;