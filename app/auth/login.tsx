import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const { iniciarSesion } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      return Alert.alert('Completa todos los campos');
    }

    try {
      const res = await axios.post('http://localhost:3000/api/usuarios/login', {
        correo,
        contraseña,
      });

      iniciarSesion(res.data.token, res.data.usuario);
      Alert.alert('Bienvenido', `Hola, ${res.data.usuario.nombre}`);
      router.replace('./(tabs)/index'); // Redirige a Inicio

    } catch (error: any) {
      console.error(error);
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Correo"
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

      <Button title="Entrar" onPress={handleLogin} />
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
  title: 'Iniciar Sesión',
};
