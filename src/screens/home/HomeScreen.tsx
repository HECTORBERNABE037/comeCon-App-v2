// import React from "react";
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   SafeAreaView, 
//   Alert, 
//   ScrollView, 
//   TextInput,
//   Image,
//   FlatList,
//   StatusBar,
//   Platform
// } from "react-native";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { MaterialIcons, FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

// import { COLORS, FONT_SIZES, Promocion, Platillo,RootStackParamList } from "../../../types";
// import { ClientBottomNavBar } from "../../components/ClientBottomNavBar"; // Importamos la nueva barra

// type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

// interface HomeScreenProps {
//   navigation: HomeScreenNavigationProp;
// }

// // Promociones destacadas
// const promociones: Promocion[] = [
//   { 
//     id: '1', 
//     title: 'Bowl con Frutas', 
//     subtitle: 'Fresa, kiwi, avena', 
//     price: '120.99', 
//     oldPrice: '170.99', 
//     image: require('../../../assets/bowlFrutas.png') 
//   },
//   { 
//     id: '2', 
//     title: 'Tostada', 
//     subtitle: 'Aguacate', 
//     price: '150.80', 
//     oldPrice: '199.99', 
//     image: require('../../../assets/tostadaAguacate.png') 
//   },
//   { 
//     id: '3', 
//     title: 'Bowl con Frutas', 
//     subtitle: 'Fresa, kiwi, avena', 
//     price: '120.99', 
//     oldPrice: '170.99', 
//     image: require('../../../assets/bowlFrutas.png') 
//   },
// ];

// //Platillos destacados
// const platillos: Platillo[] = [
//   { 
//     id: '1', 
//     title: 'Panqueques', 
//     subtitle: 'Avena y Frutas', 
//     price: '115.99', 
//     image: require('../../../assets/Panques.png') 
//   },
//   { 
//     id: '2', 
//     title: 'Cafe Panda', 
//     subtitle: 'latte', 
//     price: '110.00', 
//     image: require('../../../assets/cafePanda.png') 
//   },
//   { 
//     id: '3', 
//     title: 'Tostada', 
//     subtitle: 'Aguacate', 
//     price: '150.80', 
//     image: require('../../../assets/tostadaAguacate.png') 
//   },
// ];

// const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {

//   const handleComingSoon = (feature: string) => {
//     Alert.alert(feature, "Esta funcionalidad estará disponible próximamente.");
//   };
//   const handleCart = () => {
//     navigation.navigate('Cart');
//   };

//   // Ocultar header por defecto del stack
//   React.useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: false, 
//     });
//   }, [navigation]);

//   // Renderizado Tarjeta Promociones (Estilo Original Preservado)
//   const renderPromoCard = ({ item }:{item:Promocion}) => (
//     <TouchableOpacity style={styles.promoCard} onPress={() => navigation.navigate('ProductDetails',{platillo:item})}>
//       <Image source={item.image} style={styles.promoImage} />
//       <Text style={styles.promoTitle}>{item.title}</Text>
//       <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
//       <View style={styles.priceContainer}>
//         <Text style={styles.promoPrice}>${item.price}</Text>
//         <Text style={styles.promoPriceOld}>${item.oldPrice}</Text>
//       </View>
//       {/* <TouchableOpacity style={styles.arrowButton}>
//         <Feather name="arrow-right" size={20} color="white" />
//       </TouchableOpacity> */}
//     </TouchableOpacity>
//   );

//   // Renderizado Tarjeta Platillos (Estilo Original Preservado)
//   const renderPlatilloCard = ({ item }:{item:Platillo}) => (
//     <TouchableOpacity style={styles.platilloCard} onPress={() => navigation.navigate('ProductDetails',{platillo:item})}>
//       <Image source={item.image} style={styles.platilloImage} />
//       <View style={styles.platilloTextContainer}>
//         <Text style={styles.platilloTitle}>{item.title}</Text>
//         <Text style={styles.platilloSubtitle}>{item.subtitle}</Text>
//         <Text style={styles.platilloPrice}>${item.price}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       {/* HEADER CURVO (Nuevo Diseño) */}
//       <View style={styles.headerCard}>
//           {/* Espacio para centrar el título */}
//           <View style={{ width: 40 }} />
          
//           <Text style={styles.headerTitle}>ComeCon</Text>
          
