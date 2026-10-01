import { Stack } from 'expo-router';

export default function CategoriesLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      <Stack.Screen name="index" options={{ title: 'Categorías' }} />
      <Stack.Screen name="new" options={{ title: 'Nueva categoría' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar categoría' }} />
    </Stack>
  );
}
