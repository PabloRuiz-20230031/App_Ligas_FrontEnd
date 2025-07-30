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
import { Equipo, getEquiposPorCategoria } from '@/services/equipoService';

import { Image } from 'react-native';
 
export const navigationOptions = {
  drawerItemStyle: { display: 'none' },
};

export default function EquiposScreen() {
  const { ligaId, categoriaId } = useLocalSearchParams();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const data = await getEquiposPorCategoria(categoriaId as string);
        // Filtrar el equipo "Descanso"
        const equiposFiltrados = data.filter(
          (equipo) => equipo.nombre.toLowerCase() !== 'descanso'
        );
        setEquipos(equiposFiltrados);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, [categoriaId]);

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/ligas/[ligaId]/categorias/[categoriaId]/equipos/[equipoId]",
          params: {
            ligaId: ligaId as string,
            categoriaId: categoriaId as string,
            equipoId: item.id,
          },
        })
      }
    >
      <View style={styles.info}>
        <Image
          source={{
            uri: item.imagen || 'https://res.cloudinary.com/dprwy1viz/image/upload/v1721531371/escudo_default.png',
          }}
          style={styles.imagen}
        />
        <Text style={styles.nombre}>{item.nombre}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipos}
        keyExtractor={(item) => item.id}
        renderItem={renderEquipo}
        ListEmptyComponent={<Text>No hay equipos disponibles.</Text>}
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imagen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  nombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
