import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function Layout() {
  const router = useRouter();
  const { cerrarSesion } = useContext(AuthContext); // Asegúrate que tienes esta función

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, salir',
          onPress: () => {
            cerrarSesion(); // 👈 Tu lógica para cerrar sesión (eliminar token, etc)
            router.replace('/'); // 👈 Te redirige al inicio público
          }
        }
      ]
    );
  };

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
      {/* ✅ Ítems visibles en el menú */}
      <Drawer.Screen name="index" options={{ title: 'Panel Admin' }} />
      <Drawer.Screen name="ligas/index" options={{ title: 'Registrar Liga' }} />
      <Drawer.Screen name="categorias/index" options={{ title: 'Registrar Categoría' }} />
      <Drawer.Screen name="equipos/index" options={{ title: 'Registrar Equipo' }} />
      <Drawer.Screen name="cerrarSesion" options={{ drawerLabel: 'Cerrar sesión', drawerItemStyle: { marginTop: 'auto' }, // lo manda al fondo del menú
      headerShown: false,}}
/>

     

      {/* ❌ Ocultos en el Drawer */}
      <Drawer.Screen name="ligas/formulario" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="categorias/formulario" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="equipos/formulario" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
