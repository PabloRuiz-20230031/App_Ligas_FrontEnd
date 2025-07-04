import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TerminosScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Términos y Condiciones</Text>
      <Text style={styles.texto}>
        Aquí irán los términos y condiciones que rigen el uso de esta aplicación. Puedes modificar este contenido desde el panel de administración.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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

export default TerminosScreen;

export const screenOptions = {
  title: 'Terminos y Condiciones',
};
