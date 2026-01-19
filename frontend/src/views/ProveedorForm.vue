<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import proveedorService from '@/services/proveedorService';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);
const itemId = computed(() => route.params.id);
const loading = ref(false);
const isSaving = ref(false);
const form = reactive({
    NomProveedor: '',
    RFC: '',
    NombreContacto: '',
    Telefono: '',
    Email: '',
    Direccion: ''
});
const loadItem = async () => {
    loading.value = true;
    try {
        const { data } = await proveedorService.getProveedor(itemId.value);
        Object.assign(form, data);
    } catch (err) {
        Swal.fire('Error', 'No se pudo cargar el proveedor.', 'error');
        router.push('/proveedores');
    } finally {
        loading.value = false;
    }
};
const handleSubmit = async () => {
    if (!form.NomProveedor) {
        return Swal.fire('Atención', 'El nombre del proveedor es obligatorio.', 'warning');
    }
    isSaving.value = true;
    try {
        if (isEditing.value) {
            await proveedorService.updateProveedor(itemId.value, form);
            await Swal.fire({
                icon: 'success', title: '¡Actualizado!',
                text: 'Proveedor modificado correctamente.',
                timer: 1500, showConfirmButton: false
            });
        } else {
            await proveedorService.createProveedor(form);
            await Swal.fire({
                icon: 'success', title: '¡Registrado!',
                text: 'Nuevo proveedor añadido.',
                timer: 1500, showConfirmButton: false
            });
        }
        router.push('/proveedores');
    } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.msg || 'No se pudo guardar.', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    if (isEditing.value) loadItem();
});
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="mb-3">
            <router-link to="/proveedores" class="text-decoration-none text-muted fw-bold small">
                <i class="fa-solid fa-arrow-left me-1"></i> Volver a la lista
            </router-link>
        </div>
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <h4 class="mb-4 fw-bold text-center">
                            {{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
                        </h4>
                        <div v-if="loading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                        <form v-else @submit.prevent="handleSubmit" class="row g-3">
                            <div class="col-12">
                                <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">Datos de la Empresa</h6>
                            </div>
                            <div class="col-12 col-md-7">
                                <label class="form-label small fw-bold text-muted">Nombre / Razón Social</label>
                                <input type="text" v-model="form.NomProveedor" class="form-control minimal-input" required placeholder="Ej. Distribuidora Textil S.A.">
                            </div>
                            <div class="col-12 col-md-5">
                                <label class="form-label small fw-bold text-muted">RFC (Opcional)</label>
                                <input type="text" v-model="form.RFC" class="form-control minimal-input" placeholder="XAXX010101000">
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted">Dirección Física</label>
                                <input type="text" v-model="form.Direccion" class="form-control minimal-input" placeholder="Calle, Número, Ciudad...">
                            </div>
                            <div class="col-12 mt-4">
                                <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">Datos de Contacto</h6>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted">Nombre de Contacto</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fa-regular fa-user text-muted"></i></span>
                                    <input type="text" v-model="form.NombreContacto" class="form-control minimal-input border-start-0" placeholder="Ej. Lic. María López">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Teléfono / WhatsApp</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-phone text-muted"></i></span>
                                    <input type="text" v-model="form.Telefono" class="form-control minimal-input border-start-0" placeholder="55 1234 5678">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Correo Electrónico</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fa-regular fa-envelope text-muted"></i></span>
                                    <input type="email" v-model="form.Email" class="form-control minimal-input border-start-0" placeholder="contacto@proveedor.com">
                                </div>
                            </div>
                            <div class="col-12 d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                                <router-link to="/proveedores" class="btn btn-outline-secondary minimal-btn px-4 fw-bold">
                                    Cancelar
                                </router-link>
                                <button type="submit" class="btn btn-primary minimal-btn px-4 fw-bold shadow-sm" :disabled="isSaving">
                                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ isSaving ? 'Guardando...' : 'Guardar Proveedor' }}
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
[data-bs-theme="dark"] .input-group-text {
    background-color: #2b2b2b !important;
    border-color: #444;
}
[data-bs-theme="dark"] .input-group .form-control {
    border-left: 0;
}
</style>