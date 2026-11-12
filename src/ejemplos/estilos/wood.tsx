import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// La veta: muchas paradas de café claro/oscuro en 90° dibujan franjas verticales.
const WOOD =
  'linear-gradient(90deg, #8b5a2b 0%, #a0632f 7%, #7a4a22 13%, #a86b3c 27%, #8b5a2b 41%, #6f4320 55%, #a0632f 72%, #7c4a24 88%, #8b5a2b 100%)';
const BRASS = 'linear-gradient(180deg, #fde68a 0%, #ca8a04 50%, #fef3c7 55%, #a16207 100%)';
const CARVED = { textShadowColor: 'rgba(255,255,255,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 };

function Screw() {
  return (
    <View
      className="h-2.5 w-2.5 rounded-full"
      style={{ experimental_backgroundImage: 'radial-gradient(circle at 35% 35%, #fef9c3 0%, #854d0e 100%)' }}
    />
  );
}

/** Tablón de madera: veta + biselado interior. */
export function WoodPanel({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-4 rounded-2xl border-2 border-[#4a2c12] p-5"
      style={{
        experimental_backgroundImage: WOOD,
        boxShadow: '0 10px 20px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.3)',
      }}>
      {children}
    </View>
  );
}

/** Placa de latón atornillada, con texto grabado. */
export function BrassPlate({ text }: { text: string }) {
  return (
    <View
      className="flex-row items-center justify-between self-center rounded-md px-3 py-2"
      style={{ experimental_backgroundImage: BRASS, boxShadow: '0 2px 4px rgba(0,0,0,0.5)', minWidth: 180 }}>
      <Screw />
      <Text className="font-serif text-base font-bold uppercase tracking-widest text-[#422006]" style={CARVED}>
        {text}
      </Text>
      <Screw />
    </View>
  );
}

/** Percha (gancho de metal + barra) con una prenda colgada. */
export function HangerItem({ name, color }: { name: string; color: string }) {
  return (
    <View className="items-center">
      <View className="h-4 w-4 rounded-t-full border-2 border-b-0 border-neutral-300" />
      <View className="h-1.5 w-20 rounded-full bg-neutral-300" style={{ boxShadow: '0 2px 2px rgba(0,0,0,0.4)' }} />
      <View className="mt-1 h-24 w-20 rounded-b-2xl rounded-t-md" style={{ backgroundColor: color, boxShadow: '0 6px 10px rgba(0,0,0,0.35)' }} />
      <Text className="mt-2 text-xs font-semibold text-[#fde8c8]">{name}</Text>
    </View>
  );
}

export function WoodButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View
          className="items-center rounded-xl border-2 border-[#4a2c12] py-3"
          style={{
            experimental_backgroundImage: WOOD,
            boxShadow: pressed ? 'inset 0 3px 6px rgba(0,0,0,0.5)' : '0 4px 0 #3b2410, 0 6px 10px rgba(0,0,0,0.4)',
            transform: [{ translateY: pressed ? 3 : 0 }],
          }}>
          <Text className="font-serif text-lg font-bold text-[#fde8c8]">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function WoodDemo() {
  return (
    <View className="flex-1 justify-center gap-6 bg-[#2b1a0c] p-6">
      <WoodPanel>
        <BrassPlate text="Mi clóset" />
        <View className="flex-row justify-around">
          <HangerItem name="Camisa" color="#60a5fa" />
          <HangerItem name="Chaqueta" color="#78716c" />
          <HangerItem name="Vestido" color="#f472b6" />
        </View>
      </WoodPanel>
      <WoodButton text="Sugerir outfit" />
    </View>
  );
}
