import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Importación de nuestras dos pantallas
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";
import RegisterScreen from "../screens/auth/RegisterScreen"
import { ProductDetailScreen } from "../screens/Product/ProducDetailsScreen";
import { COLORS, RootStackParamList } from "../../types";
import {ForgotPasswordScreen} from "../screens/auth/ForgotPasswordScreen" 
import {ResetCodeScreen} from "../screens/auth/ResetCodeScreen"
import {SetNewPasswordScreen} from "../screens/auth/SetNewPasswordScreen"
import HomeAdminScreen from "../screens/home/HomeAdminScreen"
import { OrderTrackingScreen } from "../screens/admin/OrderTrackingScreen"; 
import { AdminProfileScreen } from "../screens/admin/AdminProfileScreen";
import { EditAdminProfileScreen } from "../screens/admin/EditAdminProfileScreen";
import { ClientOrderTrackingScreen } from "../screens/client/ClientOrderTrackingScreen";
import { ClientProfileScreen } from "../screens/client/ClientProfileScreen";
import { EditClientProfileScreen } from "../screens/client/EditClientProfileScreen";
import { CartScreen } from "../screens/client/CartScreen";
import { CheckoutScreen } from "../screens/client/CheckoutScreen";
import { AddCardScreen } from "../screens/client/AddCardScreen";


const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {// sitaxis para definir un compnenete en react
  return (// lo que este dentro de {} es lo que se renderiza 
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary, 
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false, // Ocultamos el header en la pantalla de login
        }}
      />
      <Stack.Screen
        name="Home"// tiene que coincidir con el nombre en rootStackParamList
        component={HomeScreen}
        options={{
          title: "ComeCon", // Título de la app
        }}
      />
      {/*Pantalla de detalles */}
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailScreen}
        options={{
          headerShown:false
        }}
      />
      {/*Pantalla de detalles */}
      <Stack.Screen
        name="ClientOrderTracking"
        component={ClientOrderTrackingScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="ClientProfile"
        component={ClientProfileScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="EditClientProfile"
        component={EditClientProfileScreen}
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen
        name="HomeAdmin"
        component={HomeAdminScreen}
        options={{
          headerShown:false, 
        }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditAdminProfile"
        component={EditAdminProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name = "Register"
        component={RegisterScreen}
        options={{headerShown:false}}
      />
      <Stack.Screen
        name='ForgotPassword'
        component={ForgotPasswordScreen}
        options={{headerShown:false}}
      />
      <Stack.Screen
        name='ResetCode'
        component={ResetCodeScreen}
        options={{headerShown:false}}
      />
      <Stack.Screen
        name='SetNewPassword'
        component={SetNewPasswordScreen}
        options={{headerShown:false}}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;// para poder usar la exportacion por defecto. Cada archivo solo puede tener un export default

