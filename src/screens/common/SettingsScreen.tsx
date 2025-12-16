import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  SafeAreaView, 
  StatusBar,
  Alert,
  Linking, 
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES } from '../../../types';
import DatabaseService from '../../services/DatabaseService';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, refreshUser } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.allowNotifications);
  const [cameraEnabled, setCameraEnabled] = useState(!!user?.allowCamera);

  useEffect(() => {
    if (user) {
      setNotificationsEnabled(!!user.allowNotifications);
      setCameraEnabled(!!user.allowCamera);
    }
  }, [user]);

  const toggleCamera = async () => {
    if (!user) return;

    const targetValue = !cameraEnabled; 

    if (targetValue === true) {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
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
        return;
      }
    }

    setCameraEnabled(targetValue);

    const success = await DatabaseService.updateUserSettings(user.email, {
      allowNotifications: notificationsEnabled,
      allowCamera: targetValue 
    });

    if (success) {
      await refreshUser(); 
    } else {
      setCameraEnabled(!targetValue); 
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
      
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Permisos de la Aplicación</Text>
        
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

        <View style={styles.row}>
          <Text style={styles.label}>Permitir Cámara</Text>
          <Switch
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={cameraEnabled ? "#fff" : "#f4f3f4"}
            onValueChange={toggleCamera} 
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
    width: 250, 
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
  },
  sectionTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  label: { fontSize: FONT_SIZES.medium, color: COLORS.text, fontWeight: '500' },
  hint: { fontSize: FONT_SIZES.small, color: '#888', marginBottom: 15, marginTop: -5 },
  separator: { height: 1, backgroundColor: '#EEE', marginBottom: 15 }
});