import api from '../api';

export interface Liga {
  id: string;
  nombre: string;
  imagen?: string;
}

export interface LigaDetalle extends Liga {
  descripcion?: string;
  fechaCreacion?: string;
  creadores?: string[];
}

export const getLigas = async (): Promise<Liga[]> => {
  try {
    const res = await api.get('/ligas');
    // Asegura que cada liga tenga un campo `id` compatible
    return res.data.map((liga: any) => ({
      id: liga._id,
      nombre: liga.nombre,
      imagen: liga.imagen || '', // si no hay imagen
    }));
  } catch (error) {
    console.error('Error al obtener ligas:', error);
    throw error;
  }
};

export const getLiga = async (id: string): Promise<LigaDetalle> => {
  try {
    const res = await api.get(`/ligas/${id}`);
    const liga = res.data;
    return {
      id: liga._id,
      nombre: liga.nombre,
      imagen: liga.imagen || '',
      descripcion: liga.descripcion || '',
      fechaCreacion: liga.fechaCreacion || liga.createdAt || '',
      creadores: liga.creadores || (liga.creador ? [liga.creador] : []),
    };
  } catch (error) {
    console.error('Error al obtener liga:', error);
    throw error;
  }
};
