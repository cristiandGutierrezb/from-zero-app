# Guía de estilos visuales, listas y áreas seguras

Referencia del curso para construir interfaces en **React Native + NativeWind (Tailwind)**.
Escrita contra las versiones de este proyecto: Expo SDK 57, React Native 0.86, NativeWind 4, Tailwind 3.4.

Tiene tres partes:

1. **Estilos visuales** inspirados en materiales reales: un bloque de componentes listos para copiar por cada estilo visto en clase.
2. **Listas y scroll**: qué componente usar según el contenido sea estático o dinámico.
3. **Márgenes seguros**: cómo respetar el notch, la barra de estado y la barra de gestos.

> Todo el código de esta guía compila con TypeScript estricto en este proyecto. Cada bloque es un archivo
> independiente: cópienlo en `src/components/`, cambien los colores por los de su marca y úsenlo.

---

## 0. Antes de empezar: qué hace Tailwind y qué no

NativeWind traduce casi todo Tailwind a estilos de React Native, pero estos estilos usan cosas que Tailwind
no sabe expresar en móvil. La regla del curso:

| Necesito… | Dónde va | Ejemplo |
|---|---|---|
| Layout, colores, radios, bordes, padding, opacidad, rotaciones | `className` | `className="rounded-3xl bg-white/20 p-6 -rotate-2"` |
| Estado presionado simple (opacidad, escala, color) | `className` con `active:` | `className="active:scale-95 active:opacity-80"` |
| **Varias sombras** o **sombras interiores** (`inset`) | `style={{ boxShadow }}` | `boxShadow: '-6px -6px 12px #fff, 6px 6px 12px #a3b1c6'` |
| **Degradados** lineales o radiales | `style={{ experimental_backgroundImage }}` | `'linear-gradient(180deg, #fff 0%, #ccc 100%)'` |
| Una sombra que cambia al presionar | `Pressable` con hijos como función | `{({ pressed }) => <View style={{ boxShadow: pressed ? A : B }} />}` |
| Desenfoque real (vidrio esmerilado) | `expo-blur` | `<BlurView intensity={40} />` |
| Liquid Glass de iOS 26 | `expo-glass-effect` | `<GlassView isInteractive />` |

Notas:

- `boxShadow` y `experimental_backgroundImage` son **nativos de React Native** (nueva arquitectura, RN 0.76+). Funcionan en Android e iOS sin instalar nada. Aceptan la misma sintaxis de CSS que ya conocen. El prefijo `experimental_` significa que el nombre puede cambiar; si algún día falla, `expo-linear-gradient` es el reemplazo gratuito.
- `className` y `style` **se combinan**: Tailwind pone la base y `style` agrega lo que Tailwind no traduce.
- Los componentes que **no** son de React Native (`BlurView`, `GlassView`) no entienden `className`. Opciones: ponerles `style` y meter el contenido en un `View` con Tailwind (lo que hace esta guía), o registrarlos una vez con `cssInterop(GlassView, { className: 'style' })` de `nativewind`.
- `font-serif` funciona en ambas plataformas (Georgia en iOS, serif en Android). Para monoespaciada usen `Platform.select({ ios: 'Menlo', default: 'monospace' })`.

### Llevar los colores a tokens

En los ejemplos los colores van sueltos (`bg-[#e0e5ec]`) para que cada bloque se entienda solo. En su
proyecto, muévanlos a `tailwind.config.js` y úsenlos por nombre:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      neu: { DEFAULT: '#e0e5ec', light: '#ffffff', dark: '#a3b1c6' },
      marca: { tinta: '#0F2A38', teal: '#1E8C8C', verde: '#5FB548' },
    },
  },
},
// Uso: className="bg-neu text-marca-tinta"
```

Las sombras y degradados, como constantes en un archivo (`src/theme/shadows.ts`), no repetidos en cada pantalla.

### ¿Cuál elijo?

| Estilo | Sensación | Encaja con | Cuidado con |
|---|---|---|---|
| Skeuomorfismo | Objeto físico, táctil | Herramientas, calculadoras, apps de campo | Puede verse recargado |
| Neumorphism | Plástico suave, calmado | Dashboards, ajustes, salud | **Bajo contraste**: mala accesibilidad |
| Glassmorphism | Ligero, moderno | Apps sobre fotos o mapas, moda | Texto ilegible sobre fondos muy claros |
| Liquid Glass | Nativo iOS 26, fluido | Barras flotantes, mapas | Solo iOS 26; necesita respaldo |
| Claymorphism | Amable, juguetón | Apps para todo público, niños, salud | Sombras pesadas en listas largas |
| Chrome / Liquid Metal | Premium, coleccionable | Juegos, cartas, recompensas | Cansa si se usa en todo |
| Y2K Techno | Nostálgico, divertido | Juegos, mascotas virtuales | Legibilidad de la tipografía |
| Madera | Cálido, artesanal | Clósets, restaurantes, muebles | Que no compita con las fotos |
| Manuscrito | Clásico, elegante | Cartas de restaurante, historia | Texto largo en serif pequeño |
| Luminous Eco | Naturaleza tecnológica | Agro, energía, sostenibilidad | Fondos oscuros + brillo = batería |
| Spatial UI | Profundidad, capas | Paneles, multitarea | Exceso de sombras = lento |
| Biophilic | Natural, sereno | Agro, bienestar, turismo | Contraste con paletas tierra |
| Scrapbook / Sticker | Personal, creativo | Viajes, diarios, redes | Rotaciones que dificultan leer |
| Hand-Drawn | Informal, humano | Notas, listas, juegos | Fuente manuscrita en textos largos |

**Para todos los estilos:** contraste mínimo 4.5:1 en el texto, áreas de toque de al menos 44–48 px,
estado presionado visible y `accessibilityRole` / `accessibilityLabel` en lo que se toca.

---

## 1. Skeuomorfismo

Imita materiales reales para que se entienda al instante qué hace cada cosa: la tecla parece una tecla y
se hunde al presionarla.

**Ingredientes**
- Degradado de claro (arriba) a oscuro (abajo): la luz viene del techo.
- Una sombra **sin desenfoque** debajo (`0 4px 0 #737373`): es el costado del objeto.
- Al presionar: el objeto baja (`translateY`) y su sombra se encoge. Eso es lo que lo hace "físico".
- Texturas: cuero (radial café + costura con `border-dashed`), LCD, LED con resplandor.

