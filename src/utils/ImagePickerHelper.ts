import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const pickImage = async (useCamera: boolean = false): Promise<string | null> => {
  try {
    // Solicitar permisos
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar fotos.');
        return null;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar imágenes.');
        return null;
      }
    }

    // Abrir Cámara o Galería
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.5,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    }

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;

  } catch (error) {
    console.error("Error al seleccionar imagen:", error);
    return null;
  }
};

export const showImageOptions = (onImageSelected: (uri: string) => void) => {
  Alert.alert(
    "Seleccionar Imagen",
    "¿De dónde quieres obtener la imagen?",
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Galería", 
        onPress: async () => {
          const uri = await pickImage(false);
          if (uri) onImageSelected(uri);
        } 
      },
      { 
        text: "Cámara", 
        onPress: async () => {
          const uri = await pickImage(true);
          if (uri) onImageSelected(uri);
        } 
      },
    ]
  );
};