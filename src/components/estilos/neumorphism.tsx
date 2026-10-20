import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

// Regla de oro: el elemento tiene EXACTAMENTE el mismo color que el fondo.
// Lo único que lo separa son dos sombras: una clara arriba-izquierda y una oscura abajo-derecha.
const RAISED = '-6px -6px 12px #ffffff, 6px 6px 12px #a3b1c6';
const PRESSED = 'inset -4px -4px 8px #ffffff, inset 4px 4px 8px #a3b1c6';

export function NeuCard({ children }: { children: ReactNode }) {
  return (
    <View className="gap-3 rounded-3xl bg-[#e0e5ec] p-6" style={{ boxShadow: RAISED }}>
      {children}
    </View>
  );
}

/** Botón que pasa de "elevado" a "hundido" mientras se presiona. */
export function NeuButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View className="items-center rounded-2xl bg-[#e0e5ec] p-4" style={{ boxShadow: pressed ? PRESSED : RAISED }}>
          <Text className="font-semibold text-slate-600">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Botón de alternar: se queda hundido mientras está activo. */
export function NeuToggle({ icon, active, onPress }: { icon: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: active }}>
      <View
        className="h-16 w-16 items-center justify-center rounded-full bg-[#e0e5ec]"
        style={{ boxShadow: active ? PRESSED : RAISED }}>
        <Text className={`text-2xl ${active ? 'text-blue-500' : 'text-slate-400'}`}>{icon}</Text>
      </View>
    </Pressable>
  );
}

/** Campo de texto "tallado" en el fondo. */
export function NeuInput(props: ComponentProps<typeof TextInput>) {
  return (
    <View className="rounded-2xl bg-[#e0e5ec] px-4" style={{ boxShadow: PRESSED }}>
      <TextInput className="py-4 text-slate-700" placeholderTextColor="#94a3b8" {...props} />
    </View>
  );
}

/** Barra de progreso: canal hundido + relleno elevado. */
export function NeuProgress({ value }: { value: number }) {
  return (
    <View className="h-4 rounded-full bg-[#e0e5ec] p-1" style={{ boxShadow: PRESSED }}>
      <View className="h-full rounded-full bg-blue-400" style={{ width: `${value}%`, boxShadow: '2px 2px 4px #a3b1c6' }} />
    </View>
  );
}

export function NeumorphismDemo() {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);

  return (
    <View className="flex-1 gap-8 bg-[#e0e5ec] p-6">
      <NeuCard>
        <Text className="text-xl font-bold text-slate-700">Próxima cita</Text>
        <Text className="text-slate-500">Martes 4 nov · 10:30 a. m.</Text>
        <NeuProgress value={65} />
      </NeuCard>

      <NeuInput placeholder="Buscar médico…" />

      <View className="flex-row justify-center gap-6">
        <NeuToggle icon="⌁" active={wifi} onPress={() => setWifi(!wifi)} />
        <NeuToggle icon="✱" active={bt} onPress={() => setBt(!bt)} />
      </View>

      <NeuButton text="Agendar" onPress={() => {}} />
    </View>
  );
}
