import api from './api';

export default {
    getResumen() {
        return api.get('/dashboard'); 
    }
};