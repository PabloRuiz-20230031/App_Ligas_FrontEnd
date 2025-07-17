// app/public/youtube.tsx
import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { obtenerRedesSociales } from '../../services/redesService';

const YouTubeScreen = () => {
  useEffect(() => {
    const abrirYouTube = async () => {
      const redes = await obtenerRedesSociales();
      const youtube = redes.find((r: any) => r.plataforma === 'youtube');

      if (youtube?.url) {
        Linking.openURL(youtube.url);
      } else {
        Alert.alert('No se encontró el enlace de YouTube.');
      }
    };

    abrirYouTube();
  }, []);

  return null;
};

export default YouTubeScreen;

export const screenOptions = {
  title: 'YouTube',
};
