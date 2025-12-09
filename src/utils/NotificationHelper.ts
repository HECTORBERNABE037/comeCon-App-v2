import * as Notifications from 'expo-notifications';

// Configuración global: Cómo se muestran las alertas cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true, // Habilita sonido por defecto
    },
    trigger: null, // null significa "mostrar inmediatamente"
  });
};