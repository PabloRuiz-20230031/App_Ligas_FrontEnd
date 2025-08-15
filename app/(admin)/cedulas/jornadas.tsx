import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/useAuth';
import { BackHandler } from 'react-native';
import api from '@/api';
import { useFocusEffect } from '@react-navigation/native';

const ESCUDO_DEFECTO = 'https://res.cloudinary.com/dkxz5wm2h/image/upload/v1755196792/dtlerpe2tfqd04gjjxqv.webp';

type Partido = {
  _id: string;
  equipoLocal: { nombre: string; imagen?: string } | null;
  equipoVisitante: { nombre: string; imagen?: string } | null;
  vuelta: number;
  cedula?: string | null;
};

type Jornada = {
  numero: number;
  partidos: Partido[];
};

export default function JornadasTemporada() {
  const { temporadaId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState<number | null>(null);

  const cargarJornadas = useCallback(async () => {
    try {
      const res = await api.get(`/temporadas/jornadas/${temporadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJornadas(res.data);
      if (res.data.length > 0) {
        setJornadaSeleccionada(res.data[0].numero);
      }
    } catch (error) {
      console.error('❌ Error al cargar jornadas:', error);
    }
  }, [temporadaId, token]);

  useFocusEffect(
    useCallback(() => {
      if (temporadaId) {
        cargarJornadas();
      }
    }, [temporadaId, cargarJornadas])
  );

  useFocusEffect(
          React.useCallback(() => {
              const onBackPress = () => {
              router.replace({
                  pathname: '/(admin)/cedulas',
                  params: { temporadaId: temporadaId as string }
              });
              return true;
              };
  
              const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
              return () => subscription.remove(); // ✅ Aquí se evita el error de TypeScript
          }, [temporadaId])
    );

  const jornadaActual = jornadas.find((j) => j.numero === jornadaSeleccionada);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Jornadas</Text>

      {jornadas.length > 0 && (
        <Picker
          selectedValue={jornadaSeleccionada ?? undefined}
          onValueChange={(valor) => setJornadaSeleccionada(valor)}
          style={styles.picker}
          
        >
          {jornadas.map((j) => (
            <Picker.Item key={j.numero} label={`Jornada ${j.numero}`} value={j.numero} />
          ))}
        </Picker>
      )}

      {jornadaActual && (
        <View style={styles.cardJornada}>
          {jornadaActual.partidos.map((partido, i) => {
            const tieneCedula = !!partido.cedula;

            const nombreLocal = partido.equipoLocal?.nombre || 'Equipo eliminado';
            const imagenLocal = partido.equipoLocal?.imagen || ESCUDO_DEFECTO;

            const nombreVisitante = partido.equipoVisitante?.nombre || 'Equipo eliminado';
            const imagenVisitante = partido.equipoVisitante?.imagen || ESCUDO_DEFECTO;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cardPartido,
                  tieneCedula && { backgroundColor: '#d0f0c0' },
                ]}
                onPress={() => {
                  const esDescanso =
                    nombreLocal.toLowerCase() === 'descanso' ||
                    nombreVisitante.toLowerCase() === 'descanso';

                  if (esDescanso) {
                    alert('No se puede agregar una cédula contra Descanso');
                    return;
                  }

                  router.push({
                    pathname: '/(admin)/cedulas/formulario',
                    params: {
                      partidoId: partido._id,
                      temporadaId: temporadaId as string,
                    },
                  });
                }}
              >
                <View style={styles.equipo}>
                  <Image source={{ uri: imagenLocal }} style={styles.escudo} />
                  <Text style={styles.nombreEquipo}>{nombreLocal}</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.vs}>VS</Text>
                  {tieneCedula && (
                    <Text style={{ fontSize: 12, color: 'green' }}>✅ Registrado</Text>
                  )}
                </View>

                <View style={styles.equipo}>
                  <Image source={{ uri: imagenVisitante }} style={styles.escudo} />
                  <Text style={styles.nombreEquipo}>{nombreVisitante}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f8ff' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  picker: { color: '#000', marginBottom: 12 },
  cardJornada: {
    gap: 12,
    marginBottom: 24,
  },
  cardPartido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  equipo: {
    alignItems: 'center',
    width: 90,
  },
  escudo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  nombreEquipo: {
    fontSize: 12,
    textAlign: 'center',
  },
  vs: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
