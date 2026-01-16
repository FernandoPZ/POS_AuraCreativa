import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/entradas';
const getAuthHeader = () => {
    const authStore = useAuthStore();
    return {
        headers: {
            Authorization: `Bearer ${authStore.token}`
        }
    };
};

export default {
    getEntradas() {
        return axios.get(API_URL, getAuthHeader()).then(res => res.data);
    },
    getDetalleEntrada(id) {
        return axios.get(`${API_URL}/${id}`, getAuthHeader()).then(res => res.data);
    },
    createEntrada(entradaData) {
        return axios.post(API_URL, entradaData, getAuthHeader()).then(res => res.data);
    }
};