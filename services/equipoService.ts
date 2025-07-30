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
  imagen?: string;
  representantes: Representante[];
  jugadores: Jugador[];
}

export interface DetalleEquipo extends Equipo {
  representantes: Representante[];
  jugadores: Jugador[];
}

// ✅ Lista
export const getEquiposPorCategoria = async (categoriaId: string): Promise<Equipo[]> => {
  try {
    const res = await api.get(`/equipos/por-categoria/${categoriaId}`);
    return res.data.map((equipo: any) => ({
      id: equipo._id,
      nombre: equipo.nombre,
      imagen: equipo.imagen || '',
    }));
  } catch (error) {
    console.error('Error al obtener equipos por categoría:', error);
    throw error;
  }
};

// ✅ Detalle
export const getEquipoPorId = async (equipoId: string): Promise<DetalleEquipo> => {
  try {
    const res = await api.get(`/equipos/${equipoId}`);
    return {
      id: res.data._id,
      nombre: res.data.nombre,
      imagen: res.data.imagen || '',
      representantes: res.data.representantes || [],
      jugadores: res.data.jugadores || [],
    };
  } catch (error) {
    console.error('Error al obtener equipo por ID:', error);
    throw error;
  }
};