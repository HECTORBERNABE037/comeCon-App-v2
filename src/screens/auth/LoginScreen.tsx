import React, { useState } from "react"; // Quitamos useEffect de imports
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
import { StackNavigationProp } from "@react-navigation/stack";
import { LoginFormData, COLORS, FONT_SIZES, RootStackParamList } from "../../../types"; 
import { useForm } from '../../hooks/useForm';
import { validateLogin } from '../../utils/validationRules';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext'; 

const loginImage = require("../../../assets/logoApp.png");

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  
  const { signIn } = useAuth();
  const { formData, errors, updateFormData, validate } = useForm<LoginFormData>(
    { email: "", password: "" },
    validateLogin
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const success = await signIn(formData.email.trim(), formData.password);

      if (success) {
        // Consultamos el rol directamente para navegación rápida
        const user = await DatabaseService.loginUser(formData.email.trim(), formData.password);
        setIsLoading(false);

        if (user?.role === 'administrador') {
          navigation.replace("AdminTabsNavigator");
        } else {
          navigation.replace("ClientTabsNavigator");
        }
      } else {
        setIsLoading(false);
        Alert.alert("Error", "Credenciales incorrectas o usuario no registrado.");
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un problema al intentar iniciar sesión.");
      console.error(error);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <Image source={loginImage} style={styles.logoImage} />
        </View>

        <Text style={styles.title}>ComeCon</Text>
        <Text style={styles.subtitle}>Iniciar Sesión</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo o usuario"
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
            placeholder="Contraseña"
            placeholderTextColor={COLORS.placeholder}
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)} 
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity
            style={[styles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "VERIFICANDO..." : "INICIAR SESION"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={()=>navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkText}>¿Olvidaste la contraseña?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={()=>navigation.navigate('Register')}>
            <Text style={styles.linkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  content: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30 
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 30, 
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  linksContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    marginTop: 15, 
  },
  errorText: {
    color: COLORS.error, 
    fontSize: FONT_SIZES.small,
    marginLeft: 10,
    marginBottom: 10,
  }
});

export default LoginScreen;