<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import articuloService from '@/services/articuloService';
import comboService from '@/services/comboService';
import puntosEntregaService from '@/services/puntosEntregaService';
import ventaService from '@/services/ventaService';
import { generarTicketPDF } from '@/utils/ticketGenerator'; 
import Swal from 'sweetalert2';
import logoDefault from '@/assets/logo_default.png';

const authStore = useAuthStore();
const configStore = useConfigStore();
const loading = ref(true);
const procesando = ref(false);
const articulos = ref([]);
const combos = ref([]);
const puntosEntrega = ref([]);
const carrito = ref([]);
const filtros = reactive({
    busqueda: '',
    categoria: 'TODOS'
});
const datosVenta = reactive({
    IdPuntoEntrega: '',
    ClienteNombre: ''
});
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const BASE_URL = API_URL.replace('/api', ''); 

onMounted(async () => {
    loading.value = true;
    try {
        const [artRes, comboRes, puntosRes] = await Promise.all([
            articuloService.getArticulos(),
            comboService.getCombos(),
            puntosEntregaService.getPuntos()
        ]);
        if (!configStore.isLoaded) {
             await configStore.fetchConfig();
        }
        articulos.value = artRes.data;
        combos.value = comboRes.data;
        puntosEntrega.value = puntosRes.data;
        if (puntosEntrega.value.length > 0) {
            datosVenta.IdPuntoEntrega = puntosEntrega.value[0].IdPunto;
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el catálogo.', 'error');
    } finally {
        loading.value = false;
    }
});

const catalogoFiltrado = computed(() => {
    const listaArticulos = articulos.value.map(a => ({
        id: a.IdArticulo,
        nombre: a.NomArticulo,
        codigo: a.CodArticulo,
        precio: Number(a.PrecioVenta),
        stock: Number(a.StockActual),
        imagen: a.Imagen,
        categoria: a.Categoria,
        tipo: 'ARTICULO',
        esCombo: false
    }));
    const listaCombos = combos.value.map(c => ({
        id: c.IdCombo,
        nombre: c.Nombre,
        codigo: c.Codigo,
        precio: Number(c.Precio),
        stock: 999,
        imagen: null,
        categoria: 'PAQUETES',
        tipo: 'COMBO',
        esCombo: true,
        ingredientes: c.ingredientes || []
    }));
    let todo = [...listaArticulos, ...listaCombos];
    if (filtros.busqueda) {
        const term = filtros.busqueda.toLowerCase();
        todo = todo.filter(i =>
            i.nombre.toLowerCase().includes(term) ||
            (i.codigo && i.codigo.toLowerCase().includes(term))
        );
    }
    if (filtros.categoria !== 'TODOS') {
        if (filtros.categoria === 'COMBOS') todo = todo.filter(i => i.esCombo);
        else todo = todo.filter(i => !i.esCombo && i.categoria === filtros.categoria);
    }
    return todo;
});
const totalVenta = computed(() => carrito.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0));
const agregarAlCarrito = (item) => {
    if (!item.esCombo && item.stock <= 0) return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Sin stock', showConfirmButton: false, timer: 1500 });
    const existe = carrito.value.find(i => i.id === item.id && i.tipo === item.tipo);
    if (existe) {
        if (!item.esCombo && existe.cantidad + 1 > item.stock) return Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'Stock insuficiente', timer: 1000, showConfirmButton: false });
        existe.cantidad++;
    } else {
        carrito.value.push({ id: item.id, nombre: item.nombre, tipo: item.tipo, precio: item.precio, cantidad: 1, maxStock: item.stock, esCombo: item.esCombo, ingredientes: item.ingredientes || [] });
    }
};
const cambiarCantidad = (index, delta) => {
    const item = carrito.value[index];
    const nuevaCant = item.cantidad + delta;
    if (nuevaCant <= 0) { carrito.value.splice(index, 1); return; }
    if (delta > 0 && !item.esCombo && nuevaCant > item.maxStock) return Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'Tope de stock', timer: 1000, showConfirmButton: false });
    item.cantidad = nuevaCant;
};
const eliminarItem = (index) => carrito.value.splice(index, 1);
const setCategoria = (cat) => { filtros.categoria = cat; };
const getBadgeClass = (stock) => stock <= 0 ? 'bg-danger' : (stock < 5 ? 'bg-warning text-dark' : 'bg-success');
const procesarVenta = async () => {
    if (carrito.value.length === 0) return Swal.fire('Carrito vacío', 'Agrega productos.', 'warning');
    if (!datosVenta.IdPuntoEntrega) return Swal.fire('Falta punto de entrega', 'Selecciona dónde se entrega.', 'warning');
    procesando.value = true;
    try {
        const payload = {
            clienteNombre: datosVenta.ClienteNombre,
            idPuntoEntrega: datosVenta.IdPuntoEntrega,
            total: totalVenta.value,
            productos: carrito.value.map(i => ({ id: i.id, tipo: i.tipo, cantidad: i.cantidad, precio: i.precio }))
        };
        const { data } = await ventaService.createVenta(payload);
        await Swal.fire({
            icon: 'success', title: `¡Venta #${data.idVenta} Exitosa!`,
            text: 'Inventario actualizado.', timer: 2000, showConfirmButton: false
        });
        const puntoSeleccionado = puntosEntrega.value.find(p => p.IdPunto === datosVenta.IdPuntoEntrega);
        const linkMaps = puntoSeleccionado ? puntoSeleccionado.LinkGoogleMaps : null;
        const logoParaTicket = configStore.fullLogoUrl || logoDefault;
        await generarTicketPDF(
            data.idVenta,
            authStore.user?.Nombre || 'Vendedor',
            carrito.value,
            totalVenta.value,
            logoParaTicket,
            null,
            null,
            {
                NombreTienda: configStore.nombreTienda,
                Direccion: configStore.direccion,
                Telefono: configStore.telefono,
                MensajeTicket: configStore.mensajeTicket
            },
            datosVenta.ClienteNombre,
            linkMaps,
            null
        );
        carrito.value = [];
        datosVenta.ClienteNombre = '';
        const { data: arts } = await articuloService.getArticulos();
        articulos.value = arts;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.response?.data?.msg || 'Error al procesar venta.', 'error');
    } finally {
        procesando.value = false;
    }
};
</script>

