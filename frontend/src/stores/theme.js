import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    const theme = ref(localStorage.getItem('user-theme') || 'light');
    const applyTheme = () => {
        document.documentElement.setAttribute('data-bs-theme', theme.value);
        localStorage.setItem('user-theme', theme.value);
    };
    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        applyTheme();
    };
    applyTheme();
    return { theme, toggleTheme };
});