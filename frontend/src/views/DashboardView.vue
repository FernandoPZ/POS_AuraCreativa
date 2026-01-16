<template>
    <div class="container py-4 minimal-bg">
        <h3 class="fw-bold mb-4">Tablero de Control</h3>
        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="card border-0 shadow-sm minimal-card bg-primary text-white h-100">
                    <div class="card-body">
                        <h6 class="opacity-75">Ventas de Hoy</h6>
                        <h2 class="fw-bold mb-0">${{ Number(resumen.ventasHoy).toFixed(2) }}</h2>
                        <small class="opacity-50">Ingresos brutos</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm minimal-card bg-danger text-white h-100">
                    <div class="card-body">
                        <h6 class="opacity-75">Compras de Hoy</h6>
                        <h2 class="fw-bold mb-0">${{ Number(resumen.comprasHoy).toFixed(2) }}</h2>
                        <small class="opacity-50">Salidas de dinero</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm minimal-card bg-success text-white h-100">
                    <div class="card-body">
                        <h6 class="opacity-75">Balance del Día</h6>
                        <h2 class="fw-bold mb-0">
                            ${{ (Number(resumen.ventasHoy) - Number(resumen.comprasHoy)).toFixed(2) }}
                        </h2>
                        <small class="opacity-50">Ganancia operativa</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm minimal-card h-100">
                    <div class="card-header bg-white border-0 py-3">
                        <h6 class="fw-bold mb-0 text-danger">⚠️ Alertas de Stock Bajo (Top 5)</h6>
                    </div>
                    <div class="card-body p-0">
                        <table class="table mb-0 align-middle">
                            <tbody>
                                <tr v-for="(art, i) in resumen.stockBajo" :key="i">
                                    <td class="ps-4">{{ art.NomArticulo }}</td>
                                    <td class="text-end pe-4 fw-bold text-danger">{{ art.StockActual }} pzas</td>
                                </tr>
                                <tr v-if="resumen.stockBajo?.length === 0">
                                    <td colspan="2" class="text-center py-4 text-muted">¡Todo el inventario está sano!</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 shadow-sm minimal-card h-100">
                    <div class="card-header bg-white border-0 py-3">
                        <h6 class="fw-bold mb-0 text-primary">⏱️ Ventas Recientes</h6>
                    </div>
                    <div class="card-body p-0">
                        <table class="table mb-0 align-middle">
                            <tbody>
                                <tr v-for="venta in resumen.ventasRecientes" :key="venta.IdVenta">
                                    <td class="ps-4">
                                        <span class="fw-bold">#{{ venta.IdVenta }}</span> 
                                        <br>
                                        <small class="text-muted">{{ formatearHora(venta.Fecha) }}</small>
                                    </td>
                                    <td>{{ venta.Vendedor }}</td>
                                    <td class="text-end pe-4 fw-bold text-success">${{ Number(venta.Total).toFixed(2) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dashboardService from '@/services/dashboardService';

const resumen = ref({
    ventasHoy: 0,
    comprasHoy: 0,
    stockBajo: [],
    ventasRecientes: []
});

onMounted(async () => {
    try {
        resumen.value = await dashboardService.getResumen();
    } catch (error) {
        console.error("Error cargando dashboard", error);
    }
});

const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};
</script>