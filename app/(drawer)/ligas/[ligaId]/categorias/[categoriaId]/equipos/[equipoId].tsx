import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Equipo, getEquipoPorId } from '@/services/equipoService';
/*
export const navigationOptions = {
  drawerItemStyle: { display: 'none' },
};*/

export default function InfoEquipoScreen() {
  const { equipoId } = useLocalSearchParams();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const data = await getEquipoPorId(equipoId as string);
        setEquipo(data);
      } catch (error) {
        console.error('Error al obtener equipo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipo();
  }, [equipoId]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;

  if (!equipo) return <Text style={styles.errorText}>Equipo no encontrado.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.nombre}>{equipo.nombre}</Text>

      <Text style={styles.seccion}>Representantes:</Text>
      {equipo.representantes.length === 0 ? (
        <Text style={styles.detalle}>Sin representantes</Text>
      ) : (
        equipo.representantes.map((rep, index) => (
          <Text key={index} style={styles.detalle}>{rep.nombre}</Text>
        ))
      )}

      <Text style={styles.seccion}>Jugadores:</Text>
      {equipo.jugadores.length === 0 ? (
        <Text style={styles.detalle}>Sin jugadores</Text>
      ) : (
        <FlatList
          data={equipo.jugadores}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Text style={styles.detalle}>{item.dorsal} - {item.nombre}</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  seccion: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  detalle: {
    fontSize: 16,
    marginBottom: 4,
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    color: 'red',
  },
});
