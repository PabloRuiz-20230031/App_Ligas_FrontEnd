import React, { createContext, useState, ReactNode } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

interface AuthContextProps {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  usuario: null,
  token: null,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
  estaAutenticado: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const iniciarSesion = (nuevoToken: string, usuarioData: Usuario) => {
    setToken(nuevoToken);
    setUsuario(usuarioData);
  };

  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
  };

  const estaAutenticado = !!token;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
