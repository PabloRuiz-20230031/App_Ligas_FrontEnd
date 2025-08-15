import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  TouchableOpacity, Image, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/api';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';



const CLOUD_NAME = 'dkxz5wm2h';
const UPLOAD_PRESET = 'liga_upload';

export default function FormularioJugador() {
  const router = useRouter();
  const { equipoId, jugadorId, representanteId, modo } = useLocalSearchParams();

  const tipoDetectado = representanteId ? 'representante' : 'jugador';
  const esEdicion = modo === 'editar';

  const [tipoRegistro, setTipoRegistro] = useState<'jugador' | 'representante'>(tipoDetectado);
  const [nombre, setNombre] = useState('');
  const [curp, setCurp] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarFecha, setMostrarFecha] = useState(false);

  
  // 🟢 Detectar automáticamente si es jugador o representante en modo edición
  useEffect(() => {
    if (modo === 'editar') {
      if (representanteId) setTipoRegistro('representante');
      else if (jugadorId) setTipoRegistro('jugador');
    }
  }, [modo, jugadorId, representanteId]);

  // 🟢 Cargar datos si estamos editando
   useEffect(() => {
  const cargarDatos = async () => {
    try {
      if (modo === 'editar') {
        if (tipoRegistro === 'jugador' && jugadorId) {
          const res = await api.get(`/jugadores/${jugadorId}`);
          console.log('📦 Datos del jugador:', res.data);
          const jugador = res.data;

          setNombre(jugador.nombre ?? '');
          setCurp(jugador.curp ?? '');
          setDorsal(jugador.dorsal !== undefined ? String(jugador.dorsal) : '');
          setFechaNacimiento(jugador.fechaNacimiento ? new Date(jugador.fechaNacimiento) : new Date());
          setImagen(jugador.foto ?? null);
        } else if (tipoRegistro === 'representante' && representanteId) {
          const res = await api.get(`/representantes/${representanteId}`);
          console.log('📦 Datos del representante:', res.data);
          const representante = res.data;

          setNombre(representante.nombre ?? '');
          setCurp(representante.curp ?? '');
          setTelefono(representante.telefono ?? '');
          setCorreo(representante.correo ?? '');
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar datos para editar:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos para editar');
    }
  };

  cargarDatos(); // 👈 No olvides ejecutar la función
}, [modo, tipoRegistro, jugadorId, representanteId]); // 👈 Y las dependencias del useEffect

useFocusEffect(
          React.useCallback(() => {
            const onBackPress = () => {
              router.replace('/(admin)/jugadores');
              return true;
            };
  
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
            return () => subscription.remove();
          }, [])
        );


useFocusEffect(
  useCallback(() => {
    if (modo !== 'editar') {
      // Limpiar campos para registro nuevo
      setNombre('');
      setCurp('');
      setDorsal('');
      setTelefono('');
      setCorreo('');
      setFechaNacimiento(new Date());
      setImagen(null);
    }
  }, [modo])
);

  

  const handleSeleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      subirImagenACloudinary(asset.base64!, asset.fileName || 'foto.jpg');
    }
  };

  const subirImagenACloudinary = async (base64: string, fileName: string) => {
    setCargando(true);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: `data:image/jpeg;base64,${base64}`,
          upload_preset: UPLOAD_PRESET,
          public_id: `jugadores/${fileName}_${Date.now()}`
        })
      });
      const data = await res.json();
      setImagen(data.secure_url);
    } catch (error) {
      Alert.alert('Error al subir imagen');
    } finally {
      setCargando(false);
    }
  };

  const validarYGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campos requeridos', 'El nombre es obligatorio');
      return;
    }

    try {
      if (esEdicion) {
        if (tipoRegistro === 'jugador') {
          await api.put(`/jugadores/${jugadorId}`, {
            nombre,
            curp,
            dorsal: parseInt(dorsal),
            fechaNacimiento,
            foto: imagen,
            equipo: equipoId
          });
          Alert.alert('Jugador actualizado');
        } else {
          await api.put(`/representantes/${representanteId}`, {
            nombre,
            curp,
            telefono,
            correo,
            equipo: equipoId
          });
          Alert.alert('Representante actualizado');
        }
        return router.back();
      }

      if (tipoRegistro === 'jugador') {
        const dorsalNum = parseInt(dorsal);
        if (!dorsalNum || dorsalNum < 1 || dorsalNum > 999) {
          Alert.alert('Dorsal inválido', 'Debe estar entre 1 y 999');
          return;
        }

        // ✅ Solo agregar curp si no está vacía
        const jugadorPayload: any = {
          nombre,
          dorsal: dorsalNum,
          fechaNacimiento,
          foto: imagen || '',
          equipo: equipoId,
        };

        if (curp.trim() !== '') {
          jugadorPayload.curp = curp.trim().toUpperCase();
        }

        await api.post('/jugadores', jugadorPayload);

        Alert.alert('Jugador registrado');
        router.push('/(admin)/jugadores');
      }
      else {
        if (!telefono.match(/^\d{10}$/)) {
          Alert.alert('Teléfono inválido', 'Debe tener 10 dígitos');
          return;
        }
        if (!correo.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
          Alert.alert('Correo inválido');
          return;
        }

        const representantePayload: any = {
          nombre,
          telefono,
          correo,
          equipo: equipoId,
        };

        if (curp.trim() !== '') {
          representantePayload.curp = curp.trim().toUpperCase();
        }

        await api.post('/representantes', representantePayload);

        Alert.alert('Representante registrado');
        router.push('/(admin)/jugadores');
      }
    } catch (err: any) {
      const mensaje = err?.response?.data?.mensaje || 'Error al guardar';
      const detalles = err?.response?.data?.error?.errors;

      // Si el backend responde con un error de validación de CURP
      if (detalles?.curp?.properties?.message === 'CURP no válida') {
        Alert.alert('CURP inválida', 'El formato de la CURP no es válido');
        return;
      }

      // Otros errores generales
      Alert.alert('Error', mensaje);
      console.error('❌ Error:', err.response?.data);
        }
  };

  
  if (esEdicion && !jugadorId && !representanteId) {
    return <Text style={{ padding: 20 }}>No hay datos válidos para editar.</Text>;
  }

  if (modo === 'editar' && !tipoRegistro) {
    return <Text style={{ padding: 20 }}>Cargando tipo de registro...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modo === 'editar' ? 'Editar' : 'Registrar'} {tipoRegistro === 'jugador' ? 'Jugador' : 'Representante'}
      </Text>

      <View style={styles.selector}>
        {!esEdicion && (
          <View style={styles.selector}>  
            <TouchableOpacity
              style={[styles.opcion, tipoRegistro === 'jugador' && styles.seleccionado]}
              onPress={() => setTipoRegistro('jugador')}
            >
              <Text>Jugador</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.opcion, tipoRegistro === 'representante' && styles.seleccionado]}
              onPress={() => setTipoRegistro('representante')}
            >
              <Text>Representante</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#888" value={nombre} onChangeText={setNombre} />
      <TextInput 
        placeholder="CURP"
        placeholderTextColor="#888"
        value={curp}
        onChangeText={(text) => {
          if (text.length <= 18) setCurp(text.toUpperCase()); // Solo permite hasta 18 y en mayúsculas
        }}
        maxLength={18}
        autoCapitalize="characters"
        style={styles.input}
      />

      {tipoRegistro === 'jugador' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Número de dorsal (1-999)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={dorsal}
            onChangeText={setDorsal}
          />
          <TouchableOpacity onPress={() => setMostrarFecha(true)} style={styles.input}>
            <Text style={{ color: '#333' }}>
              Fecha de nacimiento: {fechaNacimiento.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {mostrarFecha && (
            <DateTimePicker
              value={fechaNacimiento}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setMostrarFecha(false);
                if (selectedDate) setFechaNacimiento(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.botonImagen} onPress={handleSeleccionarImagen}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Seleccionar Foto</Text>
          </TouchableOpacity>

          {imagen && <Image source={{ uri: imagen }} style={{ width: 100, height: 100, marginTop: 10, borderRadius: 10 }} />}
        </>
      )}

      {tipoRegistro === 'representante' && (
        <>
          <TextInput
            placeholder="Teléfono"
            placeholderTextColor="#888"
            value={telefono}
            onChangeText={(text) => {
              const soloNumeros = text.replace(/[^0-9]/g, ''); // elimina cualquier carácter que no sea número
              if (soloNumeros.length <= 10) setTelefono(soloNumeros);
            }}
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={correo}
            onChangeText={setCorreo}
          />
        </>
      )}

      <Button title={modo === 'editar' ? 'Guardar cambios' : 'Registrar'} onPress={validarYGuardar} disabled={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    color: '#000',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 10
  },
  selector: {
    flexDirection: 'row', justifyContent: 'center',
    marginBottom: 15, gap: 10
  },
  opcion: {
    borderWidth: 1, borderColor: '#007bff', borderRadius: 5,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: '#f2f2f2'
  },
  seleccionado: {
    backgroundColor: '#007bff', borderColor: '#0056b3'
  },
  botonImagen: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  }
});
