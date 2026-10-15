import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import Button from '../Button';
import Field from '../Field';
import useLogin from './hooks/useLogin';

const LoginScreen = () => {

  const { headerHeight, control, handleSubmit, formState, submit } = useLogin()

  return (
    // Igual que en el registro: el offset descuenta el header del Drawer.
    <KeyboardAvoidingView
      className="flex-1 justify-center gap-5 bg-neutral-50 p-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}>
      <View className="gap-1">
        <Text className="text-2xl font-bold text-neutral-900">Mesa de ayuda</Text>
        <Text className="text-neutral-500">Entra con tu cuenta institucional</Text>
      </View>

      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        placeholder="nombre@autonoma.edu.co"
        rules={{
          required: 'El correo es obligatorio',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
        }}
      />
      <Field
        control={control}
        name="password"
        label="Contraseña"
        secureTextEntry
        placeholder="••••••••"
        rules={{ required: 'La contraseña es obligatoria' }}
      />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />

      <Link href="/register" className="text-center text-blue-600">
        ¿No tienes cuenta? Regístrate
      </Link>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen