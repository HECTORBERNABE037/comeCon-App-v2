import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Switch, SafeAreaView, StatusBar, Alert, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../../context/AuthContext';
import { DataRepository } from '../../services/DataRepository';
import { COLORS, FONT_SIZES } from '../../../types';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, refreshUser } = useAuth(); // Usamos refreshUser del contexto actualizado
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.allowNotifications);
  const [cameraEnabled, setCameraEnabled] = useState(!!user?.allowCamera);
  const [updating, setUpdating] = useState(false);

  // Sincronizar al entrar para asegurar que tenemos lo último del servidor
  useEffect(() => {
    refreshUser();
  }, []);

  // Actualizar switches si el usuario cambia (por el refreshUser)
  useEffect(() => {
    if (user) {
      setNotificationsEnabled(!!user.allowNotifications);
      setCameraEnabled(!!user.allowCamera);
    }
  }, [user]);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue); // Cambio optimista visual
    
    setUpdating(true);
    // Django espera 'allow_notifications' (snake_case)
    const result = await DataRepository.updateSetting({ allow_notifications: newValue });
    setUpdating(false);

    if (result.success) {
      await refreshUser(); // Actualizamos el estado global
    } else {
      setNotificationsEnabled(!newValue); // Revertir si falló
      Alert.alert("Error", result.error || "No se pudo actualizar. Revisa tu conexión.");
    }
  };

  const toggleCamera = async () => {
    const newValue = !cameraEnabled;
    
    // Si intenta activar, pedimos permiso real del dispositivo
    if (newValue === true) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Debes dar permiso de cámara en la configuración de tu teléfono.");
        return;
      }
    }

    setCameraEnabled(newValue);
    setUpdating(true);
    // Django espera 'allow_camera'
    const result = await DataRepository.updateSetting({ allow_camera: newValue });
    setUpdating(false);

    if (result.success) {
      await refreshUser();
    } else {
      setCameraEnabled(!newValue);
      Alert.alert("Error", result.error || "No se pudo actualizar. Revisa tu conexión.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* Sección Notificaciones */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Notificaciones</Text>
          <Switch
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
            disabled={updating}
          />
        </View>
        <Text style={styles.hint}>Recibe actualizaciones sobre el estado de tus pedidos.</Text>
      </View>

      {/* Sección Cámara */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Acceso a Cámara</Text>
          <Switch
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={cameraEnabled ? "#fff" : "#f4f3f4"}
            onValueChange={toggleCamera} 
            value={cameraEnabled}
            disabled={updating}
          />
        </View>
        <Text style={styles.hint}>Permite usar la cámara para tu foto de perfil.</Text>
      </View>
      
      {updating && <Text style={styles.savingText}>Guardando cambios en la nube...</Text>}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerCard: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerUnderline: {
    height: 3,
    width: 100,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  content: { 
    marginTop: 10, 
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderRadius: 15, 
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  label: {
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
    fontWeight: '500'
  },
  hint: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 5
  },
  savingText: {
    textAlign: 'center',
    color: COLORS.primary,
    marginTop: 10,
    fontStyle: 'italic',
    fontSize: FONT_SIZES.small
  }
});