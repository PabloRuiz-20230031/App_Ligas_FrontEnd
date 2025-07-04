import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContactoScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Contacto</Text>
      <Text style={styles.texto}>
        Si tienes dudas o deseas comunicarte con nosotros, puedes enviarnos un mensaje al correo contacto@ligasfutbol.mx
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },
  texto: {
    fontSize: 16
  }
});

export default ContactoScreen;

export const screenOptions = {
  title: 'Contacto',
};
