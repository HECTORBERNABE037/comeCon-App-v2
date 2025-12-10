import React, { useEffect, useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Switch, ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Platillo, PromotionFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validatePromotionForm } from '../utils/validationRules';
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../services/DatabaseService'; 

interface Props {
  visible: boolean;
  product: Platillo | null;
  onClose: () => void;
  onSave: (productId: string, promoData: any) => void;
  onDelete: (productId: string) => void;
}

export const PromoteProductModal: React.FC<Props> = ({ visible, product, onClose, onSave, onDelete }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(true);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const basePrice = product ? parseFloat(product.price) : 0;

  const { formData, errors, updateFormData, validate, setFormData } = useForm<PromotionFormData>(
    { promotionalPrice: '', startDate: '', endDate: '' },
    (data) => validatePromotionForm(data, basePrice)
  );

  useEffect(() => {
    const loadData = async () => {
      if (product && visible) {
        setNewImageUri(null); // Reset
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; 
        const future = new Date();
        future.setDate(now.getDate() + 15);
        const defaultEndDate = future.toISOString().split('T')[0];

        try {
          const existingPromo = await DatabaseService.getPromotionByProductId(Number(product.id));
          if (existingPromo) {
            setFormData({
              promotionalPrice: existingPromo.promotionalPrice.toString(),
              startDate: existingPromo.startDate,
              endDate: existingPromo.endDate
            });
            setIsActive(existingPromo.visible === 1);
          } else {
            setFormData({
              promotionalPrice: '',
              startDate: currentDate,
              endDate: defaultEndDate
            });
            setIsActive(true);
          }
        } catch (error) { console.error(error); }
      }
    };
    loadData();
  }, [product, visible]);

  const handleSave = () => {
    if (validate() && product) {
      onSave(product.id.toString(), { ...formData, visible: isActive, id: product.id });
    } else {
      Alert.alert("Atención", "Revisa el formulario. La oferta debe ser menor a $" + basePrice);
    }
  };

  // const handleEditImage = () => {
  //   if (!user?.allowCamera) {
  //     Alert.alert("Cámara desactivada", "Habilita la cámara en Configuración.");
  //     return;
  //   }
  //   showImageOptions(setNewImageUri);
  // };

  if (!product) return null;
  const displayImage = newImageUri ? { uri: newImageUri } : product.image;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalTitle}>Edita tu Promoción</Text>
            <View style={styles.headerContent}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <View style={styles.imageContainer}>
                <Image source={displayImage} style={[styles.productImage, !isActive && { opacity: 0.5 }]} />
                {/* <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
                  <Feather name="edit-2" size={18} color={COLORS.text} />
                </TouchableOpacity> */}
                {!isActive && (<View style={styles.hiddenBadge}><Text style={styles.hiddenText}>OCULTO</Text></View>)}
              </View>
            </View>

            <Text style={styles.label}>Precio normal</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>${basePrice.toFixed(2)}</Text>
            </View>

            <Text style={styles.label}>Precio promocional</Text>
            <TextInput style={styles.input} value={formData.promotionalPrice} onChangeText={(text) => updateFormData('promotionalPrice', text)} keyboardType="numeric" placeholder="Ej. 90.00" />
            {errors.promotionalPrice && <Text style={styles.errorText}>{errors.promotionalPrice}</Text>}

            <Text style={styles.label}>Fecha inicio</Text>
            <TextInput style={styles.input} value={formData.startDate} onChangeText={(t) => updateFormData('startDate', t)} placeholder="YYYY-MM-DD" />
            <Text style={styles.label}>Fecha fin</Text>
            <TextInput style={styles.input} value={formData.endDate} onChangeText={(t) => updateFormData('endDate', t)} placeholder="YYYY-MM-DD" />

            <View style={styles.footerControls}>
              <Switch trackColor={{ false: "#767577", true: COLORS.primary }} thumbColor={"#f4f3f4"} onValueChange={setIsActive} value={isActive} />
              <TouchableOpacity style={styles.actionButton} onPress={handleSave}><View style={styles.iconBorderGreen}><Feather name="check" size={28} color="#00C853" /></View></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(product.id.toString())}><Ionicons name="trash-outline" size={32} color="#D50000" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeTextButton} onPress={onClose}><Text style={styles.closeText}>Cancelar</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxHeight: '85%', backgroundColor: COLORS.white, borderRadius: 25, padding: 20 },
  scrollContent: { alignItems: 'center', paddingBottom: 20 },
  modalTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  headerContent: { alignItems: 'center', marginBottom: 15 },
  productTitle: { fontSize: FONT_SIZES.large, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  imageContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  productImage: { width: 100, height: 100, borderRadius: 50 },
  editImageButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.white, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', elevation: 4 },
  hiddenBadge: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  hiddenText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  label: { alignSelf: 'flex-start', fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text, marginBottom: 5, marginTop: 10 },
  inputContainer: { width: '100%', height: 50, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 15 },
  input: { width: '100%', height: 50, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 15, fontSize: FONT_SIZES.medium, color: COLORS.text },
  readOnlyInput: { backgroundColor: '#EEEEEE' },
  readOnlyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.medium },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.small, alignSelf: 'flex-start', marginTop: 2 },
  footerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 30, paddingHorizontal: 20 },
  actionButton: { padding: 5 },
  iconBorderGreen: { borderWidth: 2, borderColor: '#00C853', borderRadius: 8, padding: 2 },
  closeTextButton: { marginTop: 20 },
  closeText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.medium, textDecorationLine: 'underline' }
});