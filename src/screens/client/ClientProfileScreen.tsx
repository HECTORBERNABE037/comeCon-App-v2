// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   Image, 
//   TouchableOpacity, 
//   StatusBar,
//   Platform
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { Feather } from '@expo/vector-icons';
// import { ClientBottomNavBar } from '../../components/ClientBottomNavBar'; // Barra del cliente
// import { COLORS, FONT_SIZES, ClientProfile,RootStackParamList } from '../../../types';

// // Tipo de navegación
// type ClientProfileNavigationProp = StackNavigationProp<RootStackParamList, 'ClientProfile'>;

// // Datos Simulados del Cliente (Diferentes al Admin)
// const clientData: ClientProfile = {
//   fullName: 'Juan Pérez López',
//   nickname: 'Juan P.',
//   email: 'cliente1@comecon.com',
//   phone: '+52 55 1234 5678',
//   gender: 'Masculino',
//   country: 'Mexico',
//   address: 'Calle Falsa 123',
//   image: require('../../../assets/logoApp.png'), // Placeholder
// };

// export const ClientProfileScreen = () => {
//   const navigation = useNavigation<ClientProfileNavigationProp>();

//   const handleEditProfile = () => {
//     navigation.navigate('EditClientProfile');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
//       {/* Header Estilo Tarjeta Superior */}
//       <View style={styles.headerCard}>
//         <Text style={styles.headerTitle}>Informacion Personal</Text>
//         <View style={styles.headerUnderline} />
//       </View>

//       <View style={styles.content}>
        
//         {/* Imagen de Perfil */}
//         <View style={styles.profileImageContainer}>
//           <Image source={clientData.image} style={styles.profileImage} />
//           <View style={styles.editIconContainer}>
//              <Feather name="edit-2" size={16} color={COLORS.text} />
//           </View>
//         </View>

//         {/* Campos de Información */}
//         <View style={styles.infoGroup}>
//           <Text style={styles.label}>Nombre</Text>
//           <Text style={styles.value}>{clientData.fullName}</Text>
//           <View style={styles.separator} />
//         </View>

//         <View style={styles.infoGroup}>
//           <Text style={styles.label}>Telefono</Text>
//           <Text style={styles.value}>{clientData.phone}</Text>
//           <View style={styles.separator} />
//         </View>

//         <View style={styles.infoGroup}>
//           <Text style={styles.label}>Email</Text>
//           <Text style={styles.value}>{clientData.email}</Text>
//           <View style={styles.separator} />
//         </View>

//         {/* Botón Editar Perfil */}
//         <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
//           <Text style={styles.editButtonText}>EDITAR PERFIL</Text>
//         </TouchableOpacity>

//       </View>
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
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: FONT_SIZES.xlarge,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   headerUnderline: {
//     height: 3,
//     width: 250,
//     backgroundColor: '#F57C00', // Naranja
//     marginTop: 5,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 30,
//     alignItems: 'center',
//   },
//   profileImageContainer: {
//     position: 'relative',
//     marginBottom: 30,
//     marginTop: 10,
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#DDD',
//   },
//   editIconContainer: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: COLORS.white,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   infoGroup: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: FONT_SIZES.medium,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 5,
//   },
//   value: {
//     fontSize: FONT_SIZES.medium,
//     color: COLORS.text,
//     marginBottom: 5,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#CCC',
//     width: '100%',
//   },
//   editButton: {
//     backgroundColor: COLORS.primary, // Naranja
//     width: '100%',
//     height: 55,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 30,
//     elevation: 3,
//   },
//   editButtonText: {
//     color: COLORS.white,
//     fontSize: FONT_SIZES.large,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   }
// });