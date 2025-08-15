import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import api from '@/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';


type Liga = { _id: string; nombre: string;  };
type Categoria = {
  _id: string;
  nombre: string;
  liga: {
    _id: string;
    nombre: string;
  };
};
type Equipo = {
  _id: string;
  nombre: string;
  imagen?: string;
  categoria?: { _id: string; nombre: string };
};

export default function IndexEquipos() {
  const router = useRouter();

  const [ligas, setLigas] = useState<Liga[]>([]);
  const [busquedaLiga, setBusquedaLiga] = useState('');
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [hayTemporadaActiva, setHayTemporadaActiva] = useState(false);

  const seleccionarLiga = (liga: Liga) => {
  setLigaSeleccionada(liga);
  setBusquedaLiga(liga.nombre);
  setBusquedaCategoria('');
  setCategoriaSeleccionada(null);
};

  useEffect(() => {
    const fetchLigas = async () => {
      const res = await api.get('/ligas');
      setLigas(res.data);
    };
    fetchLigas();
  }, []);

  useEffect(() => {
    if (ligaSeleccionada) {
      const fetchCategorias = async () => {
        const res = await api.get(`/categorias/por-liga/${ligaSeleccionada._id}`);
        setCategorias(res.data);
      };
      fetchCategorias();
    }
  }, [ligaSeleccionada]);


  useEffect(() => {
    if (categoriaSeleccionada) {
      const fetchEquipos = async () => {
        const res = await api.get('/equipos');
        const filtrados = res.data.filter((e: Equipo) => e.categoria?._id === categoriaSeleccionada._id);
        setEquipos(filtrados);
      };
      fetchEquipos();
    }
  }, [categoriaSeleccionada]);
  
  useFocusEffect(
  useCallback(() => {
    if (categoriaSeleccionada) {
      const fetchEquipos = async () => {
        const res = await api.get('/equipos');
        const filtrados = res.data.filter((e: Equipo) => e.categoria?._id === categoriaSeleccionada._id);
        setEquipos(filtrados);
      };
      fetchEquipos();
    }
  }, [categoriaSeleccionada])
);

useEffect(() => {
  if (categoriaSeleccionada) {
    verificarTemporadaActiva(categoriaSeleccionada._id);
  }
}, [categoriaSeleccionada]);


  const ligasFiltradas = busquedaLiga.length > 0
    ? ligas.filter((l) =>
        l.nombre.toLowerCase().includes(busquedaLiga.toLowerCase())
      )
    : [];
    const categoriasFiltradas = busquedaCategoria.length > 0
    ? categorias.filter(c =>
        c.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
      )
    : [];

    const confirmarEliminacion = (id: string) => {
      Alert.alert(
        '¿Eliminar equipo?',
        'Esta acción no se puede deshacer',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => eliminarEquipo(id),
          },
        ]
      );
    };

    const eliminarEquipo = async (id: string) => {
      try {
        await api.delete(`/equipos/${id}`);
        setEquipos(prev => prev.filter(e => e._id !== id)); // ✅ Quita de la lista
        Alert.alert('Equipo eliminado');
      } catch (error) {
        console.log('❌ Error al eliminar', error);
        Alert.alert('Error al eliminar el equipo');
      }
    };

    const verificarTemporadaActiva = async (categoriaId: string) => {
    try {
      const res = await api.get(`/temporadas/activa/${categoriaId}`);
      setHayTemporadaActiva(res.data.activa); // espera que devuelvas `{ activa: true | false }` desde el backend
    } catch (error) {
      console.log('❌ Error al verificar temporada activa', error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Equipo</Text>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1 }}>
          {!ligaSeleccionada ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Escribe el nombre de la liga"
                placeholderTextColor="#888"
                value={busquedaLiga}
                onChangeText={setBusquedaLiga}
              />
              {ligasFiltradas.map((liga) => (
                <TouchableOpacity
                  key={liga._id}
                  style={styles.cardSugerencia}
                  onPress={() => setLigaSeleccionada(liga)}
                >
                  <Text style={styles.nombreSugerencia}>{liga.nombre}</Text>
                  <Text style={styles.detalleSugerencia}>Presiona para seleccionar</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.info}>Liga seleccionada: <Text style={{ fontWeight: 'bold' }}>{ligaSeleccionada.nombre}</Text></Text>
              <Pressable style={styles.btnGray} onPress={() => {
                setLigaSeleccionada(null);
                setBusquedaLiga('');
                setCategoriaSeleccionada(null);
                setBusquedaCategoria('');
                setCategorias([]);
                setEquipos([]);
              }}>
                <Text style={styles.btnGrayText}>Cambiar de liga</Text>
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="Escribe el nombre de la categoría"
                placeholderTextColor="#888"
                value={busquedaCategoria}
                onChangeText={setBusquedaCategoria}
              />
              {!categoriaSeleccionada && categoriasFiltradas.map(cat => (
                <TouchableOpacity
                  key={cat._id}
                  style={styles.cardSugerencia}
                  onPress={() => setCategoriaSeleccionada(cat)}
                >
                  <Text style={styles.nombreSugerencia}>{cat.nombre}</Text>
                  <Text style={styles.detalleSugerencia}>Pertenece a {cat.liga?.nombre || 'sin liga'}</Text>
                </TouchableOpacity>
              ))}

              {categoriaSeleccionada && (
                <>
                  <Text style={styles.info}>Categoría seleccionada: <Text style={{ fontWeight: 'bold' }}>{categoriaSeleccionada.nombre}</Text></Text>
                  <Pressable
                    style={styles.btnGray}
                    onPress={() => {
                      setCategoriaSeleccionada(null);
                      setBusquedaCategoria('');
                      setEquipos([]);
                    }}
                  >
                    <Text style={styles.btnGrayText}>Cambiar de categoría</Text>
                  </Pressable>

                  {categoriaSeleccionada && !hayTemporadaActiva && (
                    <View style={styles.botonCrear}>
                      <Button
                        title="Crear un nuevo Equipo"
                        onPress={() =>
                          router.push({
                            pathname: '/(admin)/equipos/formulario',
                            params: {
                              categoriaId: categoriaSeleccionada._id,
                              modo: 'crear',
                            },
                          })
                        }
                        color="#1E90FF"
                      />
                    </View>
                )}

                  {equipos.length === 0 ? (
                    <Text style={{ marginTop: 20, textAlign: 'center' }}>Aún no hay equipos</Text>
                  ) : (
                    <FlatList
                      data={equipos}
                      keyExtractor={(item) => item._id}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item }) => (
                        <View style={styles.card}>
                          <View style={styles.cardInfo}>
                            {item.imagen && (
                              <Image source={{ uri: item.imagen }} style={styles.imagenCircular} />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.nombre}>{item.nombre}</Text>
                              <Text style={styles.subtitulo}>Categoría: {item.categoria?.nombre}</Text>
                            </View>
                          </View>

                          {!(item.nombre.toLowerCase() === 'descanso' || hayTemporadaActiva) && (
                            <View style={styles.botones}>
                              <TouchableOpacity
                                style={styles.botonEditar}
                                onPress={() =>
                                  router.push({
                                    pathname: '/(admin)/equipos/formulario',
                                    params: {
                                      equipoId: item._id,
                                      modo: 'editar',
                                      categoriaId: item.categoria?._id
                                    }
                                  })
                                }
                              >
                                <Text style={styles.textoBoton}>Editar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.botonEliminar}
                                onPress={() => confirmarEliminacion(item._id)}
                              >
                                <Text style={styles.textoBoton}>Eliminar</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                    />
                  )}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f2f8ff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: {
    color: '#000',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 10
  },
  suggestion: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: { marginBottom: 8 },
  btnGray: {
    backgroundColor: '#ccc', padding: 8,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10,
  },
  btnGrayText: { fontWeight: 'bold', color: '#333' },
  card: {
    borderWidth: 1, borderColor: '#1E90FF', borderRadius: 10,
    padding: 10, marginBottom: 10,
  },
  imagen: {
    width: '100%', height: 150, borderRadius: 8, marginBottom: 10,
  },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  subtitulo: { color: '#555' },
  botonAbajo: {
  paddingTop: 10,
  paddingBottom: 20,
  borderTopWidth: 1,
  borderColor: '#eee',
},
imagenCircular: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 10,
},
cardInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
botones: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 10,
},
botonEditar: {
  backgroundColor: '#007bff',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 5,
},
botonEliminar: {
  backgroundColor: '#dc3545',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 5,
},
textoBoton: {
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
},
cardSugerencia: {
  backgroundColor: '#e0ecff',
  borderWidth: 1,
  borderColor: '#1E90FF',
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
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
botonCrear: {
  marginBottom: 20,
  marginTop: 10,
},
});
