import React, { useEffect, useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Switch, ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Platillo, PromotionFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validatePromotionForm } from '../utils/validationRules';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../services/DatabaseService'; 

interface Props {
  visible: boolean;
  product: Platillo | null;
  onClose: () => void;
  // ✅ Recibe el ID de la promo como 3er argumento
  onSave: (productId: string, promoData: any, existingPromoId?: number) => void;
  onDelete: (promoId: string) => void;
}

export const PromoteProductModal: React.FC<Props> = ({ visible, product, onClose, onSave, onDelete }) => {
  const { user } = useAuth();
  
  const [isActive, setIsActive] = useState(true);
  const [promoId, setPromoId] = useState<number | undefined>(undefined); // ✅ Estado vital para saber si es edición

  const basePrice = product ? parseFloat(product.price) : 0;

  const { formData, errors, updateFormData, validate, setFormData } = useForm<PromotionFormData>(
    { promotionalPrice: '', startDate: '', endDate: '' },
    (data) => validatePromotionForm(data, basePrice)
  );

  useEffect(() => {
    const loadData = async () => {
      if (product && visible) {
        setPromoId(undefined); // Resetear ID al abrir
        
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; 
        const future = new Date();
        future.setDate(now.getDate() + 3);
        const defaultEndDate = future.toISOString().split('T')[0];

        try {
          // Buscamos si existe promo en BD local
          const existingPromo = await DatabaseService.getPromotionByProductId(Number(product.id));
          
          if (existingPromo) {
            // ✅ ¡LA ENCONTRAMOS! Guardamos su ID
            setPromoId(existingPromo.id);
            setFormData({
              promotionalPrice: existingPromo.discountPrice.toString(),
              startDate: existingPromo.startDate || currentDate,
              endDate: existingPromo.endDate || defaultEndDate
            });
            // Si la columna visible no existe en SQLite promos, asumimos true
            setIsActive(true); 
          } else {
            // Es nueva
            setFormData({
              promotionalPrice: '',
              startDate: currentDate,
              endDate: defaultEndDate
            });
            setIsActive(true);
          }
        } catch (error) { 
          console.error(error); 
        }
      }
    };
    loadData();
  }, [product, visible]);

  const handleSave = () => {
    // Validamos manualmente por seguridad
    if (!formData.promotionalPrice) {
       Alert.alert("Error", "Ingresa un precio.");
       return;
    }

    if (validate() && product) {
      // ✅ PASAMOS EL promoId AL PADRE
      onSave(
        product.id.toString(), 
        { ...formData, visible: isActive }, 
        promoId 
      );
    } else {
      Alert.alert("Atención", "Revisa el formulario.");
    }
  };

  const handleDelete = () => {
    if (promoId) {
      onDelete(promoId.toString());
    } else {
      onClose(); // Si no se ha guardado, solo cerrar
    }
  };

  if (!product) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Gestionar Oferta</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#999" /></TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <View style={styles.imageContainer}>
                <Image source={product.image} style={[styles.productImage, !isActive && { opacity: 0.5 }]} />
                {!isActive && (<View style={styles.hiddenBadge}><Text style={styles.hiddenText}>PAUSADA</Text></View>)}
              </View>
              <Text style={styles.readOnlyText}>Precio normal: ${basePrice.toFixed(2)}</Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.labelSwitch}>Promoción Activa</Text>
              <Switch 
                trackColor={{ false: "#767577", true: COLORS.primary }} 
                thumbColor={isActive ? "#fff" : "#f4f3f4"} 
                onValueChange={setIsActive} 
                value={isActive} 
              />
            </View>

            <Text style={styles.label}>Precio de Oferta</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                value={formData.promotionalPrice} 
                onChangeText={(text) => updateFormData('promotionalPrice', text)} 
                keyboardType="numeric" 
                placeholder="Ej. 90.00" 
              />
            </View>
            {errors.promotionalPrice && <Text style={styles.errorText}>{errors.promotionalPrice}</Text>}

            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Text style={styles.label}>Inicio</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.startDate} 
                  onChangeText={(t) => updateFormData('startDate', t)} 
                  placeholder="YYYY-MM-DD" 
                />
              </View>
              <View style={{width: 15}} /> 
              <View style={styles.dateCol}>
                <Text style={styles.label}>Fin</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.endDate} 
                  onChangeText={(t) => updateFormData('endDate', t)} 
                  placeholder="YYYY-MM-DD" 
                />
              </View>
            </View>

            <View style={styles.footerControls}>
              {/* Botón Borrar solo si existe ID */}
              {promoId && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={24} color="#D32F2F" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>
                  {promoId ? 'ACTUALIZAR' : 'CREAR PROMOCIÓN'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, maxHeight: '90%' },
  scrollContent: { paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  headerContent: { alignItems: 'center', marginBottom: 20 },
  productTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  imageContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  productImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEE' },
  hiddenBadge: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  hiddenText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  readOnlyText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 5 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10 },
  labelSwitch: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, height: 50, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#E0E0E0' },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: -10, marginBottom: 10 },
  dateRow: { flexDirection: 'row', marginBottom: 20 },
  dateCol: { flex: 1 },
  footerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  deleteButton: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  saveButton: { flex: 1, height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});