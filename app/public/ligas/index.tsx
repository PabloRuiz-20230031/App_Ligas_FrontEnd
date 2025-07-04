import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLigas } from '../../../services/ligaService'; // Asegúrate de tener este servicio

interface Liga {
  id: string;
  nombre: string;
  imagen?: string;
}

export default function LigasScreen() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function fetchLigas() {
      try {
        const data = await getLigas();
        setLigas(data);
      } catch (error) {
        console.error('Error cargando ligas:', error);
      }
    }
    fetchLigas();
  }, []);

  const ligasFiltradas = ligas.filter(liga =>
    liga.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderLiga = ({ item }: { item: Liga }) => (
    <TouchableOpacity style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
      ) : (
        <View style={styles.imagenPlaceholder} />
      )}
      <Text style={styles.nombreLiga}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Barra de búsqueda */}
      <TextInput
        placeholder="Buscar liga..."
        style={styles.buscador}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Lista de ligas */}
      <FlatList
        data={ligasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderLiga}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  lista: {
    gap: 15,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  imagen: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagenPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  nombreLiga: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
});

export const screenOptions = {
  title: 'Ligas',
};