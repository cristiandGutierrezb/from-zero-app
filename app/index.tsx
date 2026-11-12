import { Link, router } from 'expo-router';
import { Text, View } from 'react-native';
import Button from '../src/components/Button';
import { isCoordination, useSession } from '../src/modules/auth/session';
import { savePushToken } from '../src/modules/notifications/api';

/** Pantalla de inicio: quién eres y qué puedes hacer. */
export default function Home() {
  const { user, signOut } = useSession();

  // Primero se desasocia el teléfono (aún con sesión válida), para que los
  // avisos del caso no le lleguen a quien entre después en este dispositivo.
  // Si falla (sin red), se cierra igual: salir no puede quedar bloqueado.
  const logOut = async () => {
    await savePushToken(null).catch(() => {});
    signOut();
  };

  return (
    <View className="flex-1 gap-6 bg-neutral-50 p-6">
      <View className="gap-1 rounded-2xl bg-white p-5">
        <Text className="text-xl font-bold text-neutral-900">Hola, {user?.name}</Text>
        <Text className="text-neutral-500">{user?.email}</Text>
        {/* El rol lo asigna el backend y define qué puede hacer cada quien (F20). */}
        <Text className="mt-2 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {user?.role}
        </Text>
      </View>

      <View className="gap-3">
        <Button text="Reportar una solicitud" onPress={() => router.push('/tickets/new')} />
        {/* Un solicitante ve solo sus casos; agentes y coordinación, todos (F10). */}
        <Button
          text={user?.role === 'SOLICITANTE' ? 'Mis solicitudes' : 'Bandeja de solicitudes'}
          onPress={() => router.push('/tickets')}
          secondary
        />
        {/* La coordinación es la que define los compromisos de atención (F04). */}
        {isCoordination(user) && (
          <Button
            text="Catálogo de categorías"
            onPress={() => router.push('/categories')}
            secondary
          />
        )}
        <Button text="Cerrar sesión" onPress={logOut} secondary />
      </View>

      {/* Material de clase, no parte del producto: un enlace discreto al final. */}
      <Link href="/ejemplos/estilos" className="mt-auto text-center text-xs text-neutral-400">
        Ejemplos de clase · galería de estilos
      </Link>
    </View>
  );
}
