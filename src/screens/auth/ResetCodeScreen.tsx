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
import { ResetCodeFormData, COLORS, FONT_SIZES,RootStackParamList } from "../../../types";
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../../hooks/useForm';
import { validateResetCode } from '../../utils/validationRules';

const loginImage = require("../../../assets/logoApp.png");

type ResetCodeScreenProps = StackScreenProps<RootStackParamList, "ResetCode">;

export const ResetCodeScreen: React.FC<ResetCodeScreenProps> = ({ navigation, route }) => {
  
  const { emailOrPhone } = route.params;

  const { formData, errors, updateFormData, validate } = useForm<ResetCodeFormData>(
    { code: "" },
    validateResetCode
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerifyCode = (): void => {
    if (validate()) {
      setIsLoading(true);
      
      console.log(`Código ingresado: ${formData.code}`);

      setTimeout(() => {
        setIsLoading(false);
        
        // Validación simulada (1234)
        if (formData.code === "1234") {
          Alert.alert("Éxito", "Código verificado correctamente.");
          navigation.navigate('SetNewPassword', { emailOrPhone });
        } else {
          Alert.alert("Error", "El código ingresado no es válido.");
        }
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        
        <View style={styles.logoCard}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.appTitle}>ComeCon</Text>
        <Text style={styles.screenTitle}>Recuperar Contraseña</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.singleInput}
              placeholder="Ingresa el código"
              placeholderTextColor="#999"
              value={formData.code}
              onChangeText={(text) => updateFormData("code", text)}
              keyboardType="number-pad"
              maxLength={4}
              editable={!isLoading}
              textAlign="center" 
            />
          </View>
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
          
          <TouchableOpacity
            style={[styles.actionButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? "VERIFICANDO..." : "ENVIAR CODIGO"}
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
    marginTop: -40 
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
    marginBottom: 40 
  },
  formContainer: { 
    width: "100%", 
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: COLORS.surface, 
    borderRadius: 8, 
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
    elevation: 1,
  },
  singleInput: {
    height: 55,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    paddingHorizontal: 15,
  },
  actionButton: { 
    backgroundColor: COLORS.primary, 
    width: '100%',
    height: 50, 
    borderRadius: 8, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 2,
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
    marginBottom: 15,
    marginTop: -10,
  }
});

export default ResetCodeScreen;