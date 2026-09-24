/**
 * Catálogo de categorías (prefijo /api/categorias).
 *
 * Leerlo lo puede cualquiera con sesión: hace falta para armar el selector al
 * registrar una solicitud. Escribirlo es tarea de la coordinación (F04), y esa
 * regla la impone el servidor con un 403: la app solo decide qué botones
 * enseña, nunca quién tiene permiso.
 */

import { request } from '../../api/client';
import type { Category, CategoryChanges, NewCategory } from './types';

/** Forma EXACTA en que el backend devuelve una categoría. */
interface CategoryResponse {
  id: string;
  nombre: string;
  descripcion: string;
  horasSla: number;
  activa: boolean;
}

/** El único lugar donde la respuesta del servidor se convierte al tipo de la app. */
const toCategory = (data: CategoryResponse): Category => ({
  id: data.id,
  name: data.nombre,
  description: data.descripcion,
  slaHours: data.horasSla,
  active: data.activa,
});

/** Lo contrario: el tipo de la app en el español que espera el servidor. */
const toBody = (changes: CategoryChanges) => ({
  ...(changes.name !== undefined ? { nombre: changes.name } : {}),
  ...(changes.description !== undefined ? { descripcion: changes.description } : {}),
  ...(changes.slaHours !== undefined ? { horasSla: changes.slaHours } : {}),
  ...(changes.active !== undefined ? { activa: changes.active } : {}),
});

/**
 * GET /categorias -> el catálogo.
 *
 * Por defecto solo las activas: una categoría desactivada sigue clasificando
 * tickets viejos, pero ofrecerla para uno nuevo haría que el servidor lo
 * rechazara. Con `onlyActive = false` llegan todas, que es lo que hace falta
 * para administrarlo y para ponerle nombre a la categoría de un ticket antiguo.
 */
export async function listCategories(onlyActive = true): Promise<Category[]> {
  const list = await request<CategoryResponse[]>(`/categorias${onlyActive ? '?activas=true' : ''}`);
  return list.map(toCategory);
}

/** GET /categorias/:id -> una categoría. 404 si ya no existe. */
export async function getCategory(id: string): Promise<Category> {
  return toCategory(await request<CategoryResponse>(`/categorias/${id}`));
}

/** POST /categorias -> la categoría creada (201). 409 si el nombre ya existe. */
export async function createCategory(category: NewCategory): Promise<Category> {
  return toCategory(await request<CategoryResponse>('/categorias', toBody(category)));
}

/** PATCH /categorias/:id -> la categoría ya modificada. Solo viajan los campos presentes. */
export async function updateCategory(id: string, changes: CategoryChanges): Promise<Category> {
  return toCategory(
    await request<CategoryResponse>(`/categorias/${id}`, toBody(changes), 'PATCH'),
  );
}

/**
 * DELETE /categorias/:id.
 *
 * El servidor responde 409 si algún ticket la usa: el historial es inmutable
 * (R08) y un ticket no puede quedarse sin clasificación. En ese caso lo que
 * corresponde es desactivarla, y el mensaje del servidor lo dice.
 */
export async function deleteCategory(id: string): Promise<void> {
  await request<unknown>(`/categorias/${id}`, undefined, 'DELETE');
}
