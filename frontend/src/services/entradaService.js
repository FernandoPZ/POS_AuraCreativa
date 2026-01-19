import api from './api';

export default {
    getEntradas() {
        return api.get('/entradas');
    },
    getDetalleEntrada(id) {
        return api.get(`/entradas/${id}`);
    },
    createEntrada(data) {
        return api.post('/entradas', data);
    }
};