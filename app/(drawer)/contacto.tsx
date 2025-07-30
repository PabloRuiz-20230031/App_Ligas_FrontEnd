import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '@/api';

export default function ContactoScreen() {
  const [datos, setDatos] = useState<{ nombre: string; correo: string } | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchContacto = async () => {
      try {
        const res = await api.get('/info/contacto');
        setDatos(res.data);
      } catch (err) {
        console.error('Error al cargar contacto', err);
      } finally {
        setCargando(false);
      }
    };

    fetchContacto();
  }, []);

  if (cargando) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Contacto</Text>
      {datos ? (
        <View style={styles.card}>
          <Text style={styles.nombre}>{datos.nombre}</Text>
          <Text style={styles.correo}>{datos.correo}</Text>
        </View>
      ) : (
        <Text style={styles.texto}>No se encontró información de contacto.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222'
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  correo: {
    fontSize: 16,
    color: '#555'
  },
  texto: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666'
  }
});

export const screenOptions = {
  title: 'Contacto',
};
