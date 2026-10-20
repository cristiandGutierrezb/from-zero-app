import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Spatial UI (visionOS): capas a distintas profundidades. Lo lejano es más pequeño,
// más oscuro y con menos sombra; lo cercano flota con sombra grande y difusa.
const FLOAT = '0 30px 60px rgba(15,23,42,0.45), 0 8px 16px rgba(15,23,42,0.25)';

/** Ventana flotante. `depth` 0 = al frente, 1 = una capa atrás. */
export function SpatialWindow({ children, depth = 0 }: { children: ReactNode; depth?: 0 | 1 }) {
  return (
    <View
      className="gap-3 rounded-[32px] border border-white/30 bg-white/20 p-6"
      style={{
        boxShadow: depth === 0 ? FLOAT : '0 10px 20px rgba(15,23,42,0.25)',
        opacity: depth === 0 ? 1 : 0.6,
        // Sin rotateX: en iOS la mitad inclinada "hacia adentro" queda detrás del fondo y se corta.
        transform: [{ scale: depth === 0 ? 1 : 0.9 }],
      }}>
      {children}
    </View>
  );
}

/** Al presionar, la pieza "se acerca": sube y su sombra crece (como el hover de la mirada en visionOS). */
export function SpatialTile({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-1">
      {({ pressed }) => (
        <View
          className="h-24 items-center justify-center rounded-3xl bg-white/30"
          style={{
            boxShadow: pressed ? FLOAT : '0 6px 12px rgba(15,23,42,0.2)',
            transform: [{ translateY: pressed ? -6 : 0 }, { scale: pressed ? 1.04 : 1 }],
          }}>
          <Text className="font-semibold text-white">{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** "Ornamento": barra de controles que flota debajo de la ventana, superpuesta a su borde. */
export function SpatialOrnament({ items }: { items: string[] }) {
  return (
    <View
      className="-mt-7 flex-row gap-4 self-center rounded-full border border-white/30 bg-slate-800/70 px-5 py-3"
      style={{ boxShadow: FLOAT }}>
      {items.map((i) => (
        <Text key={i} className="text-lg text-white">
          {i}
        </Text>
      ))}
    </View>
  );
}

export function SpatialDemo() {
  return (
    <View
      className="flex-1 justify-center p-6"
      style={{ experimental_backgroundImage: 'linear-gradient(180deg, #334155 0%, #64748b 100%)' }}>
      <View>
        {/* Capa de atrás, asomándose por encima de la ventana principal */}
        <View className="absolute -top-14 left-6 right-6">
          <SpatialWindow depth={1}>
            <Text className="text-white">Historial</Text>
          </SpatialWindow>
        </View>

        <SpatialWindow>
          <Text className="text-2xl font-bold text-white">Trabajos de hoy</Text>
          <View className="flex-row gap-3">
            <SpatialTile title="3 asignados" />
            <SpatialTile title="1 en camino" />
          </View>
        </SpatialWindow>
      </View>
      <SpatialOrnament items={['◀', '⌂', '⚙']} />
    </View>
  );
}
