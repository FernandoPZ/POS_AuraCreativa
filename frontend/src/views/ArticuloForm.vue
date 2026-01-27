<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import articuloService from '@/services/articuloService';
import proveedorService from '@/services/proveedorService';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);
const itemId = computed(() => route.params.id);
const loading = ref(false);
const isSaving = ref(false);
const proveedores = ref([]);
const previewImage = ref(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const BASE_URL = API_URL.replace('/api', ''); 
const form = reactive({
    NomArticulo: '', 
    CodArticulo: '',
    PrecioVenta: 0,
    StockActual: 0, 
    IdProveedor: '',      
    CantidadMinima: 5,
    CantidadMaxima: 100,
    NombreUnidad: 'Pza',
    Categoria: 'GENERAL',
    Talla: '',
    Color: '',
    DetallesTecnicos: '',
    Imagen: null
});
const loadProveedores = async () => {
    try {
        const { data } = await proveedorService.getProveedores();
        proveedores.value = data;
    } catch (error) {
        console.error('Error cargando proveedores:', error);
        Swal.fire({
             toast: true, position: 'top-end', icon: 'warning', 
             title: 'No se pudieron cargar los proveedores', showConfirmButton: false, timer: 3000 
        });
    }
};
const loadItem = async () => {
    loading.value = true;
    try {
        const { data } = await articuloService.getArticulo(itemId.value);
        form.NomArticulo = data.NomArticulo;
        form.StockActual = data.StockActual;
        form.PrecioVenta = Number(data.PrecioVenta);
        form.CodArticulo = data.CodArticulo;
        form.IdProveedor = data.IdProveedor;
        form.CantidadMinima = data.CantidadMinima;
        form.CantidadMaxima = data.CantidadMaxima;
        form.Categoria = data.Categoria || 'GENERAL';
        form.Talla = data.Talla || '';
        form.Color = data.Color || '';
        form.DetallesTecnicos = data.DetallesTecnicos || '';
        form.NombreUnidad = data.NombreUnidad || 'Pza';
        if (data.Imagen) {
            previewImage.value = `${BASE_URL}/uploads/${data.Imagen}`;
        }
    } catch (err) {
        Swal.fire('Error', 'No se pudo cargar el artículo.', 'error');
        router.push('/articulos');
    } finally {
        loading.value = false;
    }
};
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.Imagen = file;
        previewImage.value = URL.createObjectURL(file);
    }
};
const handleSubmit = async () => {
    if (!form.NomArticulo || !form.IdProveedor) {
        return Swal.fire('Faltan datos', 'El nombre y el proveedor son obligatorios.', 'warning');
    }
    isSaving.value = true;
    try {
        const formData = new FormData();
        formData.append('NomArticulo', form.NomArticulo);
        formData.append('CodArticulo', form.CodArticulo || '');
        formData.append('PrecioVenta', form.PrecioVenta);
        formData.append('IdProveedor', form.IdProveedor);
        formData.append('CantidadMinima', form.CantidadMinima);
        formData.append('CantidadMaxima', form.CantidadMaxima);
        formData.append('NombreUnidad', form.NombreUnidad);
        formData.append('Categoria', form.Categoria);
        formData.append('Talla', form.Talla || '');
        formData.append('Color', form.Color || '');
        formData.append('DetallesTecnicos', form.DetallesTecnicos || '');
        if (form.Imagen instanceof File) {
            formData.append('Imagen', form.Imagen);
        }
        if (isEditing.value) {
            await articuloService.updateArticulo(itemId.value, formData);
            await Swal.fire({
                icon: 'success', title: '¡Actualizado!',
                text: 'El producto ha sido modificado correctamente.',
                timer: 1500, showConfirmButton: false
            });
        } else {
            await articuloService.createArticulo(formData);
            await Swal.fire({
                icon: 'success', title: '¡Registrado!',
                text: 'Nuevo producto añadido al catálogo.',
                timer: 1500, showConfirmButton: false
            });
        }
        router.push('/articulos');
    } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.msg || 'No se pudo guardar.', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(async () => {
    await loadProveedores();
    if (isEditing.value) {
        loadItem();
    }
});
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="mb-3">
            <router-link to="/articulos" class="text-decoration-none text-muted fw-bold small">
                <i class="fa-solid fa-arrow-left me-1"></i> Volver al catálogo
            </router-link>
        </div>
        <div class="row g-4 justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <h4 class="mb-4 fw-bold text-center">
                            {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
                        </h4>
                        <div v-if="loading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                        <form v-else @submit.prevent="handleSubmit" class="row g-3">
                            <div class="col-12">
                                <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                                    <i class="fa-solid fa-box me-2"></i>Datos Generales
                                </h6>
                            </div>
                            <div class="col-12 mb-2">
                                <label class="form-label small fw-bold text-muted">Fotografía del Producto</label>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="border rounded bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative" 
                                         style="width: 80px; height: 80px;">
                                        <img v-if="previewImage" :src="previewImage" class="w-100 h-100 object-fit-cover">
                                        <i v-else class="fa-solid fa-camera text-muted fs-4"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <input type="file" @change="handleFileUpload" class="form-control minimal-input" accept="image/*">
                                        <div class="form-text small">Formatos: JPG, PNG, WEBP.</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Categoría</label>
                                <select v-model="form.Categoria" class="form-select minimal-input">
                                    <option value="GENERAL">General</option>
                                    <option value="TEXTIL">Textil (Ropa)</option>
                                    <option value="TAZAS">Tazas / Cerámica</option>
                                    <option value="INSUMOS">Insumos (Vinil, Tintas)</option>
                                    <option value="GORRAS">Gorras</option>
                                </select>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Código (SKU)</label>
                                <input type="text" v-model="form.CodArticulo" class="form-control minimal-input" placeholder="Ej. PLAY-NEG-M">
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted">Nombre del Artículo</label>
                                <input type="text" v-model="form.NomArticulo" class="form-control minimal-input" required placeholder="Ej. Playera Cuello Redondo">
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Proveedor</label>
                                <select v-model="form.IdProveedor" class="form-select minimal-input" required>
                                    <option value="" disabled>Selecciona un proveedor</option>
                                    <option v-for="prov in proveedores" :key="prov.IdProveedor" :value="prov.IdProveedor">
                                        {{ prov.NomProveedor }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Marca / Detalles</label>
                                <input type="text" v-model="form.DetallesTecnicos" class="form-control minimal-input" placeholder="Ej. Marca Yazbek, 100% Algodón">
                            </div>
                            <div class="col-12 mt-4">
                                <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                                    <i class="fa-solid fa-tags me-2"></i>Variantes
                                </h6>
                            </div>
                            <div class="col-6 col-md-4">
                                <label class="form-label small fw-bold text-muted">Talla</label>
                                <select v-model="form.Talla" class="form-select minimal-input">
                                    <option value="">N/A (Única)</option>
                                    <option value="CH">CH (Chica)</option>
                                    <option value="M">M (Mediana)</option>
                                    <option value="G">G (Grande)</option>
                                    <option value="XL">XL (Extra G)</option>
                                    <option value="XXL">XXL (Doble G)</option>
                                    <option value="INF">Infantil</option>
                                </select>
                            </div>
                            <div class="col-6 col-md-4">
                                <label class="form-label small fw-bold text-muted">Color</label>
                                <select v-model="form.Color" class="form-select minimal-input">
                                    <option value="">Sin Color</option>
                                    <option value="Blanco">Blanco</option>
                                    <option value="Negro">Negro</option>
                                    <option value="Rojo">Rojo</option>
                                    <option value="Azul">Azul</option>
                                    <option value="Verde">Verde</option>
                                    <option value="Amarillo">Amarillo</option>
                                    <option value="Rosa">Rosa</option>
                                    <option value="Gris">Gris</option>
                                </select>
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label small fw-bold text-muted">Unidad</label>
                                <input type="text" v-model="form.NombreUnidad" class="form-control minimal-input" placeholder="Pza, Kg">
                            </div>
                            <div class="col-12 mt-4">
                                <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                                    <i class="fa-solid fa-calculator me-2"></i>Costos e Inventario
                                </h6>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-success">Precio Venta ($)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-success text-white border-0">$</span>
                                    <input type="number" v-model.number="form.PrecioVenta" class="form-control minimal-input" step="0.50" min="0" required>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-bold text-muted">Stock Actual</label>
                                <input type="number" v-model.number="form.StockActual" class="form-control minimal-input" disabled>
                                <div class="form-text small text-muted">
                                    <i class="fa-solid fa-lock me-1"></i> Se gestiona desde "Compras".
                                </div>
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Mínimo (Alerta)</label>
                                <input type="number" v-model.number="form.CantidadMinima" class="form-control minimal-input" min="0">
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Máximo (Ideal)</label>
                                <input type="number" v-model.number="form.CantidadMaxima" class="form-control minimal-input" min="0">
                            </div>
                            <div class="col-12 d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                                <router-link to="/articulos" class="btn btn-outline-secondary minimal-btn px-4 fw-bold">
                                    Cancelar
                                </router-link>
                                <button type="submit" class="btn btn-primary minimal-btn px-4 fw-bold shadow-sm" :disabled="isSaving">
                                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
                                </button>
                            </div>
                        </form>
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
[data-bs-theme="dark"] .input-group-text {
    border-color: #444;
}
</style>