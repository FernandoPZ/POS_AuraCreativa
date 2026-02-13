<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const logs = ref([]);
const loading = ref(false);
const filtro = ref('');
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const loadLogs = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('token'); 
        const { data } = await axios.get(`${API_URL}/bitacora`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        logs.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la bitácora.', 'error');
    } finally {
        loading.value = false;
    }
};
const logsFiltrados = computed(() => {
    if (!filtro.value) return logs.value;
    const term = filtro.value.toLowerCase();
    return logs.value.filter(log => 
        (log.Usuario && log.Usuario.toLowerCase().includes(term)) ||
        (log.accion && log.accion.toLowerCase().includes(term)) ||
        (log.detalles && log.detalles.toLowerCase().includes(term))
    );
});
const getActionStyle = (accion) => {
    if (!accion) return 'bg-light text-secondary border-secondary';
    const act = accion.toUpperCase();
    if (act.includes('ELIMINAR') || act.includes('BAJA') || act.includes('ERROR')) 
        return 'bg-danger-subtle text-danger border-danger';
    if (act.includes('CREAR') || act.includes('NUEVA') || act.includes('ALTA')) 
        return 'bg-success-subtle text-success border-success';
    if (act.includes('EDITAR') || act.includes('MODIFICAR') || act.includes('ACTUALIZAR')) 
        return 'bg-primary-subtle text-primary border-primary';
    if (act.includes('LOGIN') || act.includes('SESION') || act.includes('INICIO')) 
        return 'bg-warning-subtle text-warning-emphasis border-warning';
    return 'bg-light text-secondary border-secondary';
};
const getIcon = (accion) => {
    if (!accion) return 'fa-circle-info';
    const act = accion.toUpperCase();
    if (act.includes('ELIMINAR')) return 'fa-trash-can';
    if (act.includes('CREAR') || act.includes('NUEVA')) return 'fa-plus-circle';
    if (act.includes('EDITAR')) return 'fa-pen-to-square';
    if (act.includes('LOGIN')) return 'fa-key';
    if (act.includes('VENTA')) return 'fa-cash-register';
    return 'fa-circle-info';
};
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

onMounted(loadLogs);
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Bitácora de Actividades</h2>
                <p class="text-muted m-0 small">Registro de seguridad y movimientos del sistema.</p>
            </div>
            <div>
                <button @click="loadLogs" class="btn btn-outline-secondary btn-sm minimal-btn">
                    <i class="fa-solid fa-rotate-right me-1"></i> Actualizar
                </button>
            </div>
        </div>
        <div class="card minimal-card border-0 shadow-sm mb-4">
            <div class="card-body p-3">
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                        <i class="fa-solid fa-magnifying-glass text-muted"></i>
                    </span>
                    <input type="text" v-model="filtro" class="form-control border-start-0 ps-0 shadow-none" 
                           placeholder="Buscar por usuario, acción (ej: 'eliminar') o detalles...">
                </div>
            </div>
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
                                <th class="ps-4 py-3 text-muted small text-uppercase" style="width: 180px;">Fecha / Hora</th>
                                <th class="py-3 text-muted small text-uppercase" style="width: 200px;">Usuario</th>
                                <th class="py-3 text-muted small text-uppercase" style="width: 150px;">Acción</th>
                                <th class="py-3 text-muted small text-uppercase">Detalle del Evento</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="logsFiltrados.length === 0">
                                <td colspan="4" class="text-center py-5 text-muted">
                                    <i class="fa-solid fa-shield-cat fs-1 mb-3 opacity-25"></i>
                                    <p class="m-0">No se encontraron registros recientes.</p>
                                </td>
                            </tr>
                            <tr v-for="log in logsFiltrados" :key="log.id">
                                <td class="ps-4 text-muted small font-monospace">
                                    {{ formatDate(log.fecha) }}
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-2 border" 
                                             style="width: 32px; height: 32px;">
                                            <i class="fa-solid fa-user text-secondary small"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark small">{{ log.Usuario }}</div>
                                            <small class="text-muted" style="font-size: 0.7rem;">{{ log.Rol || 'Usuario' }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge border d-flex align-items-center justify-content-center w-100 py-2" 
                                          :class="getActionStyle(log.accion)">
                                        <i class="fa-solid me-2" :class="getIcon(log.accion)"></i>
                                        {{ log.accion }}
                                    </span>
                                </td>
                                <td class="text-secondary small">
                                    {{ log.detalles }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-2">
                <small class="text-muted">Mostrando los últimos {{ logsFiltrados.length }} movimientos.</small>
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
.font-monospace { font-family: 'Consolas', 'Monaco', monospace; }
</style>