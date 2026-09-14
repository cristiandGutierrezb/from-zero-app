/**
 * Endpoints de tickets (prefijo /api/tickets) y la traducción entre el español
 * del servidor y el inglés de la app.
 *
 * Cubre las cuatro operaciones: registrar (F01), buscar (F11), consultar (F10)
 * y modificar o eliminar. Quién puede hacer qué lo decide el servidor según el
 * rol: un SOLICITANTE solo ve y modifica sus propios casos.
 */

import type {
  NewTicket,
  Priority,
  Ticket,
  TicketChanges,
  TicketFilters,
  TicketStatus,
} from '../types';
import { request } from './client';

/** Forma EXACTA del ticket en el servidor. No cambiar a la ligera. */
interface TicketResponse {
  id: string;
  asunto: string;
  descripcion: string;
  categoriaId: string;
  prioridad: Priority;
  estado: TicketStatus;
  solicitanteId: string;
  agenteId: string | null;
  creadoEn: string;
}

/** El único lugar donde la respuesta del servidor se convierte al tipo de la app. */
const toTicket = (data: TicketResponse): Ticket => ({
  id: data.id,
  subject: data.asunto,
  description: data.descripcion,
  categoryId: data.categoriaId,
  priority: data.prioridad,
  status: data.estado,
  requesterId: data.solicitanteId,
  agentId: data.agenteId,
  createdAt: data.creadoEn,
});

/** POST /tickets -> el ticket creado, con su identificador único (F02). */
export async function createTicket(ticket: NewTicket): Promise<Ticket> {
  return toTicket(
    await request<TicketResponse>('/tickets', {
      asunto: ticket.subject,
      descripcion: ticket.description,
      categoriaId: ticket.categoryId,
      prioridad: ticket.priority,
    }),
  );
}

/** GET /tickets -> los tickets que cumplen TODOS los filtros dados (F11). */
export async function searchTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  // URLSearchParams arma la cadena de consulta y escapa el texto por nosotros.
  const query = new URLSearchParams();
  if (filters.status) query.set('estado', filters.status);
  if (filters.priority) query.set('prioridad', filters.priority);
  if (filters.categoryId) query.set('categoriaId', filters.categoryId);
  if (filters.text?.trim()) query.set('texto', filters.text.trim());

  const suffix = query.toString();
  const list = await request<TicketResponse[]>(`/tickets${suffix ? `?${suffix}` : ''}`);
  return list.map(toTicket);
}

/** GET /tickets/:id -> un ticket. Falla con 403 si es de otro solicitante. */
export async function getTicket(id: string): Promise<Ticket> {
  return toTicket(await request<TicketResponse>(`/tickets/${id}`));
}

/**
 * PATCH /tickets/:id -> el ticket ya modificado.
 *
 * Solo viajan los campos presentes. El servidor rechaza con 409 un cambio de
 * estado que no corresponda al ciclo de vida (F06): esa regla es suya, la app
 * no la reimplementa, solo muestra el mensaje.
 */
export async function updateTicket(id: string, changes: TicketChanges): Promise<Ticket> {
  return toTicket(
    await request<TicketResponse>(
      `/tickets/${id}`,
      {
        ...(changes.subject !== undefined ? { asunto: changes.subject } : {}),
        ...(changes.description !== undefined ? { descripcion: changes.description } : {}),
        ...(changes.status !== undefined ? { estado: changes.status } : {}),
        ...(changes.priority !== undefined ? { prioridad: changes.priority } : {}),
        ...(changes.categoryId !== undefined ? { categoriaId: changes.categoryId } : {}),
      },
      'PATCH',
    ),
  );
}

/** DELETE /tickets/:id. Solo coordinación y administración; los demás reciben 403. */
export async function deleteTicket(id: string): Promise<void> {
  await request<unknown>(`/tickets/${id}`, undefined, 'DELETE');
}
