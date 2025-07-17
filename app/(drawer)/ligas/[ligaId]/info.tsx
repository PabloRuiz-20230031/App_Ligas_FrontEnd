import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getLigas, Liga } from '@/services/ligaService';
/*
export const navigationOptions = {
  drawerItemStyle: { display: 'none' },
};  */

export default function InfoLigaScreen() {
  
  const { ligaId } = useLocalSearchParams();
  const [liga, setLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiga = async () => {
      try {
        const ligas = await getLigas(); // Puedes usar getLigaPorId si lo tienes
        const encontrada = ligas.find((l) => l.id === ligaId);
        setLiga(encontrada || null);
      } catch (error) {
        console.error('Error al cargar la información de la liga:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiga();
  }, [ligaId]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;

  if (!liga) return <Text style={styles.errorText}>Liga no encontrada.</Text>;

  return (
    <View style={styles.container}>
      {liga.imagen ? (
        <Image source={{ uri: liga.imagen }} style={styles.imagen} />
      ) : null}
      <Text style={styles.nombre}>{liga.nombre}</Text>
      <Text style={styles.detalle}>Descripción: Información detallada próximamente.</Text>
      <Text style={styles.detalle}>Fecha de creación: (si tienes este campo)</Text>
      <Text style={styles.detalle}>Creadores: (puedes agregar esto desde el backend)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    marginBottom: 10,
  },
  detalle: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    color: 'red',
  },
});
