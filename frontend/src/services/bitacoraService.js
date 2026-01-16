import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/bitacora';

const getAuthHeader = () => {
    const authStore = useAuthStore();
    return {
        headers: { Authorization: `Bearer ${authStore.token}` }
    };
};

export default {
    getLogs() {
        return axios.get(API_URL, getAuthHeader()).then(res => res.data);
    }
};