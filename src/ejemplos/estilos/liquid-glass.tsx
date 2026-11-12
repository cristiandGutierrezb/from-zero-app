// npx expo install expo-glass-effect
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Liquid Glass solo existe en iOS 26+. En Android y iOS viejo se usa un respaldo translúcido.
const LIQUID = isLiquidGlassAvailable();

/**
 * GlassView no entiende `className` (no es un componente de React Native):
 * la forma (borderRadius) va en `style` y el contenido en un View con Tailwind.
 */
export function LiquidCard({ children }: { children: ReactNode }) {
  if (!LIQUID) {
    return <View className="gap-2 rounded-[28px] border border-white/40 bg-white/25 p-5">{children}</View>;
  }
  return (
    <GlassView glassEffectStyle="regular" style={{ borderRadius: 28 }}>
      <View className="gap-2 p-5">{children}</View>
    </GlassView>
  );
}

/** `isInteractive` hace que el vidrio reaccione al toque como en iOS (se estira y brilla). */
export function LiquidButton({ text, onPress, tint }: { text: string; onPress?: () => void; tint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:scale-95">
      {LIQUID ? (
        <GlassView isInteractive tintColor={tint} style={{ borderRadius: 999 }}>
          <Text className="px-6 py-3 font-semibold text-white">{text}</Text>
        </GlassView>
      ) : (
        <View className="rounded-full border border-white/40 px-6 py-3" style={{ backgroundColor: tint ?? 'rgba(255,255,255,0.25)' }}>
          <Text className="font-semibold text-white">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * GlassContainer agrupa varias piezas de vidrio: cuando están a menos de `spacing`
 * se fusionan como gotas de agua. Ideal para barras de herramientas flotantes.
 */
export function LiquidToolbar({ items }: { items: string[] }) {
  if (!LIQUID) {
    return (
      <View className="flex-row gap-2 self-center">
        {items.map((i) => (
          <View key={i} className="h-12 w-12 items-center justify-center rounded-full bg-white/25">
            <Text className="text-lg text-white">{i}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <GlassContainer spacing={10} style={{ flexDirection: 'row', gap: 6, alignSelf: 'center' }}>
      {items.map((i) => (
        <GlassView key={i} isInteractive style={{ width: 48, height: 48, borderRadius: 24 }}>
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-white">{i}</Text>
          </View>
        </GlassView>
      ))}
    </GlassContainer>
  );
}

export function LiquidGlassDemo() {
  return (
    <View
      className="flex-1 justify-end gap-4 p-6 pb-12"
      style={{ experimental_backgroundImage: 'linear-gradient(160deg, #0ea5e9 0%, #6366f1 50%, #ec4899 100%)' }}>
      <LiquidCard>
        <Text className="text-xl font-bold text-white">Zona Cable Plaza</Text>
        <Text className="text-white/80">6 cupos libres · $3.500/h</Text>
        <View className="flex-row gap-3 pt-2">
          <LiquidButton text="Reservar" tint="rgba(34,197,94,0.6)" />
          <LiquidButton text="Cómo llegar" />
        </View>
      </LiquidCard>
      <LiquidToolbar items={['⌖', '☰', '★']} />
    </View>
  );
}