```tsx
// skeuomorphism
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
```

**Cuidado:** si todo es un objeto en relieve, nada destaca. Úsenlo en las piezas que se tocan.

---

## 2. Neumorphism (Soft UI)

Plástico moldeado: los elementos salen del fondo, del **mismo color** que el fondo, y solo dos sombras los
separan.

**Ingredientes**
- Fondo y elemento con el mismo color (`#e0e5ec`).
- Elevado: sombra clara arriba-izquierda + sombra oscura abajo-derecha.
- Hundido (presionado, input, canal de progreso): las mismas dos sombras con `inset`.

```tsx
// neumorphism
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
```

**Cuidado:** es el estilo con **peor contraste**. Los bordes casi no se ven para personas con baja visión.
Usen texto oscuro, un color de acento para lo activo (`text-blue-500`) y no lo usen en formularios críticos.

---

## 3. Glassmorphism

Paneles de vidrio esmerilado: lo que hay detrás se ve borroso, con relleno translúcido y un borde fino claro.

**Ingredientes**
- **Fondo colorido** detrás (sin él, el vidrio no se nota).
- `BlurView` de `expo-blur` como capa absoluta dentro de un `View` con `overflow-hidden` y bordes redondeados.
- Relleno `bg-white/10`–`bg-white/20` y borde `border-white/40`.
- **Android:** solo se desenfoca lo que esté dentro de un `BlurTargetView`, y el `BlurView` recibe su `ref`
  en `blurTarget` y `blurMethod="dimezisBlurViewSdk31Plus"`. Sin eso, en Android solo se ve un velo translúcido.

```bash
npx expo install expo-blur
```

```tsx
// glassmorphism
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
```

**Cuidado:** el desenfoque es costoso. Úsenlo en 1–3 paneles por pantalla, no en cada fila de una lista
(en piezas pequeñas basta `bg-white/20` sin blur). Revisen que el texto blanco se lea sobre la parte más
clara del fondo.

---

## 4. Liquid Glass

La evolución de Apple del glassmorphism (iOS 26): el vidrio refracta, reacciona al toque y las piezas cercanas
se fusionan como gotas.

**Ingredientes**
- `GlassView` de `expo-glass-effect` (la forma va en `style`, el contenido en un `View` con Tailwind).
- `isInteractive` para que reaccione al toque; `tintColor` para teñirlo.
- `GlassContainer` con `spacing` para que varias piezas se fusionen.
- **Respaldo obligatorio:** `isLiquidGlassAvailable()` es `false` en Android e iOS < 26; ahí se usa
  un panel translúcido normal (o el `GlassPanel` de la sección 3).

```bash
npx expo install expo-glass-effect
```

