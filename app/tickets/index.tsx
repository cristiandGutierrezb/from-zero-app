/**
 * Bandeja de solicitudes: búsqueda y filtrado (F11).
 *
 * Lo que se ve depende del rol y lo decide el servidor: un SOLICITANTE recibe
 * solo sus casos (F10); agentes y coordinación, todos. La app no filtra por
 * dueño: pedirlo sería confiar en el cliente para algo que es de seguridad.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { listCategories } from '../../src/api/categories';
import { searchTickets } from '../../src/api/tickets';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import { STATUSES, type Ticket, type TicketStatus } from '../../src/types';

export default function TicketList() {
  const [text, setText] = useState('');
  /** Lo que realmente se consultó: el texto se aplica al enviar, no al teclear. */
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  /** Solo para la rueda del gesto de arrastrar; la carga inicial usa `tickets === null`. */
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTickets(
        await searchTickets({
          ...(status ? { status } : {}),
          ...(query ? { text: query } : {}),
        }),
      );
    } catch (failure) {
      setError((failure as Error).message);
      setTickets([]);
    }
  }, [query, status]);

  // Al volver de crear o de editar un caso, la lista se refresca sola.
  useFocusEffect(
    useCallback(() => {
      void load();
      // Todas las categorías, no solo las activas: un ticket viejo puede
      // pertenecer a una que ya se retiró del catálogo.
      listCategories(false)
        .then((list) => setNames(Object.fromEntries(list.map((c) => [c.id, c.name]))))
        .catch(() => setNames({}));
    }, [load]),
  );

  if (tickets === null) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="gap-3 border-b border-neutral-200 bg-white p-4">
        <TextInput
          className="rounded-xl border border-neutral-300 bg-white p-3"
          placeholder="Buscar en asunto y descripción…"
          placeholderTextColor="#a3a3a3"
          value={text}
          onChangeText={setText}
          returnKeyType="search"
          // Se busca al enviar y no en cada tecla: una petición por búsqueda.
          onSubmitEditing={() => setQuery(text.trim())}
        />
        <View className="flex-row flex-wrap gap-2">
          {[null, ...STATUSES].map((option) => {
            const active = option === status;
            return (
              <Pressable
                key={option ?? 'TODOS'}
                onPress={() => setStatus(option)}
                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                  active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
                }`}>
                <Text
                  className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
                  {option?.replace(/_/g, ' ') ?? 'TODOS'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(ticket) => ticket.id}
        contentContainerClassName="gap-3 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <Text className="p-6 text-center text-neutral-500">
            {error ?? 'No hay solicitudes que coincidan con la búsqueda.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/tickets/${item.id}`)}
            className="gap-2 rounded-2xl bg-white p-4 active:opacity-80">
            <Text className="font-semibold text-neutral-900" numberOfLines={1}>
              {item.subject}
            </Text>
            <Text className="text-neutral-500" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Badge value={item.status} />
              <Badge value={item.priority} />
              <Text className="text-xs text-neutral-400">
                {names[item.categoryId] ?? 'Sin categoría'} ·{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View className="border-t border-neutral-200 bg-white p-4">
        <Button text="Reportar una solicitud" onPress={() => router.push('/tickets/new')} />
      </View>
    </View>
  );
}
