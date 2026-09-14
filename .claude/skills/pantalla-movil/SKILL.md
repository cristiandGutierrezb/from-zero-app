---
name: pantalla-movil
description: Receta para consumir un endpoint nuevo del backend HelpDesk UAM desde la app Expo y construir su pantalla (tipos, traducción en src/api, pantalla en app/, navegación). Úsala cuando el backend expuso algo nuevo, cambió un campo, o hay que agregar una pantalla a la app móvil.
---

# Agregar una pantalla o un endpoint a la app móvil

De afuera hacia adentro es al revés de como se construye: primero el **tipo**,
después la **traducción**, después la **pantalla**. Hacerlo al revés termina
con nombres del servidor regados por toda la interfaz.

Ejemplo vivo: los tickets (`src/types.ts` → `src/api/tickets.ts` →
`app/tickets/`). Cópialo.

## 0. Mirar el contrato

`http://localhost:3001/api/docs` con el backend arriba, o
`../../sw_II/helpdesk-uam/src/infraestructura/http/rutas/`. Fíjate en **quién
puede** llamar cada ruta y en **qué errores** devuelve: eso decide qué botones
se muestran y qué mensajes salen.

## 1. `src/types.ts`

El tipo en inglés, con los valores en español (son datos del servidor, no
nombres de código). Para una entidad completa van tres cosas:

```ts
export interface X { id: string; /* … */ }
export interface NewX { /* lo que el usuario llena */ }
export type XChanges = Partial<Pick<X, 'campo' | 'otro'>>;   // lo modificable
```

Y si hay búsqueda, un `XFilters` con todo opcional.

## 2. `src/api/xs.ts`

El único archivo que sabe cómo se llaman los campos en el servidor:

```ts
interface XResponse { id: string; nombre: string; /* forma EXACTA del backend */ }
const toX = (data: XResponse): X => ({ id: data.id, name: data.nombre });

export async function listXs(): Promise<X[]> { /* … */ }
export async function createX(x: NewX): Promise<X> { /* … */ }
export async function updateX(id: string, changes: XChanges): Promise<X> { /* … */ }
export async function deleteX(id: string): Promise<void> { /* … */ }
```

- `request(path)` → GET · `request(path, body)` → POST · `request(path, body, 'PATCH')` · `request(path, undefined, 'DELETE')`.
- En un PATCH, viaja **solo lo que cambió**: spread condicional (`...(changes.name !== undefined ? { nombre: changes.name } : {})`).
- Los filtros se arman con `URLSearchParams`, que escapa el texto.
- No atrapes los errores aquí: `request` ya lanza un `Error` con el mensaje del servidor, y la pantalla lo muestra tal cual.

## 3. `app/…`

El nombre del archivo es la ruta. `app/xs/index.tsx` es la lista,
`app/xs/new.tsx` el formulario, `app/xs/[id].tsx` el detalle (`[id]` es
variable: se lee con `useLocalSearchParams<{ id: string }>()`).

- **Formularios**: `useForm` + `<Field>` para texto y `<Select>` para elegir entre opciones. Los errores del servidor van a `setError('root', { message })` y se pintan en un recuadro rojo.
- **Listas**: `FlatList` + `useFocusEffect` para recargar al volver de otra pantalla, y `RefreshControl` para el gesto de arrastrar.
- **Estado de carga**: `useState<X[] | null>(null)` — `null` significa «cargando» y muestra un `ActivityIndicator`.
- **Confirmar algo destructivo**: dos toques sobre el mismo botón (`confirming`), no `Alert`, que no se comporta igual en web.
- **Por rol**: `const { user } = useSession()` y esconder lo que el servidor va a rechazar de todas formas. Esconder no es autorizar: la decisión real es del servidor.

## 4. `app/_layout.tsx`

Registrar la pantalla dentro del `Stack.Protected` que corresponda (con sesión
o sin ella) y ponerle título:

```tsx
<Stack.Screen name="xs/[id]" options={{ title: 'Detalle' }} />
```

## 5. Verificar

```bash
npx expo start       # regenera .expo/types/router.d.ts con las rutas nuevas
npx tsc --noEmit     # si se queja de un href, es que faltó el paso anterior
```

Y probar contra el backend de verdad: `npm run dev` en
`../../sw_II/helpdesk-uam`, con su `npm run db:up` y `npm run db:seed`.
