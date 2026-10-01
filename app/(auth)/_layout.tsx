import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="login"
        options={{
          drawerLabel: 'Login',
          title: 'Iniciar sesión',
        }}
      />
      <Drawer.Screen
        name="register"
        options={{
          drawerLabel: 'Register',
          title: 'Crear cuenta',
        }}
      />
    </Drawer>
  );
}