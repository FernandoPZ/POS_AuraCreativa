<script setup>
import { ref, onMounted } from 'vue';
import comboService from '@/services/comboService';
import Swal from 'sweetalert2';

const combos = ref([]);
const loading = ref(false);
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Imagen</th> <th class="py-3 text-muted small text-uppercase">Código</th>
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
                                <td class="ps-4" style="width: 80px;">
                                    <div class="border rounded overflow-hidden d-flex align-items-center justify-content-center bg-white" 
                                         style="width: 50px; height: 50px;">
                                        <img v-if="combo.Imagen" 
                                             :src="`${BASE_URL}/uploads/${combo.Imagen}`" 
                                             class="w-100 h-100 object-fit-cover" 
                                             alt="Img">
                                        <i v-else class="fa-solid fa-layer-group text-muted opacity-25 fs-5"></i>
                                    </div>
                                </td>
                                <td class="text-muted small fw-bold">{{ combo.Codigo }}</td>
                                <td>
                                    <div class="fw-bold text-dark">{{ combo.Nombre }}</div>
                                    <small class="text-muted" v-if="combo.ingredientes">
                                        {{ combo.ingredientes.length }} productos
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
    </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.object-fit-cover { object-fit: cover; }
</style>