/**
 * Layout raíz: envuelve TODA la app.
 *
 * Hace tres cosas:
 *  1. Pone el proveedor de sesión, para que cualquier pantalla pueda saber
 *     quién entró.
 *  2. Activa las notificaciones push para la sesión.
 *  3. Declara la navegación y decide, con `Stack.Protected`, qué pantallas
 *     existen según haya sesión o no. Sin sesión, las rutas privadas ni
 *     siquiera están registradas: no hay forma de llegar a ellas.
 */

import { Stack } from 'expo-router';
import '../global.css';
import { isCoordination, SessionProvider, useSession } from '../src/modules/auth/session';
import { usePushNotifications } from '../src/modules/notifications/push';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Navigator />
    </SessionProvider>
  );
}

function Navigator() {
  const { user } = useSession();
  // F09: registra el teléfono al entrar y abre el caso al tocar un aviso.
  usePushNotifications(!!user);

  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      {/* Con sesión iniciada */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" options={{ title: 'HelpDesk UAM' }} />
        <Stack.Screen name="tickets/index" options={{ title: 'Solicitudes' }} />
        <Stack.Screen name="tickets/new" options={{ title: 'Nueva solicitud' }} />
        {/* `[id]` es un segmento variable: una sola pantalla para todos los casos. */}
        <Stack.Screen name="tickets/[id]" options={{ title: 'Detalle del caso' }} />
        {/* Grupos con su propio _layout: se registran por el nombre de la carpeta. */}
        <Stack.Screen name="categories" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Ejemplos de clase: fuera del producto y de toda guarda. */}
      <Stack.Screen name="ejemplos/estilos" options={{ title: 'Ejemplo · Galería de estilos' }} />

      {/* Sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
