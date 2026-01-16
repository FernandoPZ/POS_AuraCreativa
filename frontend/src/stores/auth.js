import { defineStore } from 'pinia';
import axios from 'axios';
import router from '@/router';

const API_URL = 'http://localhost:3001/api'; 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  actions: {

    // 1. ACCIÓN PARA INICIALIZAR EL TEMA (Oscuro/Claro)
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    },

    // 2. LOGIN
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.loading = false;
        router.push('/dashboard'); 
        return true; 
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.msg || 'Error de conexión o credenciales inválidas.';
        this.loading = false;
        return false;
      }
    },

    // 3. LOGOUT
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      router.push('/login');
    }
  }
});