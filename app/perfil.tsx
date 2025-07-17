import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/useAuth';
import { View, Alert } from 'react-native';

export default function PerfilScreen() {
  const { estaAutenticado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!estaAutenticado) {
      Alert.alert(
        '¡Atención!',
        'Aún no tienes cuenta, ¿Quieres ir a registrarte? ⚽',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => router.replace('/'),
          },
          {
            text: 'Ir a registrarse',
            onPress: () => router.replace('/(drawer)/registro'),
          },
        ],
        { cancelable: false }
      );
    }
  }, [estaAutenticado]);

  if (!estaAutenticado) return null;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* 👇 Aquí puedes mostrar los datos dinámicos del usuario autenticado */}
    </View>
  );
}
