import { useForm } from 'react-hook-form';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useSession } from '../../../modules/auth/session';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; password: string };

const useLogin = () => {
  const { signIn } = useSession();
  const headerHeight = useHeaderHeight();

  // `control` conecta los campos, `handleSubmit` valida antes de enviar y
  // `formState` trae los errores y si se está enviando en este momento.
  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const submit = async ({ email, password }: LoginForm) => {
    try {
      await signIn(email, password);
      // No hay que navegar: al cambiar la sesión, el layout raíz muestra las
      // pantallas privadas automáticamente.
    } catch (error) {
      // `root` es el error del formulario completo (credenciales malas, servidor
      // caído...), a diferencia del error de un campo concreto.
      setError('root', { message: (error as Error).message });
    }
  };

  return {
    headerHeight,
    control,
    handleSubmit,
    formState,
    submit
  }
}

export default useLogin