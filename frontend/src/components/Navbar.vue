<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom mb-4 px-3 minimal-card">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center py-0">
        <img :src="logoImg" alt="Logo" height="50" class="d-inline-block align-text-top">
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav" v-if="authStore.isAuthenticated">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item dropdown">
             <a class="nav-link dropdown-toggle fw-bold" href="#" role="button" data-bs-toggle="dropdown">
               <i class="fa-solid fa-store"></i> Operaciones
             </a>
             <ul class="dropdown-menu border-0 shadow-sm">
               <li><router-link to="/pos" class="dropdown-item"><i class="fa-solid fa-cash-register me-1"></i> Punto de Venta</router-link></li>
               <li><router-link to="/entradas/nueva" class="dropdown-item"><i class="fa-solid fa-box-open me-1"></i> Resurtir (Compras)</router-link></li>
             </ul>
           </li>
           <li class="nav-item dropdown">
             <a class="nav-link dropdown-toggle fw-bold" href="#" role="button" data-bs-toggle="dropdown">
               <i class="fa-solid fa-book-open"></i> Catálogos
             </a>
             <ul class="dropdown-menu border-0 shadow-sm">
               <li><router-link to="/articulos" class="dropdown-item"><i class="fa-solid fa-boxes-stacked me-1"></i> Artículos</router-link></li>
               <li><router-link to="/combos" class="dropdown-item"><i class="fa-solid fa-layer-group me-1"></i>Combos / Paquetes</router-link></li>
               <li><router-link to="/proveedores" class="dropdown-item"><i class="fa-solid fa-truck me-1"></i> Proveedores</router-link></li>
               </ul>
           </li>
           <li class="nav-item dropdown">
             <a class="nav-link dropdown-toggle fw-bold" href="#" role="button" data-bs-toggle="dropdown">
               <i class="fa-solid fa-clipboard-list"></i> Historiales
             </a>
             <ul class="dropdown-menu border-0 shadow-sm">
               <li><router-link to="/historial/ventas" class="dropdown-item text-success"><i class="fa-solid fa-shop me-1"></i> Ventas</router-link></li>
               <li><router-link to="/historial/compras" class="dropdown-item text-danger"><i class="fa-solid fa-box me-1"></i> Compras</router-link></li>
             </ul>
           </li>
          <li class="nav-item dropdown" v-if="authStore.user?.Rol?.toUpperCase() === 'ADMIN'">
            <a class="nav-link dropdown-toggle fw-bold text-primary" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fa-solid fa-gears"></i> Administración
            </a>
            <ul class="dropdown-menu border-0 shadow-sm">
              <li>
                <router-link to="/configuracion" class="dropdown-item">
                    <i class="fa-solid fa-store me-1"></i> Datos de la Tienda
                </router-link>
              </li>
              <li>
                <router-link to="/puntos-entrega" class="dropdown-item">
                    <i class="fa-solid fa-map-location-dot me-1"></i> Puntos de Entrega
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <router-link to="/usuarios" class="dropdown-item">
                    <i class="fa-solid fa-users-gear me-1"></i> Gestión de Usuarios
                </router-link>
              </li>
              <li>
                  <router-link to="/bitacora" class="dropdown-item">
                      <i class="fa-solid fa-list-check me-1"></i> Bitácora
                  </router-link>
              </li>
            </ul>
          </li>
        </ul>
        <div class="d-flex align-items-center">
          <span class="text-muted me-3 d-none d-lg-block small">
            Hola, <strong>{{ authStore.user?.Nombre || 'Usuario' }}</strong>
          </span>
          <button @click="toggleTheme" class="btn btn-link nav-link me-3 text-secondary" title="Cambiar Tema">
              <i v-if="isDarkMode" class="fa-solid fa-sun fs-5"></i>
              <i v-else class="fa-solid fa-moon fs-5"></i>
          </button>
          <button @click="handleLogout" class="btn btn-danger btn-sm rounded-pill px-3">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Dropdown } from 'bootstrap';
import logoImg from '@/assets/logo01.png';

const authStore = useAuthStore();
const router = useRouter();
const isDarkMode = ref(false);
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    const newTheme = isDarkMode.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

onMounted(() => {
  const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
  [...dropdownElementList].map(dropdownToggleEl => new Dropdown(dropdownToggleEl));
  const savedTheme = localStorage.getItem('theme') || 'light';
  isDarkMode.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar { 
    border-radius: 0 0 1rem 1rem; 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
}
.nav-link i { min-width: 20px; text-align: center; } 
</style>