import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function InfoEmpresaIndex() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [terminos, setTerminos] = useState<string[]>([]);
  const [politicas, setPoliticas] = useState<string[]>([]);

  const cargarTodo = useCallback(async () => {
    try {
      const contactoRes = await api.get('/info/contacto', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (contactoRes.data) {
        setNombre(contactoRes.data.nombre || '');
        setCorreo(contactoRes.data.correo || '');
      }
    } catch {
      setNombre('');
      setCorreo('');
    }

    try {
      const terminosRes = await api.get('/info/terminos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTerminos(terminosRes.data?.items || []);
    } catch {
      setTerminos([]);
    }

    try {
      const politicasRes = await api.get('/info/politicas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoliticas(politicasRes.data?.items || []);
    } catch {
      setPoliticas([]);
    }
  }, [token]);

  // Se ejecuta cada vez que vuelve el foco a la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarTodo();
    }, [cargarTodo])
  );

  const eliminarInfo = async (tipo: 'contacto' | 'terminos' | 'politicas', index?: number) => {
    try {
      if (tipo === 'contacto') {
        await api.delete(`/info/contacto`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const nuevaLista = tipo === 'terminos' ? [...terminos] : [...politicas];
        nuevaLista.splice(index!, 1);
        await api.put(`/info/${tipo}`, { items: nuevaLista }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Alert.alert(`${tipo.toUpperCase()} actualizado`);
      cargarTodo(); // ✅ Refrescamos la lista después de eliminar
    } catch {
      Alert.alert(`Error al eliminar ${tipo}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registro de información</Text>

      {/* CONTACTO */}
      <Text style={styles.seccion}>Contacto</Text>
      {nombre && correo ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{nombre}</Text>
          <Text>{correo}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(admin)/informacion/formularioContacto')}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarInfo('contacto')}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(admin)/informacion/formularioContacto')}
      >
        <Text style={styles.addButtonText}>Agregar contacto +</Text>
      </TouchableOpacity>

      {/* TÉRMINOS */}
      <Text style={styles.seccion}>Términos y condiciones</Text>
      {terminos.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text numberOfLines={1}>{item}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(admin)/informacion/formularioTerminos')}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarInfo('terminos', index)}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(admin)/informacion/formularioTerminos')}
      >
        <Text style={styles.addButtonText}>Agregar término +</Text>
      </TouchableOpacity>

      {/* POLÍTICAS */}
      <Text style={styles.seccion}>Políticas de uso</Text>
      {politicas.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text numberOfLines={1}>{item}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(admin)/informacion/formularioPoliticas')}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarInfo('politicas', index)}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(admin)/informacion/formularioPoliticas')}
      >
        <Text style={styles.addButtonText}>Agregar política +</Text>
      </TouchableOpacity>
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
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderColor: '#0d6efd',
    borderWidth: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#f9d72f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  editText: {
    color: '#000',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#0d6efd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
