import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { getLigas, Liga } from '@/services/ligaService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LigasScreen() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLigas = async () => {
      try {
        const data = await getLigas();
        setLigas(data);
      } catch (error) {
        console.error('Error al obtener ligas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLigas();
  }, []);

  const renderLiga = ({ item }: { item: Liga }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ligas/[ligaId]/categorias",
            params: { ligaId: item._id },
          })
        }
      >
        {item.imagen && (
          <Image
            source={{ uri: item.imagen }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.nombre}>{item.nombre ?? 'Sin nombre'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ligas/[ligaId]/info",
            params: { ligaId: item._id },
          })
        }
        style={styles.infoIcon}
      >
        <Ionicons name="information-circle-outline" size={24} color="#007bff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ligas}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderLiga}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text>No hay ligas disponibles</Text>}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8ff',
  },
  card: {
    padding: 16,
    margin: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    position: 'relative',
  },
  image: {
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
