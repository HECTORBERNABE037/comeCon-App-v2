import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta si es necesario
import { COLORS, FONT_SIZES } from '../../../types';
import DatabaseService from '../../services/DatabaseService';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, refreshUser } = useAuth();
  //1
  // Estados iniciales basados en la info del usuario (si es null, asumimos true por defecto)
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.allowNotifications ?? true);
  const [cameraEnabled, setCameraEnabled] = useState(user?.allowCamera ?? true);

  const toggleSwitch = async (type: 'notifications' | 'camera') => {
    if (!user) return;

    let newSettings = { 
      allowNotifications: notificationsEnabled, 
      allowCamera: cameraEnabled 
    };

    if (type === 'notifications') {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      newSettings.allowNotifications = newValue;
    } else {
      const newValue = !cameraEnabled;
      setCameraEnabled(newValue);
      newSettings.allowCamera = newValue;
    }

    // 1. Guardar en Base de Datos
    await DatabaseService.updateUserSettings(user.email, newSettings);
    
    // 2. Refrescar el contexto para que toda la app sepa del cambio
    await refreshUser();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{width: 28}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Permisos de la Aplicación</Text>
        
        {/* Switch Notificaciones */}
        <View style={styles.row}>
          <Text style={styles.label}>Permitir Notificaciones</Text>
          <Switch
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('notifications')}
            value={notificationsEnabled}
          />
        </View>
        <Text style={styles.hint}>Recibir alertas cuando lleguen nuevas órdenes.</Text>

        <View style={styles.separator} />

        {/* Switch Cámara */}
        <View style={styles.row}>
          <Text style={styles.label}>Permitir Cámara</Text>
          <Switch
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={cameraEnabled ? "#fff" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('camera')}
            value={cameraEnabled}
          />
        </View>
        <Text style={styles.hint}>Para tomar fotos de productos o perfil.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    elevation: 2 
  },
  backButton: { padding: 5 },
  title: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text },
  content: { marginTop: 20, padding: 20, backgroundColor: COLORS.white, borderRadius: 15, marginHorizontal: 15 },
  sectionTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  label: { fontSize: FONT_SIZES.medium, color: COLORS.text, fontWeight: '500' },
  hint: { fontSize: FONT_SIZES.small, color: '#888', marginBottom: 15, marginTop: -5 },
  separator: { height: 1, backgroundColor: '#EEE', marginBottom: 15 }
});