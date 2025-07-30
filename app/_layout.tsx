// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  console.log('✅ RootLayout cargado'); // ✅ Esto está bien en consola

  return (
    <AuthProvider>
      <Slot /> {/* ✅ Este renderiza tus rutas */}
    </AuthProvider>
  );
}
