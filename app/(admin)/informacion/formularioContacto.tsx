import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function FormularioContacto() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  const guardar = async () => {
    try {
      await api.put('/info/contacto', { nombre, correo }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Contacto guardado correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error al guardar el contacto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Agregar Contacto</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <Button title="Guardar" onPress={guardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
});