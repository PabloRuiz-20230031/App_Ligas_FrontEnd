import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';

const ESCUDO_DEFECTO = 'https://res.cloudinary.com/dkxz5wm2h/image/upload/v1755196792/dtlerpe2tfqd04gjjxqv.webp';

export default function DetalleEquipoPublico() {
  const { equipoId, ligaId, categoriaId } = useLocalSearchParams();
  const router = useRouter();
  const [equipo, setEquipo] = useState<any>(null);
  const ligaIdStr = Array.isArray(ligaId) ? ligaId[0] : ligaId;
  const categoriaIdStr = Array.isArray(categoriaId) ? categoriaId[0] : categoriaId;
  const [tabla, setTabla] = useState<any[]>([]);
  const [goleadores, setGoleadores] = useState<any[]>([]);
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [jornadasEquipo, setJornadasEquipo] = useState<any[]>([]);
  const [temporadasActivas, setTemporadasActivas] = useState([]);
  const [cargandoTemporadas, setCargandoTemporadas] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const obtenerTemporadas = async () => {
      try {
        const res = await api.get(`/temporadas/activas/${ligaId}`);
        setTemporadasActivas(res.data);
      } catch (error) {
        console.error('❌ Error al obtener temporadas activas:', error);
      } finally {
        setCargandoTemporadas(false);
      }
    };

    if (ligaId) obtenerTemporadas();
  }, [ligaId]);

 useEffect(() => {
  const fetchDatos = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const resEquipo = await api.get(`/equipos/${equipoId}/info`, { headers });
      setEquipo(resEquipo.data);

      try {
        const temporadaRes = await api.get(`/temporadas/categoria/${resEquipo.data.categoria}`, { headers });
        const temporadaId = temporadaRes.data._id;

        const [tablaRes, goleadoresRes, tarjetasRes, jornadasRes] = await Promise.all([
          api.get(`/temporadas/tabla/${temporadaId}`, { headers }),
          api.get(`/goleo/${temporadaId}`, { headers }),
          api.get(`/tarjetas/${temporadaId}`, { headers }),
          api.get(`/temporadas/jornadas/${temporadaId}`, { headers }),
        ]);

        setTabla(tablaRes.data);
        setGoleadores(goleadoresRes.data);
        setTarjetas(tarjetasRes.data);
        setJornadasEquipo(jornadasRes.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('No hay temporada para esta categoría.');
          return;
        }
        console.error('Error al cargar datos de la temporada:', error);
      }

    } catch (error) {
      console.error('❌ Error al obtener la información del equipo:', error);
    }
  };

  if (equipoId) fetchDatos();
}, [equipoId]);

  return (
    <ScrollView style={styles.container}>
      {equipo && (
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={{ uri: equipo.imagen || ESCUDO_DEFECTO }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>{equipo.nombre}</Text>
          <Text style={{ marginTop: 4 }}>{equipo.descripcion}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>Creado el {new Date(equipo.createdAt).toLocaleDateString()}</Text>
        </View>
      )}

      <Text style={styles.titulo}>Jugadores</Text>
      {equipo?.jugadores.map((j: any, i: number) => (
        <View key={i} style={styles.cardJornada}><Text>{j.nombre} (#{j.dorsal})</Text></View>
      ))}

      <Text style={styles.titulo}>Representantes</Text>
      {equipo?.representantes.map((r: any, i: number) => (
        <View key={i} style={styles.cardJornada}><Text>{r.nombre}</Text></View>
      ))}

      {!cargandoTemporadas && temporadasActivas.length === 0 && (
        <Text style={styles.mensajeSinTemporada}>
          Este equipo no se encuentra jugando ninguna temporada. Espera actualizaciones 😀.
        </Text>
      )}

      {temporadasActivas.length > 0 && (
        <>
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
                    <Image source={{ uri: fila.equipo.imagen || ESCUDO_DEFECTO }} style={styles.escudo} />
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

          <Text style={styles.subtitulo}>Jornadas del Equipo</Text>
          {jornadasEquipo.map((jornada, index) => {
            const partidosDelEquipo = jornada.partidos.filter(
              (p: any) =>
                p.equipoLocal?._id === equipo._id ||
                p.equipoVisitante?._id === equipo._id
            );

            if (partidosDelEquipo.length === 0) return null;

            return (
              <View key={index} style={styles.cardJornada}>
                <Text style={styles.nombreJornada}>Jornada {jornada.numero}</Text>

                {partidosDelEquipo.map((partido: any, i: number) => (
                  <Pressable
                    key={i}
                    style={styles.cardPartido}
                    onPress={() => {
                      if (!partido.cedula) {
                        alert('No se puede visualizar los partidos pendientes');
                        return;
                      }

                      router.push({
                        pathname: '/ligas/[ligaId]/categorias/[categoriaId]/equipos/partidos/[partidoId]',
                        params: {
                          ligaId: ligaIdStr,
                          categoriaId: categoriaIdStr,
                          partidoId: partido._id
                        }
                      });
                    }}
                  >
                    <View style={styles.equipo}>
                      <Image
                        source={{ uri: partido.equipoLocal?.imagen || ESCUDO_DEFECTO }}
                        style={styles.escudo}
                      />
                      <Text style={styles.nombreEquipo}>
                        {partido.equipoLocal?.nombre || 'Descanso'}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.vs}>VS</Text>
                      <Text
                        style={[
                          styles.estadoPartido,
                          partido.cedula ? styles.jugado : styles.pendiente
                        ]}
                      >
                        {partido.cedula ? 'Jugado' : 'Pendiente'}
                      </Text>
                    </View>

                    <View style={styles.equipo}>
                      <Image
                        source={{ uri: partido.equipoVisitante?.imagen || ESCUDO_DEFECTO }}
                        style={styles.escudo}
                      />
                      <Text style={styles.nombreEquipo}>
                        {partido.equipoVisitante?.nombre || 'Descanso'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            );
          })}

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
            <View style={styles.tablaTarjetas}>
              <View style={styles.filaHeaderTarjetas}>
                <Text style={styles.celdaHeaderTarjetasJugador}>Jugador</Text>
                <Text style={styles.celdaHeaderTarjetasEquipo}>Equipo</Text>
                <Text style={styles.celdaHeaderTarjetas}>Tarjetas Amarillas</Text>
                <Text style={styles.celdaHeaderTarjetas}>Tarjetas Rojas</Text>
              </View>
              {tarjetas.map((t, i) => (
                <View key={i} style={styles.filaTarjetas}>
                  <Text style={styles.celdaTarjetasJugador}>{t.jugador.nombre} #{t.jugador.dorsal}</Text>
                  <Text style={styles.celdaTarjetasEquipo}>{t.equipo.nombre}</Text>
                  <Text style={styles.celdaTarjetas}>{t.amarillas}</Text>
                  <Text style={styles.celdaTarjetas}>{t.rojas}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  mensajeSinTemporada: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 16,
  },
  tabla: { borderWidth: 1, borderColor: '#ccc', minWidth: 650 },
  filaHeader: { flexDirection: 'row', backgroundColor: '#1E2A38', paddingVertical: 6 },
  fila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#ccc' },
  celdaHeader: { flex: 1, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'center' },
  celdaHeaderEquipo: { width: 140, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'center' },
  celda: { flex: 1, fontSize: 12, textAlign: 'center' },
  celdaEquipo: { width: 140, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  escudo: { width: 24, height: 24, borderRadius: 12 },
  nombreEquipo: { fontSize: 12 },
  cardJornada: { gap: 12, marginBottom: 12, backgroundColor: '#f1f1f1', padding: 10, borderRadius: 6 },
  tablaGoleo: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden', width: '100%' },
  filaHeaderGoleo: { flexDirection: 'row', backgroundColor: '#1E2A38' },
  filaGoleo: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
  celdaHeaderJugador: { width: 130, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'left', padding: 6 },
  celdaHeaderGoles: { width: 50, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'left', padding: 6 },
  celdaJugador: { width: 130, fontSize: 12, textAlign: 'left', padding: 6 },
  celdaGoles: { width: 50, fontSize: 12, textAlign: 'left', padding: 6 },
  celdaHeaderTarjetasJugador: { width: 130, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'left', padding: 6 },
  celdaHeaderTarjetasEquipo: { width: 120, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'left', padding: 6 },
  celdaHeaderTarjetas: { width: 80, fontWeight: 'bold', fontSize: 12, color: '#fff', textAlign: 'center', padding: 6 },
  celdaTarjetasJugador: { width: 130, fontSize: 12, textAlign: 'left', padding: 6 },
  celdaTarjetasEquipo: { width: 120, fontSize: 12, textAlign: 'left', padding: 6 },
  tablaTarjetas: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden', marginBottom: 24 },
  filaHeaderTarjetas: { flexDirection: 'row', backgroundColor: '#1E2A38' },
  filaTarjetas: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
  celdaTarjetas: { width: 80, fontSize: 12, textAlign: 'center', padding: 6 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  nombreJornada: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#333' },
  cardPartido: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f8f8', padding: 10, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#ccc' },
  equipo: { flex: 1, alignItems: 'center' },
  vs: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  estadoPartido: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  jugado: { color: 'green' },
  pendiente: { color: 'red' }
});
