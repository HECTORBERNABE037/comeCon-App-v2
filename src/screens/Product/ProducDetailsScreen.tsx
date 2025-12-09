// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Image, 
//   TouchableOpacity, 
//   SafeAreaView, 
//   ScrollView,
//   StatusBar,
//   Alert,
//   Platform
// } from 'react-native';
// import { StackScreenProps } from '@react-navigation/stack';
// import { RootStackParamList } from '../../navigation/StackNavigator';
// import { COLORS, FONT_SIZES, Platillo } from '../../../types';
// import { Ionicons, Feather } from '@expo/vector-icons';

// type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

// export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  
//   const { platillo } = route.params;

//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState<string | null>(null);
//   const [availableSizes, setAvailableSizes] = useState<string[]>([]);

//   // Efecto para determinar tamaños dinámicos
//   useEffect(() => {
//     // Simulación de lógica dinámica basada en el tipo de producto
//     // En una app real, esto vendría en el objeto 'platillo' (ej. platillo.sizes)
//     if (platillo.title.includes('Cafe') || platillo.title.includes('Bebida')) {
//       setAvailableSizes(['M', 'G']); // Mediano, Grande
//       setSelectedSize('M');
//     } else if (platillo.title.includes('Bowl') || platillo.title.includes('Ensalada')) {
//       setAvailableSizes(['CH', 'M', 'G']); // Chico, Mediano, Grande
//       setSelectedSize('M');
//     } else {
//       setAvailableSizes(['Único']); // Tamaño único
//       setSelectedSize('Único');
//     }
//   }, [platillo]);

//   const handleGoBack = () => {
//     navigation.goBack();
//   };
  
//   const handleIncreaseQuantity = () => {
//     setQuantity(prev => prev + 1);
//   };

//   const handleDecreaseQuantity = () => {
//     setQuantity(prev => Math.max(1, prev - 1));
//   };
  
//   const handleAddToCart = () => {
//     Alert.alert(
//       'Añadido al carrito',
//       `${quantity}x ${platillo.title} ${selectedSize !== 'Único' ? `(${selectedSize})` : ''} - Total: $${(Number(platillo.price) * quantity).toFixed(2)}`
//     );
//     navigation.goBack(); 
//   };

//   const handleComingSoon = (feature: string) => {
//     Alert.alert(feature, "Próximamente");
//   };
//   const handleCart = () => {
//     navigation.navigate('Cart');
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
//       {/* 1. Header Estilo Tarjeta (Igual que Home Cliente) */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={handleGoBack}>
//             <Ionicons name="arrow-back" size={28} color={COLORS.text} />
//           </TouchableOpacity>
          
//           <Text style={styles.headerTitle}>Detalles</Text>
          
//           <TouchableOpacity onPress={handleCart}>
//             <View>
//               <Feather name="shopping-cart" size={28} color={COLORS.text} />
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>2</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
//         {/* 2. Imagen Principal */}
//         <View style={styles.imageContainer}>
//           <Image source={platillo.image} style={styles.image} />
//         </View>

//         {/* 3. Selector de Cantidad Flotante (Píldora) */}
//         <View style={styles.floatingQuantityContainer}>
//           <View style={styles.quantitySelector}>
//             <TouchableOpacity style={styles.quantityButton} onPress={handleDecreaseQuantity}>
//               <Ionicons name="remove" size={24} color={COLORS.text} />
//             </TouchableOpacity>
//             <Text style={styles.quantityText}>{quantity}</Text>
//             <TouchableOpacity style={styles.quantityButton} onPress={handleIncreaseQuantity}>
//               <Ionicons name="add" size={24} color={COLORS.text} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* 4. Contenido del Producto */}
//         <View style={styles.infoContainer}>
          
//           {/* Título */}
//           <Text style={styles.title}>{platillo.title}</Text>

