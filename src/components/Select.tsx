/**
 * Selector de una opción entre varias, en forma de botones.
 *
 * Se usa para estado, prioridad y categoría. Es la misma idea que `Field`,
 * pero en vez de un input de texto muestra una fila de opciones donde solo una
 * queda marcada. Evita depender de un componente desplegable externo.
 */

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

/**
 * Una opción es o bien un texto (se guarda y se muestra igual, cambiando "_"
 * por espacios) o bien un par: lo que se guarda y lo que se lee.
 *
 * Ese par es lo que permite elegir una categoría: se muestra "Red" y se
 * guarda su identificador, que es lo que el servidor espera.
 */
export type Option = string | { value: string; label: string };

const valueOf = (option: Option) => (typeof option === 'string' ? option : option.value);
const labelOf = (option: Option) =>
  typeof option === 'string' ? option.replace(/_/g, ' ') : option.label;

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: readonly Option[];
  /** Texto cuando no hay ninguna opción todavía (catálogo vacío o cargando). */
  empty?: string;
};

export default function Select<T extends FieldValues>({
  control,
  name,
  label,
  options,
  empty,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View className="gap-1.5">
          <Text className="font-semibold text-neutral-700">{label}</Text>
          {options.length === 0 && !!empty && <Text className="text-neutral-400">{empty}</Text>}
          {/* flex-wrap: si no caben en una línea, siguen en la siguiente. */}
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const optionValue = valueOf(option);
              const active = optionValue === value;
              return (
                <Pressable
                  key={optionValue}
                  onPress={() => onChange(optionValue)}
                  className={`rounded-full border px-4 py-2 active:opacity-70 ${
                    active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
                    {labelOf(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    />
  );
}
