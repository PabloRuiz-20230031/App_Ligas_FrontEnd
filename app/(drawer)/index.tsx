import { View, Text, StyleSheet, Image, ImageBackground, ScrollView } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('@/assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>⚽ Bienvenido a Ligas Huejutla</Text>
        <Text style={styles.subtitulo}>
          Explora las ligas municipales, conoce los equipos, consulta categorías y sigue el rendimiento de tus jugadores favoritos.
        </Text>
        <Text style={styles.mensajeFinal}>
          📱 ¡Todo en una sola app, diseñada para ti!
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  mensajeFinal: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
