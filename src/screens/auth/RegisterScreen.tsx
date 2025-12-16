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
  ScrollView,
  ActivityIndicator
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { COLORS, FONT_SIZES, RootStackParamList } from "../../../types";
import { DataRepository } from '../../services/DataRepository'; // <--- NUEVO: Repositorio

const loginImage = require("../../../assets/logoApp.png");

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  
  // LÓGICA NUEVA: Estados simples en lugar de useForm
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    // Validaciones básicas
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios (excepto teléfono)");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    // Llamamos al Repositorio (valida internet automáticamente)
    const result = await DataRepository.register({
      name,
      email,
      phone,
      password // Django se encargará de hashear
    });

    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        "¡Cuenta Creada!", 
        "Tu registro fue exitoso. Inicia sesión para continuar.",
        [{ text: "Ir al Login", onPress: () => navigation.navigate("Login") }]
      );
    } else {
      Alert.alert("Error de Registro", result.error || "No se pudo crear la cuenta.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.logoContainer}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a ComeCon hoy mismo</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono (Opcional)"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
               <ActivityIndicator color={COLORS.white} />
            ) : (
               <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
             <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
             <TouchableOpacity onPress={() => navigation.navigate("Login")}>
               <Text style={styles.loginLink}>Inicia Sesión</Text>
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ESTILOS ORIGINALES RESTAURADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100, // Ajustado para ser un poco más pequeño en registro
    height: 100,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceSecondary,
    alignSelf: 'center',
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
    width: 70, 
    height: 70, 
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
    backgroundColor: COLORS.white, // Fondo blanco tipo tarjeta
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: { 
    height: 55, 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    marginBottom: 15, 
    fontSize: FONT_SIZES.medium, 
    color: COLORS.text,
  },
  registerButton: { 
    backgroundColor: COLORS.primary,
    height: 55, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  registerButtonText: { 
    color: COLORS.white, 
    fontSize: FONT_SIZES.large, 
    fontWeight: "bold" 
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.medium,
  },
});

export default RegisterScreen;