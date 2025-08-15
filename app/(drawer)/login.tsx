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

      const { usuario, token, apiKey } = res.data;

      if (usuario.rol !== 'admin') {
        return Alert.alert(
          'Acceso restringido',
          'Solo los administradores tienen acceso a esta aplicación. Si usted es administrador, por favor contacte con otro administrador para que actualice su rol.'
        );
      }

      iniciarSesion(token, usuario, apiKey);
      Alert.alert('Bienvenido', `Hola, ${usuario.nombre}`);
      router.replace({ pathname: '/(admin)' });

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
        placeholderTextColor="#888"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#888"
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
    backgroundColor: '#f2f8ff',
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
    color: '#000',
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
    color: '#000',
    flex: 1,
    paddingVertical: 10,
  },
});

export const screenOptions = {
  title: 'Iniciar Sesión',
};
