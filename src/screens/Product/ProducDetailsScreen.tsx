import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar, Alert, Platform
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, RootStackParamList } from '../../../types';
import { Ionicons, Feather } from '@expo/vector-icons';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { platillo } = route.params;
  const { user } = useAuth(); 

  const activePrice = platillo.promotionalPrice || platillo.price;
  const hasPromo = !!platillo.promotionalPrice;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  useEffect(() => {
    if (platillo.title.includes('Cafe') || platillo.title.includes('Bebida')) {
      setAvailableSizes(['M', 'G']); setSelectedSize('M');
    } else if (platillo.title.includes('Bowl') || platillo.title.includes('Ensalada')) {
      setAvailableSizes(['CH', 'M', 'G']); setSelectedSize('M');
    } else {
      setAvailableSizes(['Único']); setSelectedSize('Único');
    }
  }, [platillo]);

  const handleGoBack = () => navigation.goBack();
  const handleCart = () => navigation.navigate('Cart');

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para comprar.");
      return;
    }

    try {
      // Guardar en SQLite
      await DatabaseService.addToCart(Number(user.id), Number(platillo.id), quantity);
      
      Alert.alert(
        'Añadido al carrito',
        `${quantity}x ${platillo.title} añadido exitosamente.`
      );
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir al carrito.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack}><Ionicons name="arrow-back" size={28} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles</Text>
          <TouchableOpacity onPress={handleCart}>
            <View><Feather name="shopping-cart" size={28} color={COLORS.text} /></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}><Image source={platillo.image} style={styles.image} /></View>
        <View style={styles.floatingQuantityContainer}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(q => Math.max(1, q - 1))}><Ionicons name="remove" size={24} color={COLORS.text} /></TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(q => q + 1)}><Ionicons name="add" size={24} color={COLORS.text} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{platillo.title}</Text>
          <View style={styles.sizesRow}>
            {availableSizes.map((size) => (
              <TouchableOpacity key={size} style={[styles.sizeButton, selectedSize === size ? styles.sizeButtonSelected : styles.sizeButtonUnselected, size === 'Único' && styles.sizeButtonUnique]} onPress={() => setSelectedSize(size)} disabled={size === 'Único'}>
                <Text style={[styles.sizeText, selectedSize === size ? styles.sizeTextSelected : styles.sizeTextUnselected]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.priceRow}>
             {hasPromo && <Text style={styles.oldPriceText}>${platillo.price}</Text>}
             <Text style={[styles.price, hasPromo && { color: '#2E7D32' }]}>${activePrice}</Text>
          </View>
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{platillo.description || "Sin descripción disponible."}</Text>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>añadir al carrito</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerCard: { backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25 },
  headerTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text },
  scrollContent: { paddingBottom: 30 },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#FFF', zIndex: 1 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingQuantityContainer: { alignItems: 'center', marginTop: -25, zIndex: 2, marginBottom: 10 },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, height: 50, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, minWidth: 140, justifyContent: 'space-between' },
  quantityButton: { padding: 5 },
  quantityText: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text, marginHorizontal: 15 },
  infoContainer: { paddingHorizontal: 25, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 15, textAlign: 'left' },
  sizesRow: { flexDirection: 'row', marginBottom: 20 },
  sizeButton: { width: 80, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  sizeButtonSelected: { backgroundColor: '#FF9F43' },
  sizeButtonUnselected: { backgroundColor: '#FAD7A0' },
  sizeButtonUnique: { width: 100, backgroundColor: '#E0E0E0' },
  sizeText: { fontSize: FONT_SIZES.large, fontWeight: 'bold' },
  sizeTextSelected: { color: COLORS.white },
  sizeTextUnselected: { color: COLORS.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#F57C00' },
  oldPriceText: { fontSize: 20, color: COLORS.textSecondary, textDecorationLine: 'line-through', marginRight: 15 },
  descriptionTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  descriptionText: { fontSize: FONT_SIZES.medium, color: '#888', lineHeight: 22, marginBottom: 30 },
  addToCartButton: { width: '100%', height: 60, backgroundColor: COLORS.primary, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 3, marginBottom: 20 },
  addToCartText: { color: COLORS.white, fontSize: FONT_SIZES.large, fontWeight: 'bold', textTransform: 'lowercase' },
  cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#F57C00', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.white },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
});