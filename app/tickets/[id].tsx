/**
 * Un caso en detalle: consultarlo (F10), modificarlo y —para la coordinación—
 * eliminarlo.
 *
 * `[id]` en el nombre del archivo es un segmento variable: esta pantalla
 * atiende /tickets/lo-que-sea, y `useLocalSearchParams` entrega ese valor.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { listCategories } from '../../src/api/categories';
import { deleteTicket, getTicket, updateTicket } from '../../src/api/tickets';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import Field from '../../src/components/Field';
import Select from '../../src/components/Select';
import { useSession } from '../../src/session/context';
import {
  PRIORITIES,
  STATUSES,
  type Category,
  type Ticket,
  type TicketChanges,
} from '../../src/types';

/** Los campos editables del formulario. Coinciden con lo que acepta el PATCH. */
type EditForm = Required<Pick<Ticket, 'subject' | 'description' | 'status' | 'priority' | 'categoryId'>>;

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { control, handleSubmit, setError, reset, formState } = useForm<EditForm>();

  useEffect(() => {
    getTicket(id)
      .then((found) => {
        setTicket(found);
        // `reset` rellena el formulario con lo que hay hoy en el servidor y
        // fija el punto de comparación: a partir de ahí, lo que el usuario
        // toque queda marcado como "sucio".
        reset({
          subject: found.subject,
          description: found.description,
          status: found.status,
          priority: found.priority,
          categoryId: found.categoryId,
        });
      })
      .catch((failure: Error) => setLoadError(failure.message));
    listCategories(false).then(setCategories).catch(() => setCategories([]));
  }, [id, reset]);

  const submit = async (data: EditForm) => {
    // Solo viaja lo que el usuario cambió: un PATCH con todo reescribiría
    // campos que nadie tocó y ensuciaría el historial.
    const { dirtyFields } = formState;
    const changes: TicketChanges = {
      ...(dirtyFields.subject ? { subject: data.subject } : {}),
      ...(dirtyFields.description ? { description: data.description } : {}),
      ...(dirtyFields.status ? { status: data.status } : {}),
      ...(dirtyFields.priority ? { priority: data.priority } : {}),
      ...(dirtyFields.categoryId ? { categoryId: data.categoryId } : {}),
    };
    if (Object.keys(changes).length === 0) return void router.back();

    try {
      const updated = await updateTicket(id, changes);
      setTicket(updated);
      reset(data);
      router.back();
    } catch (failure) {
      // Aquí caen las reglas del servidor, como una transición de estado que
      // el ciclo de vida no permite (F06). La app no las reimplementa.
      setError('root', { message: (failure as Error).message });
    }
  };

  const remove = async () => {
    try {
      await deleteTicket(id);
      router.back();
    } catch (failure) {
      setError('root', { message: (failure as Error).message });
      setConfirming(false);
    }
  };

  if (loadError) {
    return (
      <View className="flex-1 justify-center gap-4 bg-neutral-50 p-6">
        <Text className="text-center text-red-700">{loadError}</Text>
        <Button text="Volver" onPress={() => router.back()} secondary />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  // Borrar contradice el historial inmutable (R08): es un acto administrativo.
  const canDelete = user?.role === 'COORDINADOR' || user?.role === 'ADMINISTRADOR';

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <View className="gap-2 rounded-2xl bg-white p-4">
        <View className="flex-row flex-wrap items-center gap-2">
          <Badge value={ticket.status} />
          <Badge value={ticket.priority} />
        </View>
        <Text className="text-xs text-neutral-400">
          Caso {ticket.id}
          {'\n'}Registrado el {new Date(ticket.createdAt).toLocaleString()}
        </Text>
        <Text className="text-xs text-neutral-400">
          Responsable: {ticket.agentId ?? 'todavía sin asignar'}
        </Text>
      </View>

      <Field
        control={control}
        name="subject"
        label="Asunto"
        rules={{ minLength: { value: 5, message: 'Mínimo 5 caracteres' } }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        className="h-32"
        rules={{ minLength: { value: 10, message: 'Mínimo 10 caracteres' } }}
      />
      <Select control={control} name="status" label="Estado" options={STATUSES} />
      <Select control={control} name="priority" label="Prioridad" options={PRIORITIES} />
      <Select
        control={control}
        name="categoryId"
        label="Categoría"
        options={categories.map((c) => ({ value: c.id, label: `${c.name} · ${c.slaHours}h` }))}
        empty="No se pudo cargar el catálogo."
      />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />

      {canDelete && (
        // Dos toques en vez de un diálogo del sistema: `Alert` no se comporta
        // igual en web, y esto funciona en las tres plataformas.
        <Button
          text={confirming ? 'Tocar de nuevo para eliminar' : 'Eliminar caso'}
          onPress={() => (confirming ? void remove() : setConfirming(true))}
          secondary
          className={confirming ? 'border-red-500' : ''}
        />
      )}
    </ScrollView>
  );
}
