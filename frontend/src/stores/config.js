import { defineStore } from 'pinia';
import configService from '@/services/configService';

export const useConfigStore = defineStore('config', {
    state: () => ({
        nombreTienda: 'Aura Creativa',
        logoUrl: null,
        direccion: '',
        telefono: '',
        mensajeTicket: '',
        redSocial: '',
        isLoaded: false
    }),
    getters: {
        fullLogoUrl: (state) => {
            if (!state.logoUrl) return null;
            const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
            const BASE_URL = API_URL.replace('/api', '');
            return `${BASE_URL}/assets/${state.logoUrl}`;
        }
    },
    actions: {
        async fetchConfig() {
            if (this.isLoaded) return;
            try {
                const { data } = await configService.getConfig();
                if (data) {
                    this.nombreTienda = data.NombreTienda || 'Aura Creativa';
                    this.logoUrl = data.LogoUrl;
                    this.direccion = data.Direccion;
                    this.telefono = data.Telefono;
                    this.mensajeTicket = data.MensajeTicket;
                    this.redSocial = data.RedSocial;
                    this.updateFavicon();
                }
                this.isLoaded = true;
            } catch (error) {
                console.error('Error cargando config global:', error);
            }
        },
        updateFavicon() {
            if (!this.fullLogoUrl) return;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = this.fullLogoUrl;
            document.title = this.nombreTienda;
        }
    }
});