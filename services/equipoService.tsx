import api from '../api';

export interface Equipo {
  id: string;
  nombre: string;
  representantes?: string[];
}

export const getEquipos = async (categoriaId: string): Promise<Equipo[]> => {
  try {
    const res = await api.get(`/categorias/${categoriaId}/equipos`);
    return res.data.map((eq: any) => ({
      id: eq._id,
      nombre: eq.nombre,
      representantes: eq.representantes || [],
    }));
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    throw error;
  }
};
