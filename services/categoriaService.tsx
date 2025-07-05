import api from '../api';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export const getCategorias = async (ligaId: string): Promise<Categoria[]> => {
  try {
    const res = await api.get(`/ligas/${ligaId}/categorias`);
    return res.data.map((cat: any) => ({
      id: cat._id,
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
    }));
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};
