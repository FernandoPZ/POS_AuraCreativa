import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/proveedores';

const getAuthHeader = () => {
  const authStore = useAuthStore();
  return {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  };
};

export const getProveedores = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const getProveedorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

export const createProveedor = async (data) => {
  try {
    const response = await axios.post(API_URL, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

export const updateProveedor = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw error;
  }
};

export const deleteProveedor = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw error;
  }
};

export default {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor
};