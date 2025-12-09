import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, COLORS, FONT_SIZES, AdminProfileFormData } from '../../../types';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'EditAdminProfile'>;

export const EditAdminProfileScreen: React.FC<Props> = ({ navigation }) => {
  
  const { user, refreshUser } = useAuth(); // Datos del contexto
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<AdminProfileFormData>({
    fullName: '',
    nickname: '',
    email: '',
    phone: '',
    gender: '',
    country: '',
    address: ''
  });

  // Pre-llenar el formulario con los datos actuales del contexto
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.nombre || '',
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.telefono || '',
        gender: user.gender || '',
        country: user.country || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (field: keyof AdminProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    if (!user) return; // Seguridad

    setLoading(true);

    try {
      // 1. Guardar cambios en SQLite usando el email del usuario logueado
      const success = await DatabaseService.updateUserProfile(user.email, formData);
      
      if (success) {
        // 2. IMPORTANTE: Actualizar el contexto global para que el perfil muestre los datos nuevos
        await refreshUser();
        
        Alert.alert("Éxito", "Información actualizada correctamente", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", "No se pudo actualizar el perfil en la base de datos.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema inesperado.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Edita Perfil</Text>
            <View style={styles.headerUnderline} />
        </View>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Editar Información</Text>

        {/* Nombre Completo */}
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
          editable={!loading}
        />

        {/* Nickname */}
        <Text style={styles.label}>Nickname</Text>
        <TextInput
          style={styles.input}
          value={formData.nickname}
          onChangeText={(text) => handleChange('nickname', text)}
          editable={!loading}
        />

        {/* Email (Solo Lectura - Es la llave primaria/login) */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={formData.email}
          editable={false} 
        />

        {/* Telefono */}
        <Text style={styles.label}>Telefono</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          keyboardType="phone-pad"
          editable={!loading}
        />

        {/* Fila: Genero y País */}
        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Genero</Text>
            <TextInput
              style={styles.input}
              value={formData.gender}
              onChangeText={(text) => handleChange('gender', text)}
              editable={!loading}
            />
          </View>
          <View style={[styles.halfInputContainer, { marginLeft: 15 }]}>
            <Text style={styles.label}>País</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => handleChange('country', text)}
              editable={!loading}
            />
          </View>
        </View>

        {/* Direccion */}
        <Text style={styles.label}>Direccion</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          editable={!loading}
        />

        {/* Botón Actualizar */}
        <TouchableOpacity 
          style={[styles.updateButton, loading && {opacity: 0.7}]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={COLORS.white} />
          ) : (
             <Text style={styles.updateButtonText}>ACTUALIZAR</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerUnderline: {
    height: 3,
    backgroundColor: COLORS.primary,
    width: '100%',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  readOnlyInput: {
    backgroundColor: '#EAEAEA', 
    color: COLORS.textSecondary,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  }
});