import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Image,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"; 
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MaterialIcons, FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

import { RootStackParamList, ClientTabParamList, COLORS, FONT_SIZES, Platillo } from "../../../types";
import DatabaseService from '../../services/DatabaseService';
import { useAuth } from "../../context/AuthContext";
import { advancedSearch } from "../../utils/searchHelper"; // Importamos el buscador avanzado

// Tipos de Navegación
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'HomeClientTab'>,
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

const HomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const { user } = useAuth();

  const [allProducts, setAllProducts] = useState<Platillo[]>([]);
  const [promotions, setPromotions] = useState<Platillo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0); // Estado para el badge del carrito

  const handleCart = () => navigation.navigate('Cart');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Productos
      const productsFromDB = await DatabaseService.getProducts();
      
      const formattedProducts: Platillo[] = productsFromDB
        .filter(p => p.visible) 
        .map(p => ({
          id: p.id.toString(),
          title: p.title,
          subtitle: p.subtitle,
          price: p.price.toString(),
          description: p.description,
          image: resolveImage(p.image),
          promotionalPrice: p.promotionalPrice ? p.promotionalPrice.toString() : undefined,
          visible: p.visible
        }));

      setAllProducts(formattedProducts);
      setPromotions(formattedProducts.filter(p => p.promotionalPrice));

      // 2. Cargar Contador del Carrito (Reactivo)
      if (user) {
        const cartItems = await DatabaseService.getCartItems(Number(user.id));
        // Sumamos la cantidad de cada item (ej: 2 cafés + 1 pan = 3)
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalItems);
      }

    } catch (error) {
      console.error("Error home:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]) // Se ejecuta al enfocar y si cambia el usuario
  );

  // Filtrado Avanzado
  const filteredProducts = advancedSearch(allProducts, searchQuery, ['title', 'subtitle', 'description']);

  // Tarjeta Horizontal (Promociones)
  const renderPromoCard = ({ item }: { item: Platillo }) => (
    <TouchableOpacity style={styles.promoCard} onPress={() => navigation.navigate('ProductDetails', { platillo: item })}>
      <Image source={item.image} style={styles.promoImage} />
      <View style={styles.promoOverlay}>
        <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.priceTagContainer}>
           <Text style={styles.promoPrice}>${item.promotionalPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Tarjeta Vertical Detallada (Menú General - Estilo Figma)
  const renderPlatilloCard = ({ item }: { item: Platillo }) => {
    const finalPrice = item.promotionalPrice || item.price;
    const isPromo = !!item.promotionalPrice;

    return (
      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ProductDetails', { platillo: item })}>
        {/* Columna Izquierda: Imagen */}
        <Image source={item.image} style={styles.menuImage} />
        
        {/* Columna Derecha: Info */}
        <View style={styles.menuInfo}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
             <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
             <Text style={[styles.menuPrice, isPromo && { color: '#2E7D32' }]}>${finalPrice}</Text>
          </View>
          
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          
          {/* Descripción (máximo 2 líneas) */}
          <Text style={styles.menuDescription} numberOfLines={2}>
            {item.description || "Delicioso platillo preparado con ingredientes frescos."}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* HEADER */}
      <View style={styles.headerCard}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>ComeCon</Text>
          
          <TouchableOpacity onPress={handleCart}>
            <View>
              <Feather name="shopping-cart" size={28} color={COLORS.text} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text> 
                </View>
              )}
            </View>
          </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          
          {/* BUSCADOR */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={22} color={COLORS.placeholder} style={styles.searchIcon} />
              <TextInput 
                placeholder="¿Qué se te antoja hoy?"
                placeholderTextColor={COLORS.placeholder}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* PROMOCIONES (Carrusel Horizontal) */}
          {promotions.length > 0 && !searchQuery && (
            <View style={{marginBottom: 20}}>
              <Text style={styles.sectionTitle}>Promociones</Text>
              <FlatList
                data={promotions}
                renderItem={renderPromoCard}
                keyExtractor={item => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listPadding}
              />
            </View>
          )}

          {/* MENÚ COMPLETO (Lista Vertical) */}
          <Text style={styles.sectionTitle}>Nuestro Menú</Text>
          <View>
            {filteredProducts.map((item) => (
                <View key={item.id.toString()}>
                    {renderPlatilloCard({item})}
                </View>
            ))}
            {filteredProducts.length === 0 && (
                <Text style={styles.emptySearchText}>No encontramos coincidencias para "{searchQuery}"</Text>
            )}
          </View>

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, // Fondo un poco más limpio
  headerCard: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3,
    zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  cartBadge: {
    position: 'absolute', top: -6, right: -6, backgroundColor: '#D32F2F',
    minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.white, paddingHorizontal: 2
  },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  
  contentContainer: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 15 },
  
  // Buscador
  searchContainer: { marginBottom: 20 },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 15, height: 50, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2,
  },
  searchIcon: { paddingLeft: 15 },
  searchInput: { flex: 1, height: 50, paddingLeft: 10, fontSize: 16, color: COLORS.text },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 15, marginLeft: 5 },
  listPadding: { paddingRight: 20 },
  
  // Tarjetas de Promoción (Horizontal)
  promoCard: {
    width: 260, height: 160, marginRight: 15, borderRadius: 20, overflow: 'hidden',
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

  // Tarjetas de Menú (Diseño Figma: Imagen Izq, Datos Der)
  menuCard: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 18, marginBottom: 15,
    padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  menuImage: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#EEE' },
  menuInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1, marginRight: 5 },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' },
  menuPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  menuDescription: { fontSize: 12, color: '#888', lineHeight: 16 },

  emptySearchText: { textAlign: 'center', marginTop: 30, color: '#999', fontSize: 16 }
});

export default HomeScreen;