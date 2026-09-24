/**
 * El vocabulario de los tickets, en inglés.
 *
 * El backend habla español (`asunto`, `prioridad`...). Esa traducción ocurre en
 * un solo sitio, `src/api/tickets.ts`, y de ahí para acá todo se llama igual.
 * Así, si el servidor renombra un campo, solo cambia el archivo que traduce.
 *
 * Los VALORES de las listas (ALTA, NUEVO...) sí van en español: no son nombres
 * de código, son los datos que el servidor guarda y devuelve.
 *
 * Lo de la sesión vive en `src/modules/auth/types.ts` y lo del catálogo en
 * `src/modules/categories/types.ts`: cada módulo trae su propio vocabulario.
 */

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
