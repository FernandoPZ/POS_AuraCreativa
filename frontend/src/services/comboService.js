import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/combos';

const getAuthHeader = () => {
  const authStore = useAuthStore();
  return { headers: { Authorization: `Bearer ${authStore.token}` } };
};

export default {
    getCombos() {
        return axios.get(API_URL, getAuthHeader()).then(res => res.data);
    },
    getComboById(id) {
        return axios.get(`${API_URL}/${id}`, getAuthHeader()).then(res => res.data);
    },
    createCombo(data) {
        return axios.post(API_URL, data, getAuthHeader()).then(res => res.data);
    },
    updateCombo(id, data) {
        return axios.put(`${API_URL}/${id}`, data, getAuthHeader()).then(res => res.data);
    },
    deleteCombo(id) {
        return axios.delete(`${API_URL}/${id}`, getAuthHeader()).then(res => res.data);
    }
};