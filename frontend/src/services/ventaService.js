import api from './api';

export default {
    createVenta(data) {
        return api.post('/ventas', data);
    },
    getVentas() {
        return api.get('/ventas');
    },
    getDetalleVenta(id) {
        return api.get(`/ventas/${id}`);
    }
};