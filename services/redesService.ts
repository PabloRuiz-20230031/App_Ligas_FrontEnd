// services/redesService.ts
import api from '@/api'; // Asegúrate que esta ruta sea correcta según tu estructura

export type RedSocial = {
  plataforma: 'facebook' | 'youtube';
  url: string;
};

export const obtenerRedesSociales = async (): Promise<RedSocial[]> => {
  try {
    const response = await api.get<RedSocial[]>('/redes-sociales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las redes sociales:', error);
    return [];
  }
};
