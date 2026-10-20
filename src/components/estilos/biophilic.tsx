import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Biophilic: formas orgánicas (nada perfectamente simétrico), paleta de tierra, hoja, cielo y arena.
const SOFT = '0 8px 20px rgba(63,98,18,0.18)';

/** Tarjeta "piedra de río": cada esquina con un radio distinto. */
export function PebbleCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-2 rounded-bl-[40px] rounded-br-[20px] rounded-tl-[24px] rounded-tr-[48px] bg-[#f5efe0] p-6"
      style={{ boxShadow: SOFT }}>
      {children}
    </View>
  );
}

export function LeafButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="items-center rounded-bl-[8px] rounded-br-[28px] rounded-tl-[28px] rounded-tr-[8px] bg-[#4d7c0f] py-4 active:bg-[#3f6212]">
      <Text className="text-lg font-semibold text-[#f5efe0]">{text}</Text>
    </Pressable>
  );
}

/** Progreso que "crece": un tallo con hojas que aparecen según el avance. */
export function GrowthMeter({ value }: { value: number }) {
  const leaves = Math.round(value / 20);
  return (
    <View className="flex-row items-center gap-1">
      <View className="h-1 flex-1 rounded-full bg-[#d6cbb0]">
        <View className="h-full rounded-full bg-[#65a30d]" style={{ width: `${value}%` }} />
      </View>
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          className={`h-3 w-3 rounded-bl-none rounded-br-full rounded-tl-full rounded-tr-none ${
            i < leaves ? 'bg-[#65a30d]' : 'bg-[#d6cbb0]'
          }`}
        />
      ))}
    </View>
  );
}

export function TerrainChip({ text }: { text: string }) {
  return (
    <View className="self-start rounded-full bg-[#b45309]/15 px-3 py-1">
      <Text className="text-xs font-bold text-[#92400e]">{text}</Text>
    </View>
  );
}

export function BiophilicDemo() {
  return (
    <View className="flex-1 bg-[#fbf8f1]">
      {/* Cielo → montaña: el encabezado se funde con el paisaje */}
      <View
        className="h-48 justify-end rounded-b-[60px] p-6"
        style={{ experimental_backgroundImage: 'linear-gradient(180deg, #bae6fd 0%, #d9f99d 70%, #a3e635 100%)' }}>
        <Text className="text-3xl font-bold text-[#1a2e05]">Finca La Esperanza</Text>
        <Text className="text-[#365314]">Vereda El Rosario · 1.850 m</Text>
      </View>
      <View className="gap-5 p-6">
        <PebbleCard>
          <TerrainChip text="Café castillo" />
          <Text className="text-lg font-semibold text-[#1a2e05]">Etapa: floración</Text>
          <GrowthMeter value={60} />
        </PebbleCard>
        <LeafButton text="Registrar cultivo" />
      </View>
    </View>
  );
}
