import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ProductFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateProductForm } from '../utils/validationRules';
import { showImageOptions } from '../utils/ImagePickerHelper'; // Helper
import { useAuth } from '../context/AuthContext'; // Permiso

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (newProductData: any) => void; 
}

const defaultImage = require('../../assets/logoApp.png');

export const AddProductModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  onSave, 
}) => {
  
  const { user } = useAuth();
  const { formData, errors, updateFormData, validate, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '' },
    validateProductForm
  );
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFormData({ title: '', subtitle: '', price: '', description: '' });
      setImageUri(null);
    }
  }, [visible]);

  const handleSave = () => {
    if (validate()) {
      onSave({ 
        ...formData, 
        image: imageUri || 'logoApp' 
      });
    } else {
      Alert.alert("Error", "Por favor, revisa los campos del formulario.");
    }
  };

  const handleEditImage = () => {
    if (!user?.allowCamera) {
      Alert.alert("Cámara desactivada", "Habilita la cámara en Configuración para usar esta función.");
      return;
    }
    showImageOptions((uri) => {
      setImageUri(uri);
    });
  };

  const displayImage = imageUri ? { uri: imageUri } : defaultImage;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nuevo Producto</Text>
          
          <View style={styles.imageContainer}>
            <Image source={displayImage} style={styles.productImage} />
            <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
              <Feather name="camera" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Nombre del Producto" value={formData.title} onChangeText={(t) => updateFormData('title', t)}/>
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput style={styles.input} placeholder="Subtítulo (Ingredientes)" value={formData.subtitle} onChangeText={(t) => updateFormData('subtitle', t)}/>
          
          <TextInput style={styles.input} placeholder="Precio" value={formData.price} onChangeText={(t) => updateFormData('price', t)} keyboardType="numeric"/>
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

          <View style={styles.descriptionContainer}>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción corta" value={formData.description} onChangeText={(t) => updateFormData('description', t)} multiline maxLength={50}/>
            <Text style={styles.charCounter}>{formData.description.length} / 50</Text>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Ionicons name="close" size={32} color={COLORS.error} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Feather name="check" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: COLORS.background, borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  imageContainer: { position: 'relative', marginBottom: 15 },
  productImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0' },
  editImageButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.white, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', elevation: 4 },
  input: { width: '100%', height: 50, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 15, fontSize: FONT_SIZES.medium, color: COLORS.text, borderBottomWidth: 1, borderColor: COLORS.placeholder, marginBottom: 5 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 15 },
  descriptionContainer: { width: '100%' },
  charCounter: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textAlign: 'right', marginTop: -5 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  actionButton: { padding: 10, borderRadius: 30, backgroundColor: COLORS.surface, width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#4CAF50' },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.small, alignSelf: 'flex-start', marginLeft: 10, marginBottom: 5 },
});