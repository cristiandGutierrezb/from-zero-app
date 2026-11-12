import { useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Fuente manuscrita (gratis): npx expo install @expo-google-fonts/caveat expo-font
// y en el _layout raíz: const [loaded] = useFonts({ Caveat_700Bold });
// Si no se carga la fuente, React Native usa la del sistema y todo sigue funcionando.
const HAND = { fontFamily: 'Caveat_700Bold' };

/**
 * Caja "dibujada a mano": esquinas irregulares + una segunda línea un poco girada,
 * como cuando se repasa un trazo con lápiz.
 */
export function SketchBox({ children }: { children: ReactNode }) {
  return (
    <View className="p-1">
      <View className="absolute inset-0 rotate-1 rounded-bl-[10px] rounded-br-[22px] rounded-tl-[18px] rounded-tr-[6px] border-2 border-neutral-800" />
      <View className="gap-2 rounded-bl-[24px] rounded-br-[8px] rounded-tl-[6px] rounded-tr-[20px] border-2 border-neutral-800 bg-white p-5">
        {children}
      </View>
    </View>
  );
}

/** Botón con sombra sólida desplazada (sin desenfoque): se ve como un trazo con marcador. */
export function SketchButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View
          className="items-center rounded-bl-[18px] rounded-br-[6px] rounded-tl-[8px] rounded-tr-[16px] border-2 border-neutral-900 bg-yellow-300 py-3"
          style={{
            boxShadow: pressed ? '0 0 0 #171717' : '4px 4px 0 #171717',
            transform: [{ translateX: pressed ? 4 : 0 }, { translateY: pressed ? 4 : 0 }],
          }}>
          <Text className="text-2xl text-neutral-900" style={HAND}>
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Texto subrayado con resaltador: una franja girada detrás del texto. */
export function Highlight({ text }: { text: string }) {
  return (
    <View className="self-start">
      <View className="absolute bottom-1 left-0 right-0 h-3 -rotate-1 rounded-full bg-pink-300/70" />
      <Text className="text-3xl text-neutral-900" style={HAND}>
        {text}
      </Text>
    </View>
  );
}

export function SketchCheckbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <Pressable
      onPress={() => setChecked(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-center gap-3">
      <View className="h-7 w-7 -rotate-3 items-center justify-center rounded-bl-[3px] rounded-br-[8px] rounded-tl-[7px] rounded-tr-[2px] border-2 border-neutral-800">
        {checked && (
          <Text className="-mt-1 text-2xl text-red-600" style={HAND}>
            ✓
          </Text>
        )}
      </View>
      <Text className={`text-2xl text-neutral-800 ${checked ? 'line-through' : ''}`} style={HAND}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HandDrawnDemo() {
  return (
    <View className="flex-1 gap-6 bg-[#fafaf7] p-6">
      <Highlight text="Mis pendientes" />
      <SketchBox>
        <SketchCheckbox label="Hacer commit" />
        <SketchCheckbox label="Alimentar a la mascota" />
        <SketchCheckbox label="Vestirla con el gorro" />
      </SketchBox>
      <SketchButton text="¡Listo!" />
    </View>
  );
}
