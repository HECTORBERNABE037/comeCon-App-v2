import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ScrollView,
  Alert 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, ProductFormData } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateProductForm } from '../utils/validationRules'; // Asegúrate de que esta validación no falle si falta subtitle
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddProductModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Inicializamos el formulario incluyendo 'category' y 'subtitle'
  const { formData, errors, updateFormData, validate, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '', category: '' },
    validateProductForm
  );

  const handleSave = () => {
    // Validamos campos obligatorios (Título y Precio)
    if (!formData.title || !formData.price) {
      Alert.alert("Faltan datos", "El título y el precio son obligatorios.");
      return;
    }

    const newProduct = {
      ...formData,
      image: imageUri,
      // Si no escribe categoría, ponemos 'General' por defecto
      category: formData.category || 'General', 
      visible: true
    };

    onSave(newProduct);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', price: '', description: '', category: '' });
    setImageUri(null);
  };

  const handleImagePick = () => {
    if (!user?.allowCamera) {
      Alert.alert("Permiso", "Habilita la cámara en configuración.");
      return;
    }
    showImageOptions(setImageUri);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.modalTitle}>Nuevo Producto</Text>

            {/* Selector de Imagen */}
            <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera-outline" size={40} color="#CCC" />
                  <Text style={styles.placeholderText}>Foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Campos del Formulario */}
            <TextInput 
              style={styles.input} 
              placeholder="Nombre del producto *" 
              value={formData.title} 
              onChangeText={(t) => updateFormData('title', t)} 
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="Subtítulo (Ej. 350g / 500ml)" 
              value={formData.subtitle} 
              onChangeText={(t) => updateFormData('subtitle', t)} 
            />

            <TextInput 
              style={styles.input} 
              placeholder="Categoría (Ej. Bebidas, Postres)" 
              value={formData.category} 
              onChangeText={(t) => updateFormData('category', t)} 
            />

            <TextInput 
              style={styles.input} 
              placeholder="Precio ($) *" 
              value={formData.price} 
              onChangeText={(t) => updateFormData('price', t)} 
              keyboardType="numeric" 
            />

            <View style={styles.descriptionContainer}>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Descripción detallada" 
                value={formData.description} 
                onChangeText={(t) => updateFormData('description', t)} 
                multiline 
                maxLength={150}
              />
              <Text style={styles.charCounter}>{formData.description?.length || 0} / 150</Text>
            </View>

            {/* Botones de Acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>CREAR</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxHeight: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  
  imagePicker: { marginBottom: 20 },
  imagePreview: { width: 100, height: 100, borderRadius: 15 },
  placeholderImage: { width: 100, height: 100, borderRadius: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  placeholderText: { color: '#999', marginTop: 5, fontSize: 12 },

  input: { width: '100%', height: 50, backgroundColor: '#F9F9F9', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEE', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  descriptionContainer: { width: '100%' },
  charCounter: { alignSelf: 'flex-end', fontSize: 12, color: '#999', marginTop: -10, marginBottom: 15, marginRight: 5 },

  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10 },
  cancelText: { color: '#777', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  saveText: { color: 'white', fontWeight: 'bold' }
});