<template>
    <div class="container-fluid py-3 fade-in" style="height: calc(100vh - 60px);">
        <div class="row h-100 g-3">
            <div class="col-12 col-md-8 d-flex flex-column h-100">
                <div class="card border-0 shadow-sm mb-3 flex-shrink-0">
                    <div class="card-body p-3">
                        <div class="row g-2 align-items-center">
                            <div class="col-12 col-lg-6">
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-search text-muted"></i></span>
                                    <input type="text" v-model="filtros.busqueda" class="form-control border-start-0 ps-0" placeholder="Buscar producto o código...">
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="d-flex gap-2 overflow-auto pb-1" style="white-space: nowrap;">
                                    <button @click="setCategoria('TODOS')" :class="['btn btn-sm rounded-pill fw-bold', filtros.categoria==='TODOS' ? 'btn-dark' : 'btn-outline-secondary']">Todos</button>
                                    <button @click="setCategoria('COMBOS')" :class="['btn btn-sm rounded-pill fw-bold', filtros.categoria==='COMBOS' ? 'btn-primary' : 'btn-outline-secondary']">Paquetes</button>
                                    <button @click="setCategoria('TEXTIL')" :class="['btn btn-sm rounded-pill fw-bold', filtros.categoria==='TEXTIL' ? 'btn-info' : 'btn-outline-secondary']">Textil</button>
                                    <button @click="setCategoria('TAZAS')" :class="['btn btn-sm rounded-pill fw-bold', filtros.categoria==='TAZAS' ? 'btn-success' : 'btn-outline-secondary']">Tazas</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex-grow-1 overflow-y-auto pe-2 custom-scroll">
                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                    <div v-else class="row g-3">
                        <div v-for="item in catalogoFiltrado" :key="item.tipo + item.id" class="col-6 col-md-4 col-xl-3">
                            <div class="card h-100 border-0 shadow-sm product-card cursor-pointer position-relative overflow-hidden" 
                                 @click="agregarAlCarrito(item)">
                                <div v-if="item.esCombo" class="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 small fw-bold rounded-bottom-start z-1">
                                    <i class="fa-solid fa-layer-group me-1"></i>Pack
                                </div>
                                <div class="card-img-top bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative" style="height: 140px;">
                                    <img v-if="item.imagen" :src="`${BASE_URL}/uploads/${item.imagen}`" class="w-100 h-100 object-fit-cover">
                                    <i v-else-if="item.esCombo" class="fa-solid fa-box-open text-primary opacity-25 display-4"></i>
                                    <i v-else class="fa-solid fa-image text-muted opacity-25 display-4"></i>
                                    <div v-if="!item.esCombo && item.stock <= 0" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center">
                                        <span class="badge bg-danger">AGOTADO</span>
                                    </div>
                                </div>
                                <div class="card-body p-2 d-flex flex-column text-center">
                                    <h6 class="card-title fw-bold mb-1 text-truncate" :title="item.nombre">{{ item.nombre }}</h6>
                                    <small class="text-muted mb-2" style="font-size: 0.75rem;">{{ item.codigo || 'S/C' }}</small>
                                    <div class="mt-auto d-flex justify-content-between align-items-center">
                                        <div class="text-success fw-bold">${{ item.precio.toFixed(2) }}</div>
                                        <span v-if="!item.esCombo" class="badge" :class="getBadgeClass(item.stock)">
                                            {{ item.stock }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-4 h-100">
                <div class="card border-0 shadow h-100 d-flex flex-column">
                    <div class="card-header bg-white border-bottom py-3">
                        <h5 class="fw-bold m-0"><i class="fa-solid fa-cart-shopping me-2 text-primary"></i>Ticket de Venta</h5>
                    </div>
                    <div class="p-3 bg-light border-bottom">
                        <div class="mb-2">
                            <select v-model="datosVenta.IdPuntoEntrega" class="form-select form-select-sm minimal-input fw-bold">
                                <option value="" disabled>-- Punto de Entrega --</option>
                                <option v-for="p in puntosEntrega" :key="p.IdPunto" :value="p.IdPunto">
                                    📍 {{ p.NombrePunto }}
                                </option>
                            </select>
                        </div>
                        <input type="text" v-model="datosVenta.ClienteNombre" class="form-control form-select-sm minimal-input" placeholder="Nombre del Cliente (Opcional)">
                    </div>
                    <div class="flex-grow-1 overflow-y-auto custom-scroll p-0">
                        <div v-if="carrito.length === 0" class="text-center py-5 text-muted opacity-50">
                            <i class="fa-solid fa-basket-shopping display-1 mb-3"></i>
                            <p>El carrito está vacío</p>
                        </div>
                        <ul v-else class="list-group list-group-flush">
                            <li v-for="(item, idx) in carrito" :key="idx" class="list-group-item py-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div class="fw-bold text-truncate pe-2">
                                        <span v-if="item.esCombo" class="badge bg-primary me-1" style="font-size: 0.6rem;">PACK</span>
                                        {{ item.nombre }}
                                    </div>
                                    <div class="fw-bold">${{ (item.precio * item.cantidad).toFixed(2) }}</div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="input-group input-group-sm" style="width: 100px;">
                                        <button class="btn btn-outline-secondary" @click="cambiarCantidad(idx, -1)">-</button>
                                        <input type="text" class="form-control text-center bg-white px-0" :value="item.cantidad" readonly>
                                        <button class="btn btn-outline-secondary" @click="cambiarCantidad(idx, 1)">+</button>
                                    </div>
                                    <button @click="eliminarItem(idx)" class="btn btn-sm text-danger border-0">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card-footer bg-white border-top p-4">
                        <div class="d-flex justify-content-between align-items-end mb-3">
                            <span class="text-muted small">Total a Pagar</span>
                            <h2 class="fw-bold text-success m-0">${{ totalVenta.toFixed(2) }}</h2>
                        </div>
                        <div class="d-grid">
                            <button @click="procesarVenta" class="btn btn-primary btn-lg fw-bold shadow-sm" :disabled="procesando || carrito.length === 0">
                                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="fa-solid fa-money-bill-wave me-2"></i>
                                {{ procesando ? 'Procesando...' : 'COBRAR' }}
                            </button>
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
.product-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
.product-card:active { transform: scale(0.98); }
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #aaa; }
</style>