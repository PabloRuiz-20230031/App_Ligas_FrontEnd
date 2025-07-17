import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Categoria, getCategoriasPorLiga } from '@/services/categoriaService';
/*
export const navigationOptions = {
  drawerItemStyle: { display: 'none' },
};*/

export default function CategoriasScreen() {
  const { ligaId } = useLocalSearchParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategoriasPorLiga(ligaId as string);
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [ligaId]);

  const renderCategoria = ({ item }: { item: Categoria }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(drawer)/ligas/[ligaId]/categorias/[categoriaId]/info",
          params: {
            ligaId: ligaId as string,
            categoriaId: item.id,
          },
        })
      }
    >
      <Text style={styles.nombre}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoria}
        ListEmptyComponent={<Text>No hay categorías disponibles.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
  },
});
