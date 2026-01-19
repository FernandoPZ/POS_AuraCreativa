import api from './api';

export default {
    getArticulos() {
        return api.get('/articulos');
    },
    getArticulo(id) {
        return api.get(`/articulos/${id}`);
    },
    createArticulo(formData) {
        return api.post('/articulos', formData);
    },
    updateArticulo(id, formData) {
        return api.put(`/articulos/${id}`, formData);
    },
    deleteArticulo(id) {
        return api.delete(`/articulos/${id}`);
    }
};