import api from '../api';

export interface Liga {
  id: string;
  nombre: string;
  imagen?: string;
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
