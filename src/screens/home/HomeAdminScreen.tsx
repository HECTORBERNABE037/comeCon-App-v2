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
  Platform
} from "react-native";
import { useFocusEffect, CompositeNavigationProp } from "@react-navigation/native"; 
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather, Ionicons } from "@expo/vector-icons";

// Importamos los tipos de ambas listas de navegación
import { RootStackParamList, AdminTabParamList, COLORS, FONT_SIZES, Platillo, ProductFormData } from "../../../types";

import { EditProductModal } from "../../components/EditProductModal";
import { PromoteProductModal } from "../../components/PromoteProductModal";
import { AddProductModal } from "../../components/AddProductModal"; 
// Ya no importamos AdminBottomNavBar aquí porque el TabNavigator lo maneja
import DatabaseService from '../../services/DatabaseService';
import { advancedSearch } from "../../utils/searchHelper";

// DEFINICIÓN DE TIPO DE NAVEGACIÓN COMPUESTO (Tab + Stack)
type HomeAdminScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'HomeAdminTab'>,
  StackNavigationProp<RootStackParamList>
>;

interface HomeAdminScreenProps {
  navigation: HomeAdminScreenNavigationProp;
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

const HomeAdminScreen: React.FC<HomeAdminScreenProps> = ({ navigation }) => {

  const [productList, setProductList] = useState<Platillo[]>([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState<Platillo | null>(null);
  const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
  const [selectedProductPromote, setSelectedProductPromote] = useState<Platillo | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const loadProducts = async () => {
    try {
      const productsFromDB = await DatabaseService.getProducts();
      
      const formattedProducts: Platillo[] = productsFromDB.map(p => ({
        id: p.id.toString(),
        title: p.title,
        subtitle: p.subtitle,
        price: p.price.toString(),
        description: p.description,
        image: resolveImage(p.image),
        promotionalPrice: p.promotionalPrice ? p.promotionalPrice.toString() : undefined,
        visible: p.visible 
      }));

      setProductList(formattedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const filteredProducts = advancedSearch(productList, searchQuery, ['title', 'subtitle']);

  const openAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddProduct = async (newProductData: any) => {
    try {
      await DatabaseService.addProduct({
        ...newProductData,
        image: newProductData.image || 'logoApp' 
      });
      await loadProducts();
      setIsAddModalVisible(false);
      Alert.alert("Éxito", "Producto añadido correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el producto.");
    }
  };

  const openEditModal = (product: Platillo) => {
    setSelectedProductEdit(product);
    setIsEditModalVisible(true);
  };

  const handleSaveProduct = async (updatedProduct: Platillo) => {
    try {
      const priceString = updatedProduct.price.toString();
      await DatabaseService.updateProduct(Number(updatedProduct.id), {
        title: updatedProduct.title,
        subtitle: updatedProduct.subtitle,
        price: priceString,
        description: updatedProduct.description,
        visible: updatedProduct.visible,
        image: updatedProduct.image
      });
      await loadProducts();
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
      Alert.alert("Éxito", "Producto actualizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await DatabaseService.deleteProduct(Number(productId));
      await loadProducts();
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };

  const openPromoteModal = (product: Platillo) => {
    setSelectedProductPromote(product);
    setIsPromoteModalVisible(true);
  };

  const handleSavePromotion = async (productId: string, promoData: any) => {
    try {
      await DatabaseService.createPromotion(Number(productId), promoData);
      Alert.alert("Éxito", "La promoción ha sido actualizada.");
      setIsPromoteModalVisible(false);
      setSelectedProductPromote(null);
      await loadProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la promoción.");
    }
  };

  const handleDeletePromotion = async (productId: string) => {
    try {
      await DatabaseService.deletePromotion(Number(productId));
      Alert.alert("Eliminada", "La promoción ha sido eliminada correctamente.");
      setIsPromoteModalVisible(false);
      setSelectedProductPromote(null);
      await loadProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la promoción.");
    }
  };

  const renderAdminItem = ({ item }: { item: Platillo }) => {
    const hasPromo = !!item.promotionalPrice; 

    return (
      <View style={[
        styles.itemCard, 
        !item.visible && styles.itemCardHidden,
        hasPromo && styles.promoCard 
      ]}>
        
        <View>
          <Image source={item.image} style={[styles.itemImage, !item.visible && {opacity: 0.5}]} />
          
          {!item.visible && (
            <View style={styles.hiddenLabelContainer}>
              <Text style={styles.hiddenLabelText}>OCULTO</Text>
            </View>
          )}

          {hasPromo && item.visible && (
            <View style={styles.promoLabelContainer}>
              <Text style={styles.promoLabelText}>% OFERTA</Text>
            </View>
          )}
        </View>

        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, !item.visible && {color: '#999'}]}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          
          <View>
             {hasPromo && (
                <Text style={styles.oldPriceText}>${item.price}</Text>
             )}
             <Text style={[
               styles.itemPrice, 
               !item.visible && {color: '#999'},
               hasPromo && { color: '#2E7D32' }
             ]}>
               ${hasPromo ? item.promotionalPrice : item.price}
             </Text>
          </View>
        </View>

        <View style={styles.itemActionsContainer}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={{marginBottom: 10}}>
            <Feather name="edit-2" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPromoteModal(item)}>
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
        <Text style={styles.headerTitle}>ComeCon</Text>
        <View style={styles.headerLine} />
      </View>

      <View style={styles.searchAndAddContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={22} color={COLORS.placeholder} style={styles.searchIcon} />
          <TextInput 
            placeholder="Buscar producto..."
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.roundAddButton} onPress={openAddModal}>
          <Ionicons name="add" size={30} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={renderAdminItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
            {searchQuery ? "No se encontraron productos" : "No hay productos. ¡Agrega uno!"}
          </Text>
        }
      />

      {/* NOTA: Eliminamos <AdminBottomNavBar /> porque ahora está en AdminTabs.tsx */}

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
  hiddenLabelContainer: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  hiddenLabelText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  promoCard: {
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  promoLabelContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  promoLabelText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  oldPriceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: -2
  },

  itemImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  itemTextContainer: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', color: COLORS.text },
  itemSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: 5 },
  itemPrice: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.primary },
  itemActionsContainer: { justifyContent: 'space-between', alignItems: 'center', height: 60 },
});

export default HomeAdminScreen;