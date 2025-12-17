import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Image, 
  StatusBar, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, ClientTabParamList, RootStackParamList } from '../../../types';
import { DataRepository } from '../../services/DataRepository';
import { useAuth } from '../../context/AuthContext';

type ClientOrderTrackingNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'ClientOrderTrackingTab'>,
  StackNavigationProp<RootStackParamList>
>;

// Helper de Imágenes
const resolveImage = (imageSource: string | any) => {
  if (!imageSource) return require('../../../assets/logoApp.png');
  if (typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('file'))) {
    return { uri: imageSource };
  }
  return require('../../../assets/logoApp.png'); 
};

const ClientOrderTrackingScreen = () => {
  const navigation = useNavigation<ClientOrderTrackingNavigationProp>();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar Órdenes del Backend
  const loadOrders = async () => {
    if (!user) return;
    
    try {
      const result = await DataRepository.getOrders();
      
      if (result.success) {
        // ✅ CORRECCIÓN AQUÍ: Usamos (result as any) para evitar el error de TypeScript
        setOrders((result as any).data);
      } else {
        console.log(result.error); 
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageSource = require('../../../assets/logoApp.png'); 

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          {/* <Image source={imageSource} style={styles.cardImage} /> */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Orden #{item.id}</Text>
            <Text style={styles.cardSubtitle}>
              {new Date(item.date).toLocaleDateString()} - {item.delivery_time || item.deliveryTime || 'Por asignar'}
            </Text>
            <Text style={styles.cardPrice}>${item.total}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.itemsSummary}>
           {item.items?.map((prod: any, index: number) => (
             <Text key={index} style={styles.itemText} numberOfLines={1}>
               • {prod.quantity}x {prod.product_details || 'Producto'}
             </Text>
           ))}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente': return '#FF9800'; 
      case 'en proceso': return '#2196F3'; 
      case 'completado': return '#4CAF50'; 
      case 'cancelado': return '#F44336'; 
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <Text style={styles.mainTitle}>Mis Pedidos</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes pedidos realizados.</Text>
          }
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
  cardImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15, resizeMode: 'contain', backgroundColor: '#EEE' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  cardSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 2 },
  cardPrice: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  itemsSummary: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  itemText: { fontSize: 12, color: '#666', marginBottom: 2 }
});

export default ClientOrderTrackingScreen;