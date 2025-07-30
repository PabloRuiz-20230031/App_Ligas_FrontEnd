import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext';

export default function CerrarSesion() {
  const { cerrarSesion } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => router.back(), // vuelve al drawer
        },
        {
          text: 'Sí, salir',
          style: 'destructive',
          onPress: () => {
            cerrarSesion();
            router.replace('/(drawer)'); // redirige a index público
          },
        },
      ]
    );
  }, []);

  return null;
}