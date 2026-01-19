import api from './api';

export default {
    getUsuarios() {
        return api.get('/usuarios');
    },
    getUsuario(id) {
        return api.get(`/usuarios/${id}`);
    },
    createUsuario(data) {
        return api.post('/usuarios', data);
    },
    updateUsuario(id, data) {
        return api.put(`/usuarios/${id}`, data);
    },
    deleteUsuario(id) {
        return api.delete(`/usuarios/${id}`);
    }
};