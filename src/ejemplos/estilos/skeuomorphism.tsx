import { useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Plástico de una tecla: la luz viene de arriba, así que arriba es más claro.
const KEY_FACE = 'linear-gradient(180deg, #fafafa 0%, #d4d4d4 100%)';
const KEY_ORANGE = 'linear-gradient(180deg, #fdba74 0%, #ea580c 100%)';
// El primer shadow sin desenfoque (0 4px 0) es el "costado" de la tecla.
const KEY_UP = '0 4px 0 #737373, 0 6px 10px rgba(0,0,0,0.35), inset 0 1px 0 #ffffff';
const KEY_DOWN = '0 1px 0 #737373, 0 2px 3px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.25)';

/** Tecla de calculadora que se hunde físicamente al presionarla. */
export function SkeuoKey({ label, onPress, accent }: { label: string; onPress?: () => void; accent?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {({ pressed }) => (
        <View
          className={`h-16 w-16 items-center justify-center rounded-2xl border ${
            accent ? 'border-orange-700' : 'border-neutral-400'
          }`}
          style={{
            experimental_backgroundImage: accent ? KEY_ORANGE : KEY_FACE,
            boxShadow: pressed ? KEY_DOWN : KEY_UP,
            transform: [{ translateY: pressed ? 3 : 0 }],
          }}>
          <Text
            className={`text-2xl font-bold ${accent ? 'text-white' : 'text-neutral-700'}`}
            style={{ textShadowColor: 'rgba(255,255,255,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Pantalla LCD verde, como las calculadoras de bolsillo. */
export function LcdDisplay({ value }: { value: string }) {
  return (
    <View
      className="h-20 items-end justify-center rounded-xl border-2 border-neutral-700 px-4"
      style={{
        experimental_backgroundImage: 'linear-gradient(180deg, #a3b18a 0%, #c5d1a8 100%)',
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.45)',
      }}>
      <Text className="font-serif text-4xl text-neutral-800">{value}</Text>
    </View>
  );
}

/** Tarjeta de cuero con costura punteada. */
export function LeatherCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View
      className="rounded-3xl p-2"
      style={{
        experimental_backgroundImage: 'radial-gradient(circle at 30% 20%, #8b5a2b 0%, #4a2812 100%)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
      <View className="gap-2 rounded-2xl border-2 border-dashed border-[#e8c9a0]/70 p-4">
        <Text
          className="text-lg font-bold text-[#f5e6d3]"
          style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: -1 }, textShadowRadius: 0 }}>
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

/** Interruptor físico: canal hundido + perilla en relieve. */
export function SkeuoSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <View
        className={`h-9 w-16 justify-center rounded-full px-1 ${value ? 'items-end' : 'items-start'}`}
        style={{
          experimental_backgroundImage: value
            ? 'linear-gradient(180deg, #15803d 0%, #22c55e 100%)'
            : 'linear-gradient(180deg, #a3a3a3 0%, #d4d4d4 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.45)',
        }}>
        <View
          className="h-7 w-7 rounded-full"
          style={{
            experimental_backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #d4d4d4 100%)',
            boxShadow: '0 2px 3px rgba(0,0,0,0.4)',
          }}
        />
      </View>
    </Pressable>
  );
}

/** Bombillo LED: encendido brilla (glow), apagado se ve hundido. */
export function Led({ on, color = '#ef4444' }: { on: boolean; color?: string }) {
  return (
    <View
      className="h-3 w-3 rounded-full"
      style={{
        backgroundColor: on ? color : '#525252',
        boxShadow: on ? `0 0 8px ${color}, inset 0 1px 1px rgba(255,255,255,0.6)` : 'inset 0 1px 2px rgba(0,0,0,0.6)',
      }}
    />
  );
}

export function SkeuomorphismDemo() {
  const [display, setDisplay] = useState('0');
  const [sound, setSound] = useState(true);
  const press = (k: string) => setDisplay((d) => (d === '0' ? k : d + k));

  return (
    <View className="flex-1 gap-6 bg-neutral-300 p-6">
      <View
        className="gap-4 rounded-[32px] p-5"
        style={{
          experimental_backgroundImage: 'linear-gradient(180deg, #525252 0%, #262626 100%)',
          boxShadow: '0 16px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
        <LcdDisplay value={display} />
        {/* Filas explícitas de 4: con flex-wrap el número por fila depende del ancho del celular */}
        {[['7', '8', '9', '+'], ['4', '5', '6', '−'], ['1', '2', '3', '=']].map((row) => (
          <View key={row.join('')} className="flex-row justify-between">
            {row.map((k) => (
              <SkeuoKey key={k} label={k} accent={'+−='.includes(k)} onPress={() => press(k)} />
            ))}
          </View>
        ))}
      </View>

      <LeatherCard title="Ajustes">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Led on={sound} color="#22c55e" />
            <Text className="text-[#f5e6d3]">Sonido de teclas</Text>
          </View>
          <SkeuoSwitch value={sound} onChange={setSound} />
        </View>
      </LeatherCard>
    </View>
  );
}
