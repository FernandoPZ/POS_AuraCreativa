import api from './api';

export default {
    getConfig() {
        return api.get('/configuracion');
    },
    updateConfig(data) {
        return api.put('/configuracion', data);
    }
};