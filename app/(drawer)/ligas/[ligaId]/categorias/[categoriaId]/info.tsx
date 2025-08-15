import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getCategoriaPorId, Categoria } from '@/services/categoriaService';

export default function InfoCategoriaScreen() {
  const { categoriaId } = useLocalSearchParams();
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const data = await getCategoriaPorId(categoriaId as string);
        setCategoria(data);
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoria();
  }, [categoriaId]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;
  if (!categoria) return <Text style={styles.errorText}>Categoría no encontrada.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {categoria.imagen && (
        <Image source={{ uri: categoria.imagen }} style={styles.imagen} resizeMode="cover" />
      )}
      <Text style={styles.nombre}>{categoria.nombre}</Text>
      <Text style={styles.detalle}>
        Descripción: {categoria.descripcion || 'Sin descripción.'}
      </Text>
      <Text style={styles.detalle}>
        Fecha de creación: {categoria.fechaCreacion
          ? new Date(categoria.fechaCreacion).toLocaleDateString()
          : 'No disponible'}
      </Text>
      <Text style={styles.detalle}>
        Creado por: {categoria.creadoPor || 'Desconocido'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f8ff',
    alignItems: 'stretch',
  },
  imagen: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  detalle: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    color: 'red',
  },
});
