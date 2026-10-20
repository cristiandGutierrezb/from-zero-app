import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

// Y2K: iridiscente (rosa-cian-lila), burbujas brillantes, tipografía de terminal.
const IRIDESCENT = 'linear-gradient(135deg, #f0abfc 0%, #a5f3fc 35%, #c4b5fd 65%, #f9a8d4 100%)';
const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** Botón burbuja: el brillo es una media cápsula blanca encima. */
export function Y2KBubbleButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:scale-95">
      <View
        className="items-center overflow-hidden rounded-full border-2 border-white px-8 py-4"
        style={{ experimental_backgroundImage: IRIDESCENT, boxShadow: '0 6px 16px rgba(192,38,211,0.45)' }}>
        <View className="absolute left-3 right-3 top-1 h-1/2 rounded-full bg-white/60" />
        <Text className="text-lg font-black text-fuchsia-900" style={{ fontFamily: MONO }}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
}

/** Ventana de "sistema operativo" de los 2000: barra de título + bisel. */
export function Y2KWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="overflow-hidden rounded-2xl border-2 border-white" style={{ boxShadow: '0 0 0 2px #a855f7, 0 12px 24px rgba(88,28,135,0.4)' }}>
      <View className="flex-row items-center justify-between px-3 py-2" style={{ experimental_backgroundImage: IRIDESCENT }}>
        <Text className="font-bold text-fuchsia-950" style={{ fontFamily: MONO }}>
          {title}
        </Text>
        <View className="flex-row gap-1.5">
          {['bg-pink-400', 'bg-cyan-300', 'bg-violet-400'].map((c) => (
            <View key={c} className={`h-3 w-3 rounded-full border border-white ${c}`} />
          ))}
        </View>
      </View>
      <View className="gap-2 bg-white/90 p-4">{children}</View>
    </View>
  );
}

export function Y2KDemo() {
  return (
    <View className="flex-1 justify-center gap-6 bg-violet-950 p-6">
      <Y2KWindow title="mascota.exe">
        <Text className="text-fuchsia-900" style={{ fontFamily: MONO }}>
          ♥ salud ████████░░ 80%
        </Text>
        <Text className="text-fuchsia-900" style={{ fontFamily: MONO }}>
          ☺ hambre ███░░░░░░░ 30%
        </Text>
      </Y2KWindow>
      <Y2KBubbleButton text="ALIMENTAR" />
    </View>
  );
}
