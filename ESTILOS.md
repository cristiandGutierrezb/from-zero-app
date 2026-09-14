# Estilos estándar · HelpDesk UAM móvil

Cadenas de NativeWind que ya usa la app. **Copia de aquí, no inventes una
variante nueva.** Si algo se repite tres veces, se vuelve componente en
`src/components/`.

Regla base: primero busca el componente (`Button`, `Field`, `Select`,
`Badge`). Solo si no existe, usa las clases sueltas de este documento.

---

## Paleta

| Papel | Clase | Nota |
|---|---|---|
| Fondo de pantalla | `bg-neutral-50` | Todas las pantallas |
| Superficie (tarjeta, barra) | `bg-white` | |
| Primario / acción | `bg-blue-600`, `text-blue-600` | |
| Borde | `border-neutral-300` (campos), `border-neutral-200` (separadores) | |
| Texto fuerte | `text-neutral-900` | Títulos y contenido |
| Texto secundario | `text-neutral-500` | Descripciones |
| Texto tenue / metadatos | `text-neutral-400` | Fechas, ids |
| Error | `text-red-600`, `bg-red-50`, `border-red-500` | |

`placeholderTextColor="#a3a3a3"` va como **prop**, no como clase: NativeWind
no traduce `placeholder:` en React Native.

---

## Contenedores

```tsx
// Pantalla simple
<View className="flex-1 gap-6 bg-neutral-50 p-6">

// Pantalla centrada (login, acuse de recibo, error)
<View className="flex-1 justify-center gap-5 bg-neutral-50 p-6">

// Pantalla con scroll (formularios largos)
<ScrollView
  className="flex-1 bg-neutral-50"
  contentContainerClassName="gap-5 p-6"
  keyboardShouldPersistTaps="handled">

// Tarjeta
<View className="gap-2 rounded-2xl bg-white p-4">

// Barra superior fija (filtros)
<View className="gap-3 border-b border-neutral-200 bg-white p-4">

// Barra inferior fija (acción principal)
<View className="border-t border-neutral-200 bg-white p-4">

// Cargando
<View className="flex-1 items-center justify-center bg-neutral-50">
  <ActivityIndicator />
</View>
```

El espaciado entre hijos es `gap-*`, nunca `mt-*` en cada hijo.
`gap-6` entre bloques, `gap-5` entre campos de formulario, `gap-3`/`gap-2`
dentro de una tarjeta, `gap-1.5` entre etiqueta y control.

---

## Tipografía

```tsx
<Text className="text-2xl font-bold text-neutral-900">   // Título de pantalla
<Text className="text-xl font-bold text-neutral-900">    // Título de sección/tarjeta
<Text className="font-semibold text-neutral-900">        // Título de elemento en lista
<Text className="text-neutral-500">                      // Texto secundario
<Text className="text-xs text-neutral-400">              // Fecha, id, metadato
<Text className="font-semibold text-neutral-700">        // Etiqueta de un campo
```

---

## Botón → usa `Button`

`src/components/Button.tsx` es **el** botón del proyecto. No escribas otro
`Pressable` con fondo azul.

```tsx
import Button from '../src/components/Button';

// Primario
<Button text="Enviar solicitud" onPress={handleSubmit(submit)} />

// Secundario (borde, sin relleno)
<Button text="Volver" onPress={() => router.back()} secondary />

// Deshabilitado mientras se envía: el texto también cambia
<Button
  text={formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
  onPress={handleSubmit(submit)}
  disabled={formState.isSubmitting}
/>

// Ajuste puntual (se suma a las clases base)
<Button text="Eliminar caso" onPress={remove} secondary className="border-red-500" />
```

Props: `text`, `onPress`, `disabled?`, `secondary?`, `className?`.

Por dentro (referencia, no lo copies):

| Parte | Clases |
|---|---|
| Base | `items-center rounded-xl p-4 active:opacity-80 disabled:opacity-50` |
| Primario | `bg-blue-600` + texto `font-semibold text-white` |
| Secundario | `border border-neutral-300` + texto `font-semibold text-neutral-700` |

---

## Campo de texto → usa `Field`

`src/components/Field.tsx` ya trae etiqueta, borde rojo al fallar y el mensaje
de error. Solo dentro de un formulario de react-hook-form.

```tsx
<Field
  control={control}
  name="email"
  label="Correo"
  keyboardType="email-address"
  placeholder="nombre@autonoma.edu.co"
  rules={{
    required: 'El correo es obligatorio',
    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
  }}
/>

// Área de texto
<Field
  control={control}
  name="description"
  label="¿Qué está pasando?"
  multiline
  numberOfLines={5}
  textAlignVertical="top"   // sin esto el texto se centra en Android
  className="h-32"
/>
```

Input suelto (fuera de un formulario, como el buscador):

```tsx
<TextInput
  className="rounded-xl border border-neutral-300 bg-white p-3"
  placeholderTextColor="#a3a3a3"
/>
```

Clases que aplica `Field` por dentro:

| Parte | Clases |
|---|---|
| Grupo | `gap-1.5` |
| Etiqueta | `font-semibold text-neutral-700` |
| Input | `rounded-xl border bg-white p-3.5` + `border-neutral-300` / `border-red-500` |
| Error del campo | `text-xs text-red-600` |

---

## Selección de una opción → usa `Select`

```tsx
<Select control={control} name="priority" label="Prioridad" options={PRIORITIES} />

<Select
  control={control}
  name="categoryId"
  label="Categoría"
  options={categories.map((c) => ({ value: c.id, label: `${c.name} · ${c.slaHours}h` }))}
  empty="No se pudo cargar el catálogo."
/>
```

Chip (la opción individual), por si hay que hacer uno fuera del formulario
—hoy solo el filtro de estado en `app/tickets/index.tsx`—:

```tsx
<Pressable
  className={`rounded-full border px-4 py-2 active:opacity-70 ${
    active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
  }`}>
  <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
```

---

## Etiqueta de estado/prioridad → usa `Badge`

```tsx
<Badge value={ticket.status} />
<Badge value={ticket.priority} />
```

Base: `self-start rounded-full px-2.5 py-1 text-[10px] font-bold`. El color
sale del mapa `COLORS` en `src/components/Badge.tsx`; **valor nuevo del
backend ⇒ entrada nueva ahí**, no un color en la pantalla.

---

## Errores del formulario completo

Un solo formato para el error que devuelve el servidor:

```tsx
{!!formState.errors.root && (
  <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
    {formState.errors.root.message}
  </Text>
)}
```

Error que impide cargar la pantalla: `text-center text-red-700` + un
`<Button ... secondary />` para volver.

---

## Lista

```tsx
<FlatList
  contentContainerClassName="gap-3 p-4"
  ...
/>

// Fila pulsable
<Pressable className="gap-2 rounded-2xl bg-white p-4 active:opacity-80">

// Vacío o error
<Text className="p-6 text-center text-neutral-500">
```

---

## Enlace

```tsx
<Link href="/login" className="text-center text-blue-600">
```
