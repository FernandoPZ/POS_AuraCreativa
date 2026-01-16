<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isEditing = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const usuario = ref({
    nombre: '',
    email: '',
    password: '',
    rol: ''
});
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { Authorization: `Bearer ${authStore.token}` }
});

onMounted(async () => {
    if (isEditing.value) {
        loading.value = true;
        try {
            const { data } = await api.get(`/usuarios/${route.params.id}`);
            usuario.value = {
                nombre: data.Nombre,
                email: data.Email,
                rol: data.Rol,
                password: ''
            };
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos del usuario.'
            });
            router.push('/usuarios');
        } finally {
            loading.value = false;
        }
    }
});

const guardarUsuario = async () => {
    if (!isEditing.value && !usuario.value.password) {
         return Swal.fire('Falta información', 'La contraseña es obligatoria para nuevos usuarios.', 'warning');
    }

    saving.value = true;
    try {
        if (isEditing.value) {
            // EDITAR
            await api.put(`/usuarios/${route.params.id}`, usuario.value);
            await Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El usuario ha sido modificado correctamente.',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            // CREAR
            await api.post('/usuarios', usuario.value);
            await Swal.fire({
                icon: 'success',
                title: '¡Creado!',
                text: 'Nuevo usuario registrado con éxito.',
                timer: 1500,
                showConfirmButton: false
            });
        }
        router.push('/usuarios');
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: error.response?.data?.msg || 'Ocurrió un error inesperado.'
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="mb-3">
            <router-link to="/usuarios" class="text-decoration-none text-muted fw-bold small">
                <i class="fa-solid fa-arrow-left me-1"></i> Volver a la lista
            </router-link>
        </div>
        <div class="row">
            <div class="col-12 col-md-8 col-lg-6 mx-auto">
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <div class="text-center mb-4">
                            <h4 class="card-title fw-bold">
                                {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
                            </h4>
                            <p class="text-muted small">Complete la información de acceso</p>
                        </div>
                        <div v-if="loading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                        <form v-else @submit.prevent="guardarUsuario">
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">Nombre Completo</label>
                                <input 
                                    v-model="usuario.nombre" 
                                    type="text" 
                                    class="form-control minimal-input" 
                                    required
                                    placeholder="Ej. Juan Pérez"
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">Correo Electrónico</label>
                                <input 
                                    v-model="usuario.email" 
                                    type="email" 
                                    class="form-control minimal-input" 
                                    required
                                    placeholder="nombre@auracreativa.com"
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">
                                    Contraseña
                                </label>
                                <input 
                                    v-model="usuario.password" 
                                    type="password" 
                                    class="form-control minimal-input" 
                                    :required="!isEditing"
                                    placeholder="••••••••"
                                >
                                <div v-if="isEditing" class="form-text small fst-italic">
                                    <i class="fa-solid fa-circle-info me-1"></i>
                                    Deja este campo vacío si no deseas cambiar la contraseña actual.
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label text-muted small fw-bold">Rol de Usuario</label>
                                <select v-model="usuario.rol" class="form-select minimal-input" required>
                                    <option value="" disabled>Selecciona un rol</option>
                                    <option value="ADMIN">Administrador (Acceso Total)</option>
                                    <option value="Vendedor">Vendedor (Punto de Venta)</option>
                                    <option value="Cajero">Cajero (Solo Cobro)</option>
                                    <option value="Almacen">Almacén (Inventario)</option>
                                </select>
                            </div>
                            <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                                <router-link to="/usuarios" class="btn btn-outline-secondary minimal-btn px-4 fw-bold d-flex align-items-center">
                                    <i class="fa-solid fa-xmark me-2"></i> Cancelar
                                </router-link>
                                <button 
                                    type="submit" 
                                    class="btn btn-primary minimal-btn px-4 fw-bold shadow-sm d-flex align-items-center" 
                                    :disabled="saving"
                                >
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fa-solid fa-save me-2"></i>
                                    {{ saving ? 'Guardando...' : 'Guardar' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
</style>