import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Button, Alert
} from 'react-native';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';

export default function InfoEmpresaAdmin() {
  const { token } = useContext(AuthContext);

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [terminos, setTerminos] = useState<string[]>(['']);
  const [politicas, setPoliticas] = useState<string[]>(['']);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const contactoRes = await api.get('/info/contacto', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (contactoRes.data) {
          setNombre(contactoRes.data.nombre || '');
          setCorreo(contactoRes.data.correo || '');
        }
      } catch (error) {
        console.log('Contacto no encontrado, se inicializa vacío');
        setNombre('');
        setCorreo('');
      }

      try {
        const terminosRes = await api.get('/info/terminos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (terminosRes.data?.items) {
          setTerminos(terminosRes.data.items);
        }
      } catch (error) {
        console.log('Términos no encontrados, se inicializa con campo vacío');
        setTerminos(['']);
      }

      try {
        const politicasRes = await api.get('/info/politicas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (politicasRes.data?.items) {
          setPoliticas(politicasRes.data.items);
        }
      } catch (error) {
        console.log('Políticas no encontradas, se inicializa con campo vacío');
        setPoliticas(['']);
      }
    };

    cargarTodo();
  }, []);

  const guardarContacto = async () => {
    try {
      await api.put('/info/contacto', { nombre, correo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Contacto guardado');
    } catch (error) {
      Alert.alert('Error al guardar contacto');
    }
  };

  const guardarTerminos = async () => {
    try {
      await api.put('/info/terminos', { items: terminos }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Términos guardados');
    } catch (error) {
      Alert.alert('Error al guardar términos');
    }
  };

  const guardarPoliticas = async () => {
    try {
      await api.put('/info/politicas', { items: politicas }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Políticas guardadas');
    } catch (error) {
      Alert.alert('Error al guardar políticas');
    }
  };

  const eliminarInfo = async (tipo: 'contacto' | 'terminos' | 'politicas') => {
    try {
      await api.delete(`/info/${tipo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert(`${tipo.toUpperCase()} eliminado`);
      if (tipo === 'contacto') {
        setNombre('');
        setCorreo('');
      } else if (tipo === 'terminos') {
        setTerminos(['']);
      } else if (tipo === 'politicas') {
        setPoliticas(['']);
      }
    } catch (error) {
      Alert.alert(`Error al eliminar ${tipo}`);
    }
  };

  const manejarCambioLista = (
    lista: string[],
    index: number,
    nuevoValor: string,
    setter: (val: string[]) => void
  ) => {
    const copia = [...lista];
    copia[index] = nuevoValor;
    setter(copia);
  };

  const agregarCampo = (lista: string[], setter: (val: string[]) => void) => {
    setter([...lista, '']);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Información de la Empresa</Text>

      <Text style={styles.seccion}>📩 Contacto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />

      <View style={styles.buttonGroup}>
        <View style={styles.button}>
          <Button title="Agregar Contacto" onPress={guardarContacto} />
        </View>
        <View style={styles.button}>
          <Button title="Eliminar Contacto" color="red" onPress={() => eliminarInfo('contacto')} />
        </View>
      </View>

      <Text style={styles.seccion}>📄 Términos y Condiciones</Text>
      {terminos.map((item, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Término ${index + 1}`}
          value={item}
          onChangeText={(text) => manejarCambioLista(terminos, index, text, setTerminos)}
        />
      ))}
      <View style={styles.buttonGroup}>
        <View style={styles.button}>
          <Button title="Agregar Término" onPress={() => agregarCampo(terminos, setTerminos)} />
        </View>
        <View style={styles.button}>
          <Button title="Guardar Términos" onPress={guardarTerminos} />
        </View>
        <View style={styles.button}>
          <Button title="Eliminar Términos" color="red" onPress={() => eliminarInfo('terminos')} />
        </View>
      </View>

      <Text style={styles.seccion}>📚 Políticas de Uso</Text>
      {politicas.map((item, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Política ${index + 1}`}
          value={item}
          onChangeText={(text) => manejarCambioLista(politicas, index, text, setPoliticas)}
        />
      ))}
      <View style={styles.buttonGroup}>
        <View style={styles.button}>
          <Button title="Agregar Política" onPress={() => agregarCampo(politicas, setPoliticas)} />
        </View>
        <View style={styles.button}>
          <Button title="Guardar Políticas" onPress={guardarPoliticas} />
        </View>
        <View style={styles.button}>
          <Button title="Eliminar Políticas" color="red" onPress={() => eliminarInfo('politicas')} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  seccion: {
    fontSize: 18,
    marginTop: 30,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    marginVertical: 5,
  },
});
