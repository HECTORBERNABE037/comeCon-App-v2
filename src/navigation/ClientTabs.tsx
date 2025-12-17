import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClientTabParamList, COLORS } from '../../types';
import { ClientBottomNavBar } from '../components/ClientBottomNavBar';

import HomeScreen from '../screens/home/HomeScreen';
import  ClientOrderTrackingScreen  from '../screens/client/ClientOrderTrackingScreen';
import  ClientProfileScreen  from '../screens/client/ClientProfileScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator<ClientTabParamList>();

export const ClientTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <ClientBottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.background }
      }}
      initialRouteName="HomeClientTab"
    >
      <Tab.Screen name="HomeClientTab" component={HomeScreen} />
      <Tab.Screen name="ClientOrderTrackingTab" component={ClientOrderTrackingScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
      <Tab.Screen name="ClientProfileTab" component={ClientProfileScreen} />
    </Tab.Navigator>
  );
};