import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import api from '@/api';

export default function PoliticasScreen() {
  const [items, setItems] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchPoliticas = async () => {
      try {
        const res = await api.get('/info/politicas');
        setItems(res.data.items || []);
      } catch (err) {
        console.error('Error al cargar políticas', err);
      } finally {
        setCargando(false);
      }
    };

    fetchPoliticas();
  }, []);

  if (cargando) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Política de Uso</Text>
      {items.length > 0 ? (
        items.map((item, idx) => (
          <Text key={idx} style={styles.texto}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.texto}>No se encontraron políticas registradas.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f2f8ff' },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },
  texto: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10
  }
});

export const screenOptions = {
  title: 'Política de uso',
};
