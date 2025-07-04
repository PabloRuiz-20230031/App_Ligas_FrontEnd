/*import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import axios from 'axios';

const CLOUD_NAME = 'dprwy1viz'; // Reemplaza con tu cloud name
const UPLOAD_PRESET = 'liga_upload'; // Reemplaza con tu upload preset

export default function CrearLigaScreen() {
  const { usuario } = useContext(AuthContext);
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [imagenUri, setImagenUri] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  if (usuario?.rol !== 'admin') return null;

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagenUri(resultado.assets[0].uri);
    }
  };

  const subirImagen = async () => {
    const formData = new FormData();
    formData.append('file', {
      uri: imagenUri,
      type: 'image/jpeg',
      name: `liga_${Date.now()}.jpg`,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'app/ligas');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const manejarEnvio = async () => {
    if (!nombre || !fechaInicio || !fechaFin) {
      return Alert.alert('Completa todos los campos');
    }

    try {
      setSubiendo(true);
      let urlImagen = '';

      if (imagenUri) {
        urlImagen = await subirImagen();
      }

      await axios.post('http://localhost:3000/api/ligas', {
        nombre,
        fechaInicio,
        fechaFin,
        imagen: urlImagen,
      });

      Alert.alert('Éxito', 'Liga registrada correctamente');
      setNombre('');
      setImagenUri('');
      router.push('');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.mensaje || 'Error al crear liga');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Nueva Liga</Text>

      <TextInput
        placeholder="Nombre de la liga"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TouchableOpacity onPress={() => setMostrarInicio(true)} style={styles.fechaBtn}>
        <Text style={styles.fechaTexto}>
          Fecha de inicio: {fechaInicio.toLocaleDateString()}
        </Text>
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
        <Text style={styles.fechaTexto}>
          Fecha de fin: {fechaFin.toLocaleDateString()}
        </Text>
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

      <TouchableOpacity onPress={seleccionarImagen} style={styles.botonImagen}>
        <Text style={styles.botonTexto}>
          {imagenUri ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
        </Text>
      </TouchableOpacity>

      {imagenUri && (
        <Image source={{ uri: imagenUri }} style={styles.preview} />
      )}

      <Button
        title={subiendo ? 'Subiendo...' : 'Guardar Liga'}
        onPress={manejarEnvio}
        disabled={subiendo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  fechaBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  fechaTexto: {
    color: '#333',
  },
  botonImagen: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  botonTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
});*/
