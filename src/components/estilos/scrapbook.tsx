import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Scrapbook / Sticker: papel, cinta, recortes torcidos y stickers con borde blanco grueso.
const PAPER = '0 4px 8px rgba(0,0,0,0.18)';

/** Cinta adhesiva semitransparente, pegada torcida sobre el borde de arriba. */
function Tape({ className }: { className?: string }) {
  return <View className={`absolute -top-3 h-6 w-24 self-center bg-yellow-100/70 ${className ?? ''}`} />;
}

/** Foto tipo polaroid: marco blanco con el borde inferior más grueso, ligeramente girada. */
export function PolaroidCard({ caption, color, tilt = '-rotate-2' }: { caption: string; color: string; tilt?: string }) {
  return (
    <View className={`bg-white p-3 pb-10 ${tilt}`} style={{ boxShadow: PAPER }}>
      <Tape className="rotate-3" />
      {/* En la app real aquí va un <Image />; el color es un marcador de posición */}
      <View className="h-40 w-48" style={{ backgroundColor: color }} />
      <Text className="absolute bottom-3 left-0 right-0 text-center font-serif italic text-neutral-700">{caption}</Text>
    </View>
  );
}

/** Sticker: borde blanco grueso + sombra + rotación. */
export function Sticker({ text, bg = 'bg-pink-400', tilt = 'rotate-6' }: { text: string; bg?: string; tilt?: string }) {
  return (
    <View className={`self-start rounded-full border-4 border-white px-4 py-2 ${bg} ${tilt}`} style={{ boxShadow: PAPER }}>
      <Text className="font-black uppercase text-white">{text}</Text>
    </View>
  );
}

/** Nota en papel rayado. Las líneas son vistas absolutas cada 28 px. */
export function LinedNote({ children }: { children: ReactNode }) {
  return (
    <View className="-rotate-1 overflow-hidden bg-[#fffdf5] p-5 pl-10" style={{ boxShadow: PAPER }}>
      {Array.from({ length: 8 }, (_, i) => (
        <View key={i} className="absolute left-0 right-0 h-px bg-sky-200" style={{ top: 44 + i * 28 }} />
      ))}
      <View className="absolute bottom-0 left-7 top-0 w-px bg-red-300" />
      {children}
    </View>
  );
}

/** Botón recortado: borde punteado de "corte aquí". */
export function CutoutButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="rotate-1 active:rotate-0 active:scale-95">
      <View className="items-center border-2 border-dashed border-neutral-500 bg-amber-200 py-4" style={{ boxShadow: PAPER }}>
        <Text className="text-lg font-black text-neutral-800">✂ {text}</Text>
      </View>
    </Pressable>
  );
}

export function ScrapbookDemo() {
  return (
    <View className="flex-1 gap-8 bg-[#efe6d8] p-6">
      <View className="flex-row items-start justify-center">
        <PolaroidCard caption="Termales de Santa Rosa" color="#7dd3fc" />
        <View className="-ml-6 mt-6">
          <Sticker text="¡Top 1!" />
        </View>
      </View>
      <LinedNote>
        <Text className="font-serif text-lg leading-7 text-neutral-800">
          Abierto hoy hasta las 10 p. m.{'\n'}★★★★☆ · 128 reseñas
        </Text>
      </LinedNote>
      <CutoutButton text="Guardar en favoritos" />
    </View>
  );
}
