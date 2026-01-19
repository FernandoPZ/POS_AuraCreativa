import api from './api';

export default {
    getProveedores() {
        return api.get('/proveedores');
    },
    getProveedor(id) {
        return api.get(`/proveedores/${id}`);
    },
    deleteProveedor(id) {
        return api.delete(`/proveedores/${id}`);
    },
    createProveedor(data) {
        return api.post('/proveedores', data);
    },
    updateProveedor(id, data) {
        return api.put(`/proveedores/${id}`, data);
    }
};