//           {/* Carrito siempre disponible */}
//           <TouchableOpacity onPress={handleCart}>
//             <View>
//               <Feather name="shopping-cart" size={28} color={COLORS.text} />
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>2</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        
//         {/* Barra de busqueda (Estilo Original) */}
//         <View style={styles.searchContainer}>
//           <View style={styles.searchInputWrapper}>
//             <Ionicons name="search" size={22} color={COLORS.placeholder} style={styles.searchIcon} />
//             <TextInput 
//               placeholder="Search"
//               placeholderTextColor={COLORS.placeholder}
//               style={styles.searchInput}
//             />
//           </View>
//         </View>

//         {/* Botones de categoria*/}
//         <View style={styles.categoryContainer}>
//           <TouchableOpacity 
//             style={styles.categoryButton} 
//             onPress={() => handleComingSoon("Menú")}
//           >
//             <MaterialIcons name="menu-book" size={24} color={COLORS.primary} />
//             <Text style={styles.categoryButtonText}>Menú</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.categoryButton, {backgroundColor: COLORS.primary + '20'}]} 
//             onPress={() => handleComingSoon("Promociones")}
//           >
//             <FontAwesome5 name="star" size={24} color={COLORS.primary} />
//             <Text style={styles.categoryButtonText}>Promociones</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Sección promociones destacadas */}
//         <Text style={styles.sectionTitle}>Promociones Destacadas</Text>
//         <FlatList
//           data={promociones}
//           renderItem={renderPromoCard}
//           keyExtractor={item => item.id.toString()}
//           horizontal={true}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.listPadding}
//         />

//         {/* Sección platillos destacados */}
//         <Text style={styles.sectionTitle}>Platillos destacados</Text>
//         <FlatList
//           data={platillos}
//           renderItem={renderPlatilloCard}
//           keyExtractor={item => item.id.toString()}
//           horizontal={true}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.listPadding}
//         />

//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: COLORS.background 
//   },
//   // --- ESTILOS NUEVOS PARA EL HEADER ---
//   headerCard: {
//     backgroundColor: COLORS.white,
//     paddingTop: Platform.OS === 'android' ? 40 : 20,
//     paddingBottom: 20,
//     paddingHorizontal: 25,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     zIndex: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   cartBadge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: '#F57C00',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: COLORS.white,
//   },
//   cartBadgeText: {
//     color: COLORS.white,
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   contentContainer: { 
//     paddingHorizontal: 20,
//     paddingBottom: 110, // Aumentado para dejar espacio al navbar flotante
//     paddingTop: 10,
//   },
  
//   // --- ESTILOS ORIGINALES CONSERVADOS ---
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   searchInputWrapper: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.surface,
//     borderRadius: 12,
//     height: 50,
//   },
//   searchIcon: {
//     paddingLeft: 15,
//   },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     paddingLeft: 10,
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     marginTop: 25,
//     justifyContent: 'space-between',
//   },
//   categoryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary + '20', 
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 12,
//   },
//   categoryButtonText: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 10,
//   },
//   sectionTitle: {
//     fontSize: FONT_SIZES.xlarge,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginTop: 30,
//     marginBottom: 15,
//   },
//   listPadding: {
//     paddingBottom: 5,
//   },
//   // Tarjeta Promociones (Estilo Original)
//   promoCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     width: 220,
//     marginRight: 15,
//     padding: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     position: 'relative',
//   },
//   promoImage: {
//     width: '100%',
//     height: 120,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   promoTitle: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   promoSubtitle: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//     marginBottom: 5,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   promoPrice: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginRight: 10,
//   },
//   promoPriceOld: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//     textDecorationLine: 'line-through',
//   },
//   arrowButton: {
//     backgroundColor: 'black',
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     right: 15,
//     bottom: 40,
//   },
//   // Tarjeta Platillos (Estilo Original)
//   platilloCard: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     width: 260,
//     marginRight: 15,
//     padding: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     alignItems: 'center',
//   },
//   platilloImage: {
//     width: 65,
//     height: 65,
//     borderRadius: 12,
//     marginRight: 15,
//   },
//   platilloTextContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   platilloTitle: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   platilloSubtitle: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//   },
//   platilloPrice: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginTop: 5,
//   },
// });

// export default HomeScreen;