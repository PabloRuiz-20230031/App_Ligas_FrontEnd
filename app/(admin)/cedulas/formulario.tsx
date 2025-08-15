import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/api';
import { Picker } from '@react-native-picker/picker';

interface Jugador {
  _id: string;
  nombre: string;
  dorsal: number;
  equipo: string;
}

interface Amonestacion {
  jugador: string;
  minuto: string;
  motivo: string;
}

interface Expulsion {
  jugador: string;
  minuto: string;
  causa: string;
}

type Anotador = {
  jugador: string;
  minuto: string;
};

export default function CedulaFormulario() {
  const { partidoId, temporadaId } = useLocalSearchParams();
  const router = useRouter();

  const [enviando, setEnviando] = useState(false);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState<Jugador[]>([]);
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [anotadoresLocal, setAnotadoresLocal] = useState<Anotador[]>([]);
  const [anotadoresVisitante, setAnotadoresVisitante] = useState<Anotador[]>([]);
  const [amonestaciones, setAmonestaciones] = useState<Amonestacion[]>([]);
  const [expulsiones, setExpulsiones] = useState<Expulsion[]>([]);
  const [notas, setNotas] = useState('');
  const [autogoles, setAutogoles] = useState<{ equipo: string; minuto: string }[]>([]);
  const autogolesLocal = autogoles.filter(a => a.equipo === jugadoresLocal[0]?.equipo).length;
  const autogolesVisitante = autogoles.filter(a => a.equipo === jugadoresVisitante[0]?.equipo).length;

  

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await api.get(`/partidos/${partidoId}/jugadores`);
        const todos: Jugador[] = res.data;
        setJugadores(todos);

        const equipoLocalId = todos[0]?.equipo;
        const local = todos.filter((j: Jugador) => j.equipo === equipoLocalId);
        const visitante = todos.filter((j: Jugador) => j.equipo !== equipoLocalId);

        setJugadoresLocal(local);
        setJugadoresVisitante(visitante);
      } catch (error) {
        console.error('Error al cargar jugadores:', error);
      }
    };

    fetchJugadores();
  }, [partidoId]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
            router.replace({
                pathname: '/(admin)/cedulas/jornadas',
                params: { temporadaId: temporadaId as string }
            });
            return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove(); // ✅ Aquí se evita el error de TypeScript
        }, [temporadaId])
        );
  useEffect(() => {
  setGolesLocal('');
  setGolesVisitante('');
  setAnotadoresLocal([]);
  setAnotadoresVisitante([]);
  setAmonestaciones([]);
  setExpulsiones([]);
  setNotas('');
}, [partidoId]);

  const validarYGuardar = async () => {
    if (enviando) return; // ⛔ Evita múltiples envíos
    setEnviando(true);     // ⏳ Marca que ya se está enviando

    const golesL = parseInt(golesLocal);
    const golesV = parseInt(golesVisitante);

    if (isNaN(golesL) || golesL < 0 || isNaN(golesV) || golesV < 0) {
        Alert.alert('Error', 'Los goles no pueden ser negativos ni vacíos');
        setEnviando(false); // ⚠️ asegúrate de liberar el estado si hay error
        return;
    }

    const golesLFinal = golesL + autogolesVisitante;
    const golesVFinal = golesV + autogolesLocal;

    if (anotadoresLocal.length !== golesL) {
        Alert.alert('Error', `Debes seleccionar ${golesL} anotadores del equipo local`);
        setEnviando(false);
        return;
    }

    if (anotadoresVisitante.length !== golesV) {
        Alert.alert('Error', `Debes seleccionar ${golesV} anotadores del equipo visitante`);
        setEnviando(false);
        return;
    }

    for (const a of anotadoresLocal) {
    if (!a.jugador || !a.minuto) {
        Alert.alert('Error', 'Todos los anotadores locales deben tener jugador y minuto');
        setEnviando(false);
        return;
    }
    }
    for (const a of anotadoresVisitante) {
    if (!a.jugador || !a.minuto) {
        Alert.alert('Error', 'Todos los anotadores visitantes deben tener jugador y minuto');
        setEnviando(false);
        return;
    }
    }

    // Validar autogoles
    for (let i = 0; i < autogoles.length; i++) {
      const { equipo, minuto } = autogoles[i];
      if (!equipo || !minuto) {
        Alert.alert(
          'Error',
          `El autogol #${i + 1} debe tener ${!equipo ? 'equipo' : ''}${!equipo && !minuto ? ' y ' : ''}${!minuto ? 'minuto' : ''}.`
        );
        setEnviando(false);
        return;
      }
    }

    // Validar amonestaciones
    for (let i = 0; i < amonestaciones.length; i++) {
      const { jugador, minuto, motivo } = amonestaciones[i];
      if (!jugador || !minuto || !motivo) {
        Alert.alert(
          'Error',
          `La amonestación #${i + 1} debe tener ${!jugador ? 'jugador' : ''}${!jugador && (!minuto || !motivo) ? ', ' : ''}${!minuto ? 'minuto' : ''}${!motivo && !jugador && minuto ? ', ' : ''}${!motivo ? 'motivo' : ''}.`
        );
        setEnviando(false);
        return;
      }
    }

    // Validar expulsiones
    for (let i = 0; i < expulsiones.length; i++) {
      const { jugador, minuto, causa } = expulsiones[i];
      if (!jugador || !minuto || !causa) {
        Alert.alert(
          'Error',
          `La expulsión #${i + 1} debe tener ${!jugador ? 'jugador' : ''}${!jugador && (!minuto || !causa) ? ', ' : ''}${!minuto ? 'minuto' : ''}${!causa && !jugador && minuto ? ', ' : ''}${!causa ? 'causa' : ''}.`
        );
        setEnviando(false);
        return;
      }
    }

    const amarillas = amonestaciones.map(a => a.jugador);
    const rojas = expulsiones.map(e => e.jugador);

    for (const jugador of amarillas) {
        if (amarillas.filter(j => j === jugador).length >= 2 && rojas.includes(jugador)) {
        Alert.alert('Error', `El jugador con ID ${jugador} no puede tener 2 amarillas y una roja`);
        setEnviando(false);
        return;
        }
    }

    try {
      const payload = {
        partidoId,
        temporadaId,
        golesLocal: golesLFinal,
        golesVisitante: golesVFinal,
        anotadoresLocal,
        anotadoresVisitante,
        autogoles,
        amonestaciones,
        expulsiones,
        notas
      };

      await api.post('/cedulas', payload);
      Alert.alert('Éxito', 'Cédula registrada');
      router.back();
    } catch (error) {
      console.error('Error al guardar la cédula:', error);
    } finally {
      setEnviando(false);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cédula Arbitral</Text>

      <Text style={styles.label}>Goles Local</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={golesLocal}
        onChangeText={text => {
        setGolesLocal(text);
        const cantidad = parseInt(text) || 0;
        setAnotadoresLocal(Array.from({ length: cantidad }, () => ({ jugador: '', minuto: '' })));
        }}
      />

      {anotadoresLocal.map((a, idx) => (
        <View key={idx}>
            <Picker
            selectedValue={a.jugador}
            onValueChange={(value) => {
                const updated = [...anotadoresLocal];
                updated[idx].jugador = value;
                setAnotadoresLocal(updated);
            }}
             style={{ color: 'black' }}
            >
            <Picker.Item label="Selecciona anotador" value="" />
            {jugadoresLocal.map((j: Jugador) => (
                <Picker.Item key={j._id} label={`${j.nombre} (#${j.dorsal})`} value={j._id} />
            ))}
            </Picker>

            <TextInput
            placeholder="Minuto"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={[styles.input, { color: 'black' }]}
            value={a.minuto}
            onChangeText={(val) => {
                const updated = [...anotadoresLocal];
                updated[idx].minuto = val;
                setAnotadoresLocal(updated);
            }}
            />
        </View>
        ))}


      <Text style={styles.label}>Goles Visitante</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={golesVisitante}
        onChangeText={text => {
        setGolesVisitante(text);
        const cantidad = parseInt(text) || 0;
        setAnotadoresVisitante(Array.from({ length: cantidad }, () => ({ jugador: '', minuto: '' })));
        }}
        
      />

      
      {anotadoresVisitante.map((a, idx) => (
        <View key={idx}>
            <Picker
            selectedValue={a.jugador}
            onValueChange={(value) => {
                const updated = [...anotadoresVisitante];
                updated[idx].jugador = value;
                setAnotadoresVisitante(updated);
            }}
            style={{ color: 'black' }}
            >
            <Picker.Item label="Selecciona anotador" value="" />
            {jugadoresVisitante.map((j: Jugador) => (
                <Picker.Item
                key={j._id}
                label={`${j.nombre} (#${j.dorsal})`}
                value={j._id}
                />
            ))}
            </Picker>

            <TextInput
            placeholder="Minuto"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={[styles.input, { color: 'black' }]}
            value={a.minuto}
            onChangeText={(val) => {
                const updated = [...anotadoresVisitante];
                updated[idx].minuto = val;
                setAnotadoresVisitante(updated);
            }}
            />
        </View>
        ))}
        <Text style={styles.label}>Autogoles</Text>
        {autogoles.map((a, idx) => (
        <View key={idx}>
            <Picker
            selectedValue={a.equipo}
            onValueChange={(value) => {
                const updated = [...autogoles];
                updated[idx].equipo = value;
                setAutogoles(updated);
            }}
            style={{ color: 'black' }}
            >
            <Picker.Item label="Selecciona equipo" value="" />
            <Picker.Item label="Equipo Local" value={jugadoresLocal[0]?.equipo} />
            <Picker.Item label="Equipo Visitante" value={jugadoresVisitante[0]?.equipo} />
            </Picker>
            <TextInput
            placeholder="Minuto"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={[styles.input, { color: 'black' }]}
            value={a.minuto}
            onChangeText={(val) => {
                const updated = [...autogoles];
                updated[idx].minuto = val;
                setAutogoles(updated);
            }}
            />
        </View>
        ))}
        <Pressable
        style={styles.btnAdd}
        onPress={() =>
            setAutogoles([...autogoles, { equipo: '', minuto: '' }])
        }
        >
        <Text style={styles.btnAddText}>+ Autogol</Text>
        </Pressable>
        <Pressable
        style={styles.btnRed}
        onPress={() => setAutogoles(prev => prev.slice(0, -1))}
        >
        <Text style={styles.btnAddText}>- Borrar último Autogol</Text>
        </Pressable>


      <Text style={styles.label}>Amonestaciones</Text>
      {amonestaciones.map((a, idx) => (
        <View key={idx}>
          <Picker
            selectedValue={a.jugador}
            onValueChange={value => {
              const updated = [...amonestaciones];
              updated[idx].jugador = value;
              setAmonestaciones(updated);
            }}
            style={{ color: 'black' }}
          >
            <Picker.Item label="Selecciona jugador" value="" />
            {jugadores.map((j: Jugador) => (
              <Picker.Item
                key={j._id}
                label={`${j.nombre} (#${j.dorsal})`}
                value={j._id}
              />
            ))}
          </Picker>
          <TextInput
            placeholder="Minuto"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={[styles.input, { color: 'black' }]}
            value={a.minuto}
            onChangeText={val => {
              const updated = [...amonestaciones];
              updated[idx].minuto = val;
              setAmonestaciones(updated);
            }}
          />
          <TextInput
            placeholder="Motivo"
            placeholderTextColor="#888"
            style={styles.input}
            value={a.motivo}
            onChangeText={val => {
              const updated = [...amonestaciones];
              updated[idx].motivo = val;
              setAmonestaciones(updated);
            }}
          />
        </View>
      ))}
      <Pressable
        style={styles.btnAdd}
        onPress={() => setAmonestaciones([...amonestaciones, { jugador: '', minuto: '', motivo: '' }])}
      >
        <Text style={styles.btnAddText}>+ Amonestación</Text>
      </Pressable>
      <Pressable
        style={styles.btnRed}
        onPress={() => setAmonestaciones(prev => prev.slice(0, -1))}
        >
        <Text style={styles.btnAddText}>- Borrar última Amonestación</Text>
        </Pressable>

      <Text style={styles.label}>Expulsiones</Text>
      {expulsiones.map((e, idx) => (
        <View key={idx}>
          <Picker
            selectedValue={e.jugador}
            onValueChange={value => {
              const updated = [...expulsiones];
              updated[idx].jugador = value;
              setExpulsiones(updated);
            }}
            style={{ color: 'black' }}
          >
            <Picker.Item label="Selecciona jugador" value="" />
            {jugadores.map((j: Jugador) => (
              <Picker.Item
                key={j._id}
                label={`${j.nombre} (#${j.dorsal})`}
                value={j._id}
              />
            ))}
          </Picker>
          <TextInput
            placeholder="Minuto"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={[styles.input, { color: 'black' }]}
            value={e.minuto}
            onChangeText={val => {
              const updated = [...expulsiones];
              updated[idx].minuto = val;
              setExpulsiones(updated);
            }}
          />
          <TextInput
            placeholder="Causa"
            placeholderTextColor="#888"
            style={styles.input}
            value={e.causa}
            onChangeText={val => {
              const updated = [...expulsiones];
              updated[idx].causa = val;
              setExpulsiones(updated);
            }}
          />
        </View>
      ))}
      <Pressable
        style={styles.btnAdd}
        onPress={() => setExpulsiones([...expulsiones, { jugador: '', minuto: '', causa: '' }])}
      >
        <Text style={styles.btnAddText}>+ Expulsión</Text>
      </Pressable>
      <Pressable
        style={styles.btnRed}
        onPress={() => setExpulsiones(prev => prev.slice(0, -1))}
        >
        <Text style={styles.btnAddText}>- Borrar última Expulsión</Text>
        </Pressable>


      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={notas}
        onChangeText={setNotas}
      />

      <Pressable
        style={[styles.btnSave, enviando && { opacity: 0.5 }]}
        onPress={validarYGuardar}
        disabled={enviando}
        >
        <Text style={styles.btnSaveText}>
            {enviando ? 'Guardando...' : 'Guardar Cédula'}
        </Text>
        </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f8ff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { marginTop: 12, fontWeight: 'bold' },
  input: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 8
  },
  btnAdd: {
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12
  },
  btnAddText: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  btnSave: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40 // 👈 esto sube visualmente el botón
    },
  btnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  btnRed: {
  backgroundColor: '#ffcccc',
  padding: 8,
  borderRadius: 8,
  marginTop: 4,
  marginBottom: 12
},
});
