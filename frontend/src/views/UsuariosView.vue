<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const usuarios = ref([]);
const loading = ref(false);
const authStore = useAuthStore();
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { Authorization: `Bearer ${authStore.token}` }
});

// Cargar Usuarios
const loadUsuarios = async () => {
    loading.value = true;
    try {
        const { data } = await api.get('/usuarios');
        usuarios.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la lista de usuarios.'
        });
    } finally {
        loading.value = false;
    }
};

// Eliminar Usuario
const confirmDelete = (user) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Se dará de baja al usuario: ${user.Nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await api.delete(`/usuarios/${user.IdUsuario}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El usuario ha sido desactivado.',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadUsuarios();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.msg || 'No se pudo eliminar el usuario.'
                });
            }
        }
    });
};

onMounted(loadUsuarios);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Gestión de Usuarios</h2>
                <p class="text-muted m-0 small">Administra el acceso al sistema.</p>
            </div>
            <router-link to="/usuarios/nuevo" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-user-plus me-2"></i>Nuevo Usuario
            </router-link>
        </div>
        <div class="card minimal-card border-0 shadow-sm">
            <div class="card-body p-0">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="text-muted mt-2 small">Cargando personal...</p>
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4 py-3 text-muted small text-uppercase">Usuario</th>
                                <th class="py-3 text-muted small text-uppercase">Rol</th>
                                <th class="py-3 text-muted small text-uppercase">Fecha Alta</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="usuarios.length === 0">
                                <td colspan="4" class="text-center py-5 text-muted">
                                    No hay usuarios registrados aparte de ti.
                                </td>
                            </tr>
                            <tr v-for="user in usuarios" :key="user.IdUsuario">
                                <td class="ps-4">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-circle me-3 bg-primary bg-opacity-10 text-primary fw-bold">
                                            {{ user.Nombre.charAt(0).toUpperCase() }}
                                        </div>
                                        <div>
                                            <div class="fw-bold">{{ user.Nombre }}</div>
                                            <div class="small text-muted">{{ user.Email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span v-if="user.Rol === 'ADMIN' || user.Rol === 'Admin'" class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">
                                        Administrador
                                    </span>
                                    <span v-else class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
                                        {{ user.Rol }}
                                    </span>
                                </td>
                                <td class="text-muted small">
                                    <i class="fa-regular fa-calendar me-1"></i>
                                    {{ formatDate(user.FechaCreacion) }}
                                </td>
                                <td class="text-end pe-4">
                                    <router-link :to="`/usuarios/editar/${user.IdUsuario}`" class="btn btn-sm btn-outline-secondary me-2" title="Editar">
                                        <i class="fa-solid fa-pen"></i>
                                    </router-link>
                                    <button @click="confirmDelete(user)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Total de usuarios activos: <strong>{{ usuarios.length }}</strong></small>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

[data-bs-theme="dark"] .bg-light {
    background-color: #2c2c2c !important;
}
</style>