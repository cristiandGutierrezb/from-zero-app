import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Luminous Eco: bosque de noche + bioluminiscencia (resplandor verde lima).
const glow = (alpha = 0.45) => `0 0 24px rgba(163,230,53,${alpha}), 0 0 4px rgba(163,230,53,${alpha})`;

/** Tarjeta con forma de hoja: dos esquinas muy redondas y dos casi rectas. */
export function LeafCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-2 rounded-bl-lg rounded-br-[48px] rounded-tl-[48px] rounded-tr-lg border border-lime-400/30 bg-emerald-950/80 p-6"
      style={{ boxShadow: glow(0.25) }}>
      {children}
    </View>
  );
}

export function GlowButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View className="items-center rounded-full bg-lime-400 py-4" style={{ boxShadow: glow(pressed ? 0.9 : 0.5) }}>
          <Text className="text-lg font-bold text-emerald-950">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Medidor bioluminiscente (humedad, salud del cultivo…). */
export function EcoMeter({ label, value }: { label: string; value: number }) {
  return (
    <View className="gap-1.5">
      <View className="flex-row justify-between">
        <Text className="text-lime-200">{label}</Text>
        <Text className="font-bold text-lime-300">{value}%</Text>
      </View>
      <View className="h-3 rounded-full bg-emerald-900">
        <View
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            experimental_backgroundImage: 'linear-gradient(90deg, #10b981 0%, #a3e635 100%)',
            boxShadow: glow(0.7),
          }}
        />
      </View>
    </View>
  );
}

export function LuminousEcoDemo() {
  return (
    <View
      className="flex-1 justify-center gap-6 p-6"
      style={{ experimental_backgroundImage: 'radial-gradient(circle at 50% 0%, #065f46 0%, #022c22 60%, #011a14 100%)' }}>
      <LeafCard>
        <Text className="text-xl font-bold text-lime-100">Cultivo de café · Lote 3</Text>
        <EcoMeter label="Humedad del suelo" value={72} />
        <EcoMeter label="Salud de la hoja" value={45} />
      </LeafCard>
      <GlowButton text="Diagnosticar hoja" />
    </View>
  );
}
