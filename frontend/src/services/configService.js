import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = 'http://localhost:3001/api/config';

const getAuthHeader = () => {
  const authStore = useAuthStore();
  return { headers: { Authorization: `Bearer ${authStore.token}` } };
};

export default {
  getConfig() {
    return axios.get(API_URL, getAuthHeader()).then(res => res.data);
  },
  updateConfig(data) {
    return axios.put(API_URL, data, getAuthHeader()).then(res => res.data);
  }
};