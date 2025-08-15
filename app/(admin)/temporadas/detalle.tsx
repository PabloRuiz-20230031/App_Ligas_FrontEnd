import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import api from '@/api';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';


const ESCUDO_DEFECTO = 'https://res.cloudinary.com/dkxz5wm2h/image/upload/v1755196792/dtlerpe2tfqd04gjjxqv.webp';

type TablaPosicion = {
  equipo: {
    _id: string;
    nombre: string;
    imagen?: string;
  };
  PJ: number;
  PG: number;
  PE: number;
  PP: number;
  GF: number;
  GC: number;
  DIF: number;
  PTS: number;
};

type Partido = {
  _id: string;
  equipoLocal: { nombre: string; imagen?: string };
  equipoVisitante: { nombre: string; imagen?: string };
  vuelta: number;
  cedula?: string | null;
};

type Jornada = {
  numero: number;
  partidos: Partido[];
};

type Goleador = {
  jugador: {
    _id: string;
    nombre: string;
  };
  equipo: {
    _id: string;
    nombre: string;
  };
  dorsal: number;
  goles: number;
};

export default function DetalleTemporada() {
  const params = useLocalSearchParams();
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [tabla, setTabla] = useState<TablaPosicion[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState<number | null>(null);
  const [sinTemporada, setSinTemporada] = useState(false);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [tarjetas, setTarjetas] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const cargarDatos = async () => {
        try {
          console.log('📌 categoriaId:', categoriaId);
          const temporadaRes = await api.get(`/temporadas/categoria/${categoriaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const temporadaId = temporadaRes.data._id;

          const [tablaRes, tarjetasRes, jornadasRes, goleoRes] = await Promise.all([
            api.get(`/temporadas/tabla/${temporadaId}`, { headers: { Authorization: `Bearer ${token}` } }),
            api.get(`/tarjetas/${temporadaId}`, { headers: { Authorization: `Bearer ${token}` } }),
            api.get(`/temporadas/jornadas/${temporadaId}`, { headers: { Authorization: `Bearer ${token}` } }),
            api.get(`/goleo/${temporadaId}`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          setTabla(tablaRes.data);
          setTarjetas(tarjetasRes.data);
          setJornadas(jornadasRes.data);
          setGoleadores(goleoRes.data);

          if (jornadasRes.data.length > 0) {
            setJornadaSeleccionada(jornadasRes.data[0].numero);
          }

          setSinTemporada(false);
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.warn('⚠ No hay temporada activa para esta categoría');
            setSinTemporada(true);
          } else {
            console.error('Error al cargar detalle de temporada:', error);
          }
        }
      };

      if (categoriaId) cargarDatos();
    }, [categoriaId, token])
  );

  useEffect(() => {
    if (params?.categoriaId) {
      setCategoriaId(params.categoriaId as string);
    }
  }, [params]);

    useFocusEffect(
    useCallback(() => {
        const onBackPress = () => {
        router.replace('/(admin)/temporadas');
        return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
        subscription.remove();
        };
    }, [])
    );

  const jornadaActual = jornadas.find(j => j.numero === jornadaSeleccionada);

  return (
    <ScrollView style={styles.container}>
      {sinTemporada && (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 20 }}>
          No hay una temporada activa para esta categoría.
        </Text>
      )}

      <Text style={styles.titulo}>Tabla de Posiciones</Text>

      <ScrollView horizontal>
        <View style={styles.tabla}>
          <View style={styles.filaHeader}>
            <Text style={styles.celdaHeaderEquipo}>Equipo</Text>
            {['PTS', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DIF'].map((label) => (
              <Text key={label} style={styles.celdaHeader}>{label}</Text>
            ))}
          </View>

          {tabla.map((fila, index) => (
            <View key={index} style={styles.fila}>
              <View style={styles.celdaEquipo}>
                <Image
                  source={{ uri: fila.equipo.imagen || ESCUDO_DEFECTO }}
                  style={styles.escudo}
                />
                <Text style={styles.nombreEquipo}>{fila.equipo.nombre}</Text>
              </View>
              <Text style={styles.celda}>{fila.PTS}</Text>
              <Text style={styles.celda}>{fila.PJ}</Text>
              <Text style={styles.celda}>{fila.PG}</Text>
              <Text style={styles.celda}>{fila.PE}</Text>
              <Text style={styles.celda}>{fila.PP}</Text>
              <Text style={styles.celda}>{fila.GF}</Text>
              <Text style={styles.celda}>{fila.GC}</Text>
              <Text style={styles.celda}>{fila.DIF}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.titulo}>Jornadas</Text>

      {jornadas.length > 0 && (
        <Picker
          selectedValue={jornadaSeleccionada ?? undefined}
          onValueChange={(valor) => setJornadaSeleccionada(valor)}
          style={styles.picker}
        >
          {jornadas.map(j => (
            <Picker.Item key={j.numero} label={`Jornada ${j.numero}`} value={j.numero} />
          ))}
        </Picker>
      )}

      {jornadaActual && (
        <View style={styles.cardJornada}>
          {jornadaActual.partidos.map((partido, i) => (
            <Pressable
                key={i}
                style={styles.cardPartido}
                onPress={() => {
                    const nombreLocal = partido.equipoLocal?.nombre?.toLowerCase();
                    const nombreVisitante = partido.equipoVisitante?.nombre?.toLowerCase();

                    if (partido.cedula == null) {
                    alert('No se puede visualizar los partidos pendientes');
                    return;
}

                    router.push({
                    pathname: '/(admin)/temporadas/[partidoId]',
                    params: { partidoId: partido._id }
                    });
                }}
                >
                <View style={styles.equipo}>
                    <Image source={{ uri: partido.equipoLocal?.imagen || ESCUDO_DEFECTO }} style={styles.escudo} />
                    <Text style={styles.nombreEquipo}>{partido.equipoLocal?.nombre || 'Descanso'}</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.vs}>VS</Text>
                    <Text style={[styles.estadoPartido, partido.cedula ? styles.jugado : styles.pendiente]}>
                    {partido.cedula ? 'Jugado' : 'Pendiente'}
                    </Text>
                </View>

                <View style={styles.equipo}>
                    <Image source={{ uri: partido.equipoVisitante?.imagen || ESCUDO_DEFECTO }} style={styles.escudo} />
                    <Text style={styles.nombreEquipo}>{partido.equipoVisitante?.nombre || 'Descanso'}</Text>
                </View>
                </Pressable>

          ))}
        </View>
      )}

      {goleadores.length > 0 && (
        <>
            <Text style={styles.titulo}>Tabla de Goleo</Text>
            <View style={styles.tablaGoleo}>
            <View style={styles.filaHeaderGoleo}>
                <Text style={styles.celdaHeaderJugador}>Jugador</Text>
                <Text style={styles.celdaHeaderEquipo}>Equipo</Text>
                <Text style={styles.celdaHeaderGoles}>Goles</Text>
            </View>
            {goleadores.map((g, index) => (
                <View key={index} style={styles.filaGoleo}>
                <Text style={styles.celdaJugador}>{g.jugador.nombre}</Text>
                <Text style={styles.celdaEquipo}>{g.equipo.nombre}</Text>
                <Text style={styles.celdaGoles}>{g.goles}</Text>
                </View>
            ))}
            </View>
        </>
        )}
        <Text style={styles.titulo}>Tabla de Tarjetas</Text>
        <ScrollView horizontal>
            {tarjetas.length > 0 && (
                <>

                    <View style={styles.tablaTarjetas}>
                    <View style={styles.filaHeaderTarjetas}>
                        <Text style={styles.celdaHeaderTarjetasJugador}>Jugador</Text>
                        <Text style={styles.celdaHeaderTarjetasEquipo}>Equipo</Text>
                        <Text style={styles.celdaHeaderTarjetas}>Tarjetas Amarillas</Text>
                        <Text style={styles.celdaHeaderTarjetas}>Tarjetas Rojas</Text>
                    </View>

                    {tarjetas.map((t, index) => (
                        <View key={index} style={styles.filaTarjetas}>
                        <Text style={styles.celdaTarjetasJugador}>{t.jugador.nombre} {t.jugador.dorsal}</Text>
                        <Text style={styles.celdaTarjetasEquipo}>{t.equipo.nombre}</Text>
                        <Text style={styles.celdaTarjetas}>{t.amarillas}</Text>
                        <Text style={styles.celdaTarjetas}>{t.rojas}</Text>
                        </View>
                    ))}
                    </View>
                </>
                )}
                </ScrollView>
            </ScrollView>
        );
        }

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  tabla: { borderWidth: 1, borderColor: '#ccc', minWidth: 650 },
  filaHeader: { flexDirection: 'row', backgroundColor: '#1E2A38', paddingVertical: 6 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  celdaHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  celdaHeaderEquipo: {
    width: 140,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  celda: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  celdaEquipo: {
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  escudo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  nombreEquipo: {
    fontSize: 12,
  },
  picker: {
    color: '#000',
    marginBottom: 12
  },
  cardJornada: {
    gap: 12,
    marginBottom: 24
  },
  cardPartido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10
  },
  equipo: {
    alignItems: 'center',
    width: 90
  },
  vs: {
    fontWeight: 'bold',
    fontSize: 16
  },
    tablaGoleo: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  overflow: 'hidden',
  width: '100%',
},

filaHeaderGoleo: {
  flexDirection: 'row',
  backgroundColor: '#1E2A38',
},

filaGoleo: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: '#ccc',
},

celdaHeaderJugador: {
  width: 130,
  fontWeight: 'bold',
  fontSize: 12,
  color: '#fff',
  textAlign: 'left',
  padding: 6,
},
celdaHeaderGoles: {
  width: 50,
  fontWeight: 'bold',
  fontSize: 12,
  color: '#fff',
  textAlign: 'left',
  padding: 6,
},

celdaJugador: {
  width: 130,
  fontSize: 12,
  textAlign: 'left',
  padding: 6,
},
celdaGoles: {
  width: 50,
  fontSize: 12,
  textAlign: 'left',
  padding: 6,
},
estadoPartido: {
  fontSize: 12,
  fontWeight: 'bold',
  marginTop: 4,
},
jugado: {
  color: 'green',
},
pendiente: {
  color: 'red',
},
tablaTarjetas: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  overflow: 'hidden',
  marginBottom: 24,
},

filaHeaderTarjetas: {
  flexDirection: 'row',
  backgroundColor: '#1E2A38',
},

filaTarjetas: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: '#ccc',
},

celdaHeaderTarjetasJugador: {
  width: 130,
  fontWeight: 'bold',
  fontSize: 12,
  color: '#fff',
  textAlign: 'left',
  padding: 6,
},

celdaHeaderTarjetasEquipo: {
  width: 120,
  fontWeight: 'bold',
  fontSize: 12,
  color: '#fff',
  textAlign: 'left',
  padding: 6,
},

celdaHeaderTarjetas: {
  width: 80,
  fontWeight: 'bold',
  fontSize: 12,
  color: '#fff',
  textAlign: 'center',
  padding: 6,
},

celdaTarjetasJugador: {
  width: 130,
  fontSize: 12,
  textAlign: 'left',
  padding: 6,
},

celdaTarjetasEquipo: {
  width: 120,
  fontSize: 12,
  textAlign: 'left',
  padding: 6,
},

celdaTarjetas: {
  width: 80,
  fontSize: 12,
  textAlign: 'center',
  padding: 6,
},
});
