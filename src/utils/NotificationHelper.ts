import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    
    shouldPlaySound: true,
    shouldSetBadge: false,
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
    trigger: null, 
  });
};