import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';

export default function RedesSocialesAdmin() {
  const { token } = useContext(AuthContext);

  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

 type RedSocial = {
    plataforma: 'facebook' | 'youtube';
    url: string;
    };

    useEffect(() => {
    const fetchRedes = async () => {
        try {
        const res = await api.get('/redes-sociales', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const redes: RedSocial[] = res.data;

        const facebook = redes.find((r: RedSocial) => r.plataforma === 'facebook');
        const youtube = redes.find((r: RedSocial) => r.plataforma === 'youtube');

        if (facebook) setFacebookUrl(facebook.url);
        if (youtube) setYoutubeUrl(youtube.url);
        } catch (error) {
        console.error('Error al cargar redes sociales', error);
        }
    };
    fetchRedes();
    }, []);

    const actualizarUrl = async (plataforma: 'facebook' | 'youtube', url: string): Promise<void> => {
    try {
        await api.put(`/redes-sociales/${plataforma}`, { url }, {
        headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Éxito', `URL de ${plataforma} actualizada`);
    } catch (error) {
        Alert.alert('Error', `No se pudo actualizar ${plataforma}`);
    }
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Redes Sociales</Text>

      <Text style={styles.label}>Facebook:</Text>
      <TextInput
        style={styles.input}
        value={facebookUrl}
        onChangeText={setFacebookUrl}
        placeholder="URL de Facebook"
      />
      <Button title="Actualizar Facebook" onPress={() => actualizarUrl('facebook', facebookUrl)} />

      <Text style={styles.label}>YouTube:</Text>
      <TextInput
        style={styles.input}
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        placeholder="URL de YouTube"
      />
      <Button title="Actualizar YouTube" onPress={() => actualizarUrl('youtube', youtubeUrl)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
