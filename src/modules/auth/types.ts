/**
 * El vocabulario de la sesión: quién entra y con qué mando.
 *
 * Los VALORES (SOLICITANTE, COORDINADOR…) van en español porque no son nombres
 * de código: son los datos que el servidor guarda y devuelve.
 */

/**
 * Roles del sistema (F20).
 *
 * El registro público SIEMPRE crea un SOLICITANTE; los demás roles los otorga
 * la administración del servidor, nunca un formulario de la app.
 */
export const ROLES = ['SOLICITANTE', 'AGENTE', 'COORDINADOR', 'ADMINISTRADOR'] as const;
export type Role = (typeof ROLES)[number];

/** Usuario de la sesión. Nunca incluye la contraseña ni su hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
