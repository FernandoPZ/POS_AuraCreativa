import api from './api';

export default {
    getPuntos() {
        return api.get('/puntos-entrega');
    },
    createPunto(data) {
        return api.post('/puntos-entrega', data);
    },
    updatePunto(id, data) {
        return api.put(`/puntos-entrega/${id}`, data);
    },
    deletePunto(id) {
        return api.delete(`/puntos-entrega/${id}`);
    }
};