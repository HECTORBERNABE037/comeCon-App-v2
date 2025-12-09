// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   Image, 
//   FlatList, 
//   StatusBar,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   Platform
// } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { COLORS, FONT_SIZES, CartItem, Order } from '../../../types';

// // Datos Simulados del Carrito
// const initialCart: CartItem[] = [
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

// // Datos Simulados del Historial del Cliente
// const historyOrders: Order[] = [
//   { 
//     id: '101', 
//     title: 'Cafe Panda', 
//     subtitle: 'Latte', 
//     price: '110.00', 
//     image: require('../../../assets/cafePanda.png'), 
//     status: 'completed',
//     deliveryTime: 'Entregado a las 7:30pm',
//     date: '27/11/2025',
//     historyNotes: 'Fueron a comprar la leche'
//   },
//   { 
//     id: '102', 
//     title: 'Bowl con Frutas', 
//     subtitle: 'Fresa, Kiwi, Avena', 
//     price: '120.99', 
//     image: require('../../../assets/bowlFrutas.png'), 
//     status: 'cancelled',
//     deliveryTime: 'Cerrado a las 8:00pm',
//     date: '26/11/2025',
//     historyNotes: 'Falta de ingredientes'
//   }
// ];

// export const CartScreen = ({ navigation }: { navigation: any }) => {
//   const [activeTab, setActiveTab] = useState<'process' | 'history'>('process');
//   const [cartItems, setCartItems] = useState<CartItem[]>(initialCart);

//   // Cálculos
//   const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
//   const serviceFee = 40; 
//   const total = subtotal + serviceFee;

//   const handleIncrease = (id: string) => {
//     setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
//   };

//   const handleDecrease = (id: string) => {
//     setCartItems(prev => prev.map(item => {
//       if (item.id === id) {
//         return { ...item, quantity: Math.max(1, item.quantity - 1) };
//       }
//       return item;
//     }));
//   };

//   const handlePayment = () => {
//     navigation.navigate('Checkout'); // Navegar a la pantalla de resumen
//   };

//   // --- RENDERIZADO ÍTEM CARRITO (En Proceso) ---
//   const renderCartItem = ({ item }: { item: CartItem }) => (
//     <View style={styles.cartCard}>
//       <Image source={item.image} style={styles.cartImage} />
      
//       <View style={styles.cartInfo}>
//         <Text style={styles.cartTitle}>{item.title}</Text>
//         <Text style={styles.cartSubtitle}>{item.subtitle}</Text>
//         <Text style={styles.cartPrice}>${item.price}</Text>
//       </View>

//       {/* Control de Cantidad Vertical Naranja (Estilos corregidos) */}
//       <View style={styles.quantityContainer}>
//         {/* Botón MENOS arriba */}
//         <TouchableOpacity onPress={() => handleDecrease(item.id)} style={styles.qtyButton}>
//           <Text style={styles.qtyText}>-</Text>
//         </TouchableOpacity>
        
//         {/* Número en medio */}
//         <Text style={styles.qtyValue}>{item.quantity}</Text>
        
//         {/* Botón MÁS abajo */}
//         <TouchableOpacity onPress={() => handleIncrease(item.id)} style={styles.qtyButton}>
//           <Text style={styles.qtyText}>+</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   // --- RENDERIZADO ÍTEM HISTORIAL ---
//   const renderHistoryItem = ({ item }: { item: Order }) => {
//     const isCancelled = item.status === 'cancelled';
//     return (
//       <View style={styles.historyCard}>
//         <View style={styles.historyHeader}>
//           <Image source={item.image} style={styles.historyImage} />
//           <View style={styles.historyInfo}>
//             <Text style={styles.cartTitle}>{item.title}</Text>
//             <Text style={styles.cartSubtitle}>{item.subtitle}</Text>
//             <Text style={styles.cardPriceOrange}>${item.price}</Text>
//           </View>
//         </View>
        
//         <View style={styles.historyDetails}>
//           <Text style={styles.statusTitle}>
//             {isCancelled ? 'Cancelado' : 'Terminado'}
//           </Text>
//           <Text style={styles.statusTime}>
//             {item.deliveryTime}
//           </Text>
//           {item.date && (
//             <Text style={styles.statusDate}>{item.date}</Text>
//           )}
//           <View style={styles.separator} />
//           <Text style={styles.historyNotes}>{item.historyNotes}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       {/* Header Estilo Tarjeta */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={28} color={COLORS.text} />
//           </TouchableOpacity>
          
//           <Text style={styles.headerTitle}>Carrito</Text>
          
