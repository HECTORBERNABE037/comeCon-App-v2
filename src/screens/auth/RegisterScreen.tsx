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
  StatusBar,
  ScrollView 
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RegisterFormData, COLORS, FONT_SIZES,RootStackParamList } from "../../../types";
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../../hooks/useForm';
import { validateRegister } from '../../utils/validationRules';
import DatabaseService from '../../services/DatabaseService';

const loginImage = require("../../../assets/logoApp.png");

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  
  const { formData, errors, updateFormData, validate } = useForm<RegisterFormData>(
    { name: "", email: "", phone: "", password: "", confirmPassword: "" },
    validateRegister 
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    // Validar el formulario 
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Intentar registrar en SQLite
      const success = await DatabaseService.registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setIsLoading(false);

      if (success) {
        Alert.alert(
          "Registro Exitoso",
          "Tu cuenta ha sido creada. Ahora inicia sesión.",
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert("Error", "El correo ya está registrado o hubo un problema.");
      }

    } catch (error) {
      setIsLoading(false);
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
        <Ionicons name="arrow-back" size={28} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.logoContainer}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.title}>ComeCon</Text>
        <Text style={styles.subtitle}>Crear una cuenta</Text>

        <View style={styles.formContainer}>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            placeholderTextColor={COLORS.placeholder}
            value={formData.name}
            onChangeText={(text) => updateFormData("name", text)}
            autoCapitalize="words"
            editable={!isLoading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor={COLORS.placeholder}
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor={COLORS.placeholder}
            value={formData.phone}
            onChangeText={(text) => updateFormData("phone", text)}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!isLoading}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.placeholder}
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor={COLORS.placeholder}
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData("confirmPassword", text)}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          
          <TouchableOpacity
            style={[styles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "REGISTRANDO..." : "REGISTRARSE"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30,
    paddingVertical: 40
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60, // Ajustado para no chocar con statusbar
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    width: 150, // Un poco más pequeño para dar espacio al form
    height: 150,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoImage: { 
    width: 100, 
    height: 100, 
    resizeMode: 'contain'
  },
  title: { 
    fontSize: FONT_SIZES.xxlarge, 
    fontWeight: "bold", 
    color: COLORS.primary, 
    textAlign: "center", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: FONT_SIZES.large, 
    color: COLORS.textSecondary, 
    textAlign: "center", 
    marginBottom: 25
  },
  formContainer: { 
    width: "100%", 
  },
  input: { 
    height: 55, 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    marginBottom: 5, 
    fontSize: FONT_SIZES.medium, 
    color: COLORS.text,
    borderWidth: 0, 
  },
  loginButton: { 
    backgroundColor: COLORS.primary, 
    height: 55, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 20,
    elevation: 3,
  },
  loginButtonText: { 
    color: COLORS.white, 
    fontSize: FONT_SIZES.medium, 
    fontWeight: "bold" 
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    marginLeft: 10,
    marginBottom: 10,
  }
});

export default RegisterScreen;