//           {/* Selector de Tamaños Dinámico */}
//           <View style={styles.sizesRow}>
//             {availableSizes.map((size) => (
//               <TouchableOpacity
//                 key={size}
//                 style={[
//                   styles.sizeButton,
//                   selectedSize === size ? styles.sizeButtonSelected : styles.sizeButtonUnselected,
//                   // Si es tamaño único, lo hacemos parecer más una etiqueta que un botón
//                   size === 'Único' && styles.sizeButtonUnique
//                 ]}
//                 onPress={() => setSelectedSize(size)}
//                 disabled={size === 'Único'}
//               >
//                 <Text style={[
//                   styles.sizeText,
//                   selectedSize === size ? styles.sizeTextSelected : styles.sizeTextUnselected
//                 ]}>
//                   {size}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Precio */}
//           <Text style={styles.price}>${platillo.price}</Text>
          
//           {/* Descripción */}
//           <Text style={styles.descriptionTitle}>Descripción</Text>
//           <Text style={styles.descriptionText}>
//             {platillo.description || 
//              "Espresso de Granos 100% Arábica de Origen Sostenible: Seleccionamos granos de café de alta calidad, cultivados en fincas que practican la sostenibilidad."}
//           </Text>

//           {/* Botón Añadir al Carrito (Dentro del Scroll para pantallas pequeñas) */}
//           <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
//             <Text style={styles.addToCartText}>añadir al carrito</Text>
//           </TouchableOpacity>

//         </View>

//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F2', // Fondo general gris claro
//   },
//   // --- Header ---
//   headerCard: {
//     backgroundColor: COLORS.white,
//     paddingTop: Platform.OS === 'android' ? 40 : 20,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 25,
//   },
//   headerTitle: {
//     fontSize: FONT_SIZES.xlarge, // Un poco más grande para "Detalles"
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
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   // --- Imagen ---
//   imageContainer: {
//     width: '100%',
//     height: 300,
//     backgroundColor: '#FFF',
//     zIndex: 1, // Para que quede debajo del selector flotante
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   // --- Selector de Cantidad Flotante ---
//   floatingQuantityContainer: {
//     alignItems: 'center',
//     marginTop: -25, // Mitad de la altura del selector (50/2) para superponer
//     zIndex: 2,
//     marginBottom: 10,
//   },
//   quantitySelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: 25, // Píldora
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     height: 50,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     minWidth: 140,
//     justifyContent: 'space-between',
//   },
//   quantityButton: {
//     padding: 5,
//   },
//   quantityText: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginHorizontal: 15,
//   },
//   // --- Información ---
//   infoContainer: {
//     paddingHorizontal: 25,
//     paddingTop: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 15,
//     textAlign: 'left',
//   },
//   // Tamaños
//   sizesRow: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   sizeButton: {
//     width: 80, // Ancho fijo para M y G
//     height: 50,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   sizeButtonSelected: {
//     backgroundColor: '#FF9F43', // Naranja seleccionado (según imagen)
//   },
//   sizeButtonUnselected: {
//     backgroundColor: '#FAD7A0', // Beige/Naranja claro deseleccionado (según imagen)
//   },
//   sizeButtonUnique: {
//     width: 100, // Un poco más ancho si es único
//     backgroundColor: '#E0E0E0',
//   },
//   sizeText: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//   },
//   sizeTextSelected: {
//     color: COLORS.white,
//   },
//   sizeTextUnselected: {
//     color: COLORS.text, // O un color oscuro
//   },
//   // Precio
//   price: {
//     fontSize: 32, // Muy grande como en la imagen
//     fontWeight: 'bold',
//     color: '#F57C00', // Naranja precio
//     marginBottom: 20,
//   },
//   descriptionTitle: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   descriptionText: {
//     fontSize: FONT_SIZES.medium,
//     color: '#888', // Gris texto secundario
//     lineHeight: 22,
//     marginBottom: 30,
//   },
//   // Botón Añadir
//   addToCartButton: {
//     width: '100%',
//     height: 60,
//     backgroundColor: COLORS.primary, // Naranja botón
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     marginBottom: 20,
//   },
//   addToCartText: {
//     color: COLORS.white,
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     textTransform: 'lowercase', // "añadir al carrito" en minúsculas en tu imagen
//   },
// });