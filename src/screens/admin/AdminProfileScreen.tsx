import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, StatusBar, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AdminBottomNavBar } from '../../components/AdminBottomNavBar';
import { COLORS, FONT_SIZES, RootStackParamList } from '../../../types';
import { useAuth } from '../../context/AuthContext';
import { showImageOptions } from '../../utils/ImagePickerHelper'; // Helper de cámara
import DatabaseService from '../../services/DatabaseService';

type AdminProfileNavigationProp = StackNavigationProp<RootStackParamList, 'AdminProfile'>;

export const AdminProfileScreen = () => {
  const navigation = useNavigation<AdminProfileNavigationProp>();
  const { user, refreshUser } = useAuth();

  // Recargamos datos al entrar a la pantalla
  useFocusEffect(React.useCallback(() => { refreshUser(); }, []));

  const handleEditProfile = () => {
    navigation.navigate('EditAdminProfile');
  };

  // Función para manejar el botón de cámara
  const handleChangePhoto = () => {
    // 1. Verificamos permiso guardado en BD
    if (!user?.allowCamera) {
      Alert.alert("Cámara desactivada", "Habilita la cámara en Configuración para cambiar tu foto.");
      return;
    }
    
    // 2. Abrimos opciones (Cámara/Galería)
    showImageOptions(async (uri) => {
      // 3. AQUÍ ESTABA EL ERROR: Ahora usamos el método correcto updateUserImage
      const success = await DatabaseService.updateUserImage(user.email, uri);
      
      if (success) {
        refreshUser(); // Actualizar contexto para ver la nueva foto al instante
        Alert.alert("Éxito", "Foto de perfil actualizada.");
      } else {
        Alert.alert("Error", "No se pudo guardar la foto.");
      }
    });
  };

  if (!user) return <ActivityIndicator size="large" color={COLORS.primary} style={{flex:1}} />;

  // Resolver imagen local o URI
  const userImage = user.image ? { uri: user.image } : require('../../../assets/logoApp.png');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Informacion Personal</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.content}>
        <View style={styles.profileImageContainer}>
          <Image source={userImage} style={styles.profileImage} />
          {/* Botón de Cámara sobre la imagen */}
          <TouchableOpacity style={styles.editIconContainer} onPress={handleChangePhoto}>
             <Feather name="camera" size={16} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{user.nombre}</Text>
          <View style={styles.separator} />
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Telefono</Text>
          <Text style={styles.value}>{user.telefono || 'No registrado'}</Text>
          <View style={styles.separator} />
        </View>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <View style={styles.separator} />
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
        </TouchableOpacity>
      </View>
      <AdminBottomNavBar activeRoute="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerCard: { alignItems: 'center', marginTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 15 },
  headerTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text },
  headerUnderline: { height: 3, width: 250, backgroundColor: COLORS.primary, marginTop: 5 },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center' },
  profileImageContainer: { position: 'relative', marginBottom: 30, marginTop: 10 },
  profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#DDD', resizeMode: 'cover' },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.white, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  infoGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
  value: { fontSize: FONT_SIZES.medium, color: COLORS.text, marginBottom: 5 },
  separator: { height: 1, backgroundColor: '#CCC', width: '100%' },
  editButton: { backgroundColor: COLORS.primary, width: '100%', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 3 },
  editButtonText: { color: COLORS.white, fontSize: FONT_SIZES.large, fontWeight: 'bold', textTransform: 'uppercase' }
});