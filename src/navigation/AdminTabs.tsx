import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList, COLORS } from '../../types';
import { AdminBottomNavBar } from '../components/AdminBottomNavBar';

import HomeAdminScreen from '../screens/home/HomeAdminScreen';
import { OrderTrackingScreen } from '../screens/admin/OrderTrackingScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <AdminBottomNavBar {...props} />}
      screenOptions={{
        headerShown: false, 
        tabBarStyle: { backgroundColor: COLORS.background } 
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