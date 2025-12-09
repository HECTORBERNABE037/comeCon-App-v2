import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  Alert,
  Linking, 
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // IMPORTANTE: Para pedir permisos
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES } from '../../../types';
import DatabaseService from '../../services/DatabaseService';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, refreshUser } = useAuth();
  
  // Inicializamos estados con la info del usuario
  // Si user.allowCamera es 1 (true) o 0 (false), lo respetamos.
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.allowNotifications);
  const [cameraEnabled, setCameraEnabled] = useState(!!user?.allowCamera);

  // Sincronizar estado local si el usuario cambia en el contexto
  useEffect(() => {
    if (user) {
      setNotificationsEnabled(!!user.allowNotifications);
      setCameraEnabled(!!user.allowCamera);
    }
  }, [user]);

  const toggleCamera = async () => {
    if (!user) return;

    const targetValue = !cameraEnabled; // El valor al que queremos cambiar

    // Si el usuario quiere ACTIVAR la cámara, primero pedimos permiso al OS
    if (targetValue === true) {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        // Permiso denegado
        if (!canAskAgain) {
          Alert.alert(
            "Permiso necesario",
            "Has denegado el acceso a la cámara permanentemente. Ve a la configuración de tu celular para activarlo manualmante.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a Configuración", onPress: () => Linking.openSettings() }
            ]
          );
        } else {
          Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara para tomar fotos de tus productos.");
        }
        // No activamos el switch ni guardamos en BD
        return;
      }
    }

    // Si llegamos aquí, es porque tenemos permiso (o estamos desactivando)
    // 1. Actualizamos visualmente
    setCameraEnabled(targetValue);

    // 2. Guardamos en BD
    const success = await DatabaseService.updateUserSettings(user.email, {
      allowNotifications: notificationsEnabled,
      allowCamera: targetValue // Nuevo valor
    });

    if (success) {
      await refreshUser(); // Actualizar contexto global
    } else {
      setCameraEnabled(!targetValue); // Revertir si falla BD
      Alert.alert("Error", "No se pudo guardar la configuración.");
    }
  };

  const toggleNotifications = async () => {
    if (!user) return;
    const targetValue = !notificationsEnabled;
    
    setNotificationsEnabled(targetValue);

    const success = await DatabaseService.updateUserSettings(user.email, {
      allowNotifications: targetValue,
      allowCamera: cameraEnabled
    });

    if (success) {
      await refreshUser();
    } else {
      setNotificationsEnabled(!targetValue);
      Alert.alert("Error", "No se pudo guardar la configuración.");
    }
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
            onValueChange={toggleNotifications}
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
            onValueChange={toggleCamera} // Usamos la nueva función
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
    elevation: 2,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
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