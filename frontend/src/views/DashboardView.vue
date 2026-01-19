<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import dashboardService from '@/services/dashboardService';

const authStore = useAuthStore();
const loading = ref(true);
const kpi = ref({
    ventasHoy: 0,
    ventasMes: 0,
    stockBajo: 0
});
const ultimasVentas = ref([]);

onMounted(async () => {
    loading.value = true;
    try {
        const { data } = await dashboardService.getResumen();
        kpi.value.ventasHoy = data.ventasHoy;
        kpi.value.ventasMes = data.ventasMes;
        kpi.value.stockBajo = data.stockBajo;
        ultimasVentas.value = data.ventasRecientes;

    } catch (error) {
        console.error("Error cargando dashboard", error);
    } finally {
        loading.value = false;
    }
});

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="mb-4">
            <h2 class="fw-bold mb-1">Hola, {{ authStore.user?.Nombre || 'Usuario' }} 👋</h2>
            <p class="text-muted small">Resumen de actividad en tiempo real.</p>
        </div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else>
            <div class="row g-4 mb-4">
                <div class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm h-100 minimal-card bg-primary bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-white rounded-circle p-2 text-primary shadow-sm me-3" style="width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
                                    <i class="fa-solid fa-cash-register fs-5"></i>
                                </div>
                                <h6 class="fw-bold text-muted m-0">Ventas Hoy</h6>
                            </div>
                            <h3 class="fw-bold text-dark mb-0">${{ kpi.ventasHoy.toFixed(2) }}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm h-100 minimal-card bg-success bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-white rounded-circle p-2 text-success shadow-sm me-3" style="width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
                                    <i class="fa-solid fa-calendar-check fs-5"></i>
                                </div>
                                <h6 class="fw-bold text-muted m-0">Ventas del Mes</h6>
                            </div>
                            <h3 class="fw-bold text-dark mb-0">${{ kpi.ventasMes.toFixed(2) }}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="card border-0 shadow-sm h-100 minimal-card bg-warning bg-opacity-10">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-white rounded-circle p-2 text-warning shadow-sm me-3" style="width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
                                    <i class="fa-solid fa-triangle-exclamation fs-5"></i>
                                </div>
                                <h6 class="fw-bold text-muted m-0">Stock Bajo</h6>
                            </div>
                            <h3 class="fw-bold text-dark mb-0">
                                {{ kpi.stockBajo }} 
                                <small class="fs-6 text-muted fw-normal">artículos</small>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card border-0 shadow-sm h-100 minimal-card">
                        <div class="card-header bg-white py-3 border-bottom-0">
                            <h6 class="fw-bold m-0"><i class="fa-solid fa-bolt text-warning me-2"></i>Accesos Rápidos</h6>
                        </div>
                        <div class="card-body pt-0">
                            <div class="d-grid gap-2">
                                <router-link to="/pos" class="btn btn-primary fw-bold text-start p-3 shadow-sm">
                                    <i class="fa-solid fa-cart-shopping me-2"></i> Ir al Punto de Venta
                                </router-link>
                                <router-link to="/articulos/nuevo" class="btn btn-outline-secondary fw-bold text-start p-3">
                                    <i class="fa-solid fa-shirt me-2"></i> Agregar Producto
                                </router-link>
                                <router-link to="/entradas/nueva" class="btn btn-outline-secondary fw-bold text-start p-3">
                                    <i class="fa-solid fa-truck-ramp-box me-2"></i> Registrar Compra
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-8">
                    <div class="card border-0 shadow-sm h-100 minimal-card">
                        <div class="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold m-0">Últimas Transacciones</h6>
                            <router-link to="/historial/ventas" class="text-decoration-none small fw-bold">Ver historial completo</router-link>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="ps-4 small text-muted text-uppercase">Folio</th>
                                        <th class="small text-muted text-uppercase">Fecha</th>
                                        <th class="small text-muted text-uppercase">Vendedor</th>
                                        <th class="small text-muted text-uppercase text-end pe-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="ultimasVentas.length === 0">
                                        <td colspan="4" class="text-center py-5 text-muted small">
                                            Sin actividad reciente el día de hoy.
                                        </td>
                                    </tr>
                                    <tr v-for="v in ultimasVentas" :key="v.IdVenta">
                                        <td class="ps-4 fw-bold text-primary">#{{ v.IdVenta }}</td>
                                        <td class="text-muted small">{{ formatDate(v.Fecha) }}</td>
                                        <td class="small">{{ v.Vendedor || 'Sistema' }}</td>
                                        <td class="text-end fw-bold text-success pe-4">${{ Number(v.Total).toFixed(2) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.minimal-card { overflow: hidden; }
</style>