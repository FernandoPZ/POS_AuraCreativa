<template>
    <div class="container py-4 minimal-bg">
        <h3 class="fw-bold mb-4 text-success">
            <i class="fa-solid fa-cash-register me-2"></i>Historial de Ventas
        </h3>
        <div class="card border-0 shadow-sm minimal-card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-success bg-opacity-10">
                            <tr>
                                <th class="ps-4">Folio</th>
                                <th>Fecha</th>
                                <th>Vendedor</th>
                                <th>Total</th>
                                <th class="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="venta in ventas" :key="venta.IdVenta">
                                <tr :class="{'table-active': venta.expandido}" style="cursor: pointer;" @click="toggleDetalle(venta)">
                                    <td class="ps-4 fw-bold">#{{ venta.IdVenta }}</td>
                                    <td>
                                        <div class="d-flex flex-column">
                                            <span class="fw-bold">{{ formatearFecha(venta.Fecha) }}</span>
                                            <small class="text-muted">{{ formatearHora(venta.Fecha) }}</small>
                                        </div>
                                    </td>
                                    <td>{{ venta.Vendedor }}</td>
                                    <td class="fs-5 fw-bold text-dark">${{ Number(venta.Total).toFixed(2) }}</td>
                                    <td class="text-end pe-4">
                                        <button class="btn btn-sm btn-outline-success rounded-pill">
                                            {{ venta.expandido ? 'Ocultar' : 'Ver Productos' }}
                                            <i :class="venta.expandido ? 'fa-chevron-up' : 'fa-chevron-down'" class="ms-1 fa-solid"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="venta.expandido">
                                    <td colspan="5" class="p-0 bg-light">
                                        <div class="p-3">
                                            <div v-if="venta.cargando" class="text-center py-2 text-muted">
                                                <i class="fas fa-spinner fa-spin me-2"></i> Cargando productos...
                                            </div>
                                            
                                            <table v-else class="table table-sm table-bordered bg-white mb-0 w-75 mx-auto shadow-sm">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Producto / Combo</th>
                                                        <th class="text-center">Cant.</th>
                                                        <th class="text-end">Precio U.</th>
                                                        <th class="text-end">Importe</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(item, i) in venta.detalles" :key="i">
                                                        <td>
                                                            <span v-if="item.Tipo === 'COMBO'" class="badge bg-warning text-dark me-1">KIT</span>
                                                            {{ item.Producto }}
                                                        </td>
                                                        <td class="text-center">{{ item.Cantidad }}</td>
                                                        <td class="text-end">${{ Number(item.PrecioUnitario).toFixed(2) }}</td>
                                                        <td class="text-end fw-bold">${{ Number(item.Subtotal).toFixed(2) }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ventaService from '@/services/ventaService';

const ventas = ref([]);

onMounted(async () => {
    try {
        const data = await ventaService.getVentas();
        ventas.value = data.map(v => ({ 
            ...v, 
            expandido: false, 
            cargando: false, 
            detalles: [] 
        }));
    } catch (error) {
        console.error("Error cargando historial", error);
    }
});

const toggleDetalle = async (venta) => {
    if (venta.expandido) {
        venta.expandido = false;
        return;
    }
    if (venta.detalles.length === 0) {
        venta.cargando = true;
        venta.expandido = true;
        try {
            const detalles = await ventaService.getVentaDetalles(venta.IdVenta);
            venta.detalles = detalles;
        } catch (error) {
            alert("Error al cargar detalles");
        } finally {
            venta.cargando = false;
        }
    } else {
        venta.expandido = true;
    }
};

const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-MX', {day: '2-digit', month: 'short'});
const formatearHora = (fecha) => new Date(fecha).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
</script>