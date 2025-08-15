import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/api'; // Ajusta la ruta si tu archivo api.ts está en otro lugar

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleRecuperar = async () => {
    if (!correo.trim()) {
      return Alert.alert('Error', 'Por favor ingresa tu correo');
    }

    try {
      setCargando(true);
      const res = await api.post('/usuarios/recuperar-contrasena', { correo });
      Alert.alert('Éxito', res.data.mensaje, [
        { text: 'OK', onPress: () => router.push('/login') },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || 'Error al enviar la solicitud';
      Alert.alert('Error', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Recuperar Contraseña</Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <TouchableOpacity
        style={[styles.boton, cargando && { opacity: 0.6 }]}
        onPress={handleRecuperar}
        disabled={cargando}
      >
        <Text style={styles.botonTexto}>{cargando ? 'Enviando...' : 'Enviar nueva contraseña'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f2f8ff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
