import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Alert, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import CustomDrawerContentAdmin from '@/components/CustomDrawerContentAdmin';

export default function Layout() {
  const router = useRouter();
  const { cerrarSesion, usuario } = useContext(AuthContext);

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
      drawerContent={(props) => <CustomDrawerContentAdmin {...props} />}
      screenOptions={{
        headerTitleAlign: 'left',
        drawerLabelStyle: {
          fontSize: 16,
        },
        headerBackground: () => (
          <ImageBackground
            source={require('@/assets/images/pasto.jpeg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ),
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <Pressable onPress={() => router.push('/perfil')} style={{ marginRight: 15 }}>
            {usuario?.foto ? (
              <Image
                source={{ uri: usuario.foto }}
                onError={() => console.log('❌ Error cargando imagen del perfil')}
                style={{ width: 30, height: 30, borderRadius: 15 }}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={26} color="#fff" />
            )}
          </Pressable>
        ),
      }}
    >
      {/* Ítems visibles */}
      <Drawer.Screen name="index" options={{ title: 'Panel Admin' }} />
      <Drawer.Screen name="ligas/index" options={{ title: 'Registrar Liga' }} />
      <Drawer.Screen name="categorias/index" options={{ title: 'Registrar Categoría' }} />
      <Drawer.Screen name="equipos/index" options={{ title: 'Registrar Equipo' }} />
      <Drawer.Screen name="jugadores/index" options={{ title: 'Registrar Jugadores' }} />
      <Drawer.Screen name="temporadas/index" options={{ title: 'Registrar Temporada' }} />
      <Drawer.Screen name="cedulas/index" options={{ title: 'Registrar Cedula' }} />
      <Drawer.Screen name="redes/index" options={{ title: 'Registrar Redes' }} />
      <Drawer.Screen name="informacion/index" options={{ title: 'Registrar información' }} />
      <Drawer.Screen name="roles/index" options={{ title: 'Cambiar rol' }} />
      <Drawer.Screen
        name="cerrarSesion"
        options={{
          drawerLabel: 'Cerrar sesión',
          drawerItemStyle: { marginTop: 'auto' },
          drawerLabelStyle: { color: 'red' },
          headerShown: false,
        }}
      />

      {/* Ítems ocultos */}
      <Drawer.Screen name="ligas/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de ligas' }} />
      <Drawer.Screen name="categorias/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de categorías' }} />
      <Drawer.Screen name="equipos/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de equipos' }} />
      <Drawer.Screen name="jugadores/formulario" options={{ drawerItemStyle: { display: 'none' }, title: 'Formulario de jugadores' }} />
      <Drawer.Screen name="temporadas/formulario" options={{ drawerItemStyle: { display: 'none' }, title:'Formulario de temporadas' }} />
      <Drawer.Screen name="temporadas/detalle" options={{ drawerItemStyle: { display: 'none' }, title:'Detalles de temporadas' }} />
      <Drawer.Screen name="cedulas/formulario" options={{ drawerItemStyle: { display: 'none' }, title:'Registro de Cédula arbitral' }} />
      <Drawer.Screen name="cedulas/jornadas" options={{ drawerItemStyle: { display: 'none' }, title:'Selección de equipos' }} />
      <Drawer.Screen name="temporadas/[partidoId]" options={{ drawerItemStyle: { display: 'none' }, title:'Detalle del partido' }} />
      <Drawer.Screen name="informacion/formularioContacto" options={{ drawerItemStyle: { display: 'none' }, title:'Formulario de Contacto' }} />
      <Drawer.Screen name="informacion/formularioPoliticas" options={{ drawerItemStyle: { display: 'none' }, title:'Formulario de Políticas' }} />
      <Drawer.Screen name="informacion/formularioTerminos" options={{ drawerItemStyle: { display: 'none' }, title:'Formulario de Términos' }} />
      <Drawer.Screen name="perfil" options={{ drawerItemStyle: { display: 'none' }, title:'Perfil' }} />
    </Drawer>
  );
}
