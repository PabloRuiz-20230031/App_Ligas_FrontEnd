import { Drawer } from 'expo-router/drawer';
import { ImageBackground } from 'react-native';
import { useAuth } from '../../context/useAuth';
import CustomDrawerContent from '../../components/CustomDrawerContent';

export const unstable_settings = {
  staticRoutes: true,
};

export default function DrawerLayout() {
  const { estaAutenticado } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitleAlign: 'left',
        drawerLabelStyle: { fontSize: 16 },
        headerBackground: () => (
          <ImageBackground
            source={require('@/assets/images/pasto.jpeg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ),
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="ligas" options={{ title: 'Ligas' }} />
      <Drawer.Screen name="contacto" options={{ title: 'Contacto' }} />
      <Drawer.Screen name="terminos" options={{ title: 'Términos y condiciones' }} />
      <Drawer.Screen name="politicas" options={{ title: 'Políticas de uso' }} />
      <Drawer.Screen name="facebook" options={{ title: 'Facebook' }} />
      <Drawer.Screen name="youtube" options={{ title: 'YouTube' }} />
      <Drawer.Screen name="recuperarContra" options={{ title: 'Recuperar Contraseña' }} />
      {!estaAutenticado && (
        <Drawer.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      )}
      {!estaAutenticado && (
        <Drawer.Screen name="registro" options={{ title: 'Registrarse' }} />
      )}
    </Drawer>
  );
}