//           <View>
//             <Feather name="shopping-cart" size={28} color={COLORS.text} />
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Tabs dentro del Header */}
//         <View style={styles.tabsContainer}>
//           <TouchableOpacity 
//             style={[styles.tabButton, activeTab === 'process' && styles.activeTabBorder]} 
//             onPress={() => setActiveTab('process')}
//           >
//             <Text style={[styles.tabText, activeTab === 'process' && styles.activeTabText]}>En proceso</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={[styles.tabButton, activeTab === 'history' && styles.activeTabBorder]} 
//             onPress={() => setActiveTab('history')}
//           >
//             <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Historial</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Contenido Principal */}
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {activeTab === 'process' ? (
//           <>
//             {/* Lista de Carrito */}
//             <View style={styles.listContainer}>
//               {cartItems.map((item) => (
//                 <View key={item.id}>
//                   {renderCartItem({ item })}
//                 </View>
//               ))}
//             </View>
//           </>
//         ) : (
//           /* Lista de Historial */
//           <View style={styles.listContainer}>
//             {historyOrders.map((item) => (
//               <View key={item.id}>
//                 {renderHistoryItem({ item })}
//               </View>
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       {/* Resumen y Botón de Pago (Solo visible en "En proceso") */}
//       {activeTab === 'process' && (
//         <View style={styles.summaryContainer}>
//           <Text style={styles.summaryTitle}>Resumen</Text>
          
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Productos:</Text>
//             <Text style={styles.summaryValue}>{cartItems.length}</Text>
//           </View>
          
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Subtotal</Text>
//             <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
//           </View>
          
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Servicio</Text>
//             <Text style={styles.summaryValue}>${serviceFee}</Text>
//           </View>
          
//           <View style={[styles.summaryRow, { marginTop: 10 }]}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
//           </View>

//           <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
//             <Text style={styles.payButtonText}>Ir a Pagar</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F2',
//   },
//   // --- Header ---
//   headerCard: {
//     backgroundColor: COLORS.white,
//     paddingTop: Platform.OS === 'android' ? 40 : 20,
//     paddingBottom: 0,
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
//     marginBottom: 20,
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
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   tabButton: {
//     marginHorizontal: 30,
//     paddingBottom: 10,
//   },
//   activeTabBorder: {
//     borderBottomWidth: 3,
//     borderBottomColor: '#F57C00',
//   },
//   tabText: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: '600',
//     color: COLORS.textSecondary,
//   },
//   activeTabText: {
//     color: COLORS.text,
//   },
//   // --- Contenido ---
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   listContainer: {
//     padding: 20,
//   },
//   // --- Tarjeta Carrito ---
//   cartCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 10,
//     marginBottom: 15,
//     flexDirection: 'row',
//     alignItems: 'center', // Centra verticalmente los elementos de la tarjeta
//     justifyContent: 'space-between', // Separa imagen/info del control de cantidad
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cartImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginRight: 15,
//   },
//   cartInfo: {
//     flex: 1, // Toma el espacio restante
//     marginRight: 10,
//   },
//   cartTitle: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   cartSubtitle: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//     marginBottom: 5,
//   },
//   cartPrice: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: '#F57C00',
//   },
  
//   // --- CONTROL VERTICAL DE CANTIDAD (CORREGIDO) ---
//   quantityContainer: {
//     backgroundColor: COLORS.primary, // Naranja
//     borderRadius: 20, // Bordes más redondeados tipo píldora
//     width: 40, // Un poco más ancho para comodidad
//     height: 110, // Altura suficiente
//     flexDirection: 'column', // Elementos uno debajo del otro
//     alignItems: 'center', // Centrado horizontal
//     justifyContent: 'space-between', // Distribución equitativa: top, center, bottom
//     paddingVertical: 8, // Espacio interno arriba y abajo
//   },
//   qtyButton: {
//     width: '100%',
//     height: 30, // Área de toque
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyText: {
//     color: COLORS.white,
//     fontSize: 22,
//     fontWeight: 'bold',
//     lineHeight: 24, // Ayuda a centrar visualmente el caracter
//   },
//   qtyValue: {
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
  
//   // --- Tarjeta Historial ---
//   historyCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   historyHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   historyImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginRight: 15,
//   },
//   historyInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   cardPriceOrange: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: '#F57C00',
//     marginTop: 5,
//   },
//   historyDetails: {
//     paddingLeft: 10,
//   },
//   statusTitle: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   statusTime: {
//     fontSize: FONT_SIZES.small,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginTop: 2,
//   },
//   statusDate: {
//     fontSize: FONT_SIZES.small,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginVertical: 10,
//     width: '100%',
//   },
//   historyNotes: {
//     fontSize: FONT_SIZES.small,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   // --- Resumen ---
//   summaryContainer: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 25,
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   summaryTitle: {
//     fontSize: FONT_SIZES.xlarge,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 15,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//   },
//   summaryValue: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   totalLabel: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   totalValue: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   payButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 25,
//     height: 55,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   payButtonText: {
//     color: COLORS.white,
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//   }
// });