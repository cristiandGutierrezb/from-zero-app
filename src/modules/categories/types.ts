/**
 * El vocabulario del catálogo de servicios (F03/F04).
 *
 * La categoría es la que fija el compromiso de atención: cambiar el SLA de
 * «Red» es cambiar una fila de este catálogo, no desplegar código. Por eso un
 * ticket guarda `categoryId` y no el nombre de la categoría.
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  /** Horas comprometidas de solución para los casos de esta categoría. */
  slaHours: number;
  /** Una categoría inactiva no admite casos nuevos, pero conserva los viejos. */
  active: boolean;
}

/**
 * Lo que el coordinador llena al crear una categoría. El id lo pone el servidor.
 *
 * `active` es opcional porque una categoría nace activa: el servidor pone ese
 * valor por defecto y repetirlo en el formulario sería pedir un dato que nunca
 * se cambia en el alta.
 */
export type NewCategory = Omit<Category, 'id' | 'active'> & { active?: boolean };

/** Modificación parcial: solo los campos que el coordinador quiso tocar. */
export type CategoryChanges = Partial<NewCategory>;
