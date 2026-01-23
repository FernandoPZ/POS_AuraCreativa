<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ventaService from '@/services/ventaService';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const ventas = ref([]);
const detalleActual = ref([]);
const ventaSeleccionada = ref({});
const loading = ref(false);
const loadingDetalle = ref(false);
const authStore = useAuthStore();
let detalleModal = null;
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const loadVentas = async () => {
    loading.value = true;
    try {
        const { data } = await ventaService.getVentas();
        ventas.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el historial de ventas.', 'error');
    } finally {
        loading.value = false;
    }
};
const verDetalle = async (venta) => {
    ventaSeleccionada.value = venta;
    detalleActual.value = [];
    loadingDetalle.value = true;
    if (!detalleModal) {
        detalleModal = new Modal(document.getElementById('modalDetalleVenta'));
    }
    detalleModal.show();
    try {
        const { data } = await ventaService.getDetalleVenta(venta.IdVenta);
        detalleActual.value = data;
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los detalles.', 'error');
    } finally {
        loadingDetalle.value = false;
    }
};
const reimprimirTicket = (idVenta) => {
    if (!idVenta) return;
    const ticketUrl = `${API_URL}/ventas/${idVenta}/ticket?token=${authStore.token}`;
    window.open(ticketUrl, '_blank');
};

onMounted(loadVentas);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Historial de Ventas</h2>
                <p class="text-muted m-0 small">Consulta de transacciones y reimpresión de tickets.</p>
            </div>
            <button @click="loadVentas" class="btn btn-outline-secondary btn-sm minimal-btn">
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Folio / Fecha</th>
                                <th class="py-3 text-muted small text-uppercase">Cliente</th>
                                <th class="py-3 text-muted small text-uppercase">Punto Entrega</th>
                                <th class="py-3 text-muted small text-uppercase">Vendedor</th>
                                <th class="py-3 text-muted small text-uppercase">Total</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="ventas.length === 0">
                                <td colspan="6" class="text-center py-5 text-muted">No hay ventas registradas.</td>
                            </tr>
                            <tr v-for="v in ventas" :key="v.IdVenta">
                                <td class="ps-4">
                                    <div class="fw-bold text-dark">#{{ v.IdVenta }}</div>
                                    <small class="text-muted">{{ formatDate(v.Fecha) }}</small>
                                </td>
                                <td>
                                    <div class="fw-bold">{{ v.ClienteNombre || 'Público General' }}</div>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border">
                                        <i class="fa-solid fa-map-pin me-1 text-danger"></i> {{ v.PuntoEntrega || 'Local' }}
                                    </span>
                                </td>
                                <td class="small text-muted">
                                    {{ v.Vendedor || 'Sistema' }}
                                </td>
                                <td class="fw-bold text-success">
                                    ${{ Number(v.Total).toFixed(2) }}
                                </td>
                                <td class="text-end pe-4">
                                    <button @click="verDetalle(v)" class="btn btn-sm btn-outline-secondary border-0 me-2" title="Ver Detalles">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button @click="reimprimirTicket(v.IdVenta)" class="btn btn-sm btn-outline-primary border-0 bg-light-subtle" title="Reimprimir Ticket">
                                        <i class="fa-solid fa-print"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Mostrando {{ ventas.length }} transacciones.</small>
            </div>
        </div>

        <div class="modal fade" id="modalDetalleVenta" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-bottom-0 pb-0">
                        <div>
                            <h5 class="modal-title fw-bold">Detalle de Venta #{{ ventaSeleccionada.IdVenta }}</h5>
                            <p class="text-muted small mb-0">{{ formatDate(ventaSeleccionada.Fecha) }}</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="loadingDetalle" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-sm align-middle">
                                <thead class="text-muted small bg-light">
                                    <tr>
                                        <th class="ps-3">Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-end pe-3">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detalleActual" :key="idx">
                                        <td class="ps-3">
                                            <div class="fw-bold small">{{ item.Producto }}</div>
                                            <small v-if="item.Tipo === 'COMBO'" class="badge bg-primary" style="font-size: 0.6em;">PACK</small>
                                        </td>
                                        <td class="text-center small">x{{ item.Cantidad }}</td>
                                        <td class="text-end pe-3 fw-bold small">${{ Number(item.PrecioUnitario).toFixed(2) }}</td>
                                    </tr>
                                </tbody>
                                <tfoot class="border-top">
                                    <tr>
                                        <td colspan="2" class="text-end fw-bold pe-3 pt-3">Total:</td>
                                        <td class="text-end fw-bold text-success fs-5 pe-3 pt-3">
                                            ${{ Number(ventaSeleccionada.Total).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer border-top-0 pt-0">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
                        <button @click="reimprimirTicket(ventaSeleccionada.IdVenta)" class="btn btn-primary btn-sm fw-bold">
                            <i class="fa-solid fa-print me-2"></i>Ticket
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