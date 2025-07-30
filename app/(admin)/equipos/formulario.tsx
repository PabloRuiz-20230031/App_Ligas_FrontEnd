import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator,
  TouchableOpacity, Image, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../../context/AuthContext';
import api from '@/api';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CLOUD_NAME = 'dprwy1viz';
const UPLOAD_PRESET = 'liga_upload';


export default function EquipoFormulario() {
  const router = useRouter();
  const { usuario } = useContext(AuthContext);

  const params = useLocalSearchParams();
  const equipoId = Array.isArray(params.equipoId) ? params.equipoId[0] : params.equipoId;
  const categoriaId = Array.isArray(params.categoriaId) ? params.categoriaId[0] : params.categoriaId;
  const modo = Array.isArray(params.modo) ? params.modo[0] : params.modo;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [imagenUri, setImagenUri] = useState<ImagePickerAsset | null>(null);
  const [imagenCloudinary, setImagenCloudinary] = useState('');
  const [cargando, setCargando] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (modo === 'crear') {
      setNombre('');
      setDescripcion('');
      setFechaCreacion(new Date());
      setImagenUri(null);
      setImagenCloudinary('');
    }
  }, [modo])
)

useEffect(() => {
  if (modo === 'editar' && equipoId) {
    obtenerEquipo();
  }
}, [modo, equipoId]);
  useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            router.replace('/(admin)/equipos');
            return true;
          };

          const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

          return () => subscription.remove();
        }, [])
      );

const obtenerEquipo = async () => {
  try {
    const res = await api.get('/equipos');
    const equipo = res.data.find((e: any) => e._id === equipoId);

    if (!equipo) return Alert.alert('Equipo no encontrado');

    setNombre(equipo.nombre);
    setDescripcion(equipo.descripcion || '');
    setFechaCreacion(equipo.fechaCreacion ? new Date(equipo.fechaCreacion) : new Date());
    setImagenCloudinary(equipo.imagen || '');
  } catch (error) {
    console.error('Error al obtener equipo', error);
    Alert.alert('Error al cargar el equipo');
  }
};



  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImagenUri(result.assets[0]);
    }
  };

  const subirImagen = async () => {
    if (!imagenUri?.uri) return null;

    const uri = imagenUri.uri;
    const extension = uri.split('.').pop() || 'jpg';
    const type = `image/${extension}`;

    const formData = new FormData();
    formData.append('file', {
      uri,
      type,
      name: `equipo_${Date.now()}.${extension}`,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'app/equipos');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await res.json();
    return data.secure_url;
  };

  const manejarEnvio = async () => {
  if (!nombre || !descripcion || !categoriaId) {
    return Alert.alert('Faltan campos obligatorios');
  }

  try {
    setCargando(true);

    let urlImagen = imagenCloudinary;
    if (imagenUri) {
      urlImagen = await subirImagen();
    }

    const datos = {
      nombre,
      descripcion,
      fechaCreacion,
      imagen: urlImagen,
      categoria: categoriaId,
    };

    if (modo === 'editar' && equipoId) {
      await api.put(`/equipos/${equipoId}`, datos);
      Alert.alert('Equipo actualizado');
    } else {
      await api.post('/equipos', datos);
      Alert.alert('Equipo registrado');
    }

    router.replace('/(admin)/equipos');
  } catch (error) {
    console.error('❌ Error:', error);
    Alert.alert('Error', 'No se pudo guardar el equipo');
  } finally {
    setCargando(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{modo === 'editar' ? 'Editar Equipo' : 'Registrar Equipo'}</Text>
      <TextInput
        placeholder="Nombre del equipo"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Descripción del equipo"
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <TouchableOpacity
        style={styles.fechaBtn}
        onPress={() => setMostrarFecha(true)}
      >
        <Text style={styles.fechaTexto}>Fecha de creación: {fechaCreacion.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {mostrarFecha && (
        <DateTimePicker
          value={fechaCreacion}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setMostrarFecha(false);
            if (date) setFechaCreacion(date);
          }}
        />
      )}

      <TouchableOpacity onPress={seleccionarImagen} style={styles.botonImagen}>
        <Text style={styles.botonTexto}>
          {imagenUri || imagenCloudinary ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
        </Text>
      </TouchableOpacity>

      {(imagenUri || imagenCloudinary) && (
        <Image
          source={{ uri: imagenUri?.uri || imagenCloudinary }}
          style={styles.preview}
        />
      )}

      {cargando ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <Button title="Guardar Equipo" onPress={manejarEnvio} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E90FF', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15 },
  botonImagen: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  botonTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  fechaBtn: { marginBottom: 15 },
  fechaTexto: { color: '#1E90FF', fontWeight: 'bold' },
});
