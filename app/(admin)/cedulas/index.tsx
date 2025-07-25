import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/api';

type Liga = {
  _id: string;
  nombre: string;
};

type TemporadaActiva = {
  _id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  categoria: {
    _id: string;
    nombre: string;
  };
};

export default function CedulasIndex() {
  const router = useRouter();

  const [busqueda, setBusqueda] = useState('');
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);
  const [temporadas, setTemporadas] = useState<TemporadaActiva[]>([]);
  

  const buscarLigas = async (texto: string) => {
    setBusqueda(texto);
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

  const seleccionarLiga = async (liga: Liga) => {
    setLigaSeleccionada(liga);
    setBusqueda(liga.nombre);
    setLigas([]);
    try {
      const res = await api.get(`/temporadas/activas/${liga._id}`);
      setTemporadas(res.data);
    } catch (error) {
      console.error('Error al obtener temporadas activas:', error);
    }
  };

  const irAJornadas = (temporada: TemporadaActiva) => {
    router.push({
      pathname: '/(admin)/cedulas/jornadas',
      params: {
        temporadaId: temporada._id,
        nombreTemporada: temporada.nombre,
        nombreCategoria: temporada.categoria.nombre,
        categoriaId: temporada.categoria._id,
        ligaId: ligaSeleccionada?._id || '',
        nombreLiga: ligaSeleccionada?.nombre || ''
      }
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Buscar liga</Text>

      {!ligaSeleccionada ? (
        <>
          <TextInput
            placeholder="Ej. Liga Municipal"
            value={busqueda}
            onChangeText={buscarLigas}
            style={styles.input}
          />

          {ligas.map((liga) => (
            <TouchableOpacity
              key={liga._id}
              style={styles.resultado}
              onPress={() => seleccionarLiga(liga)}
            >
              <Text>{liga.nombre}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.label}>
            Liga seleccionada: <Text style={{ fontWeight: 'bold' }}>{ligaSeleccionada.nombre}</Text>
          </Text>

          <TouchableOpacity
            style={[styles.botonAccion, { backgroundColor: '#aaa', marginBottom: 10 }]}
            onPress={() => {
              setLigaSeleccionada(null);
              setBusqueda('');
              setLigas([]);
              setTemporadas([]);
            }}
          >
            <Text style={{ color: 'white' }}>Cambiar de liga</Text>
          </TouchableOpacity>
        </>
      )}

      {ligaSeleccionada && (
        <>
          <Text style={styles.label}>Temporadas activas</Text>
          {temporadas.length === 0 ? (
            <Text style={{ marginVertical: 10 }}>No hay temporadas activas para esta liga.</Text>
          ) : (
            <FlatList
              data={temporadas}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} onPress={() => irAJornadas(item)}>
                  <Text style={styles.nombreCategoria}>{item.nombre}</Text>
                  <Text style={styles.infoCategoria}>Categoría: {item.categoria?.nombre}</Text>
                  <Text style={styles.fecha}>
                    Inicio: {new Date(item.fechaInicio).toLocaleDateString()}
                  </Text>
                  <Text style={styles.fecha}>
                    Fin: {new Date(item.fechaFin).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: 'bold', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 8, borderRadius: 6, marginBottom: 10
  },
  resultado: {
    padding: 8, backgroundColor: '#f0f0f0',
    borderRadius: 4, marginBottom: 6
  },
  card: {
    backgroundColor: '#c3dafe',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12
  },
  nombreCategoria: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoCategoria: {
    fontSize: 14,
    marginTop: 4
  },
  fecha: {
    fontSize: 13,
    color: '#444',
    marginTop: 2
  },
  botonAccion: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center'
  }
});
