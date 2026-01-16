<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import logoImg from '@/assets/Logo01.png';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const isDarkMode = ref(false);

onMounted(() => {
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
                :src="logoImg" 
                alt="Aura Creativa Logo" 
                class="img-fluid mb-2"
                style="max-height: 200px; width: auto;" 
            />
        </div>

        <div class="card minimal-card p-4 shadow-sm mx-auto" style="max-width: 380px; width: 100%;">
            <div class="card-body">
                
                <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Email</label>
                        <input 
                            type="email" 
                            class="form-control minimal-input" 
                            v-model="email"
                            placeholder="usuario@correo.com"
                            required
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold">Contraseña</label>
                        <input 
                            type="password" 
                            class="form-control minimal-input" 
                            v-model="password"
                            placeholder="••••••"
                            required
                        >
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger py-2 small text-center" role="alert">
                        {{ errorMessage }}
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mt-2" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ loading ? 'Verificando...' : 'Iniciar Sesión' }}
                    </button>

                    <div class="text-center mt-4">
                        <button 
                            type="button" 
                            @click="toggleTheme" 
                            class="btn btn-link text-decoration-none text-muted p-0 small"
                            style="font-size: 0.85rem;"
                        >
                            <span v-if="isDarkMode"><i class="fa-solid fa-sun"></i> Cambiar a Modo Claro</span>
                            <span v-else><i class="fa-solid fa-moon"></i> Cambiar a Modo Oscuro</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
        
        <div class="text-center mt-3 text-muted" style="font-size: 0.75rem;">
            &copy; 2026 Aura Creativa v1.0.0
        </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    animation: fadeIn 0.5s ease-out;
    width: 100%;
    padding: 1rem;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>