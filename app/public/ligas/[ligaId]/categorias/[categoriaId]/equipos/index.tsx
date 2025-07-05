import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEquipos, Equipo } from '../../../../../../services/equipoService';
import { AuthContext } from '../../../../../../context/AuthContext';

export default function EquiposScreen() {
  const { categoriaId, ligaId } = useLocalSearchParams<{ categoriaId: string; ligaId: string }>();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const router = useRouter();
  const { estaAutenticado } = useContext(AuthContext);

  useEffect(() => {
    async function fetchEquipos() {
      try {
        if (categoriaId) {
          const data = await getEquipos(String(categoriaId));
          setEquipos(data);
        }
      } catch (error) {
        console.error('Error cargando equipos:', error);
      }
    }
    fetchEquipos();
  }, [categoriaId]);

  const irDetalle = (id: string) => {
    router.push(`/public/ligas/${ligaId}/categorias/${categoriaId}/equipos/${id}`);
  };

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <TouchableOpacity style={styles.card} onPress={() => irDetalle(item.id)}>
      <View style={styles.cardFooter}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Pressable
          onPress={() => irDetalle(item.id)}
        >
          <Ionicons name="information-circle-outline" size={20} color="#1E90FF" />
        </Pressable>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipos}
        keyExtractor={(item) => item.id}
        renderItem={renderEquipo}
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
  title: 'Equipos',
};
