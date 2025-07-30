import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image, // 👈 Importante
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Categoria, getCategoriasPorLiga } from '@/services/categoriaService';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.card}>
      {/* Ir a categorías */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ligas/[ligaId]/categorias/[categoriaId]/equipos",
            params: {
              ligaId: ligaId as string,
              categoriaId: item.id,
            },
          })
        }
      >
        {item.imagen && (
          <Image
            source={{ uri: item.imagen }}
            style={styles.imagen}
            resizeMode="cover"
          />
        )}
        <Text style={styles.nombre}>{item.nombre}</Text>
      </TouchableOpacity>

      {/* Ícono de información */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ligas/[ligaId]/categorias/[categoriaId]/info",
            params: {
              ligaId: ligaId as string,
              categoriaId: item.id,
            },
          })
        }
        style={styles.infoIcon}
      >
        <Ionicons name="information-circle-outline" size={24} color="#007bff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;
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
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagen: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoIcon: {
    position: 'absolute',
    right: 16,
    top: 16,  
  },
});
