import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert, 
  TextInput,
  Image,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"; 
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather, Ionicons } from "@expo/vector-icons";

import { RootStackParamList, AdminTabParamList, COLORS, FONT_SIZES, Platillo } from "../../../types";

import { EditProductModal } from "../../components/EditProductModal";
import { PromoteProductModal } from "../../components/PromoteProductModal";
import { AddProductModal } from "../../components/AddProductModal"; 
import { DataRepository } from '../../services/DataRepository'; 
import { useAuth } from "../../context/AuthContext";
import { advancedSearch } from "../../utils/searchHelper";

type HomeAdminScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'HomeAdminTab'>,
  StackNavigationProp<RootStackParamList>
>;

interface HomeAdminScreenProps {
  navigation: HomeAdminScreenNavigationProp;
}

const resolveImage = (imageName: string | any) => {
  if (imageName?.uri) return { uri: imageName.uri };
  if (typeof imageName === 'string' && (imageName.startsWith('http') || imageName.startsWith('file'))) {
    return { uri: imageName };
  }
  return require('../../../assets/logoApp.png');
};

const HomeAdminScreen: React.FC<HomeAdminScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  
  const [productList, setProductList] = useState<Platillo[]>([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState<Platillo | null>(null);
  const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
  const [selectedProductPromote, setSelectedProductPromote] = useState<Platillo | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // === CARGAR PRODUCTOS ===
  const loadProducts = async () => {
    if (!refreshing) setLoading(true);
    try {
      const productsFromDB = await DataRepository.getAdminProducts();
      
      const formattedProducts: Platillo[] = productsFromDB.map((p:any) => ({
        id: p.id.toString(),
        title: p.title,
        
        // ✅ CORRECCIÓN 1: Mapeo explícito de campos faltantes
        subtitle: p.subtitle || '', 
        category: p.category || 'General', 

        price: p.price.toString(),
        description: p.description || '',
        
        // Guardamos la imagen resuelta para mostrarla
        image: resolveImage(p.image),
        // Guardamos la original para lógica interna (opcional, pero útil)
        originalImageString: p.image, 

        promotionalPrice: p.promotionalPrice ? p.promotionalPrice.toString() : undefined,
        promotionId: p.promoId ? p.promoId.toString() : undefined,
        visible: p.visible 
      }));

      setProductList(formattedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const filteredProducts = advancedSearch(productList, searchQuery, ['title', 'category']);

  // === HANDLERS ===

  const handleAddProduct = async (newProductData: any) => {
    const res = await DataRepository.saveProduct({
      ...newProductData,
      category: newProductData.category || 'General',
      visible: true
    });
    
    if (res.success) {
      setIsAddModalVisible(false);
      loadProducts();
      Alert.alert("Éxito", "Producto añadido.");
    } else {
      Alert.alert("Error", res.error || "No se pudo crear.");
    }
  };

  // ✅ CORRECCIÓN 2: Lógica de guardado robusta
  const handleSaveProduct = async (updatedProduct: any) => { // Usamos any para flexibilidad temporal
    
    // Problema: 'updatedProduct.image' puede ser un objeto {uri: ...} si no se cambió.
    // DataRepository espera un string o un objeto con uri nuevo del picker.
    
    let imageToSave = updatedProduct.image;

    // Si es un objeto de imagen resuelta (no del picker) y tiene URI, extraemos la URI string
    if (updatedProduct.image?.uri && typeof updatedProduct.image.uri === 'string') {
        imageToSave = updatedProduct.image.uri;
    }
    // Si es un require (numero), lo dejamos o usamos el original si existe
    if (typeof imageToSave === 'number' && updatedProduct.originalImageString) {
        imageToSave = updatedProduct.originalImageString;
    }

    const cleanProduct = {
        ...updatedProduct,
        image: imageToSave
    };

    const res = await DataRepository.saveProduct(cleanProduct, Number(updatedProduct.id));
    
    if (res.success) {
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
      loadProducts(); // Recarga vital para ver los cambios
      Alert.alert("Éxito", "Producto actualizado.");
    } else {
      Alert.alert("Error", res.error || "No se pudo actualizar.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await DataRepository.deleteProductAdmin(Number(productId));
    if (res.success) {
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
      loadProducts();
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleSavePromotion = async (productId: string, promoData: any, existingPromoId?: number) => {
    // Si existingPromoId viene del modal, se lo pasamos al repositorio
    // Si es undefined, el repositorio hará un POST (Crear)
    // Si es número, hará un PATCH (Actualizar)
    const res = await DataRepository.savePromotion(Number(productId), promoData, existingPromoId);
    
    if (res.success) {
      setIsPromoteModalVisible(false);
      loadProducts(); // Recargamos para ver el precio tachado
      Alert.alert("Éxito", existingPromoId ? "Promoción actualizada." : "Promoción creada.");
    } else {
      // Si falla (ej: 400 Bad Request), mostramos el error
      Alert.alert("Error", res.error || "No se pudo guardar la promoción.");
    }
  };

  const handleDeletePromotion = async (promoId: string) => {
    Alert.alert("Eliminar Promoción", "¿Quitar la oferta de este producto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", onPress: async () => {
          const res = await DataRepository.deletePromotion(Number(promoId));
          if (res.success) {
            setIsPromoteModalVisible(false);
            loadProducts();
          } else {
            Alert.alert("Error", res.error);
          }
      }}
    ]);
  };

  // === RENDER ===

  const renderAdminItem = ({ item }: { item: Platillo }) => {
    const hasPromo = !!item.promotionalPrice;
    
    return (
      <View style={[styles.itemCard, !item.visible && styles.itemCardHidden, hasPromo && styles.promoCard]}>
        <View>
          <Image source={item.image} style={[styles.itemImage, !item.visible && {opacity: 0.5}]} />
          {!item.visible && <View style={styles.hiddenLabelContainer}><Text style={styles.hiddenLabelText}>OCULTO</Text></View>}
          {hasPromo && <View style={styles.promoLabelContainer}><Text style={styles.promoLabelText}>% OFERTA</Text></View>}
        </View>

        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, !item.visible && {color: '#999'}]}>{item.title}</Text>
          
          {/* Mostramos Subtítulo */}
          {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
          
          {/* Mostramos Categoría (Pequeña) */}
          <Text style={{fontSize: 10, color: COLORS.primary, marginBottom: 2, fontWeight:'600'}}>{item.category}</Text>

          <View>
             {hasPromo && <Text style={styles.oldPriceText}>${item.price}</Text>}
             <Text style={[styles.itemPrice, !item.visible && {color: '#999'}, hasPromo && { color: '#2E7D32' }]}>
               ${hasPromo ? item.promotionalPrice : item.price}
             </Text>
          </View>
        </View>

        <View style={styles.itemActionsContainer}>
          <TouchableOpacity onPress={() => { setSelectedProductEdit(item); setIsEditModalVisible(true); }} style={{marginBottom: 10}}>
            <Feather name="edit-2" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelectedProductPromote(item); setIsPromoteModalVisible(true); }}>
            <Ionicons name={hasPromo ? "star" : "star-outline"} size={24} color={hasPromo ? "#FFC107" : COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.headerLine} />
      </View>

      <View style={styles.searchAndAddContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={22} color={COLORS.placeholder} style={styles.searchIcon} />
          <TextInput 
            placeholder="Buscar..."
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.roundAddButton} onPress={() => setIsAddModalVisible(true)}>
          <Ionicons name="add" size={30} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderAdminItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>Sin productos.</Text>}
        />
      )}

      {/* MODALES */}
      <AddProductModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddProduct}
      />

      <EditProductModal
        visible={isEditModalVisible}
        product={selectedProductEdit}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

      <PromoteProductModal
        visible={isPromoteModalVisible}
        product={selectedProductPromote}
        onClose={() => setIsPromoteModalVisible(false)}
        onSave={handleSavePromotion}
        onDelete={handleDeletePromotion}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerContainer: { alignItems: 'center', marginTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 15 },
  headerTitle: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.text },
  headerLine: { width: 100, height: 3, backgroundColor: COLORS.primary, marginTop: 5 },
  searchAndAddContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E0E0', borderRadius: 15, height: 50, marginRight: 15 },
  searchIcon: { paddingLeft: 15 },
  searchInput: { flex: 1, height: 50, paddingLeft: 10, fontSize: FONT_SIZES.medium, color: COLORS.text },
  roundAddButton: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: COLORS.text, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  itemCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, alignItems: 'center' },
  itemCardHidden: { backgroundColor: '#F0F0F0', borderColor: '#DDD', borderWidth: 1 },
  promoCard: { borderWidth: 1.5, borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  hiddenLabelContainer: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  hiddenLabelText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  promoLabelContainer: { position: 'absolute', top: 0, right: 0, backgroundColor: '#4CAF50', paddingHorizontal: 6, paddingVertical: 3, borderBottomLeftRadius: 10, borderTopRightRadius: 10 },
  promoLabelText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  oldPriceText: { fontSize: 12, color: COLORS.textSecondary, textDecorationLine: 'line-through', marginBottom: -2 },
  itemImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  itemTextContainer: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  itemSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 5 },
  itemPrice: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.primary },
  itemActionsContainer: { justifyContent: 'space-between', alignItems: 'center', height: 60 },
});

export default HomeAdminScreen;