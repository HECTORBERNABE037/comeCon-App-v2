import React, { useContext } from 'react'; // Agregamos useContext
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../types';
import { AuthContext } from '../context/AuthContext'; // Importamos AuthContext

// ✅ IMPORTANTE: Debe decir 'export const'
export const AdminBottomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  
  const { logout } = useContext(AuthContext); // Usamos el logout del contexto
  const currentRouteName = state.routes[state.index].name;

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => logout() }
    ]);
  };

  const handleNavigation = (routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const isHomeActive = currentRouteName === 'HomeAdminTab';
  const isOrdersActive = currentRouteName === 'OrderTrackingTab';
  const isSettingsActive = currentRouteName === 'SettingsTab';
  const isProfileActive = currentRouteName === 'AdminProfileTab';

  return (
    <View style={styles.container}>
      
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color={COLORS.error || "#D32F2F"} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, isOrdersActive && styles.activeItem]} 
        onPress={() => handleNavigation('OrderTrackingTab')}
      >
        <Ionicons name="receipt-outline" size={26} color={isOrdersActive ? COLORS.primary : "#C4C4C4"} />
        {/* Badge opcional */}
        {!isOrdersActive && <View style={styles.badge} />}
      </TouchableOpacity>

      <View style={styles.centerButtonContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={() => handleNavigation('HomeAdminTab')}>
          <Ionicons name="home" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.navItem, isSettingsActive && styles.activeItem]} 
        onPress={() => handleNavigation('SettingsTab')}
      >
        <Ionicons name="settings-outline" size={28} color={isSettingsActive ? COLORS.primary : "#C4C4C4"} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, isProfileActive && styles.activeItem]} 
        onPress={() => handleNavigation('AdminProfileTab')}
      >
        <Ionicons name="person-circle-outline" size={30} color={isProfileActive ? COLORS.primary : "#C4C4C4"} />
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderTopLeftRadius: 25, borderTopRightRadius: 25, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 20, paddingBottom: Platform.OS === 'ios' ? 15 : 0 },
  navItem: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  activeItem: { backgroundColor: '#F0F0F0' },
  centerButtonContainer: { marginTop: -40, justifyContent: 'center', alignItems: 'center' },
  centerButton: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 8, borderWidth: 4, borderColor: '#f2f2f2' },
  badge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }
});