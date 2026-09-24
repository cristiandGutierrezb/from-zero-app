/**
 * Alta de una categoría del catálogo (F04).
 *
 * Nace activa: desactivarla es una decisión posterior y se hace desde el
 * detalle. Por eso aquí no hay interruptor que llenar sin necesidad.
 */

import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, Text } from 'react-native';
import Button from '../../src/components/Button';
import Field from '../../src/components/Field';
import { createCategory } from '../../src/modules/categories/api';

/**
 * Lo que captura el formulario. `slaHours` es texto porque eso es lo que
 * entrega un campo de texto; se convierte a número al enviar.
 */
type CategoryForm = { name: string; description: string; slaHours: string };

export default function NewCategoryScreen() {
  const { control, handleSubmit, setError, formState } = useForm<CategoryForm>({
    defaultValues: { name: '', description: '', slaHours: '24' },
  });

  const submit = async (data: CategoryForm) => {
    try {
      const category = await createCategory({
        name: data.name,
        description: data.description,
        slaHours: Number(data.slaHours),
      });
      // `replace` y no `push`: al volver atrás no tiene sentido caer otra vez
      // en el formulario de creación de algo que ya se creó.
      router.replace(`/categories/${category.id}`);
    } catch (error) {
      // Aquí cae el 409 de nombre repetido, que es una regla del servidor.
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <Field
        control={control}
        name="name"
        label="Nombre"
        autoCapitalize="sentences"
        placeholder="Red"
        rules={{
          required: 'El nombre es obligatorio',
          // 3 caracteres es lo que exige el backend: pedir menos aquí haría que
          // el servidor rechazara el envío sin que el usuario supiera por qué.
          minLength: { value: 3, message: 'Mínimo 3 caracteres' },
        }}
      />

      <Field
        control={control}
        name="description"
        label="Descripción"
        autoCapitalize="sentences"
        placeholder="Conectividad cableada e inalámbrica"
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
        placeholder="24"
        rules={{
          required: 'El compromiso de atención es obligatorio',
          // Solo se valida el FORMATO, que es lo que este campo puede saber.
          // Cuál es un compromiso aceptable lo decide el servidor, y su mensaje
          // es el que se muestra si lo rechaza.
          pattern: { value: /^\d+$/, message: 'Escribe un número entero de horas' },
        }}
      />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Creando…' : 'Crear categoría'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />
    </ScrollView>
  );
}
