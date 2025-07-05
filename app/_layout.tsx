import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  const router = useRouter();

  return (
    <AuthProvider>
      <Drawer>
        <Drawer.Screen name="index" options={{ drawerLabel: 'Inicio' }} />
        <Drawer.Screen name="public/ligas/index" options={{ drawerLabel: 'Ligas' }} />
      </Drawer>
    </AuthProvider>
  );
}

