import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import api from '@/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface Categoria {
  _id: string;
  nombre: string;
  imagen?: string;
  liga: {
    _id: string;
    nombre: string;
  };
}

interface Liga {
  _id: string;
  nombre: string;
}

export default function AdminCategorias() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useFocusEffect(
    useCallback(() => {
      obtenerLigas();      // Refresca ligas disponibles
      obtenerCategorias(); // Refresca categorías
    }, [])
  );

  const obtenerCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    }
  };

  const obtenerLigas = async () => {
    try {
      const res = await api.get('/ligas');
      setLigas(res.data);
    } catch (error) {
      console.error('Error al cargar ligas:', error);
      Alert.alert('Error', 'No se pudieron cargar las ligas');
    }
  };

  const eliminarCategoria = async (id: string) => {
    Alert.alert(
      'Eliminar categoría',
      '¿Estás seguro de que quieres eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categorias/${id}`);
              Alert.alert('Categoría eliminada');
              obtenerCategorias();
            } catch (error) {
              Alert.alert('Error al eliminar categoría');
            }
          },
        },
      ]
    );
  };

  const ligasFiltradas = ligas.filter((liga) =>
    liga.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const categoriasFiltradas = categorias.filter(
    (cat) => cat.liga && cat.liga._id === ligaSeleccionada?._id
  );

  const renderItem = ({ item }: { item: Categoria }) => (
    <View style={styles.card}>
      {item.imagen && (
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.liga}>Liga: {item.liga?.nombre}</Text>

        <View style={styles.botones}>
          <TouchableOpacity
            style={[styles.boton, { backgroundColor: '#1E90FF' }]}
            onPress={() =>
              router.push({
                pathname: '/(admin)/categorias/formulario',
                params: {
                  modo: 'editar',
                  categoriaId: item._id,
                },
              })
            }
          >   
            <Text style={styles.botonTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boton, { backgroundColor: '#DC3545' }]}
            onPress={() => eliminarCategoria(item._id)}
          >
            <Text style={styles.botonTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Categoría</Text>

      <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Escribe el nombre de la liga"
        placeholderTextColor="#888"
        style={styles.input}
      />

      {busqueda.length > 0 && !ligaSeleccionada && (
        <FlatList
          data={ligasFiltradas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardSugerencia}
              onPress={() => {
                setLigaSeleccionada(item);
                setBusqueda(item.nombre);
              }}
            >
              <Text style={styles.nombreSugerencia}>{item.nombre}</Text>
              <Text style={styles.detalleSugerencia}>Presiona para seleccionar</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {ligaSeleccionada && (
      <>
        <Text style={styles.ligaSeleccionada}>
          Liga seleccionada: {ligaSeleccionada.nombre}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setLigaSeleccionada(null);
            setBusqueda('');
          }}
          style={styles.cambiarLigaBtn}
        >
          <Text style={styles.cambiarLigaTexto}>Cambiar de liga</Text>
        </TouchableOpacity>

        <Button
          title="Crear una nueva categoría"
          onPress={() =>
            router.push({
              pathname: '/(admin)/categorias/formulario',
              params: {
                modo: 'crear',
                ligaId: ligaSeleccionada._id,
              },
            })
          }
        />

        <FlatList
          data={categoriasFiltradas}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginVertical: 30, color: '#999' }}>
              Aún no hay categorías para esta liga
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />

      </>
    )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  suggestion: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ligaSeleccionada: {
    fontWeight: 'bold',
    marginVertical: 10,
  },  
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imagen: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },

  liga: {
    fontSize: 14,
    color: '#666',
  },

  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  boton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  botonTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cambiarLigaBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },

  cambiarLigaTexto: {
    color: '#333',
    fontWeight: '600',
  },
  cardSugerencia: {
    backgroundColor: '#e0ecff',
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nombreSugerencia: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#003366',
  },
  detalleSugerencia: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },

});
