import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function FormularioTerminos() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [terminos, setTerminos] = useState<string[]>(['']);

  const guardar = async () => {
    try {
      await api.put('/info/terminos', { items: terminos }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Términos guardados correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error al guardar los términos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Agregar Términos</Text>
      {terminos.map((item, idx) => (
        <TextInput
          key={idx}
          style={styles.input}
          placeholder={`Término ${idx + 1}`}
          placeholderTextColor="#888"
          value={item}
          onChangeText={(txt) => {
            const nuevos = [...terminos];
            nuevos[idx] = txt;
            setTerminos(nuevos);
          }}
        />
      ))}

      <View style={styles.botones}>
        <Button title="Agregar otro" onPress={() => setTerminos([...terminos, ''])} />
        <Button title="Guardar" onPress={guardar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  botones: {
    marginTop: 20,
    gap: 15,
  },
});
