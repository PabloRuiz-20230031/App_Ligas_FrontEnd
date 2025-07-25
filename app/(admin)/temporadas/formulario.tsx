import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet, Pressable, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/api';
import { useAuth } from '@/context/useAuth';

export default function TemporadaFormulario() {
  const router = useRouter();
  const { ligaId, categoriaId, nombreLiga, nombreCategoria, modo, temporadaId } = useLocalSearchParams();
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [vueltas, setVueltas] = useState('1');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);
  const [cargando, setCargando] = useState(false);
  const esEdicion = modo === 'editar';

  useEffect(() => {
    if (esEdicion && categoriaId) {
      const fetchTemporada = async () => {
        try {
          const res = await api.get(`/temporadas/categoria/${categoriaId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const temporada = res.data;
          setNombre(temporada.nombre);
          setFechaInicio(new Date(temporada.fechaInicio));
          setFechaFin(new Date(temporada.fechaFin));
        } catch (error) {
          console.error('Error al cargar temporada:', error);
        }
      };

      fetchTemporada();
    } else {
      setNombre(`Temporada ${nombreCategoria}`);
    }
  }, [esEdicion, categoriaId]);

  const handleGuardarTemporada = async () => {
    if (!nombre || !fechaInicio || !fechaFin) {
      return Alert.alert('Faltan campos obligatorios');
    }

    try {
      setCargando(true);
      const payload = {
        nombre,
        fechaInicio,
        fechaFin
      };

      if (esEdicion) {
        const res = await api.get(`/temporadas/categoria/${categoriaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await api.put(`/temporadas/${res.data._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Alert.alert('✅ Temporada actualizada con éxito');
        router.replace('/(admin)/temporadas');
      } else {
        await api.post('/temporadas/crear-completa', {
          ...payload,
          categoriaId,
          vueltas: parseInt(vueltas),
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Alert.alert(
          '✅ Temporada creada con éxito',
          '¿Qué deseas hacer ahora?',
          [
            { text: 'Crear otra', onPress: () => router.push('/(admin)/temporadas') },
            { text: 'Ir al inicio', onPress: () => router.push('/(admin)') }
          ]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error al guardar la temporada');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitulo}>Liga: {nombreLiga}</Text>
      <Text style={styles.subtitulo}>Categoría: {nombreCategoria}</Text>

      <Text style={styles.label}>Nombre de la temporada</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Clausura 2025"
        style={styles.input}
      />

      {!esEdicion && (
        <>
          <Text style={styles.label}>Vueltas</Text>
          <TextInput
            value={vueltas}
            onChangeText={setVueltas}
            keyboardType="numeric"
            placeholder="Ej. 2"
            style={styles.input}
          />
        </>
      )}

      <Text style={styles.label}>Fecha inicio</Text>
      <Pressable onPress={() => setMostrarInicio(true)} style={styles.input}>
        <Text>{fechaInicio.toLocaleDateString()}</Text>
      </Pressable>
      {mostrarInicio && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'default'}
          onChange={(_, d) => {
            setMostrarInicio(false);
            if (d) setFechaInicio(d);
          }}
        />
      )}

      <Text style={styles.label}>Fecha fin</Text>
      <Pressable onPress={() => setMostrarFin(true)} style={styles.input}>
        <Text>{fechaFin.toLocaleDateString()}</Text>
      </Pressable>
      {mostrarFin && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'default'}
          onChange={(_, d) => {
            setMostrarFin(false);
            if (d) setFechaFin(d);
          }}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={cargando ? 'Guardando...' : esEdicion ? 'Actualizar temporada' : 'Crear temporada'}
          onPress={handleGuardarTemporada}
          color="#1E90FF"
          disabled={cargando}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  label: { fontWeight: 'bold', marginTop: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});
