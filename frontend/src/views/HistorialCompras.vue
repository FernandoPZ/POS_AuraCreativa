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
                <p class="text-muted m-0 small">Registro de entradas de almacén y gastos.</p>
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
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="entradas.length === 0">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    <i class="fa-solid fa-clipboard-list fs-1 mb-3 opacity-25"></i>
                                    <p class="m-0">No hay compras registradas.</p>
                                </td>
                            </tr>
                            <tr v-for="ent in entradas" :key="ent.IdEntrada">
                                <td class="ps-4">
                                    <div class="fw-bold text-dark">#{{ ent.IdEntrada }}</div>
                                    <small class="text-muted">{{ formatDate(ent.Fecha) }}</small>
                                </td>
                                <td>
                                    <div class="fw-bold text-primary">{{ ent.NomProveedor }}</div>
                                    <small class="text-muted" v-if="ent.RFC">{{ ent.RFC }}</small>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border">
                                        <i class="fa-solid fa-user me-1 text-secondary"></i> {{ ent.Usuario || 'Sistema' }}
                                    </span>
                                </td>
                                <td class="fw-bold text-success">
                                    ${{ Number(ent.Total).toFixed(2) }}
                                </td>
                                <td class="text-end pe-4">
                                    <button @click="verDetalle(ent)" class="btn btn-sm btn-outline-secondary border-0 bg-light-subtle hover-shadow" title="Ver Detalle">
                                        <i class="fa-solid fa-eye me-1"></i> Ver
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Mostrando {{ entradas.length }} registros.</small>
            </div>
        </div>
        <div class="modal fade" id="modalDetalle" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header border-bottom-0 pb-0">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close" style="z-index: 1050;"></button>
                    </div>
                    <div class="modal-body pt-0">
                        <div class="text-center mb-4 mt-2">
                            <div class="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style="width: 60px; height: 60px;">
                                <i class="fa-solid fa-receipt fs-3 text-primary"></i>
                            </div>
                            <h5 class="fw-bold mb-1">Detalle de Compra #{{ entradaSeleccionada.IdEntrada }}</h5>
                            <p class="text-muted small">{{ formatDate(entradaSeleccionada.Fecha) }}</p>
                        </div>
                        <div class="row g-3 mb-4 px-3">
                            <div class="col-sm-6">
                                <div class="p-3 border rounded bg-light h-100">
                                    <small class="text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.7rem;">Proveedor</small>
                                    <div class="fw-bold text-dark">{{ entradaSeleccionada.NomProveedor }}</div>
                                    <small class="text-muted" v-if="entradaSeleccionada.RFC">RFC: {{ entradaSeleccionada.RFC }}</small>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="p-3 border rounded bg-light h-100">
                                    <small class="text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.7rem;">Información Adicional</small>
                                    <div><span class="text-muted">Recibió:</span> <strong>{{ entradaSeleccionada.Usuario || 'Sistema' }}</strong></div>
                                    <div v-if="entradaSeleccionada.Comentarios" class="mt-2 pt-2 border-top small text-muted">
                                        <i class="fa-regular fa-comment-dots me-1"></i> {{ entradaSeleccionada.Comentarios }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="loadingDetalle" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                        </div>
                        <div v-else class="table-responsive border rounded">
                            <table class="table table-sm align-middle mb-0">
                                <thead class="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th class="ps-3 py-2">Producto</th>
                                        <th class="text-center py-2">Cant.</th>
                                        <th class="text-end py-2">Costo U.</th>
                                        <th class="text-end pe-3 py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detalleActual" :key="idx">
                                        <td class="ps-3 py-2">
                                            <div class="fw-bold small">{{ item.NomArticulo }}</div>
                                            <small class="text-muted" style="font-size: 0.7rem;">{{ item.CodArticulo }}</small>
                                        </td>
                                        <td class="text-center small py-2">
                                            {{ item.Cantidad }} {{ item.NombreUnidad || 'Pza' }}
                                        </td>
                                        <td class="text-end small text-muted py-2">
                                            ${{ Number(item.CostoUnitario).toFixed(2) }}
                                        </td>
                                        <td class="text-end pe-3 fw-bold small py-2">
                                            ${{ Number(item.Subtotal).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot class="bg-light border-top">
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold pe-3 py-3">Total Compra:</td>
                                        <td class="text-end fw-bold text-success fs-5 pe-3 py-3">
                                            ${{ Number(entradaSeleccionada.Total).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="d-grid mt-4">
                            <button type="button" class="btn btn-outline-secondary fw-bold" data-bs-dismiss="modal">Cerrar Detalle</button>
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
.hover-shadow:hover { box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
</style>