```tsx
// liquid-glass
// npx expo install expo-glass-effect
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Liquid Glass solo existe en iOS 26+. En Android y iOS viejo se usa un respaldo translúcido.
const LIQUID = isLiquidGlassAvailable();

/**
 * GlassView no entiende `className` (no es un componente de React Native):
 * la forma (borderRadius) va en `style` y el contenido en un View con Tailwind.
 */
export function LiquidCard({ children }: { children: ReactNode }) {
  if (!LIQUID) {
    return <View className="gap-2 rounded-[28px] border border-white/40 bg-white/25 p-5">{children}</View>;
  }
  return (
    <GlassView glassEffectStyle="regular" style={{ borderRadius: 28 }}>
      <View className="gap-2 p-5">{children}</View>
    </GlassView>
  );
}

/** `isInteractive` hace que el vidrio reaccione al toque como en iOS (se estira y brilla). */
export function LiquidButton({ text, onPress, tint }: { text: string; onPress?: () => void; tint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:scale-95">
      {LIQUID ? (
        <GlassView isInteractive tintColor={tint} style={{ borderRadius: 999 }}>
          <Text className="px-6 py-3 font-semibold text-white">{text}</Text>
        </GlassView>
      ) : (
        <View className="rounded-full border border-white/40 px-6 py-3" style={{ backgroundColor: tint ?? 'rgba(255,255,255,0.25)' }}>
          <Text className="font-semibold text-white">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * GlassContainer agrupa varias piezas de vidrio: cuando están a menos de `spacing`
 * se fusionan como gotas de agua. Ideal para barras de herramientas flotantes.
 */
export function LiquidToolbar({ items }: { items: string[] }) {
  if (!LIQUID) {
    return (
      <View className="flex-row gap-2 self-center">
        {items.map((i) => (
          <View key={i} className="h-12 w-12 items-center justify-center rounded-full bg-white/25">
            <Text className="text-lg text-white">{i}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <GlassContainer spacing={10} style={{ flexDirection: 'row', gap: 6, alignSelf: 'center' }}>
      {items.map((i) => (
        <GlassView key={i} isInteractive style={{ width: 48, height: 48, borderRadius: 24 }}>
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-white">{i}</Text>
          </View>
        </GlassView>
      ))}
    </GlassContainer>
  );
}

export function LiquidGlassDemo() {
  return (
    <View
      className="flex-1 justify-end gap-4 p-6 pb-12"
      style={{ experimental_backgroundImage: 'linear-gradient(160deg, #0ea5e9 0%, #6366f1 50%, #ec4899 100%)' }}>
      <LiquidCard>
        <Text className="text-xl font-bold text-white">Zona Cable Plaza</Text>
        <Text className="text-white/80">6 cupos libres · $3.500/h</Text>
        <View className="flex-row gap-3 pt-2">
          <LiquidButton text="Reservar" tint="rgba(34,197,94,0.6)" />
          <LiquidButton text="Cómo llegar" />
        </View>
      </LiquidCard>
      <LiquidToolbar items={['⌖', '☰', '★']} />
    </View>
  );
}
```

**Tip:** las pestañas nativas de Expo Router (`expo-router/unstable-native-tabs`) ya usan Liquid Glass en
iOS 26 sin hacer nada.

---

## 5. Claymorphism

El sucesor amable del neumorphism: superficies 3D separadas, como plastilina, que pueden superponerse.

**Ingredientes**
- Radios muy grandes (`rounded-[36px]`, `rounded-full`) y colores pastel.
- Tres sombras: una exterior suave del color del elemento (flota) + dos interiores (relieve).
- Superposición con margen negativo (`-mt-10`).
- Al presionar: se "aplasta" (`scale 0.96`) y pierde la sombra exterior.

```tsx
// claymorphism
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Tres sombras: una exterior suave (flota) + dos interiores (relieve de plastilina).
const clay = (rgb: string) =>
  `0 14px 28px rgba(${rgb},0.35), inset -8px -8px 16px rgba(0,0,0,0.10), inset 8px 8px 16px rgba(255,255,255,0.7)`;

/** Superficie de plastilina: muy redondeada, color pastel y relieve interno. */
export function ClayCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View className={`gap-2 rounded-[36px] bg-violet-200 p-6 ${className ?? ''}`} style={{ boxShadow: clay('124,58,237') }}>
      {children}
    </View>
  );
}

/** Al presionar se "aplasta": baja un poco y pierde sombra exterior. */
export function ClayButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View
          className="items-center rounded-full bg-pink-300 px-6 py-4"
          style={{
            boxShadow: pressed
              ? 'inset -4px -4px 8px rgba(0,0,0,0.12), inset 4px 4px 8px rgba(255,255,255,0.6)'
              : clay('219,39,119'),
            transform: [{ scale: pressed ? 0.96 : 1 }],
          }}>
          <Text className="text-lg font-extrabold text-pink-900">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ClayChip({ text, color = 'bg-amber-200' }: { text: string; color?: string }) {
  return (
    <View className={`self-start rounded-full px-4 py-2 ${color}`} style={{ boxShadow: clay('217,119,6') }}>
      <Text className="font-bold text-neutral-800">{text}</Text>
    </View>
  );
}

export function ClayAvatar({ initial }: { initial: string }) {
  return (
    <View className="h-16 w-16 items-center justify-center rounded-full bg-sky-200" style={{ boxShadow: clay('2,132,199') }}>
      <Text className="text-2xl font-black text-sky-800">{initial}</Text>
    </View>
  );
}

export function ClaymorphismDemo() {
  return (
    <View className="flex-1 gap-6 bg-violet-50 p-6">
      <ClayCard>
        <View className="flex-row items-center gap-4">
          <ClayAvatar initial="D" />
          <View>
            <Text className="text-xl font-extrabold text-violet-900">Dra. Duque</Text>
            <Text className="text-violet-700">Dermatología</Text>
          </View>
        </View>
        <ClayChip text="Mañana 9:00" />
      </ClayCard>

      {/* Superficies superpuestas: la segunda sube sobre la primera con margen negativo. */}
      <ClayCard className="-mt-10 ml-8 bg-emerald-200">
        <Text className="font-bold text-emerald-900">Receta lista para descargar</Text>
      </ClayCard>

      <ClayButton text="Agendar cita" />
    </View>
  );
}
```

