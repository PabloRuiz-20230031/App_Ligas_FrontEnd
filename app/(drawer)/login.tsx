import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '@/api';
import { Ionicons } from '@expo/vector-icons'; // 👈 Íconos

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false); // 👈 Estado para mostrar u ocultar
  const { iniciarSesion } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      return Alert.alert('Completa todos los campos');
    }

    try {
      const res = await api.post('/usuarios/login', { correo, contraseña });

      iniciarSesion(res.data.token, res.data.usuario, res.data.apiKey);
      Alert.alert('Bienvenido', `Hola, ${res.data.usuario.nombre}`);

      if (res.data.usuario.rol === 'admin') {
        router.replace({ pathname: '/(admin)' });
      } else {
        router.replace({ pathname: '/(drawer)' });
      }

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

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          style={styles.passwordInput}
          value={contraseña}
          onChangeText={setContraseña}
          secureTextEntry={!mostrarContraseña}
        />
        <TouchableOpacity onPress={() => setMostrarContraseña(!mostrarContraseña)}>
          <Ionicons
            name={mostrarContraseña ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

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
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
});

export const screenOptions = {
  title: 'Iniciar Sesión',
};
