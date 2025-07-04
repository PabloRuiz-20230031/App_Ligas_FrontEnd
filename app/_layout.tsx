import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{ drawerLabel: 'Inicio' }}
      />
      <Drawer.Screen
        name="public/contacto"
        options={{ drawerLabel: 'Contacto' }}
      />
      <Drawer.Screen
        name="public/facebook"
        options={{ drawerLabel: 'Facebook' }}
      />
      <Drawer.Screen
        name="public/youtube"
        options={{ drawerLabel: 'YouTube' }}
      />
      <Drawer.Screen
        name="public/terminos"
        options={{ drawerLabel: 'Términos y Condiciones' }}
      />
      <Drawer.Screen
        name="public/politicas"
        options={{ drawerLabel: 'Políticas de Uso' }}
      />
      <Drawer.Screen
        name="public/ligas/index"
        options={{ drawerLabel: 'Ligas' }}
      />
      <Drawer.Screen
        name="auth/login"
        options={{ drawerLabel: 'Iniciar Sesión' }}
      />
      <Drawer.Screen
        name="auth/registro"
        options={{ drawerLabel: 'Registrarse' }}
      />
      <Drawer.Screen
        name="admin/crear-liga"
        options={{ drawerLabel: 'Crear Liga' }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          drawerLabel: 'Perfil',
          headerRight: () => (
            <Pressable onPress={() => router.push('/perfil')} style={{ marginRight: 15 }}>
              <Ionicons name="person-circle-outline" size={26} color="#000" />
            </Pressable>
          ),
        }}
      />
    </Drawer>
  );
}
