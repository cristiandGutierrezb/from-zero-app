/**
 * Catálogo de categorías y SLA (F04).
 *
 * «El coordinador administra categorías y tiempos de compromiso sin
 * intervención del equipo de desarrollo»: esta es esa pantalla. Cambiar el SLA
 * de «Red» de 4 a 2 horas es editar una fila aquí, no desplegar código.
 *
 * Solo llega quien coordina (ver `app/_layout.tsx`), pero el permiso de verdad
 * lo aplica el servidor con un 403.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import Button from '../../src/components/Button';
import { listCategories } from '../../src/modules/categories/api';
import type { Category } from '../../src/modules/categories/types';

export default function CategoryList() {
  const [onlyActive, setOnlyActive] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCategories(await listCategories(onlyActive));
    } catch (failure) {
      setError((failure as Error).message);
      setCategories([]);
    }
  }, [onlyActive]);

  // Al volver de crear o de editar, el catálogo se refresca solo.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (categories === null) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="gap-3 border-b border-neutral-200 bg-white p-4">
        <Text className="text-neutral-500">
          La categoría fija el compromiso de atención de los casos que clasifica.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {[
            { value: false, label: 'TODAS' },
            { value: true, label: 'SOLO ACTIVAS' },
          ].map((option) => {
            const active = option.value === onlyActive;
            return (
              <Pressable
                key={option.label}
                onPress={() => setOnlyActive(option.value)}
                className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                  active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
                }`}>
                <Text
                  className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(category) => category.id}
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
            {error ?? 'El catálogo está vacío. Crea la primera categoría.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/categories/${item.id}`)}
            className="gap-2 rounded-2xl bg-white p-4 active:opacity-80">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="font-semibold text-neutral-900">{item.name}</Text>
              {/* El SLA es el dato que justifica el producto: va visible, no escondido. */}
              <Text className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                {item.slaHours} h
              </Text>
              {!item.active && (
                <Text className="self-start rounded-full bg-neutral-200 px-2.5 py-1 text-[10px] font-bold text-neutral-700">
                  INACTIVA
                </Text>
              )}
            </View>
            <Text className="text-neutral-500" numberOfLines={2}>
              {item.description || 'Sin descripción'}
            </Text>
          </Pressable>
        )}
      />

      <View className="border-t border-neutral-200 bg-white p-4">
        <Button text="Nueva categoría" onPress={() => router.push('/categories/new')} />
      </View>
    </View>
  );
}
