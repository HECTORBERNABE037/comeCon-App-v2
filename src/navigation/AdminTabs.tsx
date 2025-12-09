import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList, COLORS } from '../../types';
import { AdminBottomNavBar } from '../components/AdminBottomNavBar';

// Importar las pantallas que irán en las pestañas
import HomeAdminScreen from '../screens/home/HomeAdminScreen';
import { OrderTrackingScreen } from '../screens/admin/OrderTrackingScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs = () => {
  return (
    <Tab.Navigator
      // Aquí le decimos que use NUESTRA barra personalizada
      tabBar={props => <AdminBottomNavBar {...props} />}
      screenOptions={{
        headerShown: false, // Ocultamos el header por defecto
        tabBarStyle: { backgroundColor: COLORS.background } // Fondo base
      }}
      initialRouteName="HomeAdminTab"
    >
      <Tab.Screen name="HomeAdminTab" component={HomeAdminScreen} />
      <Tab.Screen name="OrderTrackingTab" component={OrderTrackingScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
      <Tab.Screen name="AdminProfileTab" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};