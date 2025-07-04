// services/redesService.ts
import axios from 'axios';

const API_URL = 'http://localhost/api/redes-sociales'; // Reemplaza con tu URL real

export const obtenerRedesSociales = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Debería ser un array de objetos [{ plataforma: 'youtube', url: '...' }, ...]
  } catch (error) {
    console.error('Error al obtener las redes sociales:', error);
    return [];
  }
};
