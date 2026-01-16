import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/ventas';
const getAuthHeader = () => {
    const authStore = useAuthStore();
    return {
        headers: { Authorization: `Bearer ${authStore.token}` }
    };
};
const crearVenta = async (ventaData) => {
    const response = await axios.post(API_URL, ventaData, getAuthHeader());
    return response.data;
};
const getVentas = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};
const getVentaDetalles = async (idVenta) => {
    const response = await axios.get(`${API_URL}/${idVenta}/detalles`, getAuthHeader());
    return response.data;
};

export default {
    crearVenta,
    getVentas,
    getVentaDetalles
};