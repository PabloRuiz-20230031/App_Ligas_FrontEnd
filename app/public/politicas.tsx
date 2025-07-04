import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PoliticasScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Política de Privacidad</Text>
      <Text style={styles.texto}>
        Aquí se mostrará la política de privacidad de la aplicación, incluyendo el uso de datos personales. Puedes actualizar este texto desde el panel de administración.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },
  texto: {
    fontSize: 16,
    lineHeight: 22
  }
});

export default PoliticasScreen;

export const screenOptions = {
  title: 'Politica de uso',
};