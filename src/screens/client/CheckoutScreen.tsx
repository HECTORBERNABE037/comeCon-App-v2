// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   Image, 
//   ScrollView, 
//   TouchableOpacity, 
//   StatusBar,
//   Platform,
//   Alert
// } from 'react-native';
// import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
// import { StackScreenProps } from '@react-navigation/stack';
// import { COLORS, FONT_SIZES, CartItem, PaymentMethod,RootStackParamList } from '../../../types';

// // Simulamos que recibimos los ítems del carrito
// const cartItems: CartItem[] = [
//   { 
//     id: '1', 
//     title: 'Cafe Panda', 
//     subtitle: 'Latte', 
//     price: '110.00', 
//     image: require('../../../assets/cafePanda.png'), 
//     quantity: 1
//   },
//   { 
//     id: '2', 
//     title: 'Bowl con Frutas', 
//     subtitle: 'Fresa, Kiwi, Avena', 
//     price: '120.99', 
//     image: require('../../../assets/bowlFrutas.png'), 
//     quantity: 1
//   }
// ];

// type Props = StackScreenProps<RootStackParamList, 'Checkout'>;

// export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  
//   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');

//   // Cálculos
//   const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
//   const serviceFee = 40;
//   const total = subtotal + serviceFee;

//   const handleOrder = () => {
//     Alert.alert(
//       "¡Orden Recibida!", 
//       "Tu pedido ha sido enviado al restaurante.",
//       [{ text: "OK", onPress: () => navigation.navigate('ClientOrderTracking') }]
//     );
//   };

//   const handleAddCard = () => {
//     navigation.navigate('AddCard');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
//       {/* Header Estilo Tarjeta */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={28} color={COLORS.text} />
//           </TouchableOpacity>
          
//           <Text style={styles.headerTitle}>Pago</Text>
          
//           <View>
//             <Feather name="shopping-cart" size={28} color={COLORS.text} />
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//             </View>
//           </View>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
//         <Text style={styles.sectionTitle}>Resumen de orden</Text>

//         {/* Lista de Productos (Compacta en tarjeta blanca) */}
//         <View style={styles.itemsCard}>
//           {cartItems.map((item, index) => (
//             <View key={item.id}>
//               <View style={styles.itemRow}>
//                 <Image source={item.image} style={styles.itemImage} />
//                 <View style={styles.itemInfo}>
//                   <Text style={styles.itemTitle}>{item.title}</Text>
//                   <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
//                   <Text style={styles.itemPrice}>${item.price}</Text>
//                 </View>
//               </View>
//               {/* Separador entre items, menos el último */}
//               {index < cartItems.length - 1 && <View style={styles.separator} />}
//             </View>
//           ))}
//         </View>

//         {/* Desglose de Costos */}
//         <View style={styles.costsContainer}>
//           <View style={styles.costRow}>
//             <Text style={styles.costLabel}>Productos:</Text>
//             <Text style={styles.costValue}>{cartItems.length}</Text>
//           </View>
//           <View style={styles.costRow}>
//             <Text style={styles.costLabel}>Subtotal</Text>
//             <Text style={styles.costValue}>${subtotal.toFixed(2)}</Text>
//           </View>
//           <View style={styles.costRow}>
//             <Text style={styles.costLabel}>Servicio</Text>
//             <Text style={styles.costValue}>${serviceFee}</Text>
//           </View>
//           <View style={[styles.costRow, { marginTop: 5 }]}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//           </View>
//         </View>

//         {/* Métodos de Pago */}
//         <View style={styles.paymentMethodsContainer}>
          
//           {/* Opción Efectivo */}
//           <TouchableOpacity 
//             style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedOption]}
//             onPress={() => setSelectedPayment('cash')}
//           >
//             <View style={styles.paymentIconContainer}>
//                <Ionicons name="cash-outline" size={24} color={COLORS.text} />
//             </View>
//             <Text style={styles.paymentText}>Efectivo</Text>
//             {selectedPayment === 'cash' && <Ionicons name="checkmark" size={24} color={COLORS.text} />}
//           </TouchableOpacity>

//           <View style={styles.separator} />

//           {/* Opción Tarjeta (Simulada) */}
//           <TouchableOpacity 
//             style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedOption]}
//             onPress={() => setSelectedPayment('card')}
//           >
//             <View style={[styles.paymentIconContainer, { backgroundColor: '#007AFF' }]}>
//                <Ionicons name="card-outline" size={24} color="white" />
//             </View>
//             <View style={styles.cardTextContainer}>
//                 <Text style={styles.paymentText}>CLIENTE1</Text>
//                 <Text style={styles.cardNumber}>.... 9820</Text>
//             </View>
//             {selectedPayment === 'card' && <Ionicons name="checkmark" size={24} color={COLORS.text} />}
//           </TouchableOpacity>

//           <View style={styles.separator} />

//           {/* Agregar Tarjeta */}
//           <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
//             <Ionicons name="add" size={24} color={COLORS.text} />
//             <Text style={styles.addCardText}>Agregar Tarjeta</Text>
//           </TouchableOpacity>

//         </View>

//         {/* Botón Ordenar */}
//         <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
//           <Text style={styles.orderButtonText}>Ordernar</Text>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F2',
//   },
//   headerCard: {
//     backgroundColor: COLORS.white,
//     paddingTop: Platform.OS === 'android' ? 40 : 20,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 5,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 25,
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
//   scrollContent: {
//     paddingHorizontal: 25,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   sectionTitle: {
//     fontSize: FONT_SIZES.xlarge,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 15,
//   },
//   // Tarjeta de Items
//   itemsCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 2,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   itemImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     marginRight: 15,
//   },
//   itemInfo: {
//     flex: 1,
//   },
//   itemTitle: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   itemSubtitle: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//   },
//   itemPrice: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: '#F57C00',
//     marginTop: 2,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginVertical: 15,
//     width: '100%',
//   },
//   // Costos
//   costsContainer: {
//     marginBottom: 25,
//   },
//   costRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 5,
//   },
//   costLabel: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   costValue: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     fontWeight: 'bold',
//   },
//   totalLabel: {
//     fontSize: FONT_SIZES.large,
//     color: COLORS.text,
//     fontWeight: 'bold',
//   },
//   totalValue: {
//     fontSize: FONT_SIZES.large,
//     color: COLORS.text,
//     fontWeight: 'bold',
//   },
//   // Métodos de Pago
//   paymentMethodsContainer: {
//     marginBottom: 30,
//   },
//   paymentOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//   },
//   selectedOption: {
//     backgroundColor: '#EAEAEA', // Highlight sutil
//   },
//   paymentIconContainer: {
//     width: 40,
//     height: 30,
//     backgroundColor: '#A5D6A7', // Verde claro para efectivo
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   paymentText: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     fontWeight: '500',
//     flex: 1,
//   },
//   cardTextContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardNumber: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     marginLeft: 10,
//   },
//   addCardButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//   },
//   addCardText: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     marginLeft: 15,
//     fontWeight: '500',
//   },
//   // Botón Ordenar
//   orderButton: {
//     backgroundColor: COLORS.primary,
//     height: 55,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//   },
//   orderButtonText: {
//     color: COLORS.white,
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//   }
// });