**Cuidado:** a diferencia del neumorphism, aquí cada elemento tiene su propio color, así que el contraste es
mejor. Aun así, revisen el texto sobre pasteles claros (usen el tono 800–900 del mismo color).

---

## 6. Chrome / Liquid Metal

Superficies metálicas que reflejan. "Liquid metal" agrega movimiento: un reflejo que recorre la superficie.

**Ingredientes**
- Degradado con **saltos bruscos** de claro a oscuro a mitad de camino (el horizonte reflejado).
- Bisel: un `View` exterior con otro degradado y `p-[2px]` envuelve la cara metálica.
- Texto grabado: oscuro con `textShadow` claro de 1 px debajo.
- Reflejo animado con `react-native-reanimated` (ya viene con Expo).
- Mercurio: `radial-gradient` con el punto de luz arriba a la izquierda.

```tsx
// chrome
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
```

**Cuidado:** las animaciones infinitas gastan batería; pongan el reflejo solo en la pieza protagonista (la
carta nueva, el premio), no en toda la pantalla.

---

## 7. Variantes nuevas del skeuomorfismo

### 7.1 Y2K Techno-Skeuomorphism

Los 2000: iridiscencia rosa-cian-lila, botones burbuja brillantes, ventanas de sistema operativo y letra de terminal.

```tsx
// y2k
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
```

### 7.2 Real-Wood Skeuomorphism (madera)

Veta de madera con un degradado de muchas paradas, placas de latón atornilladas y texto tallado.

```tsx
// wood
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
```

### 7.3 Historical Manuscript (pergamino)

Papel envejecido (centro claro, bordes quemados), tipografía con serifas, letra capital y sello de cera.

```tsx
// manuscript
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
```

### 7.4 Luminous Eco-Skeuomorphism

Naturaleza + tecnología: formas de hoja, bosque nocturno y elementos bioluminiscentes que brillan.

```tsx
// eco
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Luminous Eco: bosque de noche + bioluminiscencia (resplandor verde lima).
const glow = (alpha = 0.45) => `0 0 24px rgba(163,230,53,${alpha}), 0 0 4px rgba(163,230,53,${alpha})`;

/** Tarjeta con forma de hoja: dos esquinas muy redondas y dos casi rectas. */
export function LeafCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-2 rounded-bl-lg rounded-br-[48px] rounded-tl-[48px] rounded-tr-lg border border-lime-400/30 bg-emerald-950/80 p-6"
      style={{ boxShadow: glow(0.25) }}>
      {children}
    </View>
  );
}

export function GlowButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <View className="items-center rounded-full bg-lime-400 py-4" style={{ boxShadow: glow(pressed ? 0.9 : 0.5) }}>
          <Text className="text-lg font-bold text-emerald-950">{text}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Medidor bioluminiscente (humedad, salud del cultivo…). */
export function EcoMeter({ label, value }: { label: string; value: number }) {
  return (
    <View className="gap-1.5">
      <View className="flex-row justify-between">
        <Text className="text-lime-200">{label}</Text>
        <Text className="font-bold text-lime-300">{value}%</Text>
      </View>
      <View className="h-3 rounded-full bg-emerald-900">
        <View
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            experimental_backgroundImage: 'linear-gradient(90deg, #10b981 0%, #a3e635 100%)',
            boxShadow: glow(0.7),
          }}
        />
      </View>
    </View>
  );
}

export function LuminousEcoDemo() {
  return (
    <View
      className="flex-1 justify-center gap-6 p-6"
      style={{ experimental_backgroundImage: 'radial-gradient(circle at 50% 0%, #065f46 0%, #022c22 60%, #011a14 100%)' }}>
      <LeafCard>
        <Text className="text-xl font-bold text-lime-100">Cultivo de café · Lote 3</Text>
        <EcoMeter label="Humedad del suelo" value={72} />
        <EcoMeter label="Salud de la hoja" value={45} />
      </LeafCard>
      <GlowButton text="Diagnosticar hoja" />
    </View>
  );
}
```

---

## 8. Otros estilos relacionados con lo físico

### 8.1 Spatial UI (tipo visionOS)

Capas a distintas profundidades. Lo lejano se ve más pequeño, más tenue y con menos sombra; lo cercano flota.

