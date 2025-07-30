import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '@/api';

const ESCUDO_DEFECTO = 'https://res.cloudinary.com/dprwy1viz/image/upload/v1721531371/escudo_default.png';

export default function DetallePartidoPublico() {
  const { partidoId } = useLocalSearchParams();
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cedulas/partido/${partidoId}`);
        setDatos(res.data);
      } catch (error) {
        console.error('❌ Error al obtener datos del partido:', error);
      }
    };

    fetchData();
  }, [partidoId]);

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

    datos.anotadoresLocal?.forEach((a: any) => {
      eventos.push({ lado: 'izquierda', texto: `${a.jugador?.nombre} – Min ${a.minuto}`, icono: '⚽', tipo: 'goles' });
    });

    datos.anotadoresVisitante?.forEach((a: any) => {
      eventos.push({ lado: 'derecha', texto: `${a.jugador?.nombre} – Min ${a.minuto}`, icono: '⚽', tipo: 'goles' });
    });

    datos.autogoles?.forEach((a: any) => {
      const lado = a.equipo === datos.equipoLocal._id ? 'izquierda' : 'derecha';
      eventos.push({ lado, texto: `Autogol – Min ${a.minuto}`, icono: '⚽', tipo: 'goles' });
    });

    datos.amonestaciones?.forEach((a: any) => {
      const lado = a.jugador?.equipo === datos.equipoLocal._id ? 'derecha' : 'izquierda';
      eventos.push({ lado, texto: `${a.jugador?.nombre} – Min ${a.minuto}`, icono: '🟨', tipo: 'amarillas' });
    });

    datos.expulsiones?.forEach((a: any) => {
      const lado = a.jugador?.equipo === datos.equipoLocal._id ? 'derecha' : 'izquierda';
      eventos.push({ lado, texto: `${a.jugador?.nombre} – Min ${a.minuto}`, icono: '🟥', tipo: 'rojas' });
    });

    return {
      goles: eventos.filter(e => e.tipo === 'goles'),
      amarillas: eventos.filter(e => e.tipo === 'amarillas'),
      rojas: eventos.filter(e => e.tipo === 'rojas'),
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
