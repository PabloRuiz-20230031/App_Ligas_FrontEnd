import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getLiga, LigaDetalle } from '../../../../services/ligaService';

export default function LigaInfoScreen() {
  const { ligaId } = useLocalSearchParams<{ ligaId: string }>();
  const [liga, setLiga] = useState<LigaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchLiga() {
      try {
        if (ligaId) {
          const data = await getLiga(String(ligaId));
          setLiga(data);
        }
      } finally {
        setCargando(false);
      }
    }
    fetchLiga();
  }, [ligaId]);

  if (cargando) {
    return (
      <View style={styles.container}> 
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!liga) {
    return (
      <View style={styles.container}> 
        <Text>No se encontró la liga.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{liga.nombre}</Text>
      {liga.descripcion && <Text style={styles.texto}>{liga.descripcion}</Text>}
      {liga.fechaCreacion && (
        <Text style={styles.texto}>Creada: {new Date(liga.fechaCreacion).toLocaleDateString()}</Text>
      )}
      {liga.creadores && liga.creadores.length > 0 && (
        <Text style={styles.texto}>Creadores: {liga.creadores.join(', ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export const screenOptions = {
  title: 'Información de la liga',
};
