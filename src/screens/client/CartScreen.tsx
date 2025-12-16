import React, { useCallback, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { COLORS, FONT_SIZES } from '../../../types';

const resolveImage = (imageSource: string | any) => {
  if (!imageSource) return require('../../../assets/logoApp.png');
  if (typeof imageSource === 'string' && imageSource.startsWith('http')) return { uri: imageSource };
  return require('../../../assets/logoApp.png'); // Simplificado para brevedad
};

const CartScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { refreshCart } = useCart(); // Para actualizar badge al borrar
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    const items = await DatabaseService.getCartItems(Number(user.id));
    setCartItems(items);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadCart(); }, []));

  const handleDelete = async (productId: number) => {
    if (!user) return;
    await DatabaseService.removeFromCart(Number(user.id), productId);
    await loadCart();
    await refreshCart(); // Actualiza badge global
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.promotionalPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    // 1. VALIDACIÓN DE INTERNET (Corta el flujo Offline)
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        "Sin Conexión", 
        "Necesitas internet para procesar el pago. Tu carrito está guardado."
      );
      return;
    }

    // 2. Si hay internet -> Ir a Checkout
    navigation.navigate('Checkout', { 
      items: cartItems, 
      total: calculateTotal() 
    });
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Carrito</Text>
      
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.cartItemId.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>El carrito está vacío ☹️</Text>}
        renderItem={({ item }) => {
            const price = item.promotionalPrice || item.price;
            return (
              <View style={styles.itemCard}>
                <Image source={resolveImage(item.image)} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPrice}>${price} x {item.quantity}</Text>
                  <Text style={styles.itemSubtotal}>Sub: ${price * item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            );
        }}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>PAGAR AHORA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 18 },
  itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  itemTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
  itemPrice: { color: '#666' },
  itemSubtotal: { fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  footer: { marginTop: 20, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 20, fontWeight: 'bold' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  checkoutButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default CartScreen;