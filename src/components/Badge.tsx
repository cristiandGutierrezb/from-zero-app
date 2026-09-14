import { Text } from 'react-native';
import type { Priority, TicketStatus } from '../types';

/**
 * Etiqueta de color para el estado o la prioridad de un ticket.
 *
 * El color no es decoración: es lo que permite ver de un vistazo qué está
 * pendiente y qué está por vencer (F13).
 */
const COLORS: Record<TicketStatus | Priority, string> = {
  NUEVO: 'bg-sky-100 text-sky-800',
  ASIGNADO: 'bg-indigo-100 text-indigo-800',
  EN_PROCESO: 'bg-amber-100 text-amber-800',
  ESPERA_INFORMACION: 'bg-orange-100 text-orange-800',
  RESUELTO: 'bg-emerald-100 text-emerald-800',
  CERRADO: 'bg-neutral-200 text-neutral-700',
  BAJA: 'bg-neutral-100 text-neutral-600',
  MEDIA: 'bg-blue-100 text-blue-800',
  ALTA: 'bg-orange-100 text-orange-800',
  CRITICA: 'bg-red-100 text-red-800',
};

export default function Badge({ value }: { value: TicketStatus | Priority }) {
  return (
    <Text
      className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold ${COLORS[value]}`}>
      {value.replace(/_/g, ' ')}
    </Text>
  );
}