**Ingredientes:** `scale` y opacidad según la profundidad (eviten `rotateX`: en iOS corta la vista contra el fondo), sombras grandes y
difusas, una barra "ornamento" que flota superpuesta al borde de la ventana, y piezas que "se acercan" al tocarlas.

```tsx
// spatial
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

// Spatial UI (visionOS): capas a distintas profundidades. Lo lejano es más pequeño,
// más oscuro y con menos sombra; lo cercano flota con sombra grande y difusa.
const FLOAT = '0 30px 60px rgba(15,23,42,0.45), 0 8px 16px rgba(15,23,42,0.25)';

/** Ventana flotante. `depth` 0 = al frente, 1 = una capa atrás. */
export function SpatialWindow({ children, depth = 0 }: { children: ReactNode; depth?: 0 | 1 }) {
  return (
    <View
      className="gap-3 rounded-[32px] border border-white/30 bg-white/20 p-6"
      style={{
        boxShadow: depth === 0 ? FLOAT : '0 10px 20px rgba(15,23,42,0.25)',
        opacity: depth === 0 ? 1 : 0.6,
        // Sin rotateX: en iOS la mitad inclinada "hacia adentro" queda detrás del fondo y se corta.
        transform: [{ scale: depth === 0 ? 1 : 0.9 }],
      }}>
      {children}
    </View>
  );
}

/** Al presionar, la pieza "se acerca": sube y su sombra crece (como el hover de la mirada en visionOS). */
export function SpatialTile({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-1">
      {({ pressed }) => (
        <View
          className="h-24 items-center justify-center rounded-3xl bg-white/30"
          style={{
            boxShadow: pressed ? FLOAT : '0 6px 12px rgba(15,23,42,0.2)',
            transform: [{ translateY: pressed ? -6 : 0 }, { scale: pressed ? 1.04 : 1 }],
          }}>
          <Text className="font-semibold text-white">{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** "Ornamento": barra de controles que flota debajo de la ventana, superpuesta a su borde. */
export function SpatialOrnament({ items }: { items: string[] }) {
  return (
    <View
      className="-mt-7 flex-row gap-4 self-center rounded-full border border-white/30 bg-slate-800/70 px-5 py-3"
      style={{ boxShadow: FLOAT }}>
      {items.map((i) => (
        <Text key={i} className="text-lg text-white">
          {i}
        </Text>
      ))}
    </View>
  );
}

export function SpatialDemo() {
  return (
    <View
      className="flex-1 justify-center p-6"
      style={{ experimental_backgroundImage: 'linear-gradient(180deg, #334155 0%, #64748b 100%)' }}>
      <View>
        {/* Capa de atrás, asomándose por encima de la ventana principal */}
        <View className="absolute -top-14 left-6 right-6">
          <SpatialWindow depth={1}>
            <Text className="text-white">Historial</Text>
          </SpatialWindow>
        </View>

        <SpatialWindow>
          <Text className="text-2xl font-bold text-white">Trabajos de hoy</Text>
          <View className="flex-row gap-3">
            <SpatialTile title="3 asignados" />
            <SpatialTile title="1 en camino" />
          </View>
        </SpatialWindow>
      </View>
      <SpatialOrnament items={['◀', '⌂', '⚙']} />
    </View>
  );
}
```

### 8.2 Biophilic Design

Inspirado en la naturaleza: formas orgánicas (cada esquina con un radio distinto), paleta de tierra, hoja,
cielo y arena, y progreso que "crece".

```tsx
// biophilic
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
```

### 8.3 Scrapbook / Sticker UI

Recortes, papel y stickers: fotos polaroid giradas, cinta adhesiva, papel rayado y bordes de "corte aquí".

**Ingredientes:** rotaciones leves (`-rotate-2`, `rotate-6`), marcos blancos, sombras cortas de papel,
vistas absolutas para la cinta y las líneas del cuaderno.

```tsx
// scrapbook
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
```

### 8.4 Hand-Drawn UI

Trazos hechos a mano: bordes irregulares, doble línea "repasada", sombra sólida de marcador y fuente manuscrita.

**Ingredientes:** cada esquina con un radio distinto, una segunda caja absoluta girada `rotate-1`,
`boxShadow` sin desenfoque (`4px 4px 0`) y una fuente de Google Fonts (gratis).

```bash
npx expo install @expo-google-fonts/caveat expo-font
```

```tsx
// app/_layout.tsx
import { Caveat_700Bold, useFonts } from '@expo-google-fonts/caveat';

export default function RootLayout() {
  const [loaded] = useFonts({ Caveat_700Bold });
  if (!loaded) return null;
  // …
}
```

```tsx
// hand-drawn
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
```

---

## 9. Listas y scroll

Un `View` **nunca** hace scroll: si el contenido no cabe, se corta. Para que exista scroll hay que elegir
el componente según **cómo es el contenido**.

