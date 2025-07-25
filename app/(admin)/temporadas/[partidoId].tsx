import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '@/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const ESCUDO_DEFECTO = 'https://res.cloudinary.com/dprwy1viz/image/upload/v1721531371/escudo_default.png';

export default function DetallePartido() {
  const { partidoId } = useLocalSearchParams();
  const { token } = useContext(AuthContext);
  const [datos, setDatos] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`cedulas/partido/${partidoId}`, {
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
        // Regresa manualmente a la pantalla anterior deseada
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
    }[] = [];

    // Goles anotadores
    datos.anotadoresLocal?.forEach((a: any) => {
      eventos.push({
        lado: 'izquierda',
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '⚽',
      });
    });

    datos.anotadoresVisitante?.forEach((a: any) => {
      eventos.push({
        lado: 'derecha',
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '⚽',
      });
    });

    // Autogoles
    datos.autogoles?.forEach((a: any) => {
      const lado = a.equipo === datos.equipoLocal._id ? 'izquierda' : 'derecha';
      eventos.push({
        lado,
        texto: `Autogol – Min ${a.minuto}`,
        icono: '⚽',
      });
    });

    // Amarillas
    datos.amonestaciones?.forEach((a: any) => {
      const lado = a.jugador?.equipo === datos.equipoLocal._id ? 'derecha' : 'izquierda';
      eventos.push({
        lado,
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '🟨',
      });
    });

    // Rojas
    datos.expulsiones?.forEach((a: any) => {
      const lado = a.jugador?.equipo === datos.equipoLocal._id ? 'izquierda' : 'derecha';
      eventos.push({
        lado,
        texto: `${a.jugador?.nombre} – Min ${a.minuto}`,
        icono: '🟥',
      });
    });

    return {
      izquierda: eventos.filter((e) => e.lado === 'izquierda'),
      derecha: eventos.filter((e) => e.lado === 'derecha'),
    };
  };
  const eventos = renderEventos();

  return (
    <ScrollView style={styles.container}>

      <View style={styles.resultado}>
        {/* Escudo local */}
        <Image
          source={{ uri: datos.equipoLocal.imagen || ESCUDO_DEFECTO }}
          style={styles.escudo}
        />
        <Text style={styles.marcador}>
          {datos.golesLocal} - {datos.golesVisitante}
        </Text>
        {/* Escudo visitante */}
        <Image
          source={{ uri: datos.equipoVisitante.imagen || ESCUDO_DEFECTO }}
          style={styles.escudo}
        />
      </View>

      <View style={styles.nombres}>
        <Text style={styles.nombreEquipo}>{datos.equipoLocal.nombre}</Text>
        <Text style={styles.nombreEquipo}>{datos.equipoVisitante.nombre}</Text>
      </View>

      <View style={styles.eventos}>
        {/* Columna izquierda (equipo local) */}
        <View style={styles.columna}>
          {eventos.izquierda.map((e, i) => (
            <Text key={i} style={styles.evento}>
              {e.icono} {e.texto}
            </Text>
          ))}
        </View>

        {/* Columna derecha (equipo visitante) */}
        <View style={styles.columna}>
          {eventos.derecha.map((e, i) => (
            <Text key={i} style={styles.evento}>
              {e.icono} {e.texto}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    paddingLeft: 16,
    marginBottom: 10,
  },
  resultado: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  marcador: {
    fontSize: 28,
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
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 20,
  },
  columna: {
    flex: 1,
  },
  evento: {
    marginBottom: 6,
    fontSize: 14,
  },
});
