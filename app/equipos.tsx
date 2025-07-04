import { View, Text, StyleSheet } from 'react-native';

export default function EquiposScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipos</Text>
      <Text style={styles.subtitle}>Listado de equipos registrados en la liga.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
