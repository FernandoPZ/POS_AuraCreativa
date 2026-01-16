import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/puntos-entrega';

const getAuthHeader = () => {
  const authStore = useAuthStore();
  return { headers: { Authorization: `Bearer ${authStore.token}` } };
};

export default {
  getPuntos() {
    return axios.get(API_URL, getAuthHeader()).then(res => res.data);
  },
  createPunto(data) {
    return axios.post(API_URL, data, getAuthHeader()).then(res => res.data);
  },
  deletePunto(id) {
    return axios.delete(`${API_URL}/${id}`, getAuthHeader()).then(res => res.data);
  }
};