// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   Image, 
//   FlatList, 
//   StatusBar,
//   Platform,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { COLORS, FONT_SIZES,RootStackParamList } from '../../../types';
// import { ClientBottomNavBar } from '../../components/ClientBottomNavBar';
// import { StackScreenProps } from '@react-navigation/stack';

// type Props = StackScreenProps<RootStackParamList,'ClientOrderTracking'>;

// // Datos Simulados para el Cliente
// const myOrders = [
//   { 
//     id: '1', 
//     title: 'Cafe Panda', 
//     subtitle: 'Latte', 
//     price: '110.00', 
//     image: require('../../../assets/cafePanda.png'), 
//     status: 'Recibido',
//     timeInfo: 'Listo a las 7:30pm',
//     note: 'Fueron a comprar la leche'
//   },
//   { 
//     id: '2', 
//     title: 'Bowl con Frutas', 
//     subtitle: 'Fresa, Kiwi, Avena', 
//     price: '120.99', 
//     image: require('../../../assets/bowlFrutas.png'), 
//     status: 'En preparacion',
//     timeInfo: 'Listo a las 7:20pm',
//     note: ''
//   },
// ];

// export const ClientOrderTrackingScreen: React.FC<Props> = ({navigation}) => {

//   const handleComingSoon = (feature: string) => {
//     Alert.alert(feature, "Próximamente");
//   };
//   const handleCart = () => {
//     navigation.navigate('Cart');
//   };

//   const renderOrderItem = ({ item }: { item: typeof myOrders[0] }) => (
//     <View style={styles.card}>
//       <View style={styles.cardTopRow}>
//         {/* Imagen Circular */}
//         <Image source={item.image} style={styles.cardImage} />
        
//         {/* Info Principal */}
//         <View style={styles.cardHeaderInfo}>
//           <Text style={styles.cardTitle}>{item.title}</Text>
//           <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
//           <Text style={styles.cardPrice}>${item.price}</Text>
//         </View>
//       </View>

//       {/* Línea Divisoria */}
//       <View style={styles.separator} />

//       {/* Estatus y Hora */}
//       <View style={styles.statusContainer}>
//         <Text style={styles.statusText}>{item.status}</Text>
//         <Text style={styles.timeText}>{item.timeInfo}</Text>
//       </View>

//       {/* Nota (Solo si existe) */}
//       {item.note ? (
//         <>
//           <View style={styles.separator} />
//           <Text style={styles.noteText}>{item.note}</Text>
//         </>
//       ) : null}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       {/* HEADER ESTILO CURVO */}
//       <View style={styles.headerCard}>
//         <View style={styles.headerContent}>
//           {/* Espaciador para centrar */}
//           <View style={{ width: 40 }} />
          
//           <View style={styles.titleContainer}>
//             <Text style={styles.headerTitle}>Seguimiento</Text>
//             <View style={styles.headerUnderline} />
//           </View>
          
//           {/* Carrito */}
//           <TouchableOpacity onPress={handleCart}>
//             <View>
//               <Feather name="shopping-cart" size={28} color={COLORS.text} />
//               {/* Badge opcional si quisieras mantenerlo */}
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* LISTA DE PEDIDOS */}
//       <FlatList
//         data={myOrders}
//         renderItem={renderOrderItem}
//         keyExtractor={item => item.id}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F2', // Fondo gris claro
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
//   titleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   headerUnderline: {
//     height: 3,
//     width: '100%',
//     backgroundColor: '#F57C00', // Naranja
//     marginTop: 2,
//   },
//   // --- Lista ---
//   listContent: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 110, // Espacio para navbar
//   },
//   // --- Tarjeta de Pedido ---
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   cardImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40, // Circular
//     marginRight: 20,
//   },
//   cardHeaderInfo: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   cardTitle: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   cardSubtitle: {
//     fontSize: FONT_SIZES.small,
//     color: COLORS.textSecondary,
//     marginBottom: 5,
//   },
//   cardPrice: {
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     color: '#F57C00', // Naranja
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginVertical: 10,
//   },
//   statusContainer: {
//     marginVertical: 5,
//   },
//   statusText: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 5,
//   },
//   timeText: {
//     fontSize: FONT_SIZES.large, // Un poco más grande
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   noteText: {
//     fontSize: FONT_SIZES.small,
//     color: '#666',
//     marginTop: 5,
//     fontStyle: 'italic' // Opcional, para que parezca nota
//   }
// });