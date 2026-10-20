// npx expo install expo-blur
import { BlurTargetView, BlurView } from 'expo-blur';
import { useRef, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

/** Fondo colorido. Sin colores detrás, el vidrio no se nota. */
function ColorBlobs() {
  return (
    <>
      <View
        className="absolute -left-16 top-16 h-64 w-64 rounded-full"
        style={{ experimental_backgroundImage: 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)' }}
      />
      <View
        className="absolute -right-10 top-72 h-56 w-56 rounded-full"
        style={{ experimental_backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' }}
      />
      <View className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-amber-300" />
    </>
  );
}

/**
 * Panel de vidrio esmerilado: desenfoque + relleno translúcido + borde claro.
 * `target` es para Android: allí solo se desenfoca lo que está dentro de un BlurTargetView.
 */
export function GlassPanel({ children, target }: { children: ReactNode; target: RefObject<View | null> }) {
  return (
    <View className="overflow-hidden rounded-3xl border border-white/40">
      <BlurView
        // Texto blanco → tinte oscuro. Con tint="light" el panel queda casi blanco y el texto no se lee.
        intensity={60}
        tint="dark"
        blurTarget={target}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <View className="gap-3 bg-white/10 p-5">{children}</View>
    </View>
  );
}

/** En piezas pequeñas no hace falta desenfoque: basta el relleno translúcido. */
export function GlassButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-full border border-white/50 bg-white/20 px-6 py-3 active:bg-white/35">
      <Text className="font-semibold text-white">{text}</Text>
    </Pressable>
  );
}

export function GlassInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className="rounded-2xl border border-white/40 bg-white/15 p-4 text-white"
      placeholderTextColor="rgba(255,255,255,0.7)"
      {...props}
    />
  );
}

export function GlassmorphismDemo() {
  const target = useRef<View>(null);

  return (
    <View className="flex-1 bg-indigo-950">
      {/* Lo que se va a ver borroso detrás del vidrio. El BlurView NO va aquí adentro. */}
      <BlurTargetView ref={target} style={StyleSheet.absoluteFill}>
        <ColorBlobs />
      </BlurTargetView>

      <View className="flex-1 justify-center gap-5 p-6">
        <GlassPanel target={target}>
          <Text className="text-2xl font-bold text-white">Look del día</Text>
          <Text className="text-white/80">Chaqueta denim · camiseta blanca · tenis</Text>
          <View className="flex-row gap-3">
            <GlassButton text="♥ 128" />
            <GlassButton text="Guardar" />
          </View>
        </GlassPanel>

        <GlassInput placeholder="Buscar estilos…" />
      </View>
    </View>
  );
}
