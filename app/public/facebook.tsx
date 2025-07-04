// app/public/facebook.tsx
import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { obtenerRedesSociales } from '../../services/redesService';

const FacebookScreen = () => {
  useEffect(() => {
    const abrirFacebook = async () => {
      const redes = await obtenerRedesSociales();
      const facebook = redes.find((r: any) => r.plataforma === 'facebook');

      if (facebook?.url) {
        Linking.openURL(facebook.url);
      } else {
        Alert.alert('No se encontró el enlace de Facebook.');
      }
    };

    abrirFacebook();
  }, []);

  return null;
};

export default FacebookScreen;

export const screenOptions = {
  title: 'Facebook',
};
