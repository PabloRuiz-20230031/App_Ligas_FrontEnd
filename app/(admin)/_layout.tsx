import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function Layout() {
  const router = useRouter();
  const { cerrarSesion } = useContext(AuthContext);

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, salir',
          onPress: () => {
            cerrarSesion();
            router.replace('/');
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
      {/* ✅ Ítems visibles */}
      <Drawer.Screen name="index" options={{ title: 'Panel Admin' }} />
      <Drawer.Screen name="ligas/index" options={{ title: 'Registrar Liga' }} />
      <Drawer.Screen name="categorias/index" options={{ title: 'Registrar Categoría' }} />
      <Drawer.Screen name="equipos/index" options={{ title: 'Registrar Equipo' }} />
      <Drawer.Screen name="jugadores/index" options={{ title: 'Registrar Jugadores' }} />
      <Drawer.Screen name="temporadas/index" options={{ title: 'Registrar Temporada' }} />
      <Drawer.Screen name="cedulas/index" options={{ title: 'Registrar Cedula' }} />
      <Drawer.Screen name="redes/index" options={{ title: 'Registrar Redes' }} />
      <Drawer.Screen name="informacion/index" options={{ title: 'Registrar infromacion' }} />
      <Drawer.Screen
        name="cerrarSesion"
        options={{
          drawerLabel: 'Cerrar sesión',
          drawerItemStyle: { marginTop: 'auto' },
          headerShown: false,
        }}
      />

      {/* ❌ Ítems ocultos del menú */}
      <Drawer.Screen name="ligas/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de ligas' }} />
      <Drawer.Screen name="categorias/formulario" options={{ drawerItemStyle: { display: 'none' } , title: 'Formulario de categorias' }} />
      <Drawer.Screen name="equipos/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de equipos' }} />
      <Drawer.Screen name="jugadores/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de jugadores' }} />
      <Drawer.Screen name="temporadas/formulario" options={{ drawerItemStyle: { display: 'none' }, title:'Formulario de temporadas' }} />
      <Drawer.Screen name="temporadas/detalle" options={{ drawerItemStyle: { display: 'none' }, title:'Detalles de temporadas' }} />
      <Drawer.Screen name="cedulas/formulario" options={{ drawerItemStyle: { display: 'none' }, title:'Registro de Cedula arbrital' }} />
      <Drawer.Screen name="cedulas/jornadas" options={{ drawerItemStyle: { display: 'none' }, title:'Seleccion de equipos' }} />
      <Drawer.Screen name="temporadas/[partidoId]" options={{ drawerItemStyle: { display: 'none' }, title:'Detalle del partido' }} />
    </Drawer>
  );
}
