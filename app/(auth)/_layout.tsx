import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="login"
        options={{
          drawerLabel: 'Login',
          title: 'overview',
        }}
      />
      <Drawer.Screen
        name="register"
        options={{
          drawerLabel: 'Register',
          title: 'overview',
        }}
      />
    </Drawer>
  );
}