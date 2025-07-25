import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  Alert, ActivityIndicator, TouchableOpacity, Platform, Image, FlatList
} from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import api from '@/api';
import { useRef } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CLOUD_NAME = 'dprwy1viz';
const UPLOAD_PRESET = 'liga_upload';

export default function CategoriaFormulario() {
  const router = useRouter();
  const { usuario } = useContext(AuthContext);

  const params = useLocalSearchParams();
  const categoriaId = Array.isArray(params.categoriaId) ? params.categoriaId[0] : params.categoriaId;
  const modo = Array.isArray(params.modo) ? params.modo[0] : params.modo;
  const ligaInicial = Array.isArray(params.ligaId) ? params.ligaId[0] : params.ligaId;

  const [nombre, setNombre] = useState('');
  const [ligaSeleccionada, setLigaSeleccionada] = useState<any>(null);
  const [ligasDisponibles, setLigasDisponibles] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [imagenUri, setImagenUri] = useState<ImagePickerAsset | null>(null);
  const [imagenCloudinary, setImagenCloudinary] = useState('');
  const [cargando, setCargando] = useState(false);
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    obtenerLigas();

    if (modo === 'editar' && categoriaId) {
      obtenerCategoria();
    }
  }, [modo, categoriaId]); // Solo se llama una vez cuando cambia modo o categoriaId

  useFocusEffect(
      useCallback(() => {
        if (modo === 'crear') {
          setNombre('');
          setDescripcion('');
          setImagenUri(null);
          setImagenCloudinary('');

          if (ligaInicial) {
            const ligaEncontrada = ligasDisponibles.find(l => l._id === ligaInicial);
            setLigaSeleccionada(ligaEncontrada || { _id: ligaInicial, nombre: '' });
          } else {
            setLigaSeleccionada(null);
            setBusqueda('');
          }
        }
      }, [modo, ligaInicial, ligasDisponibles])
    );
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          router.replace('/(admin)/categorias');
          return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
      }, [])
    );

  const obtenerLigas = async () => {
    try {
      const res = await api.get('/ligas');
      setLigasDisponibles(res.data);
    } catch (error) {
      console.error('Error al obtener ligas', error);
    }
  };

  const obtenerCategoria = async () => {
    try {
      const res = await api.get('/categorias');
      const cat = res.data.find((c: any) => c._id === categoriaId);
      if (!cat) return Alert.alert('No encontrada');
      setNombre(cat.nombre);
      setDescripcion(cat.descripcion || '');
      setLigaSeleccionada(cat.liga || null); 
      setBusqueda(cat.liga?.nombre || '');
      setImagenCloudinary(cat.imagen || '');
    } catch (error) {
      Alert.alert('Error al cargar');
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
    if (!imagenUri?.uri) return '';

    const uri = imagenUri.uri;
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const type = `image/${extension}`;

    const formData = new FormData();
    formData.append('file', {
      uri,
      type,
      name: `categoria_${Date.now()}.${extension}`,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'app/categorias');

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
    if (!nombre || !ligaSeleccionada?._id) {
      return Alert.alert('Completa los campos');
    }

    try {
      setCargando(true);

      let urlImagen = imagenCloudinary;
      if (imagenUri) {
        urlImagen = await subirImagen();
      }

      const datos = {
        nombre,
        liga: ligaSeleccionada._id,
        imagen: urlImagen,
        descripcion,
      };

      if (modo === 'editar') {
        await api.put(`/categorias/${categoriaId}`, datos);
        Alert.alert('Actualizado correctamente');
      } else {
        await api.post('/categorias', datos);
        Alert.alert('Registrado correctamente');
      }

      router.replace('/(admin)/categorias');
    } catch (error: any) {
        console.log('❌ Error:', error);

        if (error.response?.status === 400 && error.response.data?.mensaje) {
          return Alert.alert('Error', error.response.data.mensaje);
        }

        Alert.alert('Error', 'No se pudo guardar la categoría');
      } finally {
      setCargando(false);
    }
  };

  const ligasFiltradas = ligasDisponibles.filter(liga =>
    liga.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {modo === 'editar' ? 'Editar Categoría' : 'Registrar Nueva Categoría'}
      </Text>

      {/* Autocompletado de liga solo si no se ha seleccionado */}
      {ligaSeleccionada ? (
        <Text style={styles.ligaSeleccionadaText}>
          Liga seleccionada: {ligaSeleccionada.nombre}
        </Text>
      ) : null}


      <TextInput
        placeholder="Nombre de la categoría"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Descripción de la categoría"
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

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
        <Button title="Guardar Categoría" onPress={manejarEnvio} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E90FF', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  suggestion: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 5,
    borderRadius: 5,
  },
  ligaSeleccionadaText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cambiarLigaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  cambiarLigaTexto: {
    color: '#333',
    fontWeight: '600',
  },
  botonImagen: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  botonTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
});