### La decisión

```text
¿El contenido lo conozco al escribir el código y es poco (≤ ~20 elementos)?
 ├─ Sí → ScrollView  (texto, formulario, ajustes, "Quiénes somos")
 └─ No, viene del servidor / del usuario / puede crecer
     ├─ ¿Está agrupado (por día, por categoría)? → SectionList
     ├─ ¿Es una cuadrícula?                       → FlatList + numColumns
     ├─ ¿Es un carrusel?                          → FlatList horizontal
     └─ Lista normal                              → FlatList
```

| Componente | Contenido | Renderiza | Cuándo |
|---|---|---|---|
| `ScrollView` | **Estático** o corto | **Todo** de una vez | Pantallas de texto, formularios largos, ajustes, 5–20 elementos fijos |
| `FlatList` | **Dinámico** (API, base de datos) | Solo lo visible (virtualizado) | Solicitudes, pedidos, reseñas, ranking, feed, prendas |
| `SectionList` | Dinámico **agrupado** | Solo lo visible, con encabezados | Citas por día, carta por categoría, historial por mes |
| `FlashList` (`@shopify/flash-list`) | Dinámico **muy largo** | Recicla celdas, más rápido | Miles de filas o filas pesadas con imágenes. Opcional, gratis |
| `VirtualizedList` | Datos que no son un arreglo | Base de `FlatList` | Casi nunca; si dudan, es `FlatList` |

**¿Por qué no `ScrollView` + `.map()` para todo?** `ScrollView` monta **todos** los hijos aunque no se vean.
Con 10 elementos no importa; con 500 pedidos con imagen, la app se congela y consume memoria. `FlatList`
monta solo lo que está en pantalla (y un poco más) y recicla al hacer scroll.

**La regla práctica:** si el arreglo viene de un `fetch`, es `FlatList`.

### Ejemplos

