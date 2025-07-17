// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  console.log('✅ RootLayout cargado'); // ✅ Mover aquí

  return (
    <AuthProvider>
      <Slot /> {/* Esto renderiza las rutas como (admin), public, etc. */}
    </AuthProvider>
  );
}
