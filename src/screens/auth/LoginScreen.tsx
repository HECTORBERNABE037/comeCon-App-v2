import React, { useState, useContext } from "react";
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
import { AuthContext } from '../../context/AuthContext'; // <--- NUEVO: Usamos Contexto

const loginImage = require("../../../assets/logoApp.png");

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  
  // LÓGICA NUEVA: Usamos el contexto en lugar de useForm/DatabaseService
  const { login, isLoading } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    // Llamamos al AuthContext (maneja Online/Offline internamente)
    const result = await login({ email, password });

    if (!result.success) {
      Alert.alert('Error', result.error || 'Credenciales incorrectas');
    }
    // Si es exitoso, el AuthContext actualiza el estado 'user' y la App navega sola.
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

        <Text style={styles.title}>ComeCon</Text>
        <Text style={styles.subtitle}>Tu comida favorita, donde estés</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail} // <--- Conectado a estado simple
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword} // <--- Conectado a estado simple
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
               <ActivityIndicator color={COLORS.white} />
            ) : (
               <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Regístrate</Text>
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
    backgroundColor: COLORS.background 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  logoContainer: { 
    alignSelf: "center", 
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoImage: { 
    width: 120, 
    height: 120, 
    resizeMode: 'contain'
  },
  title: { 
    fontSize: FONT_SIZES.xxlarge, 
    fontWeight: "bold", 
    color: COLORS.primary, 
    textAlign: "center", 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: FONT_SIZES.large, 
    color: COLORS.textSecondary, 
    textAlign: "center", 
    marginBottom: 40 
  },
  formContainer: { 
    width: "100%", 
  },
  input: { 
    height: 55, 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    marginBottom: 15, // Ajustado ligeramente para consistencia
    fontSize: FONT_SIZES.medium, 
    color: COLORS.text,
    borderWidth: 0, 
    // Sombra sutil en inputs
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forgotPassword: { 
    alignSelf: "flex-end", 
    marginBottom: 30 
  },
  forgotPasswordText: { 
    color: COLORS.primary, 
    fontSize: FONT_SIZES.small, 
    fontWeight: "600" 
  },
  loginButton: { 
    backgroundColor: COLORS.primary,
    height: 55, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginButtonText: { 
    color: COLORS.white, 
    fontSize: FONT_SIZES.large, 
    fontWeight: "bold" 
  },
  registerContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 10 
  },
  registerText: { 
    color: COLORS.textSecondary, 
    fontSize: FONT_SIZES.medium 
  },
  registerLink: { 
    color: COLORS.primary, 
    fontWeight: "bold", 
    fontSize: FONT_SIZES.medium 
  }
});

export default LoginScreen;