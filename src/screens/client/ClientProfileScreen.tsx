import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  ActivityIndicator, 
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Importamos el Picker

import { COLORS, FONT_SIZES, RootStackParamList, ClientTabParamList } from '../../../types';
import { useAuth } from '../../context/AuthContext';
import { DataRepository } from '../../services/DataRepository'; // Importamos Repositorio

type ClientProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'ClientProfileTab'>,
  StackNavigationProp<RootStackParamList>
>;

// Helper de imagen robusto
const resolveImage = (img: any) => {
  if (img?.uri) return { uri: img.uri };
  if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('file://'))) return { uri: img };
  // IMPORTANTE: Asegúrate de que esta ruta a tu logo por defecto sea correcta
  return require('../../../assets/logoApp.png'); 
};

const ClientProfileScreen = () => {
  const navigation = useNavigation<ClientProfileNavigationProp>();
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate('EditClientProfile');
  };

  // === LÓGICA DE CÁMARA/GALERÍA ===
  const handleCameraPress = async () => {
    Alert.alert(
      "Foto de Perfil",
      "¿Qué deseas hacer?",
      [
        {
          text: "Tomar Foto",
          onPress: async () => await launchCamera()
        },
        {
          text: "Elegir de Galería",
          onPress: async () => await launchGallery()
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    const result = await DataRepository.uploadProfileImage(uri);
    setUploading(false);

    if (result.success) {
      await refreshUser(); // Actualizar para ver la nueva imagen
      Alert.alert("¡Éxito!", "Tu foto de perfil se ha actualizado.");
    } else {
      Alert.alert("Error", result.error || "No se pudo subir la imagen.");
    }
  };

  if (!user) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{flex:1}} />;
  }

  const userImage = resolveImage(user.image);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      {/* Header Fijo */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Información Personal</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* ScrollView que envuelve TODO el contenido desplazable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileImageContainer}>
          {uploading ? (
            <View style={[styles.profileImage, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <Image source={userImage} style={styles.profileImage} />
          )}
          
          {/* Botón de Cámara FUNCIONAL */}
          <TouchableOpacity style={styles.editIconContainer} onPress={handleCameraPress} disabled={uploading}>
             <Feather name="camera" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        {/* Campos de Información */}
        <View style={styles.infoGroup}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{user.nombre || 'Sin nombre'}</Text>
          <View style={styles.separator} />
        </View>

        {user.nickname ? (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Apodo</Text>
            <Text style={styles.value}>{user.nickname}</Text>
            <View style={styles.separator} />
          </View>
        ) : null}

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <Text style={styles.value}>{user.phone || 'No registrado'}</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Dirección</Text>
          <Text style={styles.value}>{user.address || 'Sin dirección registrada'}</Text>
          <View style={styles.separator} />
        </View>

        {user.gender ? (
           <View style={styles.infoGroup}>
             <Text style={styles.label}>Género</Text>
             <Text style={styles.value}>{user.gender}</Text>
             <View style={styles.separator} />
           </View>
        ) : null}
        
        {user.country ? (
           <View style={styles.infoGroup}>
             <Text style={styles.label}>País</Text>
             <Text style={styles.value}>{user.country}</Text>
             <View style={styles.separator} />
           </View>
        ) : null}

        {/* Botón Editar (Navega a la otra pantalla) */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// ESTILOS ORIGINALES CONSERVADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  headerCard: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 5, // Reducido un poco el margen inferior
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
  // Estilo para el contenido del ScrollView
  scrollContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 200 // Espacio extra al final para que no se pegue el botón
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDD',
    resizeMode: 'cover'
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 40, // Aumentado ligeramente para que el icono de cámara se vea mejor
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  value: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCC',
    width: '100%',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});

export default ClientProfileScreen;