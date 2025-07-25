import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getLigaPorId, Liga } from '@/services/ligaService';

export default function InfoLigaScreen() {
  const { ligaId } = useLocalSearchParams();
  const [liga, setLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiga = async () => {
      const data = await getLigaPorId(ligaId as string);
      setLiga(data);
      setLoading(false);
    };

    fetchLiga();
  }, [ligaId]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;

  if (!liga) return <Text style={styles.errorText}>Liga no encontrada.</Text>;

  return (
    <View style={styles.container}>
      {liga.imagen && <Image source={{ uri: liga.imagen }} style={styles.imagen} />}
      <Text style={styles.nombre}>{liga.nombre}</Text>
      <Text style={styles.detalle}>
        Descripción: {liga.descripcion || 'Sin descripción disponible.'}
      </Text>
      <Text style={styles.detalle}>
        Fecha de creación: {liga.fechaCreacion ? new Date(liga.fechaCreacion).toLocaleDateString() : 'Desconocida'}
      </Text>
      <Text style={styles.detalle}>
        Creado por: {liga.creador?.nombre || 'No especificado'}
      </Text>
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