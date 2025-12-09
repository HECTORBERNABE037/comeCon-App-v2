import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, CardFormData,RootStackParamList } from '../../../types';
import { useForm } from '../../hooks/useForm';
import { validateCardForm } from '../../utils/validationRules';

type Props = StackScreenProps<RootStackParamList, 'AddCard'>;

export const AddCardScreen: React.FC<Props> = ({ navigation }) => {
  
  const { formData, errors, updateFormData, validate } = useForm<CardFormData>(
    { number: '', expiryDate: '', cvv: '', country: '', holderName: '' },
    validateCardForm
  );

  const handleAddCard = () => {
    if (validate()) {
      // Simular guardado
      console.log("Nueva tarjeta:", formData);
      Alert.alert("Éxito", "Tarjeta agregada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      {/* Header Estilo Tarjeta */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pago</Text>
          <View style={{width: 28}} /> 
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Agregar Tarjeta</Text>

          {/* Número de Tarjeta */}
          <Text style={styles.label}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            value={formData.number}
            onChangeText={(text) => updateFormData('number', text)}
            keyboardType="number-pad"
            placeholder="XXXX XXXX XXXX XXXX"
          />
          {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}

          {/* Fila: Fecha y CVV (CORREGIDO) */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              {/* Contenedor de altura fija para alinear */}
              <View style={styles.fixedLabelContainer}>
                <Text style={styles.labelNoMargin}>Fecha de vencimiento</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.expiryDate}
                onChangeText={(text) => updateFormData('expiryDate', text)}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>
            
            <View style={[styles.halfInputContainer, { marginLeft: 15 }]}>
              {/* Contenedor de altura fija para alinear */}
              <View style={styles.fixedLabelContainer}>
                <Text style={styles.labelNoMargin}>CVV</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.cvv}
                onChangeText={(text) => updateFormData('cvv', text)}
                keyboardType="number-pad"
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          {/* Divisa */}
          <Text style={styles.label}>Divisa de la tarjeta</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(text) => updateFormData('country', text)}
            placeholder="ej. Mexico"
          />
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

          {/* Nombre Opcional */}
          <Text style={styles.label}>Nombre (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={formData.holderName}
            onChangeText={(text) => updateFormData('holderName', text)}
            placeholder="ej. Tarjeta de trabajo"
          />

          {/* Botón Agregar */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
            <Text style={styles.addButtonText}>Agregar Tarjeta</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  // Nuevo estilo sin margen inferior porque lo maneja el contenedor fijo
  labelNoMargin: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  // Contenedor clave para la alineación
  fixedLabelContainer: {
    height: 45, // Altura suficiente para 2 líneas de texto
    justifyContent: 'flex-end', // Alinea el texto al fondo, pegado al input
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInputContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  }
});