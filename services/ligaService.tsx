// services/ligaService.ts

import api from '@/api';

export interface Liga {
  id: string;
  nombre: string;
  imagen?: string;
  descripcion?: string;
  fechaCreacion?: string;
  creador?: { nombre: string };
}

export const getLigas = async (): Promise<Liga[]> => {
  const res = await api.get('/ligas');
  return res.data;
};

export const getLigaPorId = async (id: string): Promise<Liga | null> => {
  try {
    const res = await api.get(`/ligas/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al obtener liga por ID', error);
    return null;
  }
};
