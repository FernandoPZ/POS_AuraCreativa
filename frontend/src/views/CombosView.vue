<script setup>
import { ref, onMounted, computed } from 'vue';
import comboService from '@/services/comboService';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const combos = ref([]);
const loading = ref(false);
const comboSeleccionado = ref({});
let modalDetalleInstance = null;
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const loadCombos = async () => {
    loading.value = true;
    try {
        const { data } = await comboService.getCombos();
        combos.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar los combos.', 'error');
    } finally {
        loading.value = false;
    }
};
const verDetalleCombo = (combo) => {
    comboSeleccionado.value = combo;
    const modalElement = document.getElementById('modalVerCombo');
    if (modalElement) {
        modalDetalleInstance = new Modal(modalElement);
        modalDetalleInstance.show();
    }
};
const valorRealSeleccionado = computed(() => {
    if (!comboSeleccionado.value.ingredientes) return 0;
    return comboSeleccionado.value.ingredientes.reduce((sum, item) => {
        return sum + (Number(item.PrecioVenta || 0) * item.Cantidad);
    }, 0);
});

const confirmDelete = (combo) => {
    Swal.fire({
        title: '¿Eliminar paquete?',
        text: `Se dará de baja: ${combo.Nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await comboService.deleteCombo(combo.IdCombo);
                Swal.fire('Eliminado', 'El combo ha sido dado de baja.', 'success');
                loadCombos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    });
};

onMounted(loadCombos);
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Paquetes y Combos</h2>
                <p class="text-muted m-0 small">Agrupaciones de productos con precio especial.</p>
            </div>
            <router-link to="/combos/nuevo" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-plus me-2"></i>Nuevo Paquete
            </router-link>
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Imagen</th>
                                <th class="py-3 text-muted small text-uppercase">Código</th>
                                <th class="py-3 text-muted small text-uppercase">Nombre del Paquete</th>
                                <th class="py-3 text-muted small text-uppercase">Precio Venta</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="combos.length === 0">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    <i class="fa-solid fa-box-open fs-1 mb-3 opacity-25"></i>
                                    <p class="m-0">No hay paquetes registrados.</p>
                                </td>
                            </tr>
                            <tr v-for="combo in combos" :key="combo.IdCombo">
                                <td class="ps-4 cursor-pointer" style="width: 80px;" @click="verDetalleCombo(combo)" title="Ver detalle">
                                    <div class="border rounded overflow-hidden d-flex align-items-center justify-content-center bg-white shadow-sm" 
                                         style="width: 50px; height: 50px;">
                                        <img v-if="combo.Imagen" 
                                             :src="`${BASE_URL}/uploads/${combo.Imagen}`" 
                                             class="w-100 h-100 object-fit-cover" 
                                             alt="Img">
                                        <i v-else class="fa-solid fa-layer-group text-muted opacity-25 fs-5"></i>
                                    </div>
                                </td>
                                <td class="text-muted small fw-bold">{{ combo.Codigo || 'N/A' }}</td>
                                <td class="cursor-pointer" @click="verDetalleCombo(combo)" title="Ver detalle">
                                    <div class="fw-bold text-primary text-decoration-underline-hover">{{ combo.Nombre }}</div>
                                    <small class="text-muted" v-if="combo.ingredientes">
                                        <i class="fa-solid fa-list-ul me-1"></i>{{ combo.ingredientes.length }} productos
                                    </small>
                                </td>
                                <td class="fw-bold text-success fs-5">
                                    ${{ Number(combo.Precio).toFixed(2) }}
                                </td>
                                <td class="text-end pe-4">
                                    <router-link :to="`/combos/editar/${combo.IdCombo}`" class="btn btn-sm btn-outline-secondary me-2 border-0 bg-transparent">
                                        <i class="fa-solid fa-pen"></i>
                                    </router-link>
                                    <button @click="confirmDelete(combo)" class="btn btn-sm btn-outline-danger border-0 bg-transparent">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Mostrando {{ combos.length }} paquetes.</small>
            </div>
        </div>
        <div class="modal fade" id="modalVerCombo" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header border-bottom-0 p-0">
                        <button type="button" 
                                class="btn-close position-absolute top-0 end-0 m-3" 
                                data-bs-dismiss="modal" 
                                aria-label="Close" 
                                style="z-index: 1050;"></button>
                    </div>
                    <div class="modal-body p-4 pt-2">
                        <div class="row g-4">
                            <div class="col-12 col-md-5 d-flex align-items-center justify-content-center bg-light rounded-3 overflow-hidden position-relative" style="min-height: 300px;">
                                <img v-if="comboSeleccionado.Imagen" 
                                     :src="`${BASE_URL}/uploads/${comboSeleccionado.Imagen}`" 
                                     class="w-100 h-100 object-fit-contain position-absolute top-0 start-0 p-3"
                                     alt="Foto Combo">
                                <div v-else class="text-center text-muted opacity-50">
                                    <i class="fa-solid fa-box-open display-1 mb-2"></i>
                                    <p class="m-0 fw-bold">Sin fotografía</p>
                                </div>
                            </div>
                            <div class="col-12 col-md-7">
                                <div class="mb-3">
                                    <span class="badge bg-primary mb-2">PAQUETE</span>
                                    <h3 class="fw-bold mb-1">{{ comboSeleccionado.Nombre }}</h3>
                                    <small class="text-muted fw-bold">Cod: {{ comboSeleccionado.Codigo || 'N/A' }}</small>
                                </div>
                                <div class="p-3 bg-light rounded-3 mb-4 border">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <small class="text-uppercase text-muted fw-bold" style="font-size: 0.7rem;">Precio del Paquete</small>
                                        <span class="fs-2 fw-bold text-success">${{ Number(comboSeleccionado.Precio).toFixed(2) }}</span>
                                    </div>
                                    <div v-if="valorRealSeleccionado > Number(comboSeleccionado.Precio)" class="border-top pt-2 mt-2">
                                        <div class="d-flex justify-content-between text-muted small">
                                            <span>Precio real (suelto):</span>
                                            <span class="text-decoration-line-through">${{ valorRealSeleccionado.toFixed(2) }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between fw-bold text-primary small mt-1">
                                            <span><i class="fa-solid fa-piggy-bank me-1"></i> Ahorro al cliente:</span>
                                            <span>${{ (valorRealSeleccionado - Number(comboSeleccionado.Precio)).toFixed(2) }}</span>
                                        </div>
                                    </div>
                                </div>
                                <h6 class="small fw-bold text-muted mb-2">Contenido:</h6>
                                <div class="border rounded overflow-hidden">
                                    <ul class="list-group list-group-flush small">
                                        <li v-for="(item, idx) in comboSeleccionado.ingredientes" :key="idx" 
                                            class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fa-solid fa-check text-success me-2" style="font-size: 0.8em;"></i>
                                                {{ item.NomArticulo }}
                                            </div>
                                            <span class="badge bg-light text-dark border">
                                                {{ item.Cantidad }} {{ item.NombreUnidad || 'Pza' }}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="d-grid mt-4">
                                    <button type="button" class="btn btn-outline-secondary fw-bold" data-bs-dismiss="modal">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
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
.cursor-pointer { cursor: pointer; transition: background-color 0.2s; }
.cursor-pointer:hover { background-color: rgba(0,0,0,0.02); }
.text-decoration-underline-hover:hover { text-decoration: underline; }
.object-fit-cover { object-fit: cover; }
.object-fit-contain { object-fit: contain; }
</style>