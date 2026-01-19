<script setup>
import { ref, reactive, onMounted } from 'vue';
import puntosEntregaService from '@/services/puntosEntregaService';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const puntos = ref([]);
const loading = ref(false);
const saving = ref(false);
let modalInstance = null;
const isEditing = ref(false);
const form = reactive({
    IdPunto: null,
    NombrePunto: '',
    LinkGoogleMaps: ''
});
const loadPuntos = async () => {
    loading.value = true;
    try {
        const { data } = await puntosEntregaService.getPuntos();
        puntos.value = data;
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los puntos.', 'error');
    } finally {
        loading.value = false;
    }
};
const openModal = (punto = null) => {
    if (punto) {
        isEditing.value = true;
        form.IdPunto = punto.IdPunto;
        form.NombrePunto = punto.NombrePunto;
        form.LinkGoogleMaps = punto.LinkGoogleMaps;
    } else {
        isEditing.value = false;
        form.IdPunto = null;
        form.NombrePunto = '';
        form.LinkGoogleMaps = '';
    }
    if (!modalInstance) {
        modalInstance = new Modal(document.getElementById('modalPunto'));
    }
    modalInstance.show();
};
const savePunto = async () => {
    if (!form.NombrePunto) return Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    saving.value = true;
    try {
        if (isEditing.value) {
            await puntosEntregaService.updatePunto(form.IdPunto, form);
            Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
        } else {
            await puntosEntregaService.createPunto(form);
            Swal.fire({ icon: 'success', title: 'Creado', timer: 1500, showConfirmButton: false });
        }
        modalInstance.hide();
        loadPuntos();
    } catch (error) {
        Swal.fire('Error', 'No se pudo guardar.', 'error');
    } finally {
        saving.value = false;
    }
};
const confirmDelete = (punto) => {
    Swal.fire({
        title: '¿Eliminar?',
        text: `Se dará de baja: ${punto.NombrePunto}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await puntosEntregaService.deletePunto(punto.IdPunto);
                Swal.fire('Eliminado', '', 'success');
                loadPuntos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    });
};

onMounted(loadPuntos);
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Puntos de Entrega</h2>
                <p class="text-muted m-0 small">Lugares disponibles para entregar pedidos.</p>
            </div>
            <button @click="openModal()" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-map-location-dot me-2"></i>Nuevo Punto
            </button>
        </div>
        <div class="card minimal-card border-0 shadow-sm">
            <div class="card-body p-0">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4 py-3 text-muted small text-uppercase">Nombre del Punto</th>
                                <th class="py-3 text-muted small text-uppercase">Ubicación (Maps)</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="puntos.length === 0">
                                <td colspan="3" class="text-center py-5 text-muted">No hay puntos registrados.</td>
                            </tr>
                            <tr v-for="punto in puntos" :key="punto.IdPunto">
                                <td class="ps-4 fw-bold">{{ punto.NombrePunto }}</td>
                                <td>
                                    <a v-if="punto.LinkGoogleMaps" :href="punto.LinkGoogleMaps" target="_blank" class="btn btn-sm btn-outline-info border-0">
                                        <i class="fa-solid fa-map-pin me-1"></i> Ver en Mapa
                                    </a>
                                    <span v-else class="text-muted small">- Sin link -</span>
                                </td>
                                <td class="text-end pe-4">
                                    <button @click="openModal(punto)" class="btn btn-sm btn-outline-primary me-2 border-0">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button @click="confirmDelete(punto)" class="btn btn-sm btn-outline-danger border-0">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="modal fade" id="modalPunto" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Punto' : 'Nuevo Punto de Entrega' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Nombre del lugar</label>
                            <input type="text" v-model="form.NombrePunto" class="form-control minimal-input" placeholder="Ej. Estación Metro Centro">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Link de Google Maps</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white text-muted border-end-0"><i class="fa-solid fa-link"></i></span>
                                <input type="text" v-model="form.LinkGoogleMaps" class="form-control minimal-input border-start-0" placeholder="https://maps.google.com/...">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="savePunto" class="btn btn-primary btn-sm fw-bold shadow-sm" :disabled="saving">
                            {{ saving ? 'Guardando...' : 'Guardar' }}
                        </button>
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