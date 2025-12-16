import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Image,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions
} from "react-native";
import { useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"; 
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";

import { RootStackParamList, ClientTabParamList, COLORS, FONT_SIZES } from "../../../types";
import { DataRepository } from '../../services/DataRepository';
import DatabaseService from '../../services/DatabaseService'; 
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'HomeClientTab'>,
  StackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');

// Helper de Imágenes
const resolveImage = (imageSource: string | any) => {
  if (!imageSource) return require('../../../assets/logoApp.png');
  if (typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('file://'))) {
    return { uri: imageSource };
  }
  // Fallbacks locales
  switch (imageSource) {
    case 'bowlFrutas': return require('../../../assets/bowlFrutas.png');
    case 'tostadaAguacate': return require('../../../assets/tostadaAguacate.png');
    case 'Panques': return require('../../../assets/Panques.png');
    case 'cafePanda': return require('../../../assets/cafePanda.png');
    default: return require('../../../assets/logoApp.png');
  }
};

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const { user } = useAuth();
  const { cartCount } = useCart();

  
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]); // Estado para el carrusel
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    if (!refreshing) setLoading(true);
    try {
      // 1. Traer Productos (Esto dispara el sync interno en DataRepository)
      const prodData = await DataRepository.getProducts();
      
      // 2. Traer Promociones (Desde SQLite, ya que syncProducts las llenó)
      const promoData = await DatabaseService.getPromotionsWithProduct();

      setProducts(prodData);
      setFilteredProducts(prodData);
      setPromotions(promoData);

    } catch (error) {
      console.error("Error cargando home:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text) {
      setFilteredProducts(products);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(lower) || 
      (p.description && p.description.toLowerCase().includes(lower))
    );
    setFilteredProducts(filtered);
  };

  // Render del Item de Producto (Lista Vertical)
  const renderProductItem = ({ item }: { item: any }) => {
    const imageSource = resolveImage(item.image);
    // Lógica reactiva: Si promotionalPrice existe y es mayor a 0, hay promo
    const hasPromo = item.promotionalPrice && item.promotionalPrice > 0;
    
    return (
      <TouchableOpacity 
        style={styles.menuCard}
        onPress={() => navigation.navigate('ProductDetails', { platillo: item })}
      >
        <Image source={imageSource} style={styles.menuImage} />
        
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.priceRow}>
            {/* Si hay promo, mostramos precio viejo tachado */}
            {hasPromo && (
               <Text style={styles.oldPrice}>${item.price}</Text>
            )}
            <Text style={[styles.menuPrice, hasPromo && { color: '#2E7D32' }]}>
              ${hasPromo ? item.promotionalPrice : item.price}
            </Text>
          </View>
        </View>

        <View style={[styles.addButton, hasPromo && { backgroundColor: '#2E7D32' }]}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render del Item de Promoción (Carrusel Horizontal)
  const renderPromoItem = ({ item }: { item: any }) => {
    const imageSource = resolveImage(item.image);
    return (
      <TouchableOpacity 
        style={styles.promoCard}
        activeOpacity={0.9}
        // NAVEGACIÓN: Pasamos el objeto 'product' que viene dentro de la promo
        onPress={() => navigation.navigate('ProductDetails', { platillo: item.product })}
      >
        <Image source={imageSource} style={styles.promoImage} />
        <View style={styles.promoOverlay}>
          <Text style={styles.promoTitle}>{item.description}</Text>
          <View style={styles.priceTagContainer}>
             <Text style={styles.promoPrice}>${item.discountPrice}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre || 'Cliente'} 👋</Text>
          <Text style={styles.subtitle}>¿Tienes hambre?</Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartButton}>
             <Feather name="shopping-cart" size={24} color={COLORS.text} />
             {/* BADGE REACTIVO */}
             {cartCount > 0 && (
               <View style={styles.badge}>
                 <Text style={styles.badgeText}>{cartCount}</Text>
               </View>
             )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          
          {/* SECCIÓN DE PROMOCIONES (Solo si existen) */}
          {promotions.length > 0 && (
            <View style={styles.promoSection}>
              <Text style={styles.sectionTitle}>Promociones del Día </Text>
              <FlatList
                data={promotions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPromoItem}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            </View>
          )}

          {/* LISTA DE PRODUCTOS */}
          <View style={styles.listSection}>
             <Text style={styles.sectionTitle}>Menú</Text>
             <FlatList
               data={filteredProducts}
               keyExtractor={(item) => item.id.toString()}
               renderItem={renderProductItem}
               scrollEnabled={false} // Scroll delegado al ScrollView padre
             />
          </View>

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  greeting: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.medium, color: COLORS.textSecondary },
  cartButton: { padding: 10, backgroundColor: COLORS.white, borderRadius: 12, elevation: 2 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 15, paddingHorizontal: 15, height: 50, marginBottom: 10, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: FONT_SIZES.medium, color: COLORS.text },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginLeft: 20, marginBottom: 10, marginTop: 10 },
  
  // Estilos Promociones
  promoSection: { marginBottom: 15 },
  promoCard: { 
    width: width * 0.75, height: 140, marginRight: 15, borderRadius: 15, overflow: 'hidden', 
    backgroundColor: COLORS.white, elevation: 3, marginBottom: 10 
  },
  promoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  promoOverlay: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  promoTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, flex: 1, marginRight: 10 },
  priceTagContainer: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  promoPrice: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Estilos Productos
  listSection: { paddingBottom: 20 },
  menuCard: { 
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 18, marginBottom: 15, marginHorizontal: 20,
    padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
    alignItems: 'center' 
  },
  menuImage: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#F0F0F0', resizeMode: 'cover' },
  menuInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  menuDescription: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through', marginRight: 8 },
  menuPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  addButton: { width: 35, height: 35, backgroundColor: COLORS.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});

export default HomeScreen;