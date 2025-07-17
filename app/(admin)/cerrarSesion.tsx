import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function CerrarSesion() {
  const { cerrarSesion } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    cerrarSesion();       // ✅ Limpia el usuario y token
    router.replace('/');  // ✅ Redirige al index.tsx público
  }, []);

  return null;
}
