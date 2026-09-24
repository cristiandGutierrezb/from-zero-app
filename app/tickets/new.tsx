/**
 * Registro de una solicitud de soporte (F01 del documento de visión).
 *
 * El solicitante describe el problema en lenguaje natural; la categoría sale
 * del catálogo que administra el coordinador (F04) y es la que fija el
 * compromiso de atención.
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { listCategories } from '../../src/modules/categories/api';
import { createTicket } from '../../src/api/tickets';
import Button from '../../src/components/Button';
import Field from '../../src/components/Field';
import Select from '../../src/components/Select';
import type { Category } from '../../src/modules/categories/types';
import { PRIORITIES, type NewTicket } from '../../src/types';

export default function NewTicketScreen() {
  // Identificador del ticket recién creado; mientras sea null se ve el formulario.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { control, handleSubmit, setError, setValue, reset, formState } = useForm<NewTicket>({
    defaultValues: {
      subject: '',
      description: '',
      categoryId: '',
      // MEDIA por defecto: el solicitante no siempre sabe priorizar, y el
      // sistema puede escalar después según el SLA (F08).
      priority: 'MEDIA',
    },
  });

  // El catálogo se pide una sola vez, al entrar. Si falla, el formulario se
  // queda sin categorías y el mensaje explica por qué.
  useEffect(() => {
    listCategories()
      .then((list) => {
        setCategories(list);
        // Preseleccionar la primera evita un envío rechazado por el servidor
        // solo porque nadie tocó el selector.
        if (list[0]) setValue('categoryId', list[0].id);
      })
      .catch((error: Error) => setError('root', { message: error.message }));
  }, [setError, setValue]);

  const submit = async (data: NewTicket) => {
    try {
      const ticket = await createTicket(data);
      setCreatedId(ticket.id);
      reset({ subject: '', description: '', categoryId: data.categoryId, priority: 'MEDIA' });
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  // Acuse de recibo (F02): el solicitante se lleva el identificador del caso.
  if (createdId) {
    return (
      <View className="flex-1 justify-center gap-4 bg-neutral-50 p-6">
        <Text className="text-center text-xl font-bold text-neutral-900">Solicitud registrada</Text>
        <Text className="text-center text-neutral-500">
          Tu caso quedó con el número{'\n'}
          <Text className="font-semibold text-neutral-900">{createdId}</Text>
        </Text>
        <Button text="Ver el caso" onPress={() => router.replace(`/tickets/${createdId}`)} />
        <Button text="Reportar otra" onPress={() => setCreatedId(null)} secondary />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <Field
        control={control}
        name="subject"
        label="Asunto"
        placeholder="No hay internet en el laboratorio 3"
        rules={{
          required: 'El asunto es obligatorio',
          minLength: { value: 5, message: 'Describe el caso en al menos 5 caracteres' },
        }}
      />

      <Field
        control={control}
        name="description"
        label="¿Qué está pasando?"
        placeholder="Cuenta qué intentabas hacer, qué pasó y desde cuándo."
        multiline
        numberOfLines={5}
        // Sin esto el texto se centra verticalmente en Android.
        textAlignVertical="top"
        className="h-32"
        rules={{
          required: 'La descripción es obligatoria',
          minLength: { value: 10, message: 'Cuéntanos un poco más (mínimo 10 caracteres)' },
        }}
      />

      <Select
        control={control}
        name="categoryId"
        label="Categoría"
        options={categories.map((c) => ({ value: c.id, label: `${c.name} · ${c.slaHours}h` }))}
        empty="No se pudo cargar el catálogo de categorías."
      />
      <Select control={control} name="priority" label="Prioridad" options={PRIORITIES} />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting || categories.length === 0}
      />
    </ScrollView>
  );
}
