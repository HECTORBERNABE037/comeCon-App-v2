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
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, COLORS, FONT_SIZES, ClientProfileFormData } from '../../../types';
import { DataRepository } from '../../services/DataRepository'; // <--- Usamos Repositorio
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'EditClientProfile'>;

const EditClientProfileScreen: React.FC<Props> = ({ navigation }) => {
  
  const { user, refreshUser } = useAuth(); 
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<ClientProfileFormData>({
    fullName: '',
    nickname: '',
    email: '',
    phone: '',
    gender: '',
    country: '',
    address: ''
  });

  // Cargar datos actuales del usuario al abrir
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.nombre || '',
        nickname: user.nickname || '',
        email: user.email || '', // Email suele ser solo lectura
        phone: user.phone || '',
        gender: user.gender || '',
        country: user.country || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (key: keyof ClientProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Preparamos payload para Django (snake_case si es necesario, pero ApiService/Serializer lo manejan)
      // Nota: Tu UserSerializer en Django espera 'name', 'phone', etc.
      const payload = {
        name: formData.fullName,
        nickname: formData.nickname,
        phone: formData.phone,
        gender: formData.gender,
        country: formData.country,
        address: formData.address
        // No enviamos email porque es el identificador único y suele ser inmutable
      };

      const result = await DataRepository.updateProfile(payload);

      if (result.success) {
        await refreshUser(); // Recargar datos en la app
        Alert.alert("¡Éxito!", "Perfil actualizado correctamente.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo actualizar.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(t) => handleChange('fullName', t)}
              placeholder="Tu nombre"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apodo (Nickname)</Text>
            <TextInput
              style={styles.input}
              value={formData.nickname}
              onChangeText={(t) => handleChange('nickname', t)}
              placeholder="Cómo te dicen"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.email}
              editable={false} // Bloqueado
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(t) => handleChange('phone', t)}
              keyboardType="phone-pad"
              placeholder="Tu número"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Género</Text>
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(t) => handleChange('gender', t)}
                placeholder="Ej. M/F"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>País</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(t) => handleChange('country', t)}
                placeholder="México"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección de Entrega</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
              value={formData.address}
              onChangeText={(t) => handleChange('address', t)}
              placeholder="Calle, Número, Colonia..."
              multiline
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text },
  scrollContent: { padding: 25, paddingBottom: 50 },
  sectionTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: FONT_SIZES.medium, color: COLORS.text, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: COLORS.white, borderRadius: 10, height: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E0E0E0', fontSize: FONT_SIZES.medium, color: COLORS.text },
  readOnlyInput: { backgroundColor: '#EAEAEA', color: COLORS.textSecondary },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  saveButtonText: { color: COLORS.white, fontSize: FONT_SIZES.large, fontWeight: 'bold' }
});

export default EditClientProfileScreen;