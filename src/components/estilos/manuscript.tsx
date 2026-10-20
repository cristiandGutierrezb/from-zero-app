import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Pergamino: centro claro, bordes quemados (radial + sombra interior café).
const PARCHMENT = 'radial-gradient(circle at 50% 40%, #fdf6e3 0%, #f1e2bf 60%, #d9bf8a 100%)';
const INK = 'text-[#3b2a1a]';

/** Hoja de pergamino. `font-serif` = Georgia en iOS, serif en Android. */
export function ParchmentCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View
      className="gap-3 rounded-sm p-6"
      style={{
        experimental_backgroundImage: PARCHMENT,
        boxShadow: 'inset 0 0 40px rgba(120,80,20,0.35), 0 8px 18px rgba(0,0,0,0.35)',
      }}>
      <Text className={`text-center font-serif text-2xl font-bold italic ${INK}`}>{title}</Text>
      <Text className="text-center text-[#8b5e34]">❦ ── ✦ ── ❦</Text>
      {children}
    </View>
  );
}

/** Párrafo con letra capital, como en los manuscritos. */
export function DropCapParagraph({ text }: { text: string }) {
  return (
    <View className="flex-row gap-2">
      <Text className="font-serif text-5xl font-bold leading-[52px] text-[#7f1d1d]">{text[0]}</Text>
      <Text className={`flex-1 pt-1 font-serif text-base leading-6 ${INK}`}>{text.slice(1)}</Text>
    </View>
  );
}

/** Fila de la carta: nombre … precio, con línea de puntos. */
export function MenuLine({ name, price }: { name: string; price: string }) {
  return (
    <View className="flex-row items-end gap-2">
      <Text className={`font-serif text-lg ${INK}`}>{name}</Text>
      <View className="mb-1.5 flex-1 border-b border-dotted border-[#8b5e34]" />
      <Text className={`font-serif text-lg font-bold ${INK}`}>{price}</Text>
    </View>
  );
}

/** Sello de cera como botón principal. */
export function WaxSealButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={text} className="items-center active:scale-95">
      <View
        className="h-24 w-24 items-center justify-center rounded-full"
        style={{
          experimental_backgroundImage: 'radial-gradient(circle at 40% 35%, #ef4444 0%, #991b1b 60%, #450a0a 100%)',
          boxShadow: '0 6px 12px rgba(69,10,10,0.55), inset 0 0 0 6px rgba(0,0,0,0.15)',
        }}>
        <Text className="px-2 text-center font-serif text-sm font-bold text-[#fde2e2]">{text}</Text>
      </View>
    </Pressable>
  );
}

export function ManuscriptDemo() {
  return (
    <View className="flex-1 justify-center gap-6 bg-[#3b2a1a] p-6">
      <ParchmentCard title="La Carta">
        <DropCapParagraph text="Bienvenido a nuestra mesa. Cada plato se prepara al momento con ingredientes de la región." />
        <MenuLine name="Bandeja paisa" price="$32.000" />
        <MenuLine name="Ajiaco" price="$24.000" />
      </ParchmentCard>
      <WaxSealButton text="Llevar a la mesa" />
    </View>
  );
}
