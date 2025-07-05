import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CategoriaInfoScreen() {
  const { categoriaId } = useLocalSearchParams<{ categoriaId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Información de la categoría</Text>
      <Text style={styles.texto}>ID: {categoriaId}</Text>
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
  },
});

export const screenOptions = {
  title: 'Acerca de la categoría',
};
