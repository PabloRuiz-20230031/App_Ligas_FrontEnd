import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';

export default function CambiarRolUsuario() {
  const { token } = useContext(AuthContext);
  const [correo, setCorreo] = useState('');
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const buscarUsuario = async () => {
    if (!correo) return Alert.alert('Ingresa un correo');

    try {
      setCargando(true);
      const res = await api.get(`/usuarios/buscar?correo=${correo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsuario(res.data);
    } catch (error: any) {
      console.error('Error al buscar usuario:', error);
      Alert.alert('❌ Usuario no encontrado');
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  const cambiarRol = async () => {
    if (!usuario) return;

    const nuevoRol = usuario.rol === 'admin' ? 'usuario' : 'admin';

    try {
      await api.put(`/usuarios/${usuario._id}/rol`, { rol: nuevoRol }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(`✅ Rol actualizado a ${nuevoRol}`);
      setUsuario({ ...usuario, rol: nuevoRol });
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      Alert.alert('❌ No se pudo actualizar el rol');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Buscar usuario por correo</Text>
      <TextInput
        placeholder="Correo del usuario"
        placeholderTextColor="#888"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Button title={cargando ? 'Buscando...' : 'Buscar'} onPress={buscarUsuario} disabled={cargando} />

      {usuario && (
        <View style={styles.resultado}>
          <Text style={styles.label}>Nombre: {usuario.nombre}</Text>
          <Text style={styles.label}>Correo: {usuario.correo}</Text>
          <Text style={styles.label}>Rol actual: {usuario.rol}</Text>

          <Button
            title={
              usuario.rol === 'admin'
                ? 'Cambiar a usuario normal'
                : 'Cambiar a administrador'
            }
            color={usuario.rol === 'admin' ? '#4CAF50' : '#FF5722'}
            onPress={cambiarRol}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    color: '#000',
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 6, padding: 10, marginBottom: 10,
    backgroundColor: '#fff'
  },
  resultado: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#f9f9f9'
  },
  label: { marginBottom: 4, fontSize: 14 }
});