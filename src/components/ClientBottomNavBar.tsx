import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../types';

export const ClientBottomNavBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  
  const currentRouteName = state.routes[state.index].name;

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })) }
    ]);
  };

  const handleNavigation = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const isHomeActive = currentRouteName === 'HomeClientTab';
  const isTrackingActive = currentRouteName === 'ClientOrderTrackingTab';
  const isSettingsActive = currentRouteName === 'SettingsTab';
  const isProfileActive = currentRouteName === 'ClientProfileTab';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#C4C4C4" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navItem, isTrackingActive && styles.activeItem]} onPress={() => handleNavigation('ClientOrderTrackingTab')}>
        <Ionicons name="receipt-outline" size={26} color={isTrackingActive ? COLORS.primary : "#C4C4C4"} />
      </TouchableOpacity>

      <View style={styles.centerButtonContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={() => handleNavigation('HomeClientTab')}>
          <Ionicons name="home" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.navItem, isSettingsActive && styles.activeItem]} onPress={() => handleNavigation('SettingsTab')}>
        <Ionicons name="settings-outline" size={28} color={isSettingsActive ? COLORS.primary : "#C4C4C4"} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navItem, isProfileActive && styles.activeItem]} onPress={() => handleNavigation('ClientProfileTab')}>
        <Ionicons name="person-circle-outline" size={30} color={isProfileActive ? COLORS.primary : "#C4C4C4"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  activeItem: { backgroundColor: '#F0F0F0' },
  centerButtonContainer: { marginTop: -50, justifyContent: 'center', alignItems: 'center' },
  centerButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 8, borderWidth: 5, borderColor: '#f2f2f2' }
});