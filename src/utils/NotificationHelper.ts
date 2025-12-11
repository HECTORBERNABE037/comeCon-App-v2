import * as Notifications from 'expo-notifications';

// Configuración global: Cómo se muestran las alertas cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // ELIMINADO: shouldShowAlert: true (Obsoleto)
    
    shouldPlaySound: true,
    shouldSetBadge: false,
    
    // NUEVOS: Reemplazan a shouldShowAlert
    shouldShowBanner: true, // Muestra el banner emergente
    shouldShowList: true,   // Lo mantiene en la lista de notificaciones
  }),
});

export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true, 
    },
    trigger: null, // null significa "mostrar inmediatamente"
  });
};