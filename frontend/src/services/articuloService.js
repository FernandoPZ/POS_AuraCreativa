import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/articulos';
const MOVIMIENTOS_API_URL = 'http://localhost:3001/api/movimientos'; 

const getAuthHeader = () => {
    const authStore = useAuthStore();
    return {
        headers: {
            Authorization: `Bearer ${authStore.token}`
        }
    };
};

const getArticulos = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error al obtener artículos:", error);
        if (error.response && error.response.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
        }
        throw error;
    }
};

const createArticulo = async (data) => {
    try {
        const response = await axios.post(API_URL, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error al crear artículo:", error);
        throw error;
    }
};

const getArticuloById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error(`Error al obtener artículo ${id}:`, error);
        throw error;
    }
};

const updateArticulo = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar artículo ${id}:`, error);
        throw error;
    }
};

const deleteArticulo = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return true;
    } catch (error) {
        console.error(`Error al eliminar artículo ${id}:`, error);
        throw error;
    }
};

const registrarMovimiento = async (data) => {
    const { TipoMovimiento, IdArticulo, Cantidad, Comentarios } = data;
    const url = `${MOVIMIENTOS_API_URL}/${TipoMovimiento.toLowerCase()}`;
    try {
        const response = await axios.post(url, { IdArticulo, Cantidad, Comentarios }, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        throw error;
    }
};

const getMovimientos = async () => {
    try {
        const response = await axios.get(MOVIMIENTOS_API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        throw error;
    }
};

const articuloService = {
    getArticulos,
    createArticulo,
    getArticuloById,
    updateArticulo,
    deleteArticulo,
    registrarMovimiento,
    getMovimientos,
};

export default articuloService;