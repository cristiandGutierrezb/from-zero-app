# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# HelpDesk UAM · app móvil

Cliente de la mesa de ayuda de la UAM. Expo SDK 57, expo-router, NativeWind,
react-hook-form. Consume la API del backend, que está en
`../../sw_II/helpdesk-uam` (léelo: ahí viven las reglas del negocio y el
documento de visión en `docs/`).

Las características se citan por su número del documento de visión: F01 =
registro de solicitudes, F10 = consulta del estado, F11 = búsqueda y filtrado.

## El mapa

La app se está mudando a **módulos**: cada característica con su vocabulario,
su traducción y su pantalla juntos, en vez de repartidos por tipo de archivo.

| Carpeta | Qué hay | Regla |
|---|---|---|
| `app/` | Una pantalla por archivo; el nombre **es** la ruta (`app/tickets/[id].tsx` → `/tickets/…`) | Solo interfaz y estado de pantalla |
| `src/modules/<x>/` | Un módulo: `types.ts` (su vocabulario) + `api.ts` (su traducción) | Un módulo no importa de otro; lo común baja a `src/api/` o `src/components/` |
| `src/modules/auth/` | Roles, usuario, login/registro/perfil y el contexto de sesión | El token vive en memoria |
| `src/modules/categories/` | El catálogo de categorías y SLA (F04) | |
| `src/api/client.ts` | El transporte compartido: **el único lugar** que sabe de `fetch`, de URLs y del token | |
| `src/api/tickets.ts`, `src/types.ts` | Los tickets, todavía sin mudar a `src/modules/tickets/` | Al tocarlos a fondo, múdalos |
| `src/components/` | Piezas reutilizadas: `Field`, `Select`, `Button`, `Badge` | Sin lógica de negocio |

## Las cuatro reglas

1. **El servidor habla español, la app inglés.** `nombre → name`, `asunto → subject`. Esa traducción ocurre **solo** en el `api.ts` del módulo, en una función `toX()`. Si el servidor renombra un campo, cambia un archivo y nada más.
2. **Las reglas del negocio son del servidor.** Qué transición de estado es válida (F06), quién puede borrar, qué categorías existen: el cliente **no** las reimplementa. Manda la petición y muestra el mensaje de error que vuelva. Duplicar la regla aquí garantiza que algún día las dos versiones difieran. Esconder un botón según el rol (`isCoordination`) no es reimplementar la regla: es no ofrecer algo que iba a fallar con 403.
3. **Nada de credenciales ni datos personales en `console.log`.** Queda en la bitácora del dispositivo.
4. **Rutas tipadas**: `app.json` tiene `typedRoutes: true`. Al agregar un archivo en `app/`, TypeScript falla con «not assignable to parameter of type…» hasta que `.expo/types/router.d.ts` se regenere. Se arregla **arrancando el servidor** (`npx expo start`), no editando ese archivo.

## Antes de dar algo por hecho

```bash
npx tsc --noEmit     # con el servidor de Expo arrancado al menos una vez
npx expo start       # y abrir la app
```

Para comprobar que compila sin simulador, con Metro arriba:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  "http://localhost:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true"
```

El backend tiene que estar arriba (`npm run dev` allá) y `EXPO_PUBLIC_API_URL`
del `.env` tiene que apuntarle. Ojo con `localhost` desde un dispositivo real:
ver `.env.example`.

**Para entrar como coordinación** (catálogo de categorías): el registro de la
app siempre crea un SOLICITANTE. Las cuentas con mando las siembra el backend
con `npm run db:seed`; la de coordinación es `coordinacion@autonoma.edu.co` y
su clave está en el `.env.example` de allá.

## Agregar una pantalla o consumir un endpoint nuevo

Receta paso a paso en **`.claude/skills/pantalla-movil/SKILL.md`**.
