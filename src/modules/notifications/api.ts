/**
 * Endpoint de avisos push (F09): decirle al servidor a qué teléfono mandarlos.
 */

import { request } from '../../api/client';

/**
 * PUT /auth/token-push -> asocia este dispositivo a la sesión (204).
 * Con `null` lo desasocia: se llama ANTES de cerrar sesión, mientras el token
 * de sesión todavía sirve.
 */
export async function savePushToken(pushToken: string | null): Promise<void> {
  await request('/auth/token-push', { token: pushToken }, 'PUT');
}
