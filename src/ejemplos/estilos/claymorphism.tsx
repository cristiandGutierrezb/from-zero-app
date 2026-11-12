import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Tres sombras: una exterior suave (flota) + dos interiores (relieve de plastilina).
const clay = (rgb: string) =>
  `0 14px 28px rgba(${rgb},0.35), inset -8px -8px 16px rgba(0,0,0,0.10), inset 8px 8px 16px rgba(255,255,255,0.7)`;

/** Superficie de plastilina: muy redondeada, color pastel y relieve interno. */
export function ClayCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View className={`gap-2 rounded-[36px] bg-violet-200 p-6 ${className ?? ''}`} style={{ boxShadow: clay('124,58,237') }}>
      {children}
    </View>
  );
}

/** Al presionar se "aplasta": baja un poco y pierde sombra exterior. */
export function ClayButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View
          className="items-center rounded-full bg-pink-300 px-6 py-4"
          style={{
            boxShadow: pressed
              ? 'inset -4px -4px 8px rgba(0,0,0,0.12), inset 4px 4px 8px rgba(255,255,255,0.6)'
              : clay('219,39,119'),
            transform: [{ scale: pressed ? 0.96 : 1 }],
          }}>
          <Text className="text-lg font-extrabold text-pink-900">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ClayChip({ text, color = 'bg-amber-200' }: { text: string; color?: string }) {
  return (
    <View className={`self-start rounded-full px-4 py-2 ${color}`} style={{ boxShadow: clay('217,119,6') }}>
      <Text className="font-bold text-neutral-800">{text}</Text>
    </View>
  );
}

export function ClayAvatar({ initial }: { initial: string }) {
  return (
    <View className="h-16 w-16 items-center justify-center rounded-full bg-sky-200" style={{ boxShadow: clay('2,132,199') }}>
      <Text className="text-2xl font-black text-sky-800">{initial}</Text>
    </View>
  );
}

export function ClaymorphismDemo() {
  return (
    <View className="flex-1 gap-6 bg-violet-50 p-6">
      <ClayCard>
        <View className="flex-row items-center gap-4">
          <ClayAvatar initial="D" />
          <View>
            <Text className="text-xl font-extrabold text-violet-900">Dra. Duque</Text>
            <Text className="text-violet-700">Dermatología</Text>
          </View>
        </View>
        <ClayChip text="Mañana 9:00" />
      </ClayCard>

      {/* Superficies superpuestas: la segunda sube sobre la primera con margen negativo. */}
      <ClayCard className="-mt-10 ml-8 bg-emerald-200">
        <Text className="font-bold text-emerald-900">Receta lista para descargar</Text>
      </ClayCard>

      <ClayButton text="Agendar cita" />
    </View>
  );
}
