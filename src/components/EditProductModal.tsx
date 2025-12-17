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
  KeyboardAvoidingView, 
  ScrollView,
  Switch 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Platillo, ProductFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateProductForm } from '../utils/validationRules';
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  product: Platillo | null;
  onClose: () => void;
  onSave: (updatedProduct: Platillo) => void;
  onDelete: (id: string) => void;
}

export const EditProductModal: React.FC<Props> = ({ visible, product, onClose, onSave, onDelete }) => {
  
  const { user } = useAuth();
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  
  // Estado local para visibilidad
  const [isVisible, setIsVisible] = useState(true);

  const { formData, errors, updateFormData, validate, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '', category: '' },
    validateProductForm
  );

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        subtitle: product.subtitle || '', // Aquí carga el subtítulo
        price: product.price,
        description: product.description || '',
        category: product.category || 'General' // Aquí carga la categoría
      });
      setIsVisible(!!product.visible);
      setNewImageUri(null);
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    
    // Validación básica (El botón no hace nada si esto falla, por eso agregué Alert)
    if (!formData.title || !formData.price) {
      Alert.alert("Campos requeridos", "Por favor ingresa al menos el Nombre y el Precio.");
      return;
    }

    const updatedProduct: Platillo = {
      ...product,
      title: formData.title,
      subtitle: formData.subtitle,
      price: formData.price,
      description: formData.description,
      category: formData.category,
      visible: isVisible, // Enviamos el estado del Switch
      image: newImageUri || product.image 
    };

    // Llamamos a la función del padre
    onSave(updatedProduct);
  };

  const handleDelete = () => {
    if (product) onDelete(product.id.toString());
  };

  const handleImagePick = () => {
    if (!user?.allowCamera) {
      Alert.alert("Permiso", "Habilita la cámara en configuración.");
      return;
    }
    showImageOptions(setNewImageUri);
  };

  const displayImage = newImageUri ? { uri: newImageUri } : product?.image;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Editar Producto</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#999" /></TouchableOpacity>
            </View>

            {/* IMAGEN */}
            <View style={styles.imageContainer}>
              <Image source={displayImage} style={styles.productImage} />
              {/* Badge de Oculto sobre la imagen */}
              {!isVisible && (
                <View style={styles.hiddenBadge}>
                  <Text style={styles.hiddenText}>OCULTO</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editImageButton} onPress={handleImagePick}>
                <Feather name="camera" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* SWITCH VISIBILIDAD */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Visible para clientes</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.primary }}
                thumbColor={isVisible ? "#fff" : "#f4f3f4"}
                onValueChange={setIsVisible}
                value={isVisible}
              />
            </View>

            {/* FORMULARIO */}
            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={styles.input} 
              value={formData.title} 
              onChangeText={(t) => updateFormData('title', t)} 
            />

            <Text style={styles.label}>Subtítulo</Text>
            <TextInput 
              style={styles.input} 
              value={formData.subtitle} 
              onChangeText={(t) => updateFormData('subtitle', t)}
              placeholder="Ej. 350g"
            />

            <View style={styles.rowContainer}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Precio ($)</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.price} 
                  onChangeText={(t) => updateFormData('price', t)} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Categoría</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.category} 
                  onChangeText={(t) => updateFormData('category', t)} 
                  placeholder="General"
                />
              </View>
            </View>

            <Text style={styles.label}>Descripción</Text>
            <View style={styles.descriptionContainer}>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.description} 
                onChangeText={(t) => updateFormData('description', t)} 
                multiline 
                maxLength={200}
              />
              <Text style={styles.charCounter}>{formData.description?.length || 0} / 200</Text>
            </View>

            {/* BOTONES */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#D32F2F" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>GUARDAR CAMBIOS</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  
  imageContainer: { position: 'relative', marginBottom: 15, alignItems: 'center', justifyContent: 'center' },
  productImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE' },
  editImageButton: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: COLORS.white, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', elevation: 4 },
  hiddenBadge: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  hiddenText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15, paddingHorizontal: 5 },
  
  label: { alignSelf: 'flex-start', color: '#666', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  input: { width: '100%', height: 50, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 15, fontSize: FONT_SIZES.medium, color: COLORS.text, borderBottomWidth: 1, borderColor: '#E0E0E0', marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 15 },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  descriptionContainer: { width: '100%' },
  charCounter: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textAlign: 'right', marginTop: -10, marginBottom: 20 },
  
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  deleteButton: { width: 50, height: 55, borderRadius: 12, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  saveButton: { flex: 1, height: 55, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});