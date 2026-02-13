<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import defaultLogo from '@/assets/logo_default.png'; 

const authStore = useAuthStore();
const configStore = useConfigStore();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const isDarkMode = ref(false);
const logoDisplay = computed(() => {
    return configStore.fullLogoUrl || defaultLogo;
});
const nombreTienda = computed(() => configStore.nombreTienda || 'Sistema POS');

onMounted(() => {
    configStore.fetchConfig();
    const savedTheme = localStorage.getItem('theme') || 'light';
    isDarkMode.value = savedTheme === 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
});

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    const newTheme = isDarkMode.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

const handleLogin = async () => {
    errorMessage.value = '';
    if (!email.value || !password.value) {
        errorMessage.value = 'Por favor ingresa correo y contraseña.';
        return;
    }
    
    loading.value = true;
    const success = await authStore.login(email.value, password.value);
    loading.value = false;

    if (!success) {
        errorMessage.value = authStore.error;
    }
};
</script>

<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 minimal-bg">
    <div class="login-container">
        <div class="text-center mb-4">
            <img 
                :src="logoDisplay" 
                :alt="nombreTienda" 
                class="img-fluid mb-2 logo-anim"
                style="max-height: 180px; width: auto; object-fit: contain;" 
            />
        </div>
        <div class="card minimal-card p-4 shadow-sm mx-auto" style="max-width: 380px; width: 100%;">
            <div class="card-body">
                <h5 class="text-center mb-4 fw-bold text-muted">Bienvenido</h5>
                <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">Email</label>
                        <input 
                            type="email" 
                            class="form-control minimal-input" 
                            v-model="email"
                            placeholder="usuario@correo.com"
                            required
                        >
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">Contraseña</label>
                        <input 
                            type="password" 
                            class="form-control minimal-input" 
                            v-model="password"
                            placeholder="••••••"
                            required
                        >
                    </div>
                    <div v-if="errorMessage" class="alert alert-danger py-2 small text-center" role="alert">
                        <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mt-2 shadow-sm" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ loading ? 'Verificando...' : 'Iniciar Sesión' }}
                    </button>
                    <div class="text-center mt-4 border-top pt-3">
                        <button 
                            type="button" 
                            @click="toggleTheme" 
                            class="btn btn-link text-decoration-none text-muted p-0 small"
                            style="font-size: 0.85rem;"
                        >
                            <span v-if="isDarkMode"><i class="fa-solid fa-sun me-1"></i> Modo Claro</span>
                            <span v-else><i class="fa-solid fa-moon me-1"></i> Modo Oscuro</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="text-center mt-3 text-muted opacity-75" style="font-size: 0.75rem;">
            &copy; {{ new Date().getFullYear() }} {{ nombreTienda }} v1.1
        </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    animation: fadeIn 0.6s ease-out;
    width: 100%;
    padding: 1rem;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.logo-anim {
    transition: transform 0.3s ease;
}
.logo-anim:hover {
    transform: scale(1.02);
}
</style>