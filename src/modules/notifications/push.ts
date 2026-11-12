/**
 * Notificaciones push (F09): pedir permiso, obtener el token del dispositivo,
 * registrarlo en el servidor y abrir el caso cuando el usuario toca un aviso.
 *
 * Quién recibe qué lo decide el servidor (cada cambio de estado avisa al
 * solicitante). La app solo dice «este teléfono es mío» y reacciona al toque.
 */

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { savePushToken } from './api';

// Sin esto, un aviso que llega con la app ABIERTA no se muestra.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Devuelve el ExpoPushToken de este teléfono, o null si no se puede:
 * permiso negado, web, o Expo Go en Android (desde el SDK 53 no trae push;
 * hace falta un development build).
 */
async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Android 13+: el canal debe existir ANTES de pedir permiso, o el diálogo no aparece.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos de solicitudes',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return null;

  // El projectId de EAS (app.json -> extra.eas.projectId) dice a qué app pertenece el token.
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

/**
 * Se usa una vez, en el layout raíz.
 *  - Al iniciar sesión registra el dispositivo en el servidor.
 *  - Al tocar un aviso abre el caso. `useLastNotificationResponse` cubre también
 *    la app cerrada: el toque espera a que haya sesión y entonces navega.
 */
export function usePushNotifications(signedIn: boolean): void {
  useEffect(() => {
    if (!signedIn) return;
    getPushToken()
      .then((pushToken) => (pushToken ? savePushToken(pushToken) : undefined))
      // Sin avisos la app sigue sirviendo: se informa y se sigue. Nunca se
      // imprime el token: identifica el teléfono (regla 3 de AGENTS.md).
      .catch((failure: Error) => console.warn('Notificaciones push no disponibles:', failure.message));
  }, [signedIn]);

  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const ticketId = response?.notification.request.content.data?.ticketId;
    if (!signedIn || typeof ticketId !== 'string') return;
    // Se consume: si no, volvería a abrir el mismo caso en el próximo inicio de sesión.
    Notifications.clearLastNotificationResponse();
    router.push({ pathname: '/tickets/[id]', params: { id: ticketId } });
  }, [response, signedIn]);
}
