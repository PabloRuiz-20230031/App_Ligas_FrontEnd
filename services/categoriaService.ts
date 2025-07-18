import api from '../api';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string;
  creadoPor?: string;
}


export const getCategoriaPorId = async (id: string): Promise<Categoria> => {
  try {
    const res = await api.get(`/categorias/${id}`);
    return {
      id: res.data._id,
      nombre: res.data.nombre,
      descripcion: res.data.descripcion,
      fechaCreacion: res.data.createdAt,
      creadoPor: res.data.creadoPor?.nombre || 'Administrador',
    };
  } catch (error) {
    console.error('Error al obtener categoría por ID:', error);
    throw error;
  }
};

export const getCategoriasPorLiga = async (ligaId: string): Promise<Categoria[]> => {
  try {
    const res = await api.get(`/categorias/por-liga/${ligaId}`);
    return res.data.map((categoria: any) => ({
      id: categoria._id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      fechaCreacion: categoria.createdAt,
      creadoPor: categoria.creadoPor?.nombre || 'Administrador',
    }));
  } catch (error) {
    console.error('Error al obtener categorías por liga:', error);
    throw error;
  }
};

