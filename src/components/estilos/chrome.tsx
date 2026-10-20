import { useEffect, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Cromo = muchas paradas de color con saltos bruscos de claro a oscuro (el "horizonte" reflejado).
const CHROME =
  'linear-gradient(180deg, #f8fafc 0%, #cbd5e1 22%, #64748b 48%, #e2e8f0 52%, #94a3b8 78%, #f1f5f9 100%)';
const BEZEL = 'linear-gradient(180deg, #ffffff 0%, #475569 100%)';
// Grabado: texto oscuro con un brillo de 1 px debajo.
const ENGRAVED = { textShadowColor: 'rgba(255,255,255,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 };

/** Botón de cromo: un borde biselado (vista de afuera) envuelve la cara metálica. */
export function ChromeButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-80">
      <View className="rounded-full p-[2px]" style={{ experimental_backgroundImage: BEZEL, boxShadow: '0 6px 14px rgba(0,0,0,0.45)' }}>
        <View className="items-center rounded-full px-8 py-4" style={{ experimental_backgroundImage: CHROME }}>
          <Text className="text-lg font-black uppercase tracking-widest text-slate-800" style={ENGRAVED}>
            {text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Reflejo que recorre la superficie en bucle (efecto "liquid metal"). */
function Sheen() {
  const x = useSharedValue(-200);
  useEffect(() => {
    x.value = withRepeat(withTiming(400, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1);
  }, [x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { rotate: '20deg' }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: -40, bottom: -40, width: 80 },
        { experimental_backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)' },
        style,
      ]}
    />
  );
}

/** Tarjeta coleccionable metálica con reflejo animado. */
export function ChromeCard({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <View className="rounded-3xl p-[3px]" style={{ experimental_backgroundImage: BEZEL, boxShadow: '0 12px 24px rgba(0,0,0,0.5)' }}>
      <View className="gap-1 overflow-hidden rounded-[22px] p-6" style={{ experimental_backgroundImage: CHROME }}>
        <Sheen />
        <Text className="text-2xl font-black text-slate-900" style={ENGRAVED}>
          {title}
        </Text>
        <Text className="font-semibold text-slate-700">{subtitle}</Text>
        {children}
      </View>
    </View>
  );
}

/** Gota de mercurio: degradado radial con el punto de luz arriba a la izquierda. */
export function MercuryBadge({ text }: { text: string }) {
  return (
    <View
      className="h-14 w-14 items-center justify-center rounded-full"
      style={{
        experimental_backgroundImage: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #94a3b8 45%, #1e293b 100%)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      }}>
      <Text className="font-black text-white">{text}</Text>
    </View>
  );
}

export function ChromeDemo() {
  return (
    <View className="flex-1 justify-center gap-8 bg-slate-950 p-6">
      <ChromeCard title="Carta #07" subtitle="Torre de Herveo · rara">
        <View className="flex-row gap-3 pt-4">
          <MercuryBadge text="+50" />
          <MercuryBadge text="x2" />
        </View>
      </ChromeCard>
      <ChromeButton text="Escanear" />
    </View>
  );
}
