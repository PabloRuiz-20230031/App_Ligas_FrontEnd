import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/useAuth';

export const unstable_settings = {
  staticRoutes: true,
};

export default function DrawerLayout() {
  const router = useRouter();
  const { estaAutenticado } = useAuth();

  return (
    <Drawer
      screenOptions={{
        headerTitleAlign: 'left',
        drawerLabelStyle: {
          fontSize: 16,
        },
        headerRight: () => (
          <Pressable onPress={() => router.push('/perfil')} style={{ marginRight: 15 }}>
            <Ionicons name="person-circle-outline" size={26} color="#000" />
          </Pressable>
        ),
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="ligas" options={{ title: 'Ligas' }} />
      <Drawer.Screen name="contacto" options={{ title: 'Contacto' }} />
      <Drawer.Screen name="terminos" options={{ title: 'Términos y condiciones' }} />
      <Drawer.Screen name="politicas" options={{ title: 'Políticas de uso' }} />
      <Drawer.Screen name="facebook" options={{ title: 'Facebook' }} />
      <Drawer.Screen name="youtube" options={{ title: 'YouTube' }} />

      {!estaAutenticado && (
        <Drawer.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      )}
      {!estaAutenticado && (
        <Drawer.Screen name="registro" options={{ title: 'Registrarse' }} />
      )}
    </Drawer>
  );
}
