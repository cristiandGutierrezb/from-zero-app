/**
 * Una categoría en detalle: editarla, desactivarla o eliminarla (F04).
 *
 * Desactivar y eliminar NO son lo mismo, y esa diferencia es del negocio: una
 * categoría inactiva deja de ofrecerse para casos nuevos pero sigue
 * clasificando los viejos; eliminarla solo es posible si ningún ticket la usa,
 * porque el historial es inmutable (R08). Quién puede y cuándo lo decide el
 * servidor: la app manda la petición y muestra lo que responda.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Button from '../../src/components/Button';
import Field from '../../src/components/Field';
import Select from '../../src/components/Select';
import { deleteCategory, getCategory, updateCategory } from '../../src/modules/categories/api';
import type { Category, CategoryChanges } from '../../src/modules/categories/types';

/**
 * Los campos editables. `slaHours` y `active` son texto porque eso es lo que
 * manejan `Field` y `Select`; se convierten al enviar.
 */
type EditForm = { name: string; description: string; slaHours: string; active: string };

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Activa' },
  { value: 'false', label: 'Inactiva' },
];

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { control, handleSubmit, setError, reset, formState } = useForm<EditForm>();

  useEffect(() => {
    getCategory(id)
      .then((found) => {
        setCategory(found);
        // `reset` rellena el formulario con lo que hay hoy en el servidor y fija
        // el punto de comparación: lo que el usuario toque queda «sucio».
        reset({
          name: found.name,
          description: found.description,
          slaHours: String(found.slaHours),
          active: String(found.active),
        });
      })
      .catch((failure: Error) => setLoadError(failure.message));
  }, [id, reset]);

  const submit = async (data: EditForm) => {
    // Solo viaja lo que el usuario cambió: un PATCH con todo reescribiría
    // campos que nadie tocó.
    const { dirtyFields } = formState;
    const changes: CategoryChanges = {
      ...(dirtyFields.name ? { name: data.name } : {}),
      ...(dirtyFields.description ? { description: data.description } : {}),
      ...(dirtyFields.slaHours ? { slaHours: Number(data.slaHours) } : {}),
      ...(dirtyFields.active ? { active: data.active === 'true' } : {}),
    };
    if (Object.keys(changes).length === 0) return void router.back();

    try {
      setCategory(await updateCategory(id, changes));
      reset(data);
      router.back();
    } catch (failure) {
      // 409 si el nombre ya es de otra categoría; 403 si la sesión no coordina.
      setError('root', { message: (failure as Error).message });
    }
  };

  const remove = async () => {
    try {
      await deleteCategory(id);
      router.back();
    } catch (failure) {
      // 409 con el número de tickets que la usan: el servidor dice que la
      // desactive en lugar de borrarla, y ese mensaje es el que se muestra.
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

  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <View className="gap-2 rounded-2xl bg-white p-4">
        <Text className="text-xl font-bold text-neutral-900">{category.name}</Text>
        <Text className="text-xs text-neutral-400">Categoría {category.id}</Text>
      </View>

      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="sentences"
        rules={{
          required: 'El nombre es obligatorio',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
        }}
      />
      <Field
        control={control}
        name="description"
        label="Descripción"
        autoCapitalize="sentences"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="h-24"
      />
      <Field
        control={control}
        name="slaHours"
        label="Horas de compromiso (SLA)"
        keyboardType="number-pad"
        rules={{
          required: 'El compromiso de atención es obligatorio',
          pattern: { value: /^\d+$/, message: 'Escribe un número entero de horas' },
        }}
      />
      <Select
        control={control}
        name="active"
        label="Disponibilidad"
        options={ACTIVE_OPTIONS}
      />
      <Text className="-mt-3 text-xs text-neutral-400">
        Una categoría inactiva no se ofrece para casos nuevos, pero conserva los que ya clasificó.
      </Text>

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

      {/* Dos toques en vez de un diálogo del sistema: `Alert` no se comporta
          igual en web, y esto funciona en las tres plataformas. */}
      <Button
        text={confirming ? 'Tocar de nuevo para eliminar' : 'Eliminar categoría'}
        onPress={() => (confirming ? void remove() : setConfirming(true))}
        secondary
        className={confirming ? 'border-red-500' : ''}
      />
    </ScrollView>
  );
}
