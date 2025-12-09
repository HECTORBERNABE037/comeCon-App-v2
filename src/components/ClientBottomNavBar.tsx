import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../types';

type ClientTab = 'Home' | 'Tracking' | 'Settings' | 'Profile' | null;

interface Props {
  activeRoute: ClientTab;
}

export const ClientBottomNavBar: React.FC<Props> = ({ activeRoute }) => {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => 
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          ) 
      }
    ]);
  };

  const handleNavigation = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      
      <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#C4C4C4" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Tracking' && styles.activeItem]} 
        onPress={() => handleNavigation('ClientOrderTracking')} 
      >
        <Ionicons 
          name="receipt-outline" 
          size={26} 
          color={activeRoute === 'Tracking' ? COLORS.primary : "#C4C4C4"} 
        />
      </TouchableOpacity>

      <View style={styles.centerButtonContainer}>
        <TouchableOpacity 
          style={styles.centerButton} 
          onPress={() => handleNavigation('Home')}
        >
          <Ionicons name="home" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Botón Configuración Activo */}
      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Settings' && styles.activeItem]} 
        onPress={() => handleNavigation('Settings')} // <--- CONECTADO
      >
        <Ionicons 
          name="settings-outline" 
          size={28} 
          color={activeRoute === 'Settings' ? COLORS.primary : "#C4C4C4"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, activeRoute === 'Profile' && styles.activeItem]} 
        onPress={() => handleNavigation('ClientProfile')}
      >
        <Ionicons 
            name="person-circle-outline" 
            size={30} 
            color={activeRoute === 'Profile' ? COLORS.primary : "#C4C4C4"} 
        />
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90, 
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  activeItem: {
    backgroundColor: '#F0F0F0',
  },
  centerButtonContainer: {
    marginTop: -50, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 5,
    borderColor: '#f2f2f2'
  }
});