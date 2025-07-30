import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  rol: string;
  foto?: string;
}

interface AuthContextProps {
  usuario: Usuario | null;
  token: string | null;
  apiKey: string | null;
  iniciarSesion: (token: string, usuario: Usuario, apiKey: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  estaAutenticado: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  usuario: null,
  token: null,
  apiKey: null,
  iniciarSesion: async () => {},
  cerrarSesion: async () => {},
  estaAutenticado: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // ✅ Cargar sesión guardada al iniciar la app
  useEffect(() => {
    const cargarSesion = async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('usuario');
      const k = await AsyncStorage.getItem('apiKey');

      if (t && u) {
        const usuarioParseado = JSON.parse(u);
        console.log('✅ Usuario cargado desde AsyncStorage:', usuarioParseado);

        setToken(t);
        setUsuario(usuarioParseado);
        setApiKey(k);
      }
    };

    cargarSesion();
  }, []);

  // ✅ Guardar token y usuario en almacenamiento
  const iniciarSesion = async (nuevoToken: string, usuarioData: Usuario, nuevaApiKey: string) => {
    setToken(nuevoToken);
    setUsuario(usuarioData);
    setApiKey(nuevaApiKey);

    await AsyncStorage.setItem('token', nuevoToken);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    await AsyncStorage.setItem('apiKey', nuevaApiKey);
  };

  const cerrarSesion = async () => {
    setToken(null);
    setUsuario(null);
    setApiKey(null);

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    await AsyncStorage.removeItem('apiKey');
  };

  const estaAutenticado = !!token;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        apiKey,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
