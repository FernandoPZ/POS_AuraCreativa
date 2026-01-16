<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Swal from 'sweetalert2';

const logs = ref([]);
const loading = ref(false);
const authStore = useAuthStore();
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { Authorization: `Bearer ${authStore.token}` }
});
const loadBitacora = async () => {
    loading.value = true;
    try {
        const { data } = await api.get('/bitacora');
        logs.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el historial.', 'error');
    } finally {
        loading.value = false;
    }
};

onMounted(loadBitacora);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

const getActionBadge = (accion) => {
    const act = accion?.toUpperCase() || '';
    if (act.includes('LOGIN')) return 'bg-info text-dark';
    if (act.includes('CREAR') || act.includes('NUEVA') || act.includes('ALTA')) return 'bg-success';
    if (act.includes('EDITAR') || act.includes('MODIFICAR') || act.includes('CONFIG')) return 'bg-warning text-dark';
    if (act.includes('ELIMINAR') || act.includes('BAJA') || act.includes('BORRAR')) return 'bg-danger';
    return 'bg-secondary';
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Bitácora de Actividades</h2>
                <p class="text-muted m-0 small">Registro de seguridad y movimientos del sistema.</p>
            </div>
            <button @click="loadBitacora" class="btn btn-outline-secondary btn-sm minimal-btn">
                <i class="fa-solid fa-rotate me-2"></i>Actualizar
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Fecha / Hora</th>
                                <th class="py-3 text-muted small text-uppercase">Usuario</th>
                                <th class="py-3 text-muted small text-uppercase">Acción</th>
                                <th class="py-3 text-muted small text-uppercase">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="logs.length === 0">
                                <td colspan="4" class="text-center py-5 text-muted">No hay actividad registrada.</td>
                            </tr>
                            <tr v-for="log in logs" :key="log.id">
                                <td class="ps-4 text-muted small fw-bold" style="white-space: nowrap;">
                                    {{ formatDate(log.fecha) }}
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 border" style="width: 32px; height: 32px;">
                                            <i class="fa-solid fa-user text-secondary small"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold fs-6">{{ log.Usuario }}</div>
                                            <div class="small text-muted" style="font-size: 0.75rem;">{{ log.Rol }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge border" :class="getActionBadge(log.accion)">
                                        {{ log.accion }}
                                    </span>
                                </td>
                                <td class="text-muted small">
                                    {{ log.detalles }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-white border-top py-3">
                <small class="text-muted">Mostrando los últimos {{ logs.length }} registros</small>
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