import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  TouchableOpacity, Alert, Platform, ActivityIndicator, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import api from '@/api';

const CLOUD_NAME = 'dprwy1viz';
const UPLOAD_PRESET = 'liga_upload';

export default function LigaFormulario() {
  const { usuario } = useContext(AuthContext);
  const router = useRouter();
  const params = useLocalSearchParams();

  const ligaId = Array.isArray(params.ligaId) ? params.ligaId[0] : params.ligaId;
  const modo = Array.isArray(params.modo) ? params.modo[0] : params.modo;
  const viewKey = Array.isArray(params.key) ? params.key[0] : params.key || 'formulario';

  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [descripcion, setDescripcion] = useState('');
  const [imagenCloudinary, setImagenCloudinary] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  useEffect(() => {
    console.log('👤 Usuario desde AuthContext:', usuario);
  }, []);

  useEffect(() => {
    if (modo === 'editar' && ligaId) {
      obtenerLiga();
    }
  }, [modo, ligaId]);

  useFocusEffect(
    useCallback(() => {
      if (modo === 'crear') {
        console.log('🧹 useFocusEffect: Reiniciando campos');
        setNombre('');
        setDescripcion('');
        setFechaInicio(new Date());
        setFechaFin(new Date());
        setImagenCloudinary('');
        setCreatedAt('');
      }
    }, [modo])
  );
  useFocusEffect(
            React.useCallback(() => {
              const onBackPress = () => {
                router.replace('/(admin)/ligas');
                return true;
              };
    
              const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
              return () => subscription.remove();
            }, [])
          );

  const obtenerLiga = async () => {
    try {
      setCargando(true);
      const res = await api.get('/ligas');
      const liga = res.data.find((l: any) => l._id === ligaId);
      if (!liga) return Alert.alert('Liga no encontrada');

      setNombre(liga.nombre || '');
      setDescripcion(liga.descripcion || '');
      setFechaInicio(new Date(liga.fechaInicio));
      setFechaFin(new Date(liga.fechaFin));
      setImagenCloudinary(liga.imagen || '');
      setCreatedAt(liga.createdAt || '');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar la liga');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarImagenYSubir = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 1,
      });

      if (resultado.canceled || resultado.assets.length === 0) return;

      const asset = resultado.assets[0];
      const base64Img = `data:${asset.mimeType};base64,${asset.base64}`;

      const data = {
        file: base64Img,
        upload_preset: UPLOAD_PRESET,
        folder: 'app/ligas',
      };

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const file = await res.json();

      if (file.secure_url) {
        setImagenCloudinary(file.secure_url);
      } else {
        Alert.alert('Error', 'No se recibió la URL de la imagen');
      }
    } catch (error) {
      console.error('❌ Error al subir imagen base64:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  const manejarEnvio = async () => {
    if (!nombre || !fechaInicio || !fechaFin || !imagenCloudinary) {
      return Alert.alert('Completa todos los campos, incluida la imagen');
    }

    if (!usuario || !usuario._id) {
      return Alert.alert('Error', 'No se ha encontrado el usuario autenticado');
    }

    try {
      setCargando(true);

      const datos = {
        nombre,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        imagen: imagenCloudinary,
        descripcion,
        creador: usuario._id,
      };

      if (modo === 'editar') {
        await api.put(`/ligas/${ligaId}`, datos);
        Alert.alert('Actualizado', 'Liga actualizada correctamente');
        router.replace({ pathname: '/(admin)/ligas' });
      } else {
        const res = await api.post('/ligas', datos);
        if (res.status === 201) {
          Alert.alert('Creado', 'Liga registrada correctamente');
          router.replace({ pathname: '/(admin)/ligas' });
        } else {
          Alert.alert('Error', res.data?.mensaje || 'No se pudo registrar la liga');
        }
      }
    } catch (error: any) {
      console.log('❌ Error completo:', error);
      const mensaje = error?.response?.data?.mensaje || 'Error al guardar liga';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  if (usuario?.rol !== 'admin') return null;

  return (
    <View key={viewKey} style={styles.container}>
      <Text style={styles.title}>{modo === 'editar' ? 'Editar Liga' : 'Registrar Nueva Liga'}</Text>

      <TextInput
        placeholder="Nombre de la liga"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Descripción"
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <TouchableOpacity onPress={() => setMostrarInicio(true)} style={styles.fechaBtn}>
        <Text style={styles.fechaTexto}>Fecha de inicio: {fechaInicio.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarInicio && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, date?: Date) => {
            setMostrarInicio(false);
            if (date) setFechaInicio(date);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setMostrarFin(true)} style={styles.fechaBtn}>
        <Text style={styles.fechaTexto}>Fecha de fin: {fechaFin.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarFin && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, date?: Date) => {
            setMostrarFin(false);
            if (date) setFechaFin(date);
          }}
        />
      )}

      <TouchableOpacity onPress={seleccionarImagenYSubir} style={styles.fechaBtn}>
        <Text style={styles.fechaTexto}>
          {imagenCloudinary ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
        </Text>
      </TouchableOpacity>

      {imagenCloudinary && (
        <Image
          source={{ uri: imagenCloudinary }}
          style={{ width: '100%', height: 200, marginBottom: 15, borderRadius: 10 }}
        />
      )}

      {modo === 'editar' && createdAt && (
        <Text style={styles.createdAt}>
          Creada el: {new Date(createdAt).toLocaleDateString()}
        </Text>
      )}

      {cargando ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <Button title="Guardar Liga" onPress={manejarEnvio} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E90FF', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15 },
  fechaBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  fechaTexto: { color: '#333' },
  createdAt: { textAlign: 'center', color: '#888', marginBottom: 10 },
});
