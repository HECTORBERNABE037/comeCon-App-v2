import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, Order, AdminTabParamList, RootStackParamList } from '../../../types';
import { OrderActionModal } from '../../components/OrderActionModal';
import DatabaseService from '../../services/DatabaseService';
import { sendLocalNotification } from '../../utils/NotificationHelper'; 
import { useAuth } from '../../context/AuthContext'; 

type OrderTrackingNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'OrderTrackingTab'>,
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

export const OrderTrackingScreen = () => {
  const navigation = useNavigation<OrderTrackingNavigationProp>();
  const { user } = useAuth(); 
  
  const [activeTab, setActiveTab] = useState<'process' | 'history'>('process');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getOrders();
      const formattedData: Order[] = data.map(o => ({
        ...o,
        image: resolveImage(o.image) 
      }));
      setAllOrders(formattedData);
    } catch (error) {
      console.error("Error fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (user?.allowNotifications) {
        await sendLocalNotification(
          "Nueva Orden Recibida 🔔", 
          "Tienes un nuevo pedido pendiente de revisión."
        );
      }
    }, 10000); 

    return () => clearTimeout(timer);
  }, [user]); 

  const filteredOrders = allOrders.filter(order => {
    const activeStatuses = ['En proceso', 'Pendiente'];
    const isProcess = activeStatuses.includes(order.status);
    
    const matchesTab = activeTab === 'process' ? isProcess : !isProcess; 

    const matchesSearch = searchQuery === "" || 
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleOpenActionModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleUpdateOrder = async (orderId: string, data: any) => {
    try {
      await DatabaseService.updateOrderStatus(Number(orderId), data.status, data.comment, data.estimatedTime);
      Alert.alert("Éxito", "Orden actualizada.");
      setIsModalVisible(false);
      setSelectedOrder(null);
      loadOrders(); 
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    Alert.alert("Completar", "¿Marcar como entregada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: async () => {
        try {
          await DatabaseService.updateOrderStatus(Number(orderId), 'completado', 'Completado por Admin', 'Entregado ahora');
          setIsModalVisible(false); setSelectedOrder(null); loadOrders();
        } catch (error) { Alert.alert("Error", "Fallo al completar"); }
      }}
    ]);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Cancelar", "¿Cancelar esta orden?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: 'destructive', onPress: async () => {
        try {
          await DatabaseService.updateOrderStatus(Number(orderId), 'cancelado', 'Cancelado por Admin', 'Cancelado ahora');
          setIsModalVisible(false); setSelectedOrder(null); loadOrders();
        } catch (error) { Alert.alert("Error", "Fallo al cancelar"); }
      }}
    ]);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    if (activeTab === 'process') {
      return (
        <View style={styles.card}>
          <Image source={item.image} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
            <Text style={{fontSize:12, color: COLORS.primary, fontWeight:'bold'}}>{item.status}</Text>
          </View>
          <TouchableOpacity style={styles.cardAction} onPress={() => handleOpenActionModal(item)}>
            <Ionicons name="megaphone-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      );
    } else {
      const isCancelled = item.status === 'cancelado';
      return (
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Image source={item.image} style={styles.historyImage} />
            <View style={styles.historyInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardPriceOrange}>${item.price}</Text>
            </View>
          </View>
          <View style={styles.historyDetails}>
            <Text style={[styles.statusTitle, isCancelled && {color: 'red'}]}>
              {isCancelled ? 'Cancelado' : (item.status === 'completado' ? 'Entregado' : item.status)}
            </Text>
            <Text style={styles.statusTime}>{item.deliveryTime || 'Sin hora registrada'}</Text>
            <View style={styles.separator} />
            <Text style={styles.historyNotes}>{item.historyNotes || 'Sin notas adicionales'}</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8"/>
      <Text style={styles.mainTitle}>Ordenes Recibidas</Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'process' && styles.activeTabBorder]} onPress={() => setActiveTab('process')}>
          <Text style={[styles.tabText, activeTab === 'process' && styles.activeTabText]}>En proceso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'history' && styles.activeTabBorder]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Historial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          placeholder="Buscar orden..." 
          placeholderTextColor="#999" 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={18} color="#999" /></TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>{searchQuery ? 'No se encontraron órdenes.' : (activeTab === 'process' ? 'No hay órdenes pendientes' : 'Historial vacío')}</Text>}
        />
      )}

      <OrderActionModal
        visible={isModalVisible} order={selectedOrder} onClose={() => setIsModalVisible(false)}
        onUpdate={handleUpdateOrder} onComplete={handleCompleteOrder} onCancel={handleCancelOrder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', paddingTop: 10 },
  mainTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: COLORS.text },
  tabsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  tabButton: { marginHorizontal: 20, paddingBottom: 5 },
  activeTabBorder: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.large, fontWeight: '600', color: COLORS.textSecondary },
  activeTabText: { color: COLORS.text },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAEAEA', marginHorizontal: 20, borderRadius: 15, height: 50, marginBottom: 20, paddingHorizontal: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: FONT_SIZES.medium, color: COLORS.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: FONT_SIZES.medium },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  cardSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 5 },
  cardPrice: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.primary },
  cardAction: { padding: 10 },
  historyCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 15, elevation: 2 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  historyImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  historyInfo: { flex: 1, justifyContent: 'center' },
  cardPriceOrange: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
  historyDetails: { paddingLeft: 10 },
  statusTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  statusTime: { fontSize: FONT_SIZES.small, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
  separator: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10, width: '100%' },
  historyNotes: { fontSize: FONT_SIZES.small, color: '#666', fontStyle: 'italic' }
});