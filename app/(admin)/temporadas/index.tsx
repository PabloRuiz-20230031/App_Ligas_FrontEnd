import React, { useState, useContext } from 'react';

import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, Alert, StyleSheet, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext'; // Ajusta la ruta si es diferente
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

type Liga = {
  _id: string;
  nombre: string;
};

type CategoriaConInfo = {
  _id: string;
  nombre: string;
  liga: string;
  totalEquipos: number;
  tieneTemporada: boolean;
  temporadaId?: string;
  temporadaActiva?: boolean;
  nombreTemporada?: string; // ✅ agregado
};

type CategoriaConTemporada = {
  _id: string;
  nombre: string;
  liga: { _id: string; nombre: string };
  totalEquipos: number;
  tieneTemporada: boolean;
};

export default function TemporadasIndex() {
  const router = useRouter();
  const { apiKey, token } = useContext(AuthContext);

  const [ligaBuscada, setLigaBuscada] = useState('');
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<any>(null);
  const [categorias, setCategorias] = useState<CategoriaConInfo[]>([]);
  
 useFocusEffect(
    useCallback(() => {
      const recargarCategorias = async () => {
        if (ligaSeleccionada) {
          try {
            const res = await api.get(`/categorias/por-liga/${ligaSeleccionada._id}`);
            setCategorias(res.data);
          } catch (error) {
            console.error('Error al recargar categorías:', error);
          }
        }
      };

      recargarCategorias();
    }, [ligaSeleccionada])
  );
  

  const buscarLigas = async (texto: string) => {
    setLigaBuscada(texto);
    if (texto.length >= 3) {
      try {
        const res = await api.get(`/ligas/buscar?nombre=${texto}`);
        setLigas(res.data);
      } catch (error) {
        console.error('Error al buscar ligas:', error);
      }
    } else {
      setLigas([]);
    }
  };

  const seleccionarLiga = async (liga: any) => {
    setLigaSeleccionada(liga);
    setLigaBuscada(liga.nombre);
    setLigas([]);
    try {
      const res = await api.get(`/categorias/por-liga/${liga._id}`);
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const confirmarTemporada = (categoria: any) => {
    if (categoria.temporadaActiva) {
      Alert.alert(
        '⚠️ Temporada activa',
        'Esta categoría ya tiene una temporada activa. No puedes crear otra hasta que finalice o se elimine.'
      );
      return;
    }

    Alert.alert(
      'Crear Temporada',
      `Está a punto de crear una temporada para la categoría ${categoria.nombre} de la liga ${ligaSeleccionada.nombre}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            router.push({
              pathname: '/(admin)/temporadas/formulario',
              params: {
                ligaId: ligaSeleccionada._id,
                categoriaId: categoria._id,
                nombreCategoria: categoria.nombre,
                nombreLiga: ligaSeleccionada.nombre
              }
            } as any);
          }
        }
      ]
    );
  };


  const editarTemporada = (item: CategoriaConInfo) => {
    router.push({
        pathname: '/(admin)/temporadas/formulario',
        params: {
        modo: 'editar',
        categoriaId: item._id,
        nombreCategoria: item.nombre,
        ligaId: ligaSeleccionada._id,
        nombreLiga: ligaSeleccionada.nombre
        }
    } as any);
    };

     const eliminarTemporada = async (categoriaId: string) => {
        try {
            const res = await api.get(`/temporadas/categoria/${categoriaId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });

            if (!res.data || !res.data._id) {
            Alert.alert('⚠ No se encontró una temporada para esta categoría.');
            return;
            }

            const temporadaId = res.data._id;

            await api.delete(`/temporadas/${temporadaId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });

            Alert.alert('✅ Temporada eliminada correctamente');

            if (ligaSeleccionada) {
            const recarga = await api.get(`/categorias/por-liga/${ligaSeleccionada._id}`);
            setCategorias(recarga.data);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
            Alert.alert('⚠ No se encontró la temporada para esta categoría.');
            } else {
            console.error('❌ Error al eliminar temporada:', error);
            Alert.alert('❌ Error al eliminar la temporada');
            }
        }
        };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Buscar liga</Text>
      <TextInput
        placeholder="Ej. Liga Municipal"
        placeholderTextColor="#888"
        value={ligaBuscada}
        onChangeText={buscarLigas}
        style={styles.input}
      />

      {ligas.map((liga) => (
        <TouchableOpacity
          key={liga._id}
          style={styles.cardSugerencia}
          onPress={() => seleccionarLiga(liga)}
        >
          <Text style={styles.nombreSugerencia}>{liga.nombre}</Text>
          <Text style={styles.detalleSugerencia}>Presiona para seleccionar</Text>
        </TouchableOpacity>
      ))}

      {ligaSeleccionada && (
        <>
          <Text style={styles.titulo}>
            Categorías de {ligaSeleccionada?.nombre ?? '...'}
          </Text>

          {categorias.length === 0 ? (
            <Text style={{ marginTop: 10 }}>No hay categorías disponibles.</Text>
          ) : (
            <FlatList<CategoriaConInfo>
            data={categorias}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => confirmarTemporada(item)}
                    >
                    <Text style={styles.nombreCategoria}>{item.nombre}</Text>
                    {item.nombreTemporada ? (
                        <Text style={styles.nombreTemporada}>📅 {item.nombreTemporada}</Text>
                      ) : null}
                    <Text>Equipos: {item.totalEquipos}</Text>
                    <Text
                      style={{
                        color: item.temporadaActiva ? 'green' : item.tieneTemporada ? 'gray' : 'orange',
                        fontWeight: 'bold',
                        marginTop: 4
                      }}
                    >
                      {item.temporadaActiva
                        ? '✅ Temporada activa'
                        : item.tieneTemporada
                        ? '⚠ Temporada finalizada'
                        : '⚠ Sin temporada'}
                    </Text>
                    {item.tieneTemporada && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableOpacity
                        style={[styles.botonAccion, { backgroundColor: '#2196F3' }]}
                        onPress={() =>
                        router.push({
                            pathname: '/(admin)/temporadas/detalle',
                            params: {
                            temporadaId: item.temporadaId,
                            categoriaId: item._id,
                            nombreCategoria: item.nombre,
                            ligaId: ligaSeleccionada._id,
                            nombreLiga: ligaSeleccionada.nombre
                            }
                        } as any)
                        }
                        >
                        <Text style={styles.textoBoton}>Ver Detalle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                        style={[styles.botonAccion, { backgroundColor: '#FFA500' }]}
                        onPress={() => editarTemporada(item)}
                        >
                        <Text style={styles.textoBoton}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                        style={[styles.botonAccion, { backgroundColor: '#FF4444' }]}
                        onPress={() => eliminarTemporada(item._id)}
                        >
                        <Text style={styles.textoBoton}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                    )}
             </TouchableOpacity>
            )}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: 'bold', marginBottom: 6 },
  input: {
    color: '#000',
    borderWidth: 1, borderColor: '#ccc',
    padding: 8, borderRadius: 6, marginBottom: 10
  },
  resultado: {
    padding: 8, backgroundColor: '#f0f0f0',
    borderRadius: 4, marginBottom: 6
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10
  },
  card: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8
  },
  nombreCategoria: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  botonAccion: {
  flex: 1,
  padding: 8,
  marginHorizontal: 5,
  borderRadius: 6,
  alignItems: 'center'
},
textoBoton: {
  color: 'white',
  fontWeight: 'bold'
},
cardSugerencia: {
  backgroundColor: '#e0ecff',
  borderWidth: 1,
  borderColor: '#1E90FF',
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
nombreSugerencia: {
  fontWeight: 'bold',
  fontSize: 16,
  color: '#003366',
},
detalleSugerencia: {
  fontSize: 13,
  color: '#555',
  marginTop: 4,
},
nombreTemporada: {
  fontSize: 14,
  color: '#333',
  marginTop: 2,
}

});