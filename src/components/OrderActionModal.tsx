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
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Order, OrderFormData, COLORS, FONT_SIZES } from '../../types';
import { useForm } from '../hooks/useForm';
import { validateOrderForm } from '../utils/validationRules';

interface Props {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdate: (orderId: string, data: OrderFormData) => void;
  onComplete: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

export const OrderActionModal: React.FC<Props> = ({ 
  visible, 
  order, 
  onClose, 
  onUpdate, 
  onComplete, 
  onCancel 
}) => {
  
  const { formData, errors, updateFormData, validate, setFormData } = useForm<OrderFormData>(
    { status: '', estimatedTime: '', comment: '' },
    validateOrderForm
  );

  useEffect(() => {
    if (order && visible) {
      setFormData({
        status: order.status, 
        estimatedTime: order.deliveryTime || '7:30pm',
        comment: order.historyNotes || ''
      });
    }
  }, [order, visible]);

  const handleSave = () => {
    if (validate() && order) {
      onUpdate(order.id.toString(), formData);
    } else {
      Alert.alert("Atención", "Revisa los campos requeridos.");
    }
  };

  const handleCompleteAction = () => {
    if(order) onComplete(order.id.toString());
  };

  const handleCancelAction = () => {
    if(order) onCancel(order.id.toString());
  };

  if (!order) return null;

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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.modalTitle}>Acciones de Orden</Text>
            
            {/* Cabecera con Imagen */}
            <View style={styles.headerContent}>
              <Text style={styles.productTitle}>{order.title}</Text>
              <Image source={order.image} style={styles.productImage} />
            </View>

            {/* Input Estatus */}
            <Text style={styles.label}>Estatus</Text>
            <TextInput
              style={styles.input}
              value={formData.status}
              onChangeText={(text) => updateFormData('status', text)}
              placeholder="ej. En proceso"
            />
            {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

            {/* Input Hora Estimada */}
            <Text style={styles.label}>Hora Estimada / Entrega</Text>
            <TextInput
              style={styles.input}
              value={formData.estimatedTime}
              onChangeText={(text) => updateFormData('estimatedTime', text)}
              placeholder="ej. 7:30pm"
            />
            {errors.estimatedTime && <Text style={styles.errorText}>{errors.estimatedTime}</Text>}

            {/* Input Comentario (TextArea) */}
            <Text style={styles.label}>Comentario (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.comment}
              onChangeText={(text) => updateFormData('comment', text)}
              placeholder="Notas internas..."
              multiline
              textAlignVertical="top"
              maxLength={100}
            />
            <Text style={styles.charCounter}>{formData.comment.length} / 100</Text>
            {errors.comment && <Text style={styles.errorText}>{errors.comment}</Text>}

            {/* Botones de Acción (Iconos) */}
            <View style={styles.footerIcons}>
              
              {/* Botón Completar (Bolsa con check) */}
              <TouchableOpacity style={styles.iconButton} onPress={handleCompleteAction}>
                 <MaterialCommunityIcons name="shopping-outline" size={32} color={COLORS.text} />
                 <View style={styles.miniCheckBadge}>
                    <Ionicons name="checkmark" size={12} color="white" />
                 </View>
              </TouchableOpacity>

              {/* Botón Guardar (Check Verde en Cuadro) */}
              <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                <View style={styles.greenCheckBox}>
                   <Feather name="check" size={28} color="#00C853" />
                </View>
              </TouchableOpacity>

              {/* Botón Cancelar (Bolsa Roja con X) */}
              <TouchableOpacity style={styles.iconButton} onPress={handleCancelAction}>
                 <MaterialCommunityIcons name="shopping-outline" size={32} color="#D50000" />
                 <View style={styles.miniCancelBadge}>
                    <Ionicons name="close" size={12} color="white" />
                 </View>
              </TouchableOpacity>

            </View>

          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close-circle-outline" size={30} color="#ccc" />
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  productTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
  },
  charCounter: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.small,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  footerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  greenCheckBox: {
    borderWidth: 2,
    borderColor: '#00C853',
    borderRadius: 10,
    padding: 5,
  },
  miniCheckBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.text, 
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCancelBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#D50000', 
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
});