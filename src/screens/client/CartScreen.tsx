import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, StatusBar, Alert, ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, RootStackParamList, CartItem } from '../../../types';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<RootStackParamList, 'Cart'>;

const resolveImage = (imageName: string) => {
  if (imageName?.startsWith('file://')) return { uri: imageName };
  switch (imageName) {
    case 'bowlFrutas': return require('../../../assets/bowlFrutas.png');
    case 'tostadaAguacate': return require('../../../assets/tostadaAguacate.png');
    case 'Panques': return require('../../../assets/Panques.png');
    case 'cafePanda': return require('../../../assets/cafePanda.png');
    default: return require('../../../assets/logoApp.png'); 
  }
};

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await DatabaseService.getCartItems(Number(user.id));
      setCartItems(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [user])
  );

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleIncrement = async (id: string, currentQty: number) => {
    await DatabaseService.updateCartQuantity(Number(id), currentQty + 1);
    loadCart(); 
  };

  const handleDecrement = async (id: string, currentQty: number) => {
    if (currentQty > 1) {
      await DatabaseService.updateCartQuantity(Number(id), currentQty - 1);
      loadCart();
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert("Eliminar", "¿Quitar producto del carrito?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: async () => {
          await DatabaseService.removeFromCart(Number(id));
          loadCart();
      }}
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={resolveImage(item.image)} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => handleRemove(item.id.toString())} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={20} color="#D50000" />
        </TouchableOpacity>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => handleDecrement(item.id.toString(), item.quantity)} style={styles.qtyBtn}>
            <Feather name="minus" size={16} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncrement(item.id.toString(), item.quantity)} style={styles.qtyBtn}>
            <Feather name="plus" size={16} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}}/> : (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="shopping-cart" size={60} color="#CCC" />
              <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            </View>
          }
        />
      )}

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>PAGAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row',paddingTop: Platform.OS === 'android' ? 40 : 20 ,alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: FONT_SIZES.medium, color: COLORS.textSecondary },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  image: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  infoContainer: { flex: 1 },
  title: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 5 },
  price: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary },
  actionsContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 70 },
  removeButton: { padding: 5 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 15, padding: 5 },
  qtyBtn: { width: 25, height: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12.5, elevation: 1 },
  qtyText: { marginHorizontal: 10, fontWeight: 'bold', fontSize: FONT_SIZES.medium },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  totalLabel: { fontSize: FONT_SIZES.large, color: COLORS.text, fontWeight: '600' },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  checkoutButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  checkoutText: { color: COLORS.white, fontSize: FONT_SIZES.large, fontWeight: 'bold', letterSpacing: 1 },
});