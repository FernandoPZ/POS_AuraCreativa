<script setup>
import { ref, onMounted } from 'vue';
import comboService from '@/services/comboService';
import Swal from 'sweetalert2';

const combos = ref([]);
const loading = ref(false);
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
                <i class="fa-solid fa-layer-group me-2"></i>Nuevo Combo
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Código</th>
                                <th class="py-3 text-muted small text-uppercase">Nombre del Combo</th>
                                <th class="py-3 text-muted small text-uppercase">Precio Venta</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="combos.length === 0">
                                <td colspan="4" class="text-center py-5 text-muted">No hay combos registrados.</td>
                            </tr>
                            <tr v-for="combo in combos" :key="combo.IdCombo">
                                <td class="ps-4 text-muted small fw-bold">{{ combo.Codigo }}</td>
                                <td class="fw-bold text-primary">{{ combo.Nombre }}</td>
                                <td class="fw-bold text-success fs-5">${{ Number(combo.Precio).toFixed(2) }}</td>
                                <td class="text-end pe-4">
                                    <router-link :to="`/combos/editar/${combo.IdCombo}`" class="btn btn-sm btn-outline-secondary me-2 border-0">
                                        <i class="fa-solid fa-pen"></i>
                                    </router-link>
                                    <button @click="confirmDelete(combo)" class="btn btn-sm btn-outline-danger border-0">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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