<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const config = ref({
    NombreTienda: '',
    Direccion: '',
    Telefono: '',
    MensajeTicket: '',
    RedSocial: '',
    LogoUrl: ''
});

const loading = ref(false);
const saving = ref(false);
const authStore = useAuthStore();
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { Authorization: `Bearer ${authStore.token}` }
});

// Cargar datos al entrar
onMounted(async () => {
    loading.value = true;
    try {
        const { data } = await api.get('/configuracion');
        config.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se pudo cargar la configuración de la tienda.',
            confirmButtonColor: '#0d6efd'
        });
    } finally {
        loading.value = false;
    }
});

// Guardar cambios
const guardarCambios = async () => {
    saving.value = true;
    try {
        await api.put('/configuracion', config.value);
        // ALERTA DE ÉXITO
        Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: 'La información de la tienda ha sido actualizada.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    } catch (error) {
        console.error(error);
        // ALERTA DE ERROR
        Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: error.response?.data?.msg || 'Ocurrió un problema en el servidor.',
            confirmButtonColor: '#d63384'
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Datos de la Tienda</h2>
                <p class="text-muted m-0 small">Información general para tickets y encabezados.</p>
            </div>
        </div>
        <div class="card minimal-card border-0 shadow-sm">
            <div class="card-body p-4">
                <form @submit.prevent="guardarCambios">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <h5 class="fw-bold text-primary mb-3 border-bottom pb-2">
                                <i class="fa-solid fa-store me-2"></i>Identidad
                            </h5>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Nombre de la Tienda</label>
                                <input type="text" v-model="config.NombreTienda" class="form-control minimal-input" required placeholder="Ej: Aura Creativa">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Redes Sociales / Web</label>
                                <input type="text" v-model="config.RedSocial" class="form-control minimal-input" placeholder="Ej: @auracreativa">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">URL del Logo (Opcional)</label>
                                <input type="text" v-model="config.LogoUrl" class="form-control minimal-input" placeholder="http://...">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h5 class="fw-bold text-primary mb-3 border-bottom pb-2">
                                <i class="fa-solid fa-receipt me-2"></i>Contacto y Ticket
                            </h5>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Dirección Física</label>
                                <textarea v-model="config.Direccion" class="form-control minimal-input" rows="2" placeholder="Calle, Número, Colonia..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Teléfono / WhatsApp</label>
                                <input type="text" v-model="config.Telefono" class="form-control minimal-input" placeholder="55 1234 5678">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Mensaje al pie del Ticket</label>
                                <textarea v-model="config.MensajeTicket" class="form-control minimal-input" rows="2" placeholder="Gracias por su compra..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end mt-4 pt-3 border-top">
                        <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="fa-solid fa-save me-2"></i>
                            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                    </div>
                </form>
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