```tsx
// listas
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  View,
} from 'react-native';

type Item = { id: string; title: string };
// En su app esto vive en el api.ts del módulo: devuelve una página de resultados.
declare function fetchPage(page: number): Promise<Item[]>;

// ─── 1. Contenido ESTÁTICO: ScrollView ───────────────────────────────────────
export function AboutScreen() {
  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-6">
      <Text className="text-2xl font-bold">Quiénes somos</Text>
      <Text className="text-neutral-600">Un texto largo que no cabe en la pantalla…</Text>
      <View className="h-48 rounded-2xl bg-neutral-200" />
      <Text className="text-neutral-600">Más texto fijo…</Text>
    </ScrollView>
  );
}

// ─── 2. Lista CORTA y FIJA (la conoces al escribir el código): ScrollView + map ─
const SETTINGS = ['Perfil', 'Notificaciones', 'Privacidad', 'Ayuda', 'Cerrar sesión'];

export function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-2 p-4">
      {SETTINGS.map((s) => (
        <Pressable key={s} className="rounded-xl bg-white p-4 active:opacity-70">
          <Text>{s}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── 3. Lista DINÁMICA (viene del API, puede crecer): FlatList ───────────────
function Row({ item }: { item: Item }) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <Text className="font-semibold">{item.title}</Text>
    </View>
  );
}

export function TicketsScreen() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setItems(await fetchPage(1));
    setPage(1);
    setRefreshing(false);
  }, []);

  const loadMore = async () => {
    const next = await fetchPage(page + 1);
    if (next.length) {
      setItems((prev) => [...(prev ?? []), ...next]);
      setPage(page + 1);
    }
  };

  if (items === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-3 p-4"
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Row item={item} />}
      // Lo que va arriba de la lista, dentro del mismo scroll (¡no envolver en ScrollView!)
      ListHeaderComponent={<Text className="text-2xl font-bold">Solicitudes</Text>}
      ListEmptyComponent={<Text className="p-6 text-center text-neutral-500">No hay solicitudes.</Text>}
      // Arrastrar hacia abajo para recargar
      refreshing={refreshing}
      onRefresh={refresh}
      // Paginación: pide más cuando falta medio pantallazo para el final
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}

// ─── 4. Cuadrícula (ropero, álbum, galería): FlatList + numColumns ───────────
export function GridScreen({ items }: { items: Item[] }) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerClassName="gap-3 p-4"
      columnWrapperClassName="gap-3"
      renderItem={({ item }) => (
        <View className="aspect-square flex-1 items-center justify-center rounded-2xl bg-white">
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
}

// ─── 5. Carrusel horizontal: FlatList horizontal ─────────────────────────────
export function Carousel({ items }: { items: Item[] }) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 px-4"
      renderItem={({ item }) => (
        <View className="h-32 w-56 justify-end rounded-2xl bg-blue-100 p-4">
          <Text className="font-semibold">{item.title}</Text>
        </View>
      )}
    />
  );
}

// ─── 6. Datos AGRUPADOS (citas por día, carta por categoría): SectionList ────
const AGENDA = [
  { title: 'Lunes 3 nov', data: [{ id: '1', title: '9:00 · Ana' }, { id: '2', title: '10:00 · Luis' }] },
  { title: 'Martes 4 nov', data: [{ id: '3', title: '8:30 · Sara' }] },
];

export function AgendaScreen() {
  return (
    <SectionList
      sections={AGENDA}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-2 p-4"
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <Text className="bg-neutral-50 py-2 text-xs font-bold uppercase text-neutral-500">{section.title}</Text>
      )}
      renderItem={({ item }) => <Row item={item} />}
    />
  );
}

// ─── 7. Formulario largo con teclado: KeyboardAvoidingView + ScrollView ──────
export function LongFormScreen() {
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1 bg-neutral-50"
        contentContainerClassName="gap-5 p-6"
        // Sin esto, el primer toque en un botón solo cierra el teclado
        keyboardShouldPersistTaps="handled">
        <TextInput className="rounded-xl border border-neutral-300 bg-white p-3" placeholder="Nombre" />
        <TextInput className="rounded-xl border border-neutral-300 bg-white p-3" placeholder="Descripción" multiline />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

### Props de `FlatList` que van a usar

| Prop | Para qué |
|---|---|
| `data` + `renderItem` | Los datos y cómo se dibuja cada uno |
| `keyExtractor` | Id único y **estable** (el `id` de la base de datos, nunca el índice) |
| `contentContainerClassName` | Padding y `gap` del contenido (Tailwind). `className` es para el contenedor |
| `ListHeaderComponent` / `ListFooterComponent` | Lo que va arriba/abajo de la lista **dentro del mismo scroll** |
| `ListEmptyComponent` | Lo que se ve si `data` está vacío |
| `refreshing` + `onRefresh` | Arrastrar hacia abajo para recargar |
| `onEndReached` + `onEndReachedThreshold` | Paginación / scroll infinito |
| `numColumns` + `columnWrapperClassName` | Cuadrícula y el espacio entre columnas |
| `horizontal` | Carrusel |
| `keyboardShouldPersistTaps="handled"` | Que un toque en un botón funcione con el teclado abierto |

### Errores comunes

- **`VirtualizedLists should never be nested inside plain ScrollViews`**: pusieron una `FlatList` dentro de un
  `ScrollView` en la misma dirección. Quiten el `ScrollView` y pasen lo de arriba a `ListHeaderComponent` y lo
  de abajo a `ListFooterComponent`. (Un carrusel **horizontal** dentro de una lista vertical sí está bien.)
- **La lista no hace scroll:** al padre le falta `flex-1` (o la lista no tiene altura). `ScrollView` y
  `FlatList` necesitan un alto limitado para saber que deben desplazarse.
- **`gap` no separa las filas:** el `gap` va en `contentContainerClassName`, no en `className`.
- **La lista no se actualiza al volver de otra pantalla:** recarguen en `useFocusEffect` de `expo-router`.
- **Funciones pesadas en `renderItem`:** extraigan la fila a un componente (`Row`) y no calculen cosas costosas
  por cada fila en cada render.
- **`key` con el índice:** al borrar o reordenar, React mezcla filas. Usen el `id`.

---

## 10. Márgenes seguros (insets)

El celular tiene zonas donde el contenido no debe ir: el notch o la isla dinámica, la barra de estado arriba
y la barra de gestos o de navegación abajo. Los **insets** son el tamaño de esas zonas en cada dispositivo.

### `SafeAreaView` de React Native está obsoleto

El `SafeAreaView` que viene en `'react-native'` está marcado como **deprecated** en React Native 0.86
(*"Use react-native-safe-area-context instead"*) y además **solo funcionaba en iOS**. No lo usen.

```tsx
import { SafeAreaView } from 'react-native';                    // ❌ obsoleto, solo iOS
import { SafeAreaView } from 'react-native-safe-area-context';  // ✅ Android + iOS
```

Por qué importa también en Android: desde Expo SDK 54 las apps de Android son **edge-to-edge** siempre;
el contenido se dibuja debajo de la barra de estado y de la barra de navegación, igual que en iOS.

`react-native-safe-area-context` ya viene instalado y **Expo Router ya pone el `SafeAreaProvider`** en la
raíz de la app; no hay que agregarlo.

### Las cuatro herramientas

| Herramienta | Uso | Ejemplo |
|---|---|---|
| `<SafeAreaView edges={[…]}>` | Toda la pantalla respeta los bordes indicados | `edges={['top', 'bottom']}` |
| Clases de NativeWind | Padding/margen con el inset desde Tailwind | `pt-safe`, `pb-safe`, `pb-safe-offset-4`, `pt-safe-or-6`, `h-screen-safe` |
| `useSafeAreaInsets()` | Números para cálculos: botones flotantes, listas, animaciones | `bottom: insets.bottom + 16` |
| `contentInsetAdjustmentBehavior="automatic"` | `ScrollView` debajo de un header transparente o de título grande en iOS | En el `ScrollView` |

Las clases de NativeWind:

- `pt-safe` → `paddingTop` = inset superior.
- `pb-safe-offset-4` → inset inferior **+** 16 px (sirve para despegar del borde).
- `pt-safe-or-6` → el **mayor** entre el inset y 24 px (para que en celulares sin notch no quede pegado).
- Existen para `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr`.

### ¿Qué borde protejo?

| Pantalla | Arriba | Abajo |
|---|---|---|
| Con header del `Stack` (`headerShown` por defecto) | ❌ el header ya lo cubre | ✅ si hay botones o contenido pegado abajo |
| Dentro de `Tabs` | ❌ si hay header | ❌ la barra de pestañas ya lo cubre |
| Sin header (login, onboarding, `headerShown: false`) | ✅ | ✅ |
| Mapa o imagen a pantalla completa | El **fondo** no; los **controles flotantes** sí | Igual |
| Lista larga sin pestañas | — | ✅ `paddingBottom: insets.bottom` en el contenido |

### Ejemplos

```tsx
// safe-area
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Item = { id: string; title: string };

