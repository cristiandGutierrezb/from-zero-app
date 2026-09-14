/**
 * Catálogo de categorías (prefijo /api/categorias).
 *
 * Es de solo lectura desde la app: administrarlo es tarea del coordinador
 * (F04) y se hace desde la consola web. Aquí solo se necesita para armar el
 * selector al registrar una solicitud.
 */

import type { Category } from '../types';
import { request } from './client';

/** Forma EXACTA en que el backend devuelve una categoría. */
interface CategoryResponse {
  id: string;
  nombre: string;
  descripcion: string;
  horasSla: number;
  activa: boolean;
}

const toCategory = (data: CategoryResponse): Category => ({
  id: data.id,
  name: data.nombre,
  description: data.descripcion,
  slaHours: data.horasSla,
  active: data.activa,
});

/**
 * GET /categorias -> el catálogo.
 *
 * Por defecto solo las activas: una categoría desactivada sigue clasificando
 * tickets viejos, pero ofrecerla para uno nuevo haría que el servidor lo
 * rechazara. Con `onlyActive = false` llegan todas, que es lo que hace falta
 * para ponerle nombre a la categoría de un ticket antiguo.
 */
export async function listCategories(onlyActive = true): Promise<Category[]> {
  const list = await request<CategoryResponse[]>(`/categorias${onlyActive ? '?activas=true' : ''}`);
  return list.map(toCategory);
}
