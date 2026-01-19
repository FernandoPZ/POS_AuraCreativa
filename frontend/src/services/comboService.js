import api from './api';

export default {
    getCombos() {
        return api.get('/combos');
    },
    getCombo(id) {
        return api.get(`/combos/${id}`);
    },
    createCombo(data) {
        return api.post('/combos', data);
    },
    updateCombo(id, data) {
        return api.put(`/combos/${id}`, data);
    },
    deleteCombo(id) {
        return api.delete(`/combos/${id}`);
    }
};