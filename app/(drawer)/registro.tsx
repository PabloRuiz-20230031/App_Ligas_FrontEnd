import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import api from '@/api';
import { Ionicons } from '@expo/vector-icons'; 

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña, ] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

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
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#aaa',
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 15,
      },
      toggleText: {
      marginLeft: 10,
      fontSize: 18,
      },
      passwordInput: {
      flex: 1,
      paddingVertical: 10,
    },
});

export const screenOptions = {
  title: 'Crear Cuenta',
};
