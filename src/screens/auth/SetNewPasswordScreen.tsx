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
import { SetNewPasswordFormData, COLORS, FONT_SIZES,RootStackParamList } from "../../../types";
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../../hooks/useForm';
import { validateSetNewPassword } from '../../utils/validationRules';

import DatabaseService from '../../services/DatabaseService';

const loginImage = require("../../../assets/logoApp.png");


type Props = StackScreenProps<RootStackParamList, "SetNewPassword">;

export const SetNewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  
  const { emailOrPhone } = route.params;

  const { formData, errors, updateFormData, validate } = useForm<SetNewPasswordFormData>(
    { newPassword: "", confirmPassword: "" },
    validateSetNewPassword
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSetPassword = async (): Promise<void> => {
    // Validar el formulario 
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Actualizar en SQLite
      const success = await DatabaseService.updatePassword(emailOrPhone, formData.newPassword);
      
      setIsLoading(false);

      if (success) {
        Alert.alert(
          "Éxito",
          "Tu contraseña ha sido cambiada correctamente. Por favor, inicia sesión con tu nueva credencial.",
          [
            { 
              text: "Ir al Login", 
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } 
            }
          ]
        );
      } else {
        Alert.alert("Error", "No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      }

    } catch (error) {
      setIsLoading(false);
      console.error(error);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        
        <View style={styles.logoCard}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.appTitle}>ComeCon</Text>
        <Text style={styles.screenTitle}>Restablecer Contraseña</Text>
        
        {/* Mensaje informativo */}
        <Text style={styles.infoText}>
          Crea una nueva contraseña para tu cuenta: <Text style={{fontWeight: 'bold'}}>{emailOrPhone}</Text>
        </Text>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nueva Contraseña"
              placeholderTextColor="#999"
              value={formData.newPassword}
              onChangeText={(text) => updateFormData("newPassword", text)}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
          {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData("confirmPassword", text)}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          
          <TouchableOpacity
            style={[styles.actionButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSetPassword}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? "GUARDANDO..." : "CAMBIAR CONTRASEÑA"}
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
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
  }
});

export default SetNewPasswordScreen;