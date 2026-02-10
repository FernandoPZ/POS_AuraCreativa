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
        console.error(error);
        Swal.fire({
             toast: true, position: 'top-end', icon: 'warning', 
             title: 'Error cargando proveedores', showConfirmButton: false, timer: 3000 
        });
    }
};
const loadItem = async () => {
    loading.value = true;
    try {
        const { data } = await articuloService.getArticulo(itemId.value);
        form.NomArticulo = data.NomArticulo;
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
        if (!file.type.startsWith('image/')) {
            event.target.value = '';
            return Swal.fire('Formato incorrecto', 'Solo se permiten imágenes (JPG, PNG, WEBP).', 'warning');
        }
        if (file.size > 5 * 1024 * 1024) {
            event.target.value = ''; 
            return Swal.fire('Muy pesada', 'La imagen no debe superar los 5MB.', 'warning');
        }
        form.Imagen = file;
        previewImage.value = URL.createObjectURL(file);
    }
};
const fileInput = ref(null);
const triggerFileInput = () => {
    fileInput.value.click();
};
const preventNegatives = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
};
const handleSubmit = async () => {
    if (!form.NomArticulo || !form.IdProveedor) {
        return Swal.fire('Faltan datos', 'El nombre y el proveedor son obligatorios.', 'warning');
    }
    if (form.CantidadMinima > form.CantidadMaxima) {
        return Swal.fire('Incoherencia', 'El stock mínimo no puede ser mayor que el máximo.', 'warning');
    }
    if (form.PrecioVenta <= 0) {
        const result = await Swal.fire({
            title: '¿Producto Gratuito?',
            text: "El precio de venta es $0.00. ¿Deseas registrarlo así?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, es gratis / promocional',
            cancelButtonText: 'Corregir precio'
        });
        if (!result.isConfirmed) return;
    }
    isSaving.value = true;
    try {
        const formData = new FormData();
        formData.append('NomArticulo', form.NomArticulo.trim());
        formData.append('CodArticulo', form.CodArticulo ? form.CodArticulo.trim() : '');
        formData.append('PrecioVenta', form.PrecioVenta);
        formData.append('IdProveedor', form.IdProveedor);
        formData.append('CantidadMinima', form.CantidadMinima);
        formData.append('CantidadMaxima', form.CantidadMaxima);
        formData.append('NombreUnidad', form.NombreUnidad.trim());
        formData.append('Categoria', form.Categoria);
        formData.append('Talla', form.Talla || '');
        formData.append('Color', form.Color || '');
        formData.append('DetallesTecnicos', form.DetallesTecnicos ? form.DetallesTecnicos.trim() : '');
        if (form.Imagen instanceof File) {
            formData.append('Imagen', form.Imagen);
        }
        if (isEditing.value) {
            await articuloService.updateArticulo(itemId.value, formData);
            await Swal.fire({
                icon: 'success', title: '¡Actualizado!',
                text: 'Producto modificado correctamente.',
                timer: 1500, showConfirmButton: false
            });
        } else {
            await articuloService.createArticulo(formData);
            await Swal.fire({
                icon: 'success', title: '¡Creado!',
                text: 'Producto agregado al catálogo.',
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
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <router-link to="/articulos" class="text-decoration-none text-muted fw-bold small mb-1 d-inline-block">
                    <i class="fa-solid fa-arrow-left me-1"></i> Volver
                </router-link>
                <h3 class="fw-bold m-0">
                    {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
                </h3>
            </div>
            <div>
                <button @click="handleSubmit" class="btn btn-primary fw-bold shadow-sm px-4" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
                </button>
            </div>
        </div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="row g-4">
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm minimal-card mb-4">
                    <div class="card-body p-4">
                        <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                            <i class="fa-solid fa-file-lines me-2"></i>Información General
                        </h6>
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted">Nombre del Artículo <span class="text-danger">*</span></label>
                                <input type="text" v-model="form.NomArticulo" class="form-control minimal-input fs-5 fw-bold" required placeholder="Ej. Playera Premium" maxlength="100">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted">Código / SKU</label>
                                <input type="text" v-model="form.CodArticulo" class="form-control minimal-input" placeholder="Automático si se deja vacío" maxlength="50">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted">Proveedor <span class="text-danger">*</span></label>
                                <select v-model="form.IdProveedor" class="form-select minimal-input" required>
                                    <option value="" disabled>Seleccionar...</option>
                                    <option v-for="prov in proveedores" :key="prov.IdProveedor" :value="prov.IdProveedor">
                                        {{ prov.NomProveedor }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted">Descripción / Detalles Técnicos</label>
                                <textarea v-model="form.DetallesTecnicos" class="form-control minimal-input" rows="3" placeholder="Marca, material, especificaciones..." maxlength="255"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <h6 class="text-success text-uppercase small fw-bold mb-3 border-bottom pb-2">
                            <i class="fa-solid fa-sack-dollar me-2"></i>Precio y Stock Ideal
                        </h6>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-dark">Precio Venta</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-success text-white border-0 fw-bold">$</span>
                                    <input type="number" v-model.number="form.PrecioVenta" class="form-control minimal-input fs-5 fw-bold text-success" step="0.50" min="0" @keydown="preventNegatives" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted">Stock Mínimo (Alerta)</label>
                                <input type="number" v-model.number="form.CantidadMinima" class="form-control minimal-input" min="0" @keydown="preventNegatives">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted">Stock Máximo (Ideal)</label>
                                <input type="number" v-model.number="form.CantidadMaxima" class="form-control minimal-input" min="0" @keydown="preventNegatives">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-4">
                <div class="card border-0 shadow-sm minimal-card mb-4">
                    <div class="card-body p-3 text-center">
                        <h6 class="text-muted text-uppercase small fw-bold mb-3 text-start">Fotografía</h6>
                        <div class="image-upload-container mb-3 position-relative overflow-hidden rounded-3 border bg-light cursor-pointer" 
                             @click="triggerFileInput"
                             style="aspect-ratio: 1/1; width: 100%;">
                            <img v-if="previewImage" :src="previewImage" class="w-100 h-100 object-fit-cover">
                            <div v-else class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                <i class="fa-solid fa-cloud-arrow-up display-1 mb-2"></i>
                                <span class="small fw-bold">Subir Imagen</span>
                            </div>
                            <div class="overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white opacity-0 hover-opacity-100 transition">
                                <i class="fa-solid fa-pen me-2"></i> Cambiar
                            </div>
                        </div>
                        <input type="file" ref="fileInput" @change="handleFileUpload" hidden accept="image/*">
                        <p class="small text-muted mb-0">
                            <i class="fa-solid fa-circle-info me-1"></i> Se recortará automáticamente a formato cuadrado.
                        </p>
                    </div>
                </div>
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <h6 class="text-primary text-uppercase small fw-bold mb-3 border-bottom pb-2">
                            <i class="fa-solid fa-tags me-2"></i>Clasificación
                        </h6>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Categoría</label>
                            <select v-model="form.Categoria" class="form-select minimal-input">
                                <option value="GENERAL">General</option>
                                <option value="TEXTIL">Textil (Ropa)</option>
                                <option value="TAZAS">Tazas / Cerámica</option>
                                <option value="INSUMOS">Insumos</option>
                                <option value="GORRAS">Gorras</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Unidad de Medida</label>
                            <input type="text" v-model="form.NombreUnidad" class="form-control minimal-input" placeholder="Pza, Kg, Lt" maxlength="20">
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Talla</label>
                                <select v-model="form.Talla" class="form-select minimal-input">
                                    <option value="">N/A</option>
                                    <option value="CH">CH</option>
                                    <option value="M">M</option>
                                    <option value="G">G</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="INF">Infantil</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold text-muted">Color</label>
                                <select v-model="form.Color" class="form-select minimal-input">
                                    <option value="">N/A</option>
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
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.cursor-pointer { cursor: pointer; }
.transition { transition: all 0.3s ease; }
.hover-opacity-100:hover { opacity: 1 !important; }
.object-fit-cover { object-fit: cover; }
.minimal-input, .form-select {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 0.6rem 0.8rem;
    transition: all 0.2s;
}
.minimal-input:focus, .form-select:focus {
    background-color: #fff;
    border-color: #0d6efd;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}
</style>