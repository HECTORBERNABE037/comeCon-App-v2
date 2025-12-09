import React, { useEffect } from 'react';
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
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (newProductData: ProductFormData) => void;
}

// Imagen por defecto para nuevos productos
const defaultImage = require('../../assets/logoApp.png'); // O usa una imagen placeholder específica

export const AddProductModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  onSave, 
}) => {
  
  // Inicializamos el formulario VACÍO
  const { formData, errors, updateFormData, validate, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '' },
    validateProductForm
  );

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setFormData({ title: '', subtitle: '', price: '', description: '' });
    }
  }, [visible]);

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    } else {
      Alert.alert("Error", "Por favor, revisa los campos del formulario.");
    }
  };

  const handleEditImage = () => {
    Alert.alert(
      "Cargar Imagen",
      "Próximamente podrás seleccionar una imagen de tu galería."
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Nuevo Producto</Text>
          
          {/* Imagen Placeholder con botón de edición */}
          <View style={styles.imageContainer}>
            <Image source={defaultImage} style={styles.productImage} />
            <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
              <Feather name="camera" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nombre del Producto"
            placeholderTextColor={COLORS.placeholder}
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Subtítulo (Ingredientes)"
            placeholderTextColor={COLORS.placeholder}
            value={formData.subtitle}
            onChangeText={(text) => updateFormData('subtitle', text)}
          />
          {errors.subtitle && <Text style={styles.errorText}>{errors.subtitle}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Precio"
            placeholderTextColor={COLORS.placeholder}
            value={formData.price}
            onChangeText={(text) => updateFormData('price', text)}
            keyboardType="numeric"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

          <View style={styles.descriptionContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción corta"
              placeholderTextColor={COLORS.placeholder}
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              maxLength={50}
            />
            <Text style={styles.charCounter}>{formData.description.length} / 50</Text>
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/* Botones de Acción */}
          <View style={styles.actionButtonsContainer}>
            {/* Botón Cancelar (X roja) */}
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Ionicons name="close" size={32} color={COLORS.error} />
            </TouchableOpacity>

            {/* Botón Guardar (Check verde) */}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative', 
    marginBottom: 15,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0', // Fondo gris por si la imagen es transparente
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.placeholder,
    marginBottom: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  descriptionContainer: {
    width: '100%',
  },
  charCounter: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: -5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    width: 60, 
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
  },
});