// ─── A. Pantalla SIN header (login, onboarding, mapa a pantalla completa) ────
// SafeAreaView de react-native-safe-area-context, NO el de 'react-native'.
export function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
      <View className="flex-1 justify-center gap-5 p-6">
        <Text className="text-2xl font-bold">Iniciar sesión</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── B. Pantalla CON header del Stack: el header ya cubre arriba, solo falta abajo ─
export function DetailScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-6">
        <Text>Contenido…</Text>
      </ScrollView>
      <View className="border-t border-neutral-200 bg-white p-4">
        <Text className="text-center font-semibold">Botón fijo abajo</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── C. Clases de NativeWind: pt-safe, pb-safe, pb-safe-offset-4, … ─────────
export function FullScreenMap() {
  return (
    <View className="flex-1 bg-sky-200">
      {/* Barra flotante arriba: inset superior + 8 px */}
      <View className="absolute left-4 right-4 top-0 pt-safe-offset-2">
        <View className="rounded-2xl bg-white p-4">
          <Text>Buscar zona…</Text>
        </View>
      </View>
      {/* Panel flotante abajo: inset inferior + 16 px */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 pt-6 pb-safe-offset-4">
        <Text className="text-lg font-bold">Zona Cable Plaza</Text>
      </View>
    </View>
  );
}

// ─── D. Hook useSafeAreaInsets: control fino (botón flotante, listas) ────────
export function ListWithFab({ items }: { items: Item[] }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-50">
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Text className="rounded-xl bg-white p-4">{item.title}</Text>}
        contentContainerClassName="gap-3 p-4"
        // Que el último elemento no quede tapado por la barra del sistema ni por el botón
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      />
      <Pressable
        className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-blue-600 active:opacity-80"
        style={{ bottom: insets.bottom + 16 }}>
        <Text className="text-3xl text-white">+</Text>
      </Pressable>
    </View>
  );
}
```

### Errores comunes

- **Doble espacio arriba:** pantalla con header del `Stack` + `SafeAreaView` con `edges` por defecto (que
  incluye `top`). Usen `edges={['bottom']}`.
- **`paddingTop: 40` a mano:** en un celular sobra y en otro falta. Siempre insets.
- **Insets en 0 dentro de un `<Modal>`:** el modal es otra ventana; envuelvan su contenido en otro
  `<SafeAreaProvider>`.
- **El último elemento de la lista queda debajo de la barra de gestos o del botón flotante:**
  `contentContainerStyle={{ paddingBottom: insets.bottom + alturaDelBoton }}`.
- **El teclado tapa el campo:** eso no es un inset; es `KeyboardAvoidingView` (sección 9, ejemplo 7).

---

## Checklist para su proyecto

- [ ] Elegí un estilo de esta guía y lo justifiqué en el documento de visión.
- [ ] Mis colores, sombras y degradados están en tokens, no repetidos en cada pantalla.
- [ ] Tengo al menos botón, tarjeta, campo de texto y un elemento propio de mi app en ese estilo.
- [ ] Todo lo que se toca tiene estado presionado y `accessibilityRole`.
- [ ] El texto tiene contraste 4.5:1 sobre su fondo (también sobre vidrio y degradados).
- [ ] Lo probé en Android **y** en iOS (las sombras, el blur y Liquid Glass se ven distinto).
- [ ] Las listas que vienen del servidor usan `FlatList` / `SectionList`, no `ScrollView` + `map`.
- [ ] Ninguna lista está dentro de un `ScrollView` en la misma dirección.
- [ ] Las listas tienen estado de carga, vacío y error.
- [ ] No uso el `SafeAreaView` de `'react-native'`; uso `react-native-safe-area-context`, sus clases o el hook.
- [ ] Nada queda debajo del notch, la barra de estado o la barra de gestos.
