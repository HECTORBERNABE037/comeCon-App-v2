import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';

// Importaciones internas
import { ForgotPasswordFormData, COLORS, FONT_SIZES,RootStackParamList } from "../../../types";
import { useForm } from '../../hooks/useForm';
import { validateForgotPassword } from '../../utils/validationRules';
import DatabaseService from '../../services/DatabaseService';

// Imagen
const loginImage = require("../../../assets/logoApp.png");

// Tipos de navegación
type Props = StackScreenProps<RootStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  
  const { formData, errors, updateFormData, validate } = useForm<ForgotPasswordFormData>(
    { emailOrPhone: "" },
    validateForgotPassword
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendCode = async (): Promise<void> => {
    // Validación de formato
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Verificar existencia en SQLite 
      const userExists = await DatabaseService.checkUserExists(formData.emailOrPhone.trim());

      setIsLoading(false);

      if (userExists) {
        console.log(`[Simulación] Código enviado a: ${formData.emailOrPhone}`);
        
        Alert.alert(
          "Código Enviado",
          "Se ha enviado un código de verificación. (Código simulado: 1234)",
          [
            { 
              text: "Continuar", 
              onPress: () => navigation.navigate('ResetCode', { emailOrPhone: formData.emailOrPhone })
            }
          ]
        );
      } else {
        Alert.alert(
          "Usuario no encontrado", 
          "No existe ninguna cuenta registrada con este correo o teléfono. Verifica tus datos o regístrate."
        );
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un problema al verificar la cuenta.");
      console.error("Error en ForgotPassword:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      {/* Botón Regresar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
      </TouchableOpacity>
      
      {/* Botón Ir a Registro */}
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Crear cuenta</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        
        <View style={styles.logoCard}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.appTitle}>ComeCon</Text>
        <Text style={styles.screenTitle}>Recuperar Contraseña</Text>
        <Text style={styles.infoText}>
          Ingresa tu correo o teléfono vinculado a tu cuenta para recibir un código de verificación.
        </Text>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Correo o Teléfono"
              placeholderTextColor="#999"
              value={formData.emailOrPhone}
              onChangeText={(text) => updateFormData("emailOrPhone", text)}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.emailOrPhone && <Text style={styles.errorText}>{errors.emailOrPhone}</Text>}
          
          <TouchableOpacity
            style={[styles.actionButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? "VERIFICANDO..." : "ENVIAR CÓDIGO"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F2', 
  },
  content: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30,
    marginTop: -20
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 20,
    zIndex: 10,
  },
  registerButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    right: 20,
    zIndex: 10,
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 35, 
    backgroundColor: '#E0E0E0', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: { 
    width: 90, 
    height: 90, 
    resizeMode: 'contain'
  },
  appTitle: { 
    fontSize: FONT_SIZES.xlarge, 
    fontWeight: "bold", 
    color: COLORS.primary,
    textAlign: "center", 
    marginBottom: 5 
  },
  screenTitle: { 
    fontSize: FONT_SIZES.medium, 
    color: '#A0A0A0',
    textAlign: "center", 
    marginBottom: 10 
  },
  infoText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  formContainer: { 
    width: "100%", 
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: COLORS.surface, 
    borderRadius: 12,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  input: { 
    height: 55, 
    paddingHorizontal: 20, 
    fontSize: FONT_SIZES.medium, 
    color: COLORS.text,
  },
  actionButton: { 
    backgroundColor: COLORS.primary, 
    height: 55, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 20,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionButtonText: { 
    color: COLORS.white, 
    fontSize: FONT_SIZES.medium, 
    fontWeight: "bold",
    textTransform: 'uppercase'
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
  }
});

export default ForgotPasswordScreen;