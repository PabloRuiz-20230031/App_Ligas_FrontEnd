import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../../../../../../context/AuthContext';

export default function EquipoInfoScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>();
  const { estaAutenticado } = useContext(AuthContext);

  const manejarNotificacion = () => {
    if (!estaAutenticado) {
      Alert.alert('Inicia sesión para activar notificaciones');
      return;
    }
    Alert.alert('Notificaciones activadas');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Acerca del equipo</Text>
      <Text style={styles.texto}>ID: {equipoId}</Text>
      <Pressable onPress={manejarNotificacion} style={styles.notificacion}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </Pressable>
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
    marginBottom: 10,
  },
  notificacion: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
});

export const screenOptions = {
  title: 'Acerca del equipo',
};
