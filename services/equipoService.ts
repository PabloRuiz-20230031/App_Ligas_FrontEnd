import api from '../api';

export interface Representante {
  nombre: string;
}

export interface Jugador {
  _id: string;
  nombre: string;
  dorsal: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  representantes: Representante[];
  jugadores: Jugador[];
}

// Obtener todos los equipos de una categoría
export const getEquiposPorCategoria = async (categoriaId: string): Promise<Equipo[]> => {
  try {
    const res = await api.get(`/equipos/por-categoria/${categoriaId}`);
    return res.data.map((equipo: any) => ({
      id: equipo._id,
      nombre: equipo.nombre,
      representantes: equipo.representantes || [],
      jugadores: equipo.jugadores || [],
    }));
  } catch (error) {
    console.error('Error al obtener equipos por categoría:', error);
    throw error;
  }
};

// Obtener un equipo por ID
export const getEquipoPorId = async (equipoId: string): Promise<Equipo> => {
  try {
    const res = await api.get(`/equipos/${equipoId}`);
    return {
      id: res.data._id,
      nombre: res.data.nombre,
      representantes: res.data.representantes || [],
      jugadores: res.data.jugadores || [],
    };
  } catch (error) {
    console.error('Error al obtener equipo por ID:', error);
    throw error;
  }
};
