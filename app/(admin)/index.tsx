import { View, Text, StyleSheet } from 'react-native';

export default function AdminInicioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <Text style={styles.subtitle}>
        Desde aquí puedes gestionar ligas, categorías, equipos, jugadores, usuarios y más.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f8ff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
