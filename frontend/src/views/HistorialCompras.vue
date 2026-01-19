<script setup>
import { ref, onMounted } from 'vue';
import entradaService from '@/services/entradaService';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const entradas = ref([]);
const detalleActual = ref([]);
const entradaSeleccionada = ref({});
const loading = ref(false);
const loadingDetalle = ref(false);
let detalleModal = null;
const loadEntradas = async () => {
    loading.value = true;
    try {
        const { data } = await entradaService.getEntradas();
        entradas.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el historial.', 'error');
    } finally {
        loading.value = false;
    }
};
const verDetalle = async (entrada) => {
    entradaSeleccionada.value = entrada;
    detalleActual.value = [];
    loadingDetalle.value = true;
    if (!detalleModal) {
        detalleModal = new Modal(document.getElementById('modalDetalle'));
    }
    detalleModal.show();
    try {
        const { data } = await entradaService.getDetalleEntrada(entrada.IdEntrada);
        detalleActual.value = data;
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los detalles.', 'error');
    } finally {
        loadingDetalle.value = false;
    }
};

onMounted(loadEntradas);

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
                <h2 class="fw-bold mb-1">Historial de Compras</h2>
                <p class="text-muted m-0 small">Registro de entradas de almacén.</p>
            </div>
            <router-link to="/entradas/nueva" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-cart-plus me-2"></i>Nueva Compra
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Folio / Fecha</th>
                                <th class="py-3 text-muted small text-uppercase">Proveedor</th>
                                <th class="py-3 text-muted small text-uppercase">Registrado por</th>
                                <th class="py-3 text-muted small text-uppercase">Total</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="entradas.length === 0">
                                <td colspan="5" class="text-center py-5 text-muted">No hay compras registradas.</td>
                            </tr>
                            <tr v-for="ent in entradas" :key="ent.IdEntrada">
                                <td class="ps-4">
                                    <div class="fw-bold text-dark">#{{ ent.IdEntrada }}</div>
                                    <small class="text-muted">{{ formatDate(ent.Fecha) }}</small>
                                </td>
                                <td>
                                    <div class="fw-bold">{{ ent.NomProveedor }}</div>
                                    <small class="text-muted" v-if="ent.RFC">{{ ent.RFC }}</small>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border">
                                        <i class="fa-solid fa-user me-1 text-muted"></i> {{ ent.Usuario || 'Sistema' }}
                                    </span>
                                </td>
                                <td class="fw-bold text-success">
                                    ${{ Number(ent.Total).toFixed(2) }}
                                </td>
                                <td class="text-end pe-4">
                                    <button @click="verDetalle(ent)" class="btn btn-sm btn-outline-primary border-0 bg-light-subtle">
                                        <i class="fa-solid fa-eye me-1"></i> Ver Ticket
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="modal fade" id="modalDetalle" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-bottom-0 pb-0">
                        <div>
                            <h5 class="modal-title fw-bold">Detalle de Compra #{{ entradaSeleccionada.IdEntrada }}</h5>
                            <p class="text-muted small mb-0">{{ entradaSeleccionada.NomProveedor }} - {{ formatDate(entradaSeleccionada.Fecha) }}</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="entradaSeleccionada.Comentarios" class="alert alert-light border mb-3 small">
                            <strong>Nota:</strong> {{ entradaSeleccionada.Comentarios }}
                        </div>
                        <div v-if="loadingDetalle" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                            <span class="ms-2 small text-muted">Cargando productos...</span>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-sm align-middle">
                                <thead class="text-muted small bg-light">
                                    <tr>
                                        <th class="ps-3">Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-end">Costo U.</th>
                                        <th class="text-end pe-3">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detalleActual" :key="idx">
                                        <td class="ps-3">
                                            <div class="fw-bold small">{{ item.NomArticulo }}</div>
                                            <small class="text-muted" style="font-size: 0.75rem;">{{ item.CodArticulo }}</small>
                                        </td>
                                        <td class="text-center small">
                                            {{ item.Cantidad }} {{ item.NombreUnidad || 'Pza' }}
                                        </td>
                                        <td class="text-end small text-muted">
                                            ${{ Number(item.CostoUnitario).toFixed(2) }}
                                        </td>
                                        <td class="text-end pe-3 fw-bold small">
                                            ${{ Number(item.Subtotal).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot class="border-top">
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold pe-3 pt-3">Total Pagado:</td>
                                        <td class="text-end fw-bold text-success fs-6 pe-3 pt-3">
                                            ${{ Number(entradaSeleccionada.Total).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer border-top-0 pt-0">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
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