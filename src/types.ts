/**
 * El vocabulario de la app, en inglés.
 *
 * El backend habla español (`nombre`, `correo`, `clave`...). Esa traducción
 * ocurre en un solo sitio, `src/api/`, y de ahí para acá todo se llama igual.
 * Así, si el servidor renombra un campo, solo cambia el archivo que traduce.
 *
 * Los VALORES de las listas (SOLICITANTE, ALTA, RED...) sí van en español:
 * no son nombres de código, son los datos que el servidor guarda y devuelve.
 */

/** Roles del sistema. El backend asigna SOLICITANTE por defecto al registrarse. */
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

// --- Tickets ---------------------------------------------------------------

export const PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  'NUEVO',
  'ASIGNADO',
  'EN_PROCESO',
  'ESPERA_INFORMACION',
  'RESUELTO',
  'CERRADO',
] as const;
export type TicketStatus = (typeof STATUSES)[number];

/**
 * Categoría del catálogo (F03/F04): determina el SLA y el grupo de agentes
 * competentes.
 *
 * Ya NO es una lista quemada: el coordinador administra el catálogo en el
 * servidor y la app lo pide con `listCategories()`. Por eso un ticket guarda
 * `categoryId` y no el nombre de la categoría.
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

/** Lo que el usuario llena en el formulario de una nueva solicitud. */
export interface NewTicket {
  subject: string;
  description: string;
  categoryId: string;
  priority: Priority;
}

/** Un ticket ya registrado en el servidor. */
export interface Ticket extends NewTicket {
  id: string;
  status: TicketStatus;
  requesterId: string;
  agentId: string | null;
  /** Fecha ISO tal como la manda el servidor. */
  createdAt: string;
}

/** Lo que se puede cambiar de un ticket. El dueño y la fecha, nunca. */
export type TicketChanges = Partial<
  Pick<Ticket, 'subject' | 'description' | 'status' | 'priority' | 'categoryId'>
>;

/**
 * Criterios de búsqueda (F11). Lo ausente no restringe.
 *
 * No hay filtro por solicitante: el servidor se lo impone solo a quien tiene
 * rol SOLICITANTE, que únicamente ve sus propios casos.
 */
export interface TicketFilters {
  status?: TicketStatus;
  priority?: Priority;
  categoryId?: string;
  text?: string;
}
