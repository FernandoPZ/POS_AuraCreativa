import api from './api';

export default {
    getBitacora() {
        return api.get('/bitacora');
    }
};