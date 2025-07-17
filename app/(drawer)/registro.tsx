import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '@/api';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleRegistro = async () => {
    if (!nombre || !correo || !contraseña) {
      return Alert.alert('Faltan datos', 'Completa todos los campos.');
    }

    try {
      const res = await api.post('/usuarios/register', {
        nombre,
        correo,
        contraseña,
      });

      Alert.alert('Éxito', res.data.mensaje || 'Usuario registrado');
    } catch (error: any) {
      console.error(error);
      const mensaje = error.response?.data?.mensaje || 'Error al registrar';
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>

      <TextInput
        placeholder="Nombre completo"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={contraseña}
        onChangeText={setContraseña}
        secureTextEntry
      />

      <Button title="Registrarse" onPress={handleRegistro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E90FF',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});

export const screenOptions = {
  title: 'Crear Cuenta',
};
