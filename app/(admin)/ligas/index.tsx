import { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/api';

interface Liga {
  _id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  imagen?: string;
  descripcion?: string;
  createdAt?: string;
}

export default function LigasAdminScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      obtenerLigas();
    }, [])
  );

  const obtenerLigas = async () => {
    try {
      setCargando(true);
      const res = await api.get('/ligas');
      setLigas(res.data);
    } catch (error) {
      console.error('Error al obtener ligas', error);
      Alert.alert('Error', 'No se pudieron cargar las ligas');
    } finally {
      setCargando(false);
    }
  };

  const ligasFiltradas = ligas.filter((liga) =>
    liga.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const editarLiga = (ligaId: string) => {
  router.push({
    pathname: '/(admin)/ligas/formulario',
    params: { ligaId, modo: 'editar', key: Date.now().toString() },
  });
};


  const crearLiga = () => {
  router.push({
    pathname: '/(admin)/ligas/formulario',
    params: { modo: 'crear', key: Date.now().toString() }, // 👈 importante
  });
};

  const eliminarLiga = (ligaId: string) => {
  Alert.alert(
    '¿Eliminar liga?',
    'Esta acción no se puede deshacer.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/ligas/${ligaId}`);
            Alert.alert('Eliminada', 'La liga fue eliminada correctamente');
            obtenerLigas(); // Refrescar la lista
          } catch (error) {
            console.error('❌ Error al eliminar liga:', error);
            Alert.alert('Error', 'No se pudo eliminar la liga');
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Ligas</Text>

      <TextInput
        placeholder="Buscar liga por nombre"
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.input}
      />

      <Button title="Crear nueva liga" onPress={crearLiga} />

      <FlatList
        data={ligasFiltradas}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.fecha}>
            {new Date(item.fechaInicio).toLocaleDateString()} - {new Date(item.fechaFin).toLocaleDateString()}
          </Text>

          <Pressable style={styles.btnEditar} onPress={() => editarLiga(item._id)}>
            <Text style={styles.btnTexto}>Editar</Text>
          </Pressable>

          <Pressable style={styles.btnEliminar} onPress={() => eliminarLiga(item._id)}>
            <Text style={styles.btnTexto}>Eliminar</Text>
          </Pressable>
        </View>
      )}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, textAlign: 'center', color: '#999' }}>
            No se encontraron ligas
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1E90FF' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  nombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  fecha: { color: '#555' },
  btnEditar: {
    marginTop: 8,
    backgroundColor: '#1E90FF',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
    btnEliminar: {
    marginTop: 6,
    backgroundColor: '#DC143C', // rojo fuerte
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
