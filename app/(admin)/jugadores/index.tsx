import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, StyleSheet, Button, Alert, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '@/api';
import { ScrollView } from 'react-native';

type Liga = { _id: string; nombre: string };
type Categoria = { _id: string; nombre: string; liga: { _id: string; nombre: string } };
type Equipo = { _id: string; nombre: string; categoria: { _id: string; nombre: string } };
type Jugador = {
  _id: string;
  nombre: string;
  curp: string;
  dorsal: number;
  fechaNacimiento: string;
  foto?: string;
  equipo: string | { _id: string; nombre: string };
};
type Representante = {
  _id: string;
  nombre: string;
  curp: string;
  telefono: string;
  correo: string;
  equipo: string | { _id: string; nombre: string };
};

const calcularEdad = (fecha: string): number => {
  const nacimiento = new Date(fecha);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

export default function IndexJugadores() {
    const router = useRouter();

    const [ligas, setLigas] = useState<Liga[]>([]);
    const [busquedaLiga, setBusquedaLiga] = useState('');
    const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [busquedaCategoria, setBusquedaCategoria] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [busquedaEquipo, setBusquedaEquipo] = useState('');
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);

    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [representantes, setRepresentantes] = useState<any[]>([]);

  // Buscar ligas al cargar
  useEffect(() => {
    const fetchLigas = async () => {
      const res = await api.get('/ligas');
      setLigas(res.data);
    };
    fetchLigas();
  }, []);

  // Buscar categorías de la liga seleccionada
  useEffect(() => {
    if (ligaSeleccionada) {
      const fetchCategorias = async () => {
        const res = await api.get(`/categorias/por-liga/${ligaSeleccionada._id}`);
        setCategorias(res.data);
      };
      fetchCategorias();
    }
  }, [ligaSeleccionada]);

  // Buscar equipos de la categoría seleccionada
  useEffect(() => {
    if (categoriaSeleccionada) {
      const fetchEquipos = async () => {
        const res = await api.get('/equipos');
        const filtrados = res.data.filter((e: Equipo) => e.categoria._id === categoriaSeleccionada._id);
        setEquipos(filtrados);
      };
      fetchEquipos();
    }
  }, [categoriaSeleccionada]);

  // Buscar jugadores del equipo seleccionado
  useFocusEffect(
    useCallback(() => {
      if (equipoSeleccionado) {
        const fetchDatos = async () => {
          try {
            const resJugadores = await api.get(`/jugadores/equipo/${equipoSeleccionado._id}`);
            setJugadores(resJugadores.data);

            const resRepresentantes = await api.get(`/representantes/equipo/${equipoSeleccionado._id}`);
            setRepresentantes(resRepresentantes.data);
          } catch (error) {
            console.error('Error al cargar jugadores o representantes:', error);
            Alert.alert('Error al cargar datos del equipo');
          }
        };
        fetchDatos();
      }
    }, [equipoSeleccionado])
  );


  const confirmarEliminacionJugador = (id: string) => {
    Alert.alert('¿Eliminar jugador?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => eliminarJugador(id),
      },
    ]);
  };

  const eliminarJugador = async (id: string) => {
    try {
      await api.delete(`/jugadores/${id}`);
      setJugadores(prev => prev.filter(j => j._id !== id));
      Alert.alert('Jugador eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar', error);
      Alert.alert('Error al eliminar el jugador');
    }
  };

  const confirmarEliminacionRepresentante = (id: string) => {
    Alert.alert('¿Eliminar representante?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => eliminarRepresentante(id),
      },
    ]);
  };

  const eliminarRepresentante = async (id: string) => {
    try {
      await api.delete(`/representantes/${id}`);
      setRepresentantes(prev => prev.filter(r => r._id !== id));
      Alert.alert('Representante eliminado');
    } catch (error) {
      Alert.alert('Error al eliminar representante');
    }
  };

  const ligasFiltradas = busquedaLiga.length > 0
    ? ligas.filter(l => l.nombre.toLowerCase().includes(busquedaLiga.toLowerCase()))
    : [];

  const categoriasFiltradas = busquedaCategoria.length > 0
    ? categorias.filter(c => c.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()))
    : [];

  const equiposFiltrados = busquedaEquipo.length > 0
    ? equipos.filter(e => e.nombre.toLowerCase().includes(busquedaEquipo.toLowerCase()))
    : [];

    return (
       <ScrollView /*contentContainerStyle={styles.scrollContainer}*/>
    <View style={styles.container}>
        <Text style={styles.title}>Jugadores y Representantes</Text>

        {!ligaSeleccionada ? (
        <>
            <TextInput
            style={styles.input}
            placeholder="Escribe el nombre de la liga"
            value={busquedaLiga}
            onChangeText={setBusquedaLiga}
            />
            {ligasFiltradas.map(l => (
            <TouchableOpacity key={l._id} style={styles.suggestion} onPress={() => setLigaSeleccionada(l)}>
                <Text>{l.nombre}</Text>
            </TouchableOpacity>
            ))}
        </>
        ) : !categoriaSeleccionada ? (
        <>
            <Text style={styles.info}>Liga Seleccionada: <Text style={{ fontWeight: 'bold' }}>{ligaSeleccionada.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setLigaSeleccionada(null);
            setBusquedaLiga('');
            setCategorias([]);
            setCategoriaSeleccionada(null);
            setEquipoSeleccionado(null);
            setJugadores([]);
            setRepresentantes([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Liga</Text>
            </Pressable>

            <TextInput
            style={styles.input}
            placeholder="Escribe el nombre de la categoría"
            value={busquedaCategoria}
            onChangeText={setBusquedaCategoria}
            />
            {categoriasFiltradas.map(c => (
            <TouchableOpacity key={c._id} style={styles.suggestion} onPress={() => setCategoriaSeleccionada(c)}>
                <Text>{c.nombre}</Text>
            </TouchableOpacity>
            ))}
        </>
        ) : !equipoSeleccionado ? (
        <>
            <Text style={styles.info}>Liga Seleccionada: <Text style={{ fontWeight: 'bold' }}>{ligaSeleccionada.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setLigaSeleccionada(null);
            setBusquedaLiga('');
            setCategorias([]);
            setCategoriaSeleccionada(null);
            setEquipoSeleccionado(null);
            setJugadores([]);
            setRepresentantes([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Liga</Text>
            </Pressable>

            <Text style={styles.info}>Categoría Seleccionada: <Text style={{ fontWeight: 'bold' }}>{categoriaSeleccionada.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setCategoriaSeleccionada(null);
            setBusquedaCategoria('');
            setEquipos([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Categoría</Text>
            </Pressable>

            <TextInput
            style={styles.input}
            placeholder="Escribe el nombre del equipo"
            value={busquedaEquipo}
            onChangeText={setBusquedaEquipo}
            />
            {equiposFiltrados.map(e => (
            <TouchableOpacity key={e._id} style={styles.suggestion} onPress={() => setEquipoSeleccionado(e)}>
                <Text>{e.nombre}</Text>
            </TouchableOpacity>
            ))}
        </>
        ) : (
        <>
            <Text style={styles.info}>Liga Seleccionada: <Text style={{ fontWeight: 'bold' }}>{ligaSeleccionada.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setLigaSeleccionada(null);
            setBusquedaLiga('');
            setCategorias([]);
            setCategoriaSeleccionada(null);
            setEquipoSeleccionado(null);
            setJugadores([]);
            setRepresentantes([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Liga</Text>
            </Pressable>

            <Text style={styles.info}>Categoría Seleccionada: <Text style={{ fontWeight: 'bold' }}>{categoriaSeleccionada.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setCategoriaSeleccionada(null);
            setBusquedaCategoria('');
            setEquipos([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Categoría</Text>
            </Pressable>

            <Text style={styles.info}>Equipo Seleccionado: <Text style={{ fontWeight: 'bold' }}>{equipoSeleccionado.nombre}</Text></Text>
            <Pressable style={styles.btnGray} onPress={() => {
            setEquipoSeleccionado(null);
            setBusquedaEquipo('');
            setJugadores([]);
            setRepresentantes([]);
            }}>
            <Text style={styles.btnGrayText}>Cambiar Equipo</Text>
            </Pressable>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Button
                title="Registrar nuevo jugador o representante"
                color="#1E90FF"
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/jugadores/formulario',
                    params: { equipoId: equipoSeleccionado._id }
                  })
                }
              />
            </View>

            {jugadores.length === 0 && representantes.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Aún no hay jugadores ni representantes registrados para este equipo</Text>
            ) : (
            <>
                {jugadores.map((item: Jugador) => (
                <View key={item._id} style={[styles.card, { backgroundColor: '#e6f2de' }]}>
                    <Text style={styles.tipo}>Jugador</Text>
                    <View style={styles.cardContenido}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text>CURP: {item.curp}</Text>
                        <Text>Dorsal: {item.dorsal}</Text>
                        <Text>Edad: {calcularEdad(item.fechaNacimiento)} años</Text>
                    </View>
                    <Image
                        source={{ uri: item.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                        style={styles.avatar}
                    />
                   </View>
                   <View style={styles.botones}>
                        <TouchableOpacity
                          style={styles.botonEditar}
                          onPress={() =>
                            router.push({
                              pathname: '/(admin)/jugadores/formulario',
                              params: { jugadorId: item._id, modo: 'editar', equipoId: equipoSeleccionado._id }
                            })
                          }
                        >
                          <Text style={styles.textoBoton}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.botonEliminar}
                          onPress={() => confirmarEliminacionJugador(item._id)}
                        >
                          <Text style={styles.textoBoton}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                </View>
                ))}

                {representantes.map((item) => (
                <View key={item._id} style={[styles.card, { backgroundColor: '#dde6f9' }]}>
                    <Text style={styles.tipo}>Representante</Text>
                    <Text style={styles.nombre}>{item.nombre}</Text>
                    <Text>CURP: {item.curp}</Text>
                    <Text>Teléfono: {item.telefono}</Text>
                    <Text>Correo electrónico: {item.correo}</Text>
                     <View style={styles.botones}>
                      <TouchableOpacity
                        style={styles.botonEditar}
                        onPress={() =>
                          router.push({
                            pathname: '/(admin)/jugadores/formulario',
                            params: { representanteId: item._id, modo: 'editar', equipoId: equipoSeleccionado._id }
                          })
                        }
                      >
                        <Text style={styles.textoBoton}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.botonEliminar}
                        onPress={() => confirmarEliminacionRepresentante(item._id)}
                      >
                        <Text style={styles.textoBoton}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                ))}
            </>
            )}

            
        </>
        )}
    </View>
    </ScrollView>
    );

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 10
  },
  suggestion: {
    padding: 10, backgroundColor: '#eee', marginBottom: 5, borderRadius: 5,
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
  nombre: { fontSize: 16, fontWeight: 'bold' },
  imagenCircular: { width: 50, height: 50, borderRadius: 25, marginBottom: 10 },
  botonEditar: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: 10 
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
  tipo: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
    },
    cardContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    },
    avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    },
});
