import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Image, 
  StatusBar, 
  ActivityIndicator
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, Order, ClientTabParamList, RootStackParamList } from '../../../types';
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from '../../context/AuthContext';

type ClientOrderTrackingNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'ClientOrderTrackingTab'>,
  StackNavigationProp<RootStackParamList>
>;

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

export const ClientOrderTrackingScreen = () => {
  const navigation = useNavigation<ClientOrderTrackingNavigationProp>();
  const { user } = useAuth();
  
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DatabaseService.getOrdersByUserId(Number(user.id));
      const formattedData: Order[] = data.map(o => ({
        ...o,
        image: resolveImage(o.image) 
      }));
      setMyOrders(formattedData);
    } catch (error) {
      console.error("Error al cargar mis órdenes", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMyOrders();
    }, [user])
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    let statusColor = COLORS.primary;
    let statusText = "En proceso";

    switch (item.status) {
      case 'completado': 
        statusText = "Entregado"; 
        statusColor = '#2E7D32'; 
        break; 
      case 'cancelado': 
        statusText = "Cancelado"; 
        statusColor = '#D50000'; 
        break; 
      case 'En proceso': 
        statusText = "En camino"; 
        statusColor = '#FF9800'; 
        break;   
      case 'Pendiente':
        statusText = "Recibido";
        statusColor = COLORS.textSecondary;
        break;
      default: 
        statusText = item.status; 
        statusColor = COLORS.textSecondary;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={item.image} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Fecha: {item.date}</Text>
          {item.deliveryTime && (
            <Text style={styles.deliveryText}>
              {item.status === 'completado' ? 'Entregado: ' : 'Estimado: '} 
              {item.deliveryTime}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8"/>
      <Text style={styles.mainTitle}>Mis Pedidos</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={myOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no has realizado pedidos.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', paddingTop: 10 },
  mainTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: COLORS.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: FONT_SIZES.medium },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 15, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  cardSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 2 },
  cardPrice: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  dateText: { fontSize: 12, color: '#888' },
  deliveryText: { fontSize: 12, color: COLORS.text, fontWeight: '500' }
});