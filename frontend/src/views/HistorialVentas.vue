<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import ventaService from '@/services/ventaService';
import comboService from '@/services/comboService';
import puntosEntregaService from '@/services/puntosEntregaService';
import { generarTicketPDF } from '@/utils/ticketGenerator';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const ventas = ref([]);
const detalleActual = ref([]);
const combosCatalogo = ref([]);
const puntosEntrega = ref([]); 
const ventaSeleccionada = ref({});
const loading = ref(false);
const loadingDetalle = ref(false);
const authStore = useAuthStore();
const configStore = useConfigStore();
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
const loadCatalogos = async () => {
    try {
        const [comboRes, puntosRes] = await Promise.all([
            comboService.getCombos(),
            puntosEntregaService.getPuntos()
        ]);
        combosCatalogo.value = comboRes.data;
        puntosEntrega.value = puntosRes.data;
        if (!configStore.isLoaded) await configStore.fetchConfig();
    } catch (error) {
        console.error("Error cargando catálogos auxiliares", error);
    }
};
const getLinkMapa = (nombrePunto) => {
    if (!nombrePunto) return null;
    const punto = puntosEntrega.value.find(p => p.NombrePunto === nombrePunto);
    return punto ? punto.LinkGoogleMaps : null;
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
        detalleActual.value = data.map(item => {
            if (item.Tipo === 'COMBO') {
                const comboOriginal = combosCatalogo.value.find(c => 
                    c.IdCombo === item.IdProducto || c.Nombre === item.Producto
                );
                if (comboOriginal && comboOriginal.ingredientes) {
                    return { ...item, ingredientes: comboOriginal.ingredientes, esCombo: true };
                }
                return { ...item, esCombo: true, ingredientes: [] };
            }
            return { ...item, esCombo: false };
        });
        
    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los detalles.', 'error');
    } finally {
        loadingDetalle.value = false;
    }
};
const reimprimirTicket = async (venta) => {
    let ventaObj = venta;
    if (typeof venta === 'number' || typeof venta === 'string') {
        ventaObj = ventas.value.find(v => v.IdVenta === venta);
    }
    if (!ventaObj) return;
    try {
        Swal.fire({ title: 'Generando Ticket...', didOpen: () => Swal.showLoading() });
        const { data: detalles } = await ventaService.getDetalleVenta(ventaObj.IdVenta);
        const carritoReconstruido = detalles.map(item => {
            let ingredientes = [];
            if (item.Tipo === 'COMBO') {
                const c = combosCatalogo.value.find(x => x.IdCombo === item.IdProducto || x.Nombre === item.Producto);
                if (c) ingredientes = c.ingredientes;
            }
            return {
                cantidad: item.Cantidad,
                nombre: item.Producto,
                precio: item.PrecioUnitario,
                esCombo: item.Tipo === 'COMBO',
                ingredientes: ingredientes
            };
        });
        const punto = puntosEntrega.value.find(p => p.NombrePunto === ventaObj.PuntoEntrega);
        const linkMaps = punto ? punto.LinkGoogleMaps : null;
        const logo = configStore.fullLogoUrl || null;
        const configData = {
            NombreTienda: configStore.nombreTienda,
            Direccion: configStore.direccion,
            Telefono: configStore.telefono,
            MensajeTicket: configStore.mensajeTicket
        };
        await generarTicketPDF(
            ventaObj.IdVenta,
            ventaObj.Vendedor,
            carritoReconstruido,
            ventaObj.Total,
            logo,
            null,
            null,
            configData,
            ventaObj.ClienteNombre,
            linkMaps,
            formatDate(ventaObj.Fecha)
        );
        Swal.close();
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo generar el ticket.', 'error');
    }
};

onMounted(() => {
    loadVentas();
    loadCatalogos();
});

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
                                <td><div class="fw-bold">{{ v.ClienteNombre || 'Público General' }}</div></td>
                                <td>
                                    <span class="badge bg-light text-dark border">
                                        <i class="fa-solid fa-map-pin me-1 text-danger"></i> {{ v.PuntoEntrega || 'Local' }}
                                    </span>
                                </td>
                                <td class="small text-muted">{{ v.Vendedor || 'Sistema' }}</td>
                                <td class="fw-bold text-success">${{ Number(v.Total).toFixed(2) }}</td>
                                <td class="text-end pe-4">
                                    <button @click="verDetalle(v)" class="btn btn-sm btn-outline-secondary border-0 me-2" title="Ver Detalles">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button @click="reimprimirTicket(v)" class="btn btn-sm btn-outline-primary border-0 bg-light-subtle" title="Reimprimir Ticket">
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
                        <div class="bg-light p-3 rounded mb-3 small border">
                            <div class="row g-2">
                                <div class="col-6">
                                    <span class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Cliente</span>
                                    <span class="fw-bold text-dark"><i class="fa-solid fa-user me-1 text-secondary"></i>{{ ventaSeleccionada.ClienteNombre || 'Público General' }}</span>
                                </div>
                                <div class="col-6">
                                    <span class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Atendido por</span>
                                    <span class="fw-bold text-dark"><i class="fa-solid fa-user-tag me-1 text-secondary"></i>{{ ventaSeleccionada.Vendedor || 'Sistema' }}</span>
                                </div>
                                <div class="col-12 border-top pt-2 mt-2">
                                    <span class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Punto de Entrega</span>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <span class="fw-bold text-dark">
                                            <i class="fa-solid fa-map-location-dot me-1 text-danger"></i>
                                            {{ ventaSeleccionada.PuntoEntrega }}
                                        </span>
                                        <a v-if="getLinkMapa(ventaSeleccionada.PuntoEntrega)" 
                                           :href="getLinkMapa(ventaSeleccionada.PuntoEntrega)" 
                                           target="_blank" 
                                           class="btn btn-sm btn-link text-decoration-none p-0 fw-bold">
                                            Ver Mapa <i class="fa-solid fa-arrow-up-right-from-square ms-1"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="loadingDetalle" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-sm align-middle mb-0">
                                <thead class="text-muted small bg-light">
                                    <tr>
                                        <th class="ps-3">Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-end pe-3">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in detalleActual" :key="idx" :class="{'border-bottom-0': item.esCombo}">
                                        <td class="ps-3 py-2">
                                            <div class="fw-bold small">{{ item.Producto }}</div>
                                            <span v-if="item.esCombo" class="badge bg-primary" style="font-size: 0.6em;">PACK</span>
                                            <div v-if="item.esCombo && item.ingredientes && item.ingredientes.length > 0" class="mt-1 ps-2 border-start border-2 ms-1">
                                                <div v-for="(ing, i) in item.ingredientes" :key="i" class="text-muted fst-italic" style="font-size: 0.75rem;">
                                                    • {{ ing.Cantidad }} {{ ing.NomArticulo }}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="text-center small align-top py-2">x{{ item.Cantidad }}</td>
                                        <td class="text-end pe-3 fw-bold small align-top py-2">${{ Number(item.PrecioUnitario).toFixed(2) }}</td>
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
                        <button @click="reimprimirTicket(ventaSeleccionada)" class="btn btn-primary btn-sm fw-bold">
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