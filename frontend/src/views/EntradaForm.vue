<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import proveedorService from '@/services/proveedorService';
import articuloService from '@/services/articuloService';
import entradaService from '@/services/entradaService';
import Swal from 'sweetalert2';

const router = useRouter();
const proveedores = ref([]);
const articulos = ref([]);
const carrito = ref([]);
const loading = ref(false);
const saving = ref(false);
const encabezado = reactive({
    IdProveedor: '',
    Comentarios: ''
});
const itemActual = reactive({
    IdArticulo: '',
    Cantidad: 1,
    Costo: 0
});

onMounted(async () => {
    loading.value = true;
    try {
        const [provRes, artRes] = await Promise.all([
            proveedorService.getProveedores(),
            articuloService.getArticulos()
        ]);
        proveedores.value = provRes.data;
        articulos.value = artRes.data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar los catálogos.', 'error');
    } finally {
        loading.value = false;
    }
});

const articuloSeleccionado = computed(() => {
    return articulos.value.find(a => a.IdArticulo === itemActual.IdArticulo);
});
const totalCompra = computed(() => {
    return carrito.value.reduce((sum, item) => sum + item.Subtotal, 0);
});
const preventNegatives = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
};
const agregarItem = async () => {
    if (!itemActual.IdArticulo) return Swal.fire('Falta producto', 'Selecciona un artículo.', 'warning');
    if (itemActual.Cantidad <= 0) return Swal.fire('Cantidad inválida', 'La cantidad debe ser mayor a 0.', 'warning');
    if (itemActual.Costo < 0) return Swal.fire('Costo inválido', 'El costo no puede ser negativo.', 'warning');
    if (Number(itemActual.Costo) === 0) {
        const result = await Swal.fire({
            title: '¿Costo $0.00?',
            text: "Estás registrando un producto sin costo. ¿Es una bonificación o regalo?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, es correcto',
            cancelButtonText: 'Corregir'
        });
        if (!result.isConfirmed) return;
    }
    const art = articuloSeleccionado.value;
    const linea = {
        IdArticulo: art.IdArticulo,
        NomArticulo: art.NomArticulo,
        CodArticulo: art.CodArticulo,
        NombreUnidad: art.NombreUnidad || 'Pza',
        Cantidad: Number(itemActual.Cantidad),
        Costo: Number(itemActual.Costo),
        Subtotal: Number(itemActual.Cantidad) * Number(itemActual.Costo)
    };
    const existe = carrito.value.find(i => i.IdArticulo === linea.IdArticulo);
    if (existe) {
        existe.Cantidad += linea.Cantidad;
        existe.Costo = linea.Costo;
        existe.Subtotal = existe.Cantidad * existe.Costo; 
        Swal.fire({ 
            toast: true, position: 'top-end', icon: 'info', 
            title: 'Cantidad actualizada', timer: 1500, showConfirmButton: false 
        });
    } else {
        carrito.value.push(linea);
    }
    itemActual.IdArticulo = '';
    itemActual.Cantidad = 1;
    itemActual.Costo = 0;
};
const eliminarItem = (index) => {
    carrito.value.splice(index, 1);
};
const guardarEntrada = async () => {
    if (!encabezado.IdProveedor) return Swal.fire('Atención', 'Selecciona un Proveedor.', 'warning');
    if (carrito.value.length === 0) return Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');
    saving.value = true;
    try {
        const payload = {
            IdProveedor: encabezado.IdProveedor,
            Total: totalCompra.value,
            Comentarios: encabezado.Comentarios,
            Productos: carrito.value
        };
        const { data } = await entradaService.createEntrada(payload);
        await Swal.fire({
            icon: 'success',
            title: '¡Compra Registrada!',
            text: `Entrada #${data.IdEntrada} guardada correctamente.`,
            confirmButtonText: 'Aceptar'
        });
        router.push('/entradas'); 
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.response?.data?.msg || 'No se pudo guardar la compra.', 'error');
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Nueva Entrada de Almacén</h2>
                <p class="text-muted m-0 small">Registrar compra de insumos o mercancía.</p>
            </div>
            <router-link to="/articulos" class="btn btn-outline-secondary minimal-btn fw-bold">
                Cancelar
            </router-link>
        </div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>
        <div v-else class="row g-4">
            <div class="col-12 col-lg-4">
                <div class="card minimal-card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                            <i class="fa-solid fa-truck me-2"></i>Proveedor
                        </h6>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Seleccionar Proveedor <span class="text-danger">*</span></label>
                            <select v-model="encabezado.IdProveedor" class="form-select minimal-input">
                                <option value="" disabled>-- Elige una opción --</option>
                                <option v-for="prov in proveedores" :key="prov.IdProveedor" :value="prov.IdProveedor">
                                    {{ prov.NomProveedor }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-0">
                            <label class="form-label small fw-bold text-muted">Comentarios / Factura</label>
                            <textarea v-model="encabezado.Comentarios" class="form-control minimal-input" rows="2" placeholder="Ej. Factura F-1234..." maxlength="200"></textarea>
                        </div>
                    </div>
                </div>
                <div class="card minimal-card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h6 class="text-success text-uppercase small fw-bold mb-3 border-bottom pb-2">
                            <i class="fa-solid fa-box-open me-2"></i>Agregar Producto
                        </h6>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Artículo / Insumo</label>
                            <select v-model="itemActual.IdArticulo" class="form-select minimal-input">
                                <option value="" disabled>-- Busca el producto --</option>
                                <option v-for="art in articulos" :key="art.IdArticulo" :value="art.IdArticulo">
                                    {{ art.NomArticulo }} (Stock: {{ art.StockActual }})
                                </option>
                            </select>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Cantidad</label>
                                <input type="number" 
                                       v-model.number="itemActual.Cantidad" 
                                       class="form-control minimal-input text-center fw-bold" 
                                       min="1" 
                                       @keydown="preventNegatives">
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Costo Unitario ($)</label>
                                <input type="number" 
                                       v-model.number="itemActual.Costo" 
                                       class="form-control minimal-input text-end fw-bold text-success" 
                                       min="0" 
                                       step="0.50" 
                                       @keydown="preventNegatives">
                            </div>
                        </div>
                        <div v-if="articuloSeleccionado" class="mt-3 p-2 bg-light rounded border small text-muted">
                            <div class="d-flex justify-content-between">
                                <span>Precio Venta Actual:</span>
                                <strong>${{ Number(articuloSeleccionado.PrecioVenta).toFixed(2) }}</strong>
                            </div>
                            <div v-if="Number(itemActual.Costo) > Number(articuloSeleccionado.PrecioVenta)" class="text-danger fw-bold mt-1">
                                <i class="fa-solid fa-triangle-exclamation me-1"></i> ¡Costo mayor que precio venta!
                            </div>
                        </div>
                        <div class="d-grid mt-4">
                            <button @click="agregarItem" class="btn btn-secondary minimal-btn fw-bold" :disabled="!itemActual.IdArticulo">
                                <i class="fa-solid fa-plus me-2"></i>Agregar a la lista
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="card minimal-card border-0 shadow-sm h-100">
                    <div class="card-body p-0 d-flex flex-column">
                        <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                            <h6 class="m-0 fw-bold text-dark">Detalle de la Compra</h6>
                            <span class="badge bg-secondary">{{ carrito.length }} Items</span>
                        </div>
                        <div class="table-responsive flex-grow-1" style="max-height: 500px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="text-muted small text-uppercase bg-white sticky-top">
                                    <tr>
                                        <th class="ps-4">Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-end">Costo U.</th>
                                        <th class="text-end">Subtotal</th>
                                        <th class="text-end pe-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="carrito.length === 0">
                                        <td colspan="5" class="text-center py-5 text-muted">
                                            <i class="fa-solid fa-cart-flatbed fs-1 mb-3 text-light-emphasis"></i>
                                            <p>No hay productos en la lista aún.</p>
                                        </td>
                                    </tr>
                                    <tr v-for="(item, index) in carrito" :key="index">
                                        <td class="ps-4">
                                            <div class="fw-bold">{{ item.NomArticulo }}</div>
                                            <small class="text-muted">{{ item.CodArticulo || 'Sin Código' }}</small>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge bg-light text-dark border">
                                                {{ item.Cantidad }} {{ item.NombreUnidad }}
                                            </span>
                                        </td>
                                        <td class="text-end text-muted">
                                            ${{ item.Costo.toFixed(2) }}
                                        </td>
                                        <td class="text-end fw-bold text-dark">
                                            ${{ item.Subtotal.toFixed(2) }}
                                        </td>
                                        <td class="text-end pe-4">
                                            <button @click="eliminarItem(index)" class="btn btn-sm btn-link text-danger p-0">
                                                <i class="fa-solid fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="p-4 bg-light border-top mt-auto">
                            <div class="row align-items-center">
                                <div class="col-6">
                                    <small class="text-muted">Revise los costos antes de confirmar.</small>
                                </div>
                                <div class="col-6 text-end">
                                    <h4 class="fw-bold mb-0 text-success">
                                        <small class="text-dark fs-6 fw-normal me-2">Total a Pagar:</small>
                                        ${{ totalCompra.toFixed(2) }}
                                    </h4>
                                </div>
                            </div>
                            <div class="d-grid mt-3">
                                <button @click="guardarEntrada" class="btn btn-success minimal-btn py-3 fw-bold fs-5 shadow-sm" :disabled="saving || carrito.length === 0">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fa-solid fa-check-circle me-2"></i>
                                    {{ saving ? 'Procesando...' : 'Confirmar Entrada' }}
                                </button>
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
.minimal-card { overflow: hidden; }
.sticky-top { top: 0; z-index: 10; }
</style>