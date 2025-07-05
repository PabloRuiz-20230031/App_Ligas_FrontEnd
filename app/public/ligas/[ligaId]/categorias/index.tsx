import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCategorias, Categoria } from '../../../../../services/categoriaService';

export default function CategoriasScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategorias() {
      try {
        if (ligaId) {
          const data = await getCategorias(String(ligaId));
          setCategorias(data);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    }
    fetchCategorias();
  }, [ligaId]);

  const renderCategoria = ({ item }: { item: Categoria }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`/public/ligas/${ligaId}/categorias/${item.id}/equipos`)
      }
    >
      <View style={styles.cardFooter}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Pressable
          onPress={() =>
            router.push(`/public/ligas/${ligaId}/categorias/${item.id}/info`)
          }
        >
          <Ionicons name="information-circle-outline" size={20} color="#1E90FF" />
        </Pressable>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoria}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
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
  cardFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
});

export const screenOptions = {
  title: 'Categorías',
};
