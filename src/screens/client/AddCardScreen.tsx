import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, RootStackParamList, CardFormData } from '../../../types';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';
import { DataRepository } from '../../services/DataRepository';

type Props = StackScreenProps<RootStackParamList, 'AddCard'>;

const AddCardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CardFormData>({
    number: '', expiryDate: '', cvv: '', country: '', holderName: ''
  });

  const handleSave = async () => {
    if (formData.number.length < 16 || !formData.holderName || !formData.cvv || !user) {
      Alert.alert("Error", "Por favor completa los datos correctamente.");
      return;
    }

    setLoading(true);
    try {
      // ENVIAR A DJANGO
      const result = await DataRepository.addCard({
        user: Number(user.id), // Enviamos ID de usuario
        last_four: formData.number.slice(-4), // Django suele guardar solo últimos 4 por seguridad, o guarda todo encriptado
        holder_name: formData.holderName,
        expiry_date: formData.expiryDate, // Asegúrate del formato YYYY-MM-DD
        type: 'visa' // Detectar tipo real si puedes
      });
      
      if (result.success) {
        Alert.alert("Éxito", "Tarjeta guardada en tu cuenta.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo guardar.");
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
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Tarjeta</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Card Preview Visual */}
          <View style={styles.cardPreview}>
            <View style={styles.cardChip} />
            <Text style={styles.cardNumberPreview}>
              {formData.number ? formData.number.match(/.{1,4}/g)?.join(' ') : '**** **** **** ****'}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardNamePreview}>{formData.holderName.toUpperCase() || 'NOMBRE TITULAR'}</Text>
              <Ionicons name="card" size={30} color="white" />
            </View>
          </View>
          
          <Text style={styles.label}>Número de Tarjeta</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0000 0000 0000 0000" 
            keyboardType="numeric" 
            maxLength={16}
            value={formData.number}
            onChangeText={t => setFormData({...formData, number: t})}
          />

          <View style={styles.row}>
            <View style={{flex:1, marginRight:10}}>
              <Text style={styles.label}>Expiración</Text>
              <TextInput 
                style={styles.input} 
                placeholder="MM/YY" 
                maxLength={5}
                value={formData.expiryDate}
                onChangeText={t => setFormData({...formData, expiryDate: t})}
              />
            </View>
            <View style={{flex:1, marginLeft:10}}>
              <Text style={styles.label}>CVV</Text>
              <TextInput 
                style={styles.input} 
                placeholder="123" 
                keyboardType="numeric" 
                maxLength={4}
                secureTextEntry
                value={formData.cvv}
                onChangeText={t => setFormData({...formData, cvv: t})}
              />
            </View>
          </View>

          <Text style={styles.label}>Nombre del Titular</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Como aparece en la tarjeta"
            value={formData.holderName}
            onChangeText={t => setFormData({...formData, holderName: t})}
          />

          <TouchableOpacity 
            style={[styles.saveButton, loading && {opacity: 0.7}]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>{loading ? 'GUARDANDO...' : 'GUARDAR TARJETA'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold' },
  content: { padding: 20 },
  
  cardPreview: { backgroundColor: '#1A237E', borderRadius: 15, height: 180, padding: 20, justifyContent: 'space-between', marginBottom: 30, elevation: 5 },
  cardChip: { width: 40, height: 30, backgroundColor: '#FFD700', borderRadius: 5 },
  cardNumberPreview: { color: 'white', fontSize: 22, letterSpacing: 2, textAlign: 'center' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardNamePreview: { color: '#EEE', fontSize: 14, fontWeight: 'bold' },

  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: 'white', height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default AddCardScreen;