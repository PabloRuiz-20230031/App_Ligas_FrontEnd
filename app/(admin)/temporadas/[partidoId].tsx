import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import api from '@/api';
import { useFocusEffect } from '@react-navigation/native';

const ESCUDO_DEFECTO = 'ttps://res.cloudinary.com/dkxz5wm2h/image/upload/v1755196792/dtlerpe2tfqd04gjjxqv.webph';

export default function DetallePartido() {
  const { partidoId } = useLocalSearchParams();
  const { token } = useContext(AuthContext);
  const [datos, setDatos] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cedulas/partido/${partidoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDatos(res.data);
      } catch (error) {
        console.error('❌ Error al obtener datos del partido:', error);
      }
    };

    fetchData();
  }, [partidoId]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        router.replace('/(admin)/temporadas/detalle');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => subscription.remove();
    }, [])
  );

  if (!datos) {
    return <Text style={{ padding: 16 }}>Cargando datos del partido...</Text>;
  }

  const renderEventos = () => {
    const eventos: {
      lado: 'izquierda' | 'derecha';
      texto: string;
      icono: string;
      tipo: 'goles' | 'amarillas' | 'rojas';
    }[] = [];

    // Goles anotadores
    datos.anotadoresLocal?.forEach((a: any) => {
      eventos.push({
        lado: 'izquierda',
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '⚽',
        tipo: 'goles',
      });
    });

    datos.anotadoresVisitante?.forEach((a: any) => {
      eventos.push({
        lado: 'derecha',
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '⚽',
        tipo: 'goles',
      });
    });

    // Autogoles
    datos.autogoles?.forEach((a: any) => {
      const lado = a.equipo === datos.equipoLocal._id ? 'izquierda' : 'derecha';
      eventos.push({
        lado,
        texto: `Autogol – Min ${a.minuto}`,
        icono: '⚽',
        tipo: 'goles',
      });
    });

    // Amonestaciones
    datos.amonestaciones?.forEach((a: any) => {
      const jugadorId = a.jugador?._id;
      const esLocal = datos.equipoLocal.jugadores?.some((j: any) => j._id === jugadorId);
      const equipoNombre = esLocal ? datos.equipoVisitante.nombre : datos.equipoLocal.nombre;
      const lado = esLocal ? 'derecha' : 'izquierda';
      

      eventos.push({
        lado,
        texto: `${a.jugador?.nombre} (${equipoNombre}) – Dorsal ${a.jugador?.dorsal} – ${a.motivo || 'Sin motivo'} – Min ${a.minuto}`,
        icono: '🟨',
        tipo: 'amarillas',
      });
    });

    // Expulsiones
    datos.expulsiones?.forEach((a: any) => {
      const jugadorId = a.jugador?._id;
      const esLocal = datos.equipoLocal.jugadores?.some((j: any) => j._id === jugadorId);
      const equipoNombre = esLocal ? datos.equipoVisitante.nombre : datos.equipoLocal.nombre;
      const lado = esLocal ? 'derecha' : 'izquierda';

      eventos.push({
        lado,
        texto: `${a.jugador?.nombre} – Dorsal ${a.jugador?.dorsal} – ${a.motivo || 'Sin motivo'} – Min ${a.minuto}`,
        icono: '🟥',
        tipo: 'rojas',
      });
    });

    // Autogoles formateados (extra aparte)
    const autogolesFormateados: string[] = datos.autogoles?.length
      ? datos.autogoles.map((a: any) => {
          const esLocal = a.equipo === datos.equipoLocal._id;
          return `Autogol ${esLocal ? 'local' : 'visitante'} – Min ${a.minuto}`;
        })
      : [];

    return {
      goles: eventos.filter(e => e.tipo === 'goles'),
      amarillas: eventos.filter(e => e.tipo === 'amarillas'),
      rojas: eventos.filter(e => e.tipo === 'rojas'),
      autogolesFormateados
    };
  };

  const eventos = renderEventos();

  const BloqueEventos = ({ titulo, items }: { titulo: string; items: typeof eventos.goles }) => (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.subtitulo}>{titulo}</Text>
      <View style={styles.eventos}>
        <View style={styles.columna}>
          {items.filter(e => e.lado === 'izquierda').map((e, i) => (
            <Text key={i} style={styles.evento}>{e.icono} {e.texto}</Text>
          ))}
        </View>
        <View style={styles.columna}>
          {items.filter(e => e.lado === 'derecha').map((e, i) => (
            <Text key={i} style={styles.evento}>{e.icono} {e.texto}</Text>
          ))}
        </View>
      </View>
      {items.length === 0 && <Text style={styles.sinEventos}>Ninguno</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Detalle del Partido</Text>

      <View style={styles.resultado}>
        <Image source={{ uri: datos.equipoLocal.imagen || ESCUDO_DEFECTO }} style={styles.escudo} />
        <Text style={styles.marcador}>{datos.golesLocal} - {datos.golesVisitante}</Text>
        <Image source={{ uri: datos.equipoVisitante.imagen || ESCUDO_DEFECTO }} style={styles.escudo} />
      </View>

      <View style={styles.nombres}>
        <Text style={styles.nombreEquipo}>{datos.equipoLocal.nombre}</Text>
        <Text style={styles.nombreEquipo}>{datos.equipoVisitante.nombre}</Text>
      </View>

      <BloqueEventos titulo="Goles" items={eventos.goles} />
      <BloqueEventos titulo="Amonestaciones" items={eventos.amarillas} />
      <BloqueEventos titulo="Expulsiones" items={eventos.rojas} />

      <View style={{ marginTop: 20 }}>
        <Text style={styles.subtitulo}>Autogoles</Text>
        {eventos.autogolesFormateados.length === 0 ? (
          <Text style={styles.sinEventos}>Ninguno</Text>
        ) : (
          eventos.autogolesFormateados.map((linea, idx) => (
            <Text key={idx} style={styles.evento}>{linea}</Text>
          ))
        )}
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={styles.subtitulo}>Notas del Partido</Text>
        <Text style={styles.notas}>{datos.notas || 'Sin observaciones.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f8ff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultado: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  marcador: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  escudo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  nombres: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  nombreEquipo: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  columna: {
    flex: 1,
  },
  evento: {
    marginBottom: 6,
    fontSize: 14,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sinEventos: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 4,
  },
  notas: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
});
