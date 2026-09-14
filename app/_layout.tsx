/**
 * Layout raíz: envuelve TODA la app.
 *
 * Hace dos cosas:
 *  1. Pone el proveedor de sesión, para que cualquier pantalla pueda saber
 *     quién entró.
 *  2. Declara la navegación y decide, con `Stack.Protected`, qué pantallas
 *     existen según haya sesión o no. Sin sesión, las rutas privadas ni
 *     siquiera están registradas: no hay forma de llegar a ellas.
 */

import { Stack } from 'expo-router';
import '../global.css';
import { SessionProvider, useSession } from '../src/session/context';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Navigator />
    </SessionProvider>
  );
}

function Navigator() {
  const { user } = useSession();

  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      {/* Con sesión iniciada */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" options={{ title: 'HelpDesk UAM' }} />
        <Stack.Screen name="tickets/index" options={{ title: 'Solicitudes' }} />
        <Stack.Screen name="tickets/new" options={{ title: 'Nueva solicitud' }} />
        {/* `[id]` es un segmento variable: una sola pantalla para todos los casos. */}
        <Stack.Screen name="tickets/[id]" options={{ title: 'Detalle del caso' }} />
      </Stack.Protected>

      {/* Sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>
    </Stack>
  );
}
