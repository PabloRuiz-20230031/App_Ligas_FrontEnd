import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CLOUD_NAME = 'dkxz5wm2h';
const UPLOAD_PRESET = 'liga_upload';

export default function PerfilAdmin() {
  const { token, actualizarUsuario } = useContext(AuthContext);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [foto, setFoto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNombre(res.data.nombre);
        setCorreo(res.data.correo);
        setFoto(res.data.foto || '');
      } catch (error) {
        Alert.alert('Error al cargar el perfil');
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, []);

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const data = new FormData();
      data.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'perfil.jpg',
      } as any);
      data.append('upload_preset', UPLOAD_PRESET);

      try {
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: data,
        });

        const cloudData = await cloudRes.json();
        setFoto(cloudData.secure_url);
      } catch (error) {
        Alert.alert('Error al subir imagen');
      }
    }
  };

  const guardarCambios = async () => {
    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim().toLowerCase(); // también conviene forzar a minúsculas

    if (!nombreLimpio || !correoLimpio) {
        Alert.alert('Nombre y correo son obligatorios');
        return;
    }

    if (nuevaContraseña && nuevaContraseña.length < 6) {
        Alert.alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        await api.put('/usuarios/perfil', {
        nombre: nombreLimpio,
        correo: correoLimpio,
        contraseña: nuevaContraseña || undefined,
        foto,
        }, {
        headers: { Authorization: `Bearer ${token}` },
        });

        Alert.alert('Perfil actualizado correctamente');
        await actualizarUsuario();
        router.replace('/(admin)');
        setNuevaContraseña('');
    } catch (error) {
        Alert.alert('Error al actualizar perfil');
    }
    };

  if (cargando) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Perfil del Administrador</Text>

      <TouchableOpacity onPress={seleccionarImagen}>
        <Image
          source={{ uri: foto || 'https://res.cloudinary.com/dkxz5wm2h/image/upload/v1755208069/x4crphwybochload8etr.png' }}
          style={styles.foto}
        />
        <Text style={styles.cambiarFoto}>Cambiar Foto</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#888"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />
        <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Nueva Constraseña (opcional)"
          placeholderTextColor="#888"
          style={styles.passwordInput}
          value={nuevaContraseña}
          onChangeText={setNuevaContraseña}
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

      <Button title="Guardar Cambios" onPress={guardarCambios} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f8ff'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
  },
  cambiarFoto: {
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
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
    color: '#000',
    flex: 1,
    paddingVertical: 10,
  },
});
