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
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"; 
import { MaterialIcons, FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

// Importamos RootStackParamList Y ClientTabParamList
import { RootStackParamList, ClientTabParamList, COLORS, FONT_SIZES, Platillo } from "../../../types";
// Ya no importamos ClientBottomNavBar aquí
import DatabaseService from '../../services/DatabaseService';

// TIPO DE NAVEGACIÓN COMPUESTO
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'HomeClientTab'>,
  StackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const resolveImage = (imageName: string) => {
  if (imageName?.startsWith('file://')) {
    return { uri: imageName };
  }
  switch (imageName) {
    case 'bowlFrutas': return require('../../../assets/bowlFrutas.png');
    case 'tostadaAguacate': return require('../../../assets/tostadaAguacate.png');
    case 'Panques': return require('../../../assets/Panques.png');
    case 'cafePanda': return require('../../../assets/cafePanda.png');
    default: return require('../../../assets/logoApp.png'); 
  }
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {

  const [allProducts, setAllProducts] = useState<Platillo[]>([]);
  const [promotions, setPromotions] = useState<Platillo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleComingSoon = (feature: string) => {
    // Alert.alert(feature, "Esta funcionalidad estará disponible próximamente.");
  };
  
  const handleCart = () => {
    navigation.navigate('Cart');
  };

  const loadData = async () => {
    setLoading(true);
    try {
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

      const activePromos = formattedProducts.filter(p => p.promotionalPrice);
      setPromotions(activePromos);

    } catch (error) {
      console.error("Error cargando home:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const renderPromoCard = ({ item }: { item: Platillo }) => (
    <TouchableOpacity style={styles.promoCard} onPress={() => navigation.navigate('ProductDetails', { platillo: item })}>
      <Image source={item.image} style={styles.promoImage} />
      <Text style={styles.promoTitle}>{item.title}</Text>
      <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.promoPrice}>${item.promotionalPrice}</Text>
        <Text style={styles.promoPriceOld}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlatilloCard = ({ item }: { item: Platillo }) => {
    const finalPrice = item.promotionalPrice || item.price;
    const isPromo = !!item.promotionalPrice;

    return (
      <TouchableOpacity style={styles.platilloCard} onPress={() => navigation.navigate('ProductDetails', { platillo: item })}>
        <Image source={item.image} style={styles.platilloImage} />
        <View style={styles.platilloTextContainer}>
          <Text style={styles.platilloTitle}>{item.title}</Text>
          <Text style={styles.platilloSubtitle}>{item.subtitle}</Text>
          <Text style={[styles.platilloPrice, isPromo && { color: '#2E7D32' }]}>
            ${finalPrice}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.headerCard}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>ComeCon</Text>
          
          <TouchableOpacity onPress={handleCart}>
            <View>
              <Feather name="shopping-cart" size={28} color={COLORS.text} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>2</Text> 
              </View>
            </View>
          </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={22} color={COLORS.placeholder} style={styles.searchIcon} />
              <TextInput 
                placeholder="Buscar platillo..."
                placeholderTextColor={COLORS.placeholder}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* <View style={styles.categoryContainer}>
            <TouchableOpacity style={styles.categoryButton} onPress={() => handleComingSoon("Menú")}>
              <MaterialIcons name="menu-book" size={24} color={COLORS.primary} />
              <Text style={styles.categoryButtonText}>Menú</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.categoryButton, {backgroundColor: COLORS.primary + '20'}]} onPress={() => handleComingSoon("Promociones")}>
              <FontAwesome5 name="star" size={24} color={COLORS.primary} />
              <Text style={styles.categoryButtonText}>Promociones</Text>
            </TouchableOpacity>
          </View> */}

          {promotions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Promociones Destacadas</Text>
              <FlatList
                data={promotions}
                renderItem={renderPromoCard}
                keyExtractor={item => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listPadding}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Platillos destacados</Text>
          <FlatList
            data={allProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))}
            renderItem={renderPlatilloCard}
            keyExtractor={item => item.id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={<Text style={{marginLeft: 5, color: '#999'}}>No se encontraron platillos.</Text>}
          />

        </ScrollView>
      )}

      {/* IMPORTANTE: Se eliminó <ClientBottomNavBar /> */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerCard: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  cartBadge: {
    position: 'absolute', top: -5, right: -5, backgroundColor: '#F57C00',
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.white,
  },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 10 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, height: 50,
  },
  searchIcon: { paddingLeft: 15 },
  searchInput: { flex: 1, height: 50, paddingLeft: 10, fontSize: FONT_SIZES.medium, color: COLORS.text },
  
  categoryContainer: { flexDirection: 'row', marginTop: 25, justifyContent: 'space-between' },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '20', 
    paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12,
  },
  categoryButtonText: { fontSize: FONT_SIZES.medium, fontWeight: '600', color: COLORS.primary, marginLeft: 10 },
  
  sectionTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text, marginTop: 30, marginBottom: 15 },
  listPadding: { paddingBottom: 5 },
  
  // Tarjetas
  promoCard: {
    backgroundColor: COLORS.white, borderRadius: 20, width: 220, marginRight: 15, padding: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  promoImage: { width: '100%', height: 120, borderRadius: 15, marginBottom: 10 },
  promoTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.text },
  promoSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 5 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  promoPrice: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text, marginRight: 10 },
  promoPriceOld: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  
  platilloCard: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 20, width: 260, marginRight: 15, padding: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, alignItems: 'center',
  },
  platilloImage: { width: 65, height: 65, borderRadius: 12, marginRight: 15 },
  platilloTextContainer: { flex: 1, justifyContent: 'center' },
  platilloTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  platilloSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
  platilloPrice: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text, marginTop: 5 },
});

export default HomeScreen;