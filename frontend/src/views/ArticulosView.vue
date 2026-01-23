<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import articuloService from '@/services/articuloService';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const articulos = ref([]);
const loading = ref(false);
const authStore = useAuthStore();
const articuloSeleccionado = ref({});
let modalDetalleInstance = null;
const totalStock = computed(() => {
    return articulos.value.reduce((sum, item) => sum + Number(item.StockActual), 0);
});
const loadArticulos = async () => {
    loading.value = true;
    try {
        const { data } = await articuloService.getArticulos();
        articulos.value = data;
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el inventario.', 'error');
    } finally {
        loading.value = false;
    }
};
const verDetalleProducto = (articulo) => {
    articuloSeleccionado.value = articulo;
    const modalElement = document.getElementById('modalVerProducto');
    if (modalElement) {
        modalDetalleInstance = new Modal(modalElement);
        modalDetalleInstance.show();
    }
};

onMounted(loadArticulos);

const confirmDelete = (articulo) => {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: `Se dará de baja: ${articulo.NomArticulo}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await articuloService.deleteArticulo(articulo.IdArticulo);
                Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
                loadArticulos(); 
            } catch (error) {
                const msg = error.response?.data?.msg || 'No se pudo eliminar.';
                Swal.fire('Error', msg, 'error');
            }
        }
    });
};
const getCategoriaClass = (cat) => {
    if (!cat) return 'bg-secondary';
    const c = cat.toUpperCase();
    if (c === 'TEXTIL') return 'bg-info text-dark';
    if (c === 'INSUMOS') return 'bg-warning text-dark';
    if (c === 'TAZAS') return 'bg-success';
    return 'bg-secondary';
};
const getStockColor = (art) => {
    if (art.StockActual <= art.CantidadMinima) return 'bg-danger';
    if (art.StockActual >= art.CantidadMaxima) return 'bg-success';
    return 'bg-primary';
};
const getBadgeStyle = (nombreColor) => {
    const colores = {
        'negro': '#212529', 'black': '#212529',
        'blanco': '#f8f9fa', 'white': '#f8f9fa',
        'rojo': '#dc3545', 'red': '#dc3545',
        'azul': '#0d6efd', 'blue': '#0d6efd', 'marino': '#002f6c',
        'verde': '#198754', 'green': '#198754',
        'amarillo': '#ffc107', 'yellow': '#ffc107',
        'rosa': '#d63384', 'pink': '#d63384', 'fucsia': '#d63384',
        'gris': '#6c757d', 'gray': '#6c757d',
        'naranja': '#fd7e14', 'orange': '#fd7e14',
        'morado': '#6f42c1', 'purple': '#6f42c1'
    };
    const bg = colores[nombreColor?.toLowerCase()] || '#e9ecef';
    const isDarkBg = ['negro', 'black', 'azul', 'marino', 'rojo', 'verde', 'morado', 'gris'].includes(nombreColor?.toLowerCase());
    return {
        backgroundColor: bg,
        color: isDarkBg ? 'white' : '#212529',
        borderColor: isDarkBg ? 'transparent' : '#dee2e6'
    };
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Mis Insumos y Productos</h2>
                <p class="text-muted m-0 small">
                    Total de piezas físicas: <strong>{{ totalStock }}</strong>
                </p>
            </div>
            <router-link to="/articulos/nuevo" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-plus me-2"></i>Nuevo Artículo
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Cód/ID</th>
                                <th class="py-3 text-muted small text-uppercase">Artículo</th>
                                <th class="py-3 text-muted small text-uppercase">Variantes</th>
                                <th class="py-3 text-muted small text-uppercase">Categoría</th>
                                <th class="py-3 text-muted small text-uppercase">Precio</th>
                                <th class="py-3 text-muted small text-uppercase" style="width: 150px;">Stock</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="articulos.length === 0">
                                <td colspan="7" class="text-center py-5 text-muted">No hay artículos registrados.</td>
                            </tr>
                            <tr v-for="articulo in articulos" :key="articulo.IdArticulo">
                                <td class="ps-4 fw-bold small text-muted">{{ articulo.CodArticulo || '#' + articulo.IdArticulo }}</td>
                                <td class="cursor-pointer" @click="verDetalleProducto(articulo)" title="Clic para ver detalle">
                                    <div class="d-flex align-items-center">
                                        <div class="me-3 border rounded overflow-hidden d-flex align-items-center justify-content-center bg-light" 
                                             style="width: 50px; height: 50px; min-width: 50px;">
                                            <img v-if="articulo.Imagen" 
                                                 :src="`http://20.168.11.169:3001/uploads/${articulo.Imagen}`" 
                                                 class="w-100 h-100 object-fit-cover" 
                                                 alt="Img">
                                            <i v-else class="fa-solid fa-image text-muted opacity-25 fs-5"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-primary text-decoration-underline-hover">{{ articulo.NomArticulo }}</div>
                                            <div class="small text-muted" v-if="articulo.DetallesTecnicos">
                                                {{ articulo.DetallesTecnicos }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex gap-1 align-items-center flex-wrap">
                                        <span v-if="articulo.Talla" class="badge bg-light text-body border">{{ articulo.Talla }}</span>
                                        <span v-if="articulo.Color" class="badge border d-flex align-items-center" :style="getBadgeStyle(articulo.Color)">
                                            <span class="me-1 d-inline-block rounded-circle shadow-sm" style="width: 8px; height: 8px; background-color: rgba(255,255,255,0.8);"></span>
                                            {{ articulo.Color }}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="getCategoriaClass(articulo.Categoria)">{{ articulo.Categoria }}</span>
                                </td>
                                <td class="fw-bold text-success">${{ Number(articulo.PrecioVenta).toFixed(2) }}</td>
                                <td>
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="fw-bold small">
                                            {{ articulo.StockActual }} 
                                            <span class="text-muted fw-normal" style="font-size: 0.8em;">{{ articulo.NombreUnidad || 'Pza' }}</span>
                                        </span>
                                        <i v-if="articulo.StockActual <= articulo.CantidadMinima" class="fa-solid fa-triangle-exclamation text-danger small" title="Stock Bajo"></i>
                                    </div>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" :class="getStockColor(articulo)" role="progressbar" 
                                             :style="{ width: Math.min((articulo.StockActual / (articulo.CantidadMaxima || 100)) * 100, 100) + '%' }">
                                        </div>
                                    </div>
                                </td>
                                <td class="text-end pe-4">
                                    <router-link :to="`/articulos/editar/${articulo.IdArticulo}`" class="btn btn-sm btn-outline-primary me-2 border-0 bg-transparent">
                                        <i class="fa-solid fa-pen"></i>
                                    </router-link>
                                    <button @click="confirmDelete(articulo)" class="btn btn-sm btn-outline-danger border-0 bg-transparent">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Mostrando {{ articulos.length }} registros</small>
            </div>
        </div>
        <div class="modal fade" id="modalVerProducto" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header border-bottom-0 pb-0">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 pt-2">
                        <div class="row g-4">
                            <div class="col-12 col-md-5 d-flex align-items-center justify-content-center bg-light rounded-3 overflow-hidden position-relative" style="min-height: 300px;">
                                <img v-if="articuloSeleccionado.Imagen" 
                                     :src="`http://20.168.11.169:3001/uploads/${articuloSeleccionado.Imagen}`" 
                                     class="w-100 h-100 object-fit-contain position-absolute top-0 start-0 p-3"
                                     alt="Producto Grande">
                                <div v-else class="text-center text-muted opacity-50">
                                    <i class="fa-solid fa-image display-1 mb-2"></i>
                                    <p class="m-0 fw-bold">Sin fotografía</p>
                                </div>
                            </div>
                            <div class="col-12 col-md-7">
                                <div class="mb-3">
                                    <span class="badge mb-2" :class="getCategoriaClass(articuloSeleccionado.Categoria)">
                                        {{ articuloSeleccionado.Categoria }}
                                    </span>
                                    <h3 class="fw-bold mb-1">{{ articuloSeleccionado.NomArticulo }}</h3>
                                    <small class="text-muted fw-bold">SKU: {{ articuloSeleccionado.CodArticulo || 'N/A' }}</small>
                                </div>
                                <div class="p-3 bg-light rounded-3 mb-4 border">
                                    <div class="d-flex justify-content-between align-items-end">
                                        <div>
                                            <small class="text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.7rem;">Precio de Venta</small>
                                            <span class="fs-2 fw-bold text-success">${{ Number(articuloSeleccionado.PrecioVenta).toFixed(2) }}</span>
                                        </div>
                                        <div class="text-end">
                                            <small class="text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.7rem;">Stock Actual</small>
                                            <span class="fs-4 fw-bold text-dark">{{ articuloSeleccionado.StockActual }}</span> 
                                            <span class="small ms-1">{{ articuloSeleccionado.NombreUnidad }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row g-3 mb-4">
                                    <div class="col-6">
                                        <label class="small text-muted fw-bold">Proveedor</label>
                                        <div class="fw-bold text-dark">{{ articuloSeleccionado.NomProveedor }}</div>
                                    </div>
                                    <div class="col-6">
                                        <label class="small text-muted fw-bold">Variantes</label>
                                        <div>
                                            <span v-if="articuloSeleccionado.Talla" class="badge bg-white text-dark border me-1">{{ articuloSeleccionado.Talla }}</span>
                                            <span v-if="articuloSeleccionado.Color" class="badge border" :style="getBadgeStyle(articuloSeleccionado.Color)">{{ articuloSeleccionado.Color }}</span>
                                            <span v-if="!articuloSeleccionado.Talla && !articuloSeleccionado.Color" class="text-muted small">-</span>
                                        </div>
                                    </div>
                                    <div class="col-12" v-if="articuloSeleccionado.DetallesTecnicos">
                                        <label class="small text-muted fw-bold">Descripción / Detalles</label>
                                        <p class="small text-secondary m-0 border-start border-3 ps-3">
                                            {{ articuloSeleccionado.DetallesTecnicos }}
                                        </p>
                                    </div>
                                </div>
                                <div class="d-grid">
                                    <button type="button" class="btn btn-outline-secondary fw-bold" data-bs-dismiss="modal">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
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
.cursor-pointer { cursor: pointer; transition: background-color 0.2s; }
.cursor-pointer:hover { background-color: rgba(0,0,0,0.02); }
.text-decoration-underline-hover:hover { text-decoration: underline; }
[data-bs-theme="dark"] .text-body { color: #e0e0e0 !important; }
</style>