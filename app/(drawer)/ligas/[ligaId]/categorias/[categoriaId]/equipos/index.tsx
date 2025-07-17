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
import { Ionicons } from '@expo/vector-icons';

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
        setEquipos(data);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, [categoriaId]);

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <TouchableOpacity
        style={styles.icono}
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
        <Ionicons name="information-circle-outline" size={24} color="#007bff" />
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
  },
  icono: {
    padding: 4,
  },
});
