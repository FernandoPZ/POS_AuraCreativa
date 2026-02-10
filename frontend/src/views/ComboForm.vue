<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import comboService from '@/services/comboService';
import articuloService from '@/services/articuloService';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);
const itemId = computed(() => route.params.id);
const articulos = ref([]);
const loading = ref(false);
const saving = ref(false);
const previewImage = ref(null);
const fileInput = ref(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const form = reactive({
    Nombre: '',
    Codigo: '',
    Precio: 0,
    Imagen: null
});
const receta = ref([]);
const ingredienteActual = reactive({
    IdArticulo: '',
    Cantidad: 1
});
const valorRealCombo = computed(() => {
    return receta.value.reduce((suma, item) => {
        return suma + (Number(item.PrecioIndividual || 0) * Number(item.Cantidad));
    }, 0);
});
const diferenciaPrecio = computed(() => {
    const precioCombo = Number(form.Precio) || 0;
    return valorRealCombo.value - precioCombo;
});

onMounted(async () => {
    loading.value = true;
    try {
        const { data: listaArticulos } = await articuloService.getArticulos();
        articulos.value = listaArticulos;
        if (isEditing.value) {
            const { data } = await comboService.getCombo(itemId.value);
            form.Nombre = data.Nombre;
            form.Codigo = data.Codigo;
            form.Precio = Number(data.Precio);
            if (data.Imagen) {
                previewImage.value = `${BASE_URL}/uploads/${data.Imagen}`;
            }
            if (data.ingredientes) {
                receta.value = data.ingredientes.map(i => {
                    const artCatalogo = articulos.value.find(a => a.IdArticulo === i.IdArticulo);
                    return {
                        IdArticulo: i.IdArticulo,
                        NomArticulo: i.NomArticulo,
                        NombreUnidad: i.NombreUnidad || 'Pza',
                        Cantidad: i.Cantidad,
                        PrecioIndividual: artCatalogo ? artCatalogo.PrecioVenta : 0
                    };
                });
            }
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    } finally {
        loading.value = false;
    }
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            event.target.value = '';
            return Swal.fire('Formato incorrecto', 'Solo imágenes (JPG, PNG).', 'warning');
        }
        if (file.size > 5 * 1024 * 1024) {
            event.target.value = '';
            return Swal.fire('Muy pesada', 'Máximo 5MB.', 'warning');
        }
        form.Imagen = file;
        previewImage.value = URL.createObjectURL(file);
    }
};
const triggerFileInput = () => fileInput.value.click();
const agregarIngrediente = () => {
    if (!ingredienteActual.IdArticulo) return;
    const art = articulos.value.find(a => a.IdArticulo === ingredienteActual.IdArticulo);
    if (!art) return;
    const cantidad = Number(ingredienteActual.Cantidad);
    if (cantidad <= 0) return;
    const existe = receta.value.find(r => r.IdArticulo === art.IdArticulo);
    if (existe) {
        existe.Cantidad += cantidad;
    } else {
        receta.value.push({
            IdArticulo: art.IdArticulo,
            NomArticulo: art.NomArticulo,
            NombreUnidad: art.NombreUnidad || 'Pza',
            Cantidad: cantidad,
            PrecioIndividual: Number(art.PrecioVenta)
        });
    }
    ingredienteActual.IdArticulo = '';
    ingredienteActual.Cantidad = 1;
};
const eliminarIngrediente = (index) => {
    receta.value.splice(index, 1);
};
const precioSeleccionado = computed(() => {
    if (!ingredienteActual.IdArticulo) return 0;
    const art = articulos.value.find(a => a.IdArticulo === ingredienteActual.IdArticulo);
    return art ? Number(art.PrecioVenta) : 0;
});
const preventNegatives = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};
const guardarCombo = async () => {
    if (!form.Nombre || form.Precio === '' || receta.value.length === 0) {
        return Swal.fire('Faltan datos', 'Nombre, Precio y al menos 1 producto son obligatorios.', 'warning');
    }
    if (form.Precio <= 0) {
        const confirm = await Swal.fire({
            title: '¿Paquete Gratuito?',
            text: "El precio es $0.00. ¿Es correcto?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Corregir'
        });
        if (!confirm.isConfirmed) return;
    }
    if (diferenciaPrecio.value < 0) {
        const confirm = await Swal.fire({
            title: '¿Precio elevado?',
            html: `El precio del combo ($${form.Precio}) es <b>mayor</b> que la suma de sus productos ($${valorRealCombo.value}).<br>¿Deseas continuar?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar así',
            cancelButtonText: 'Corregir precio'
        });
        if (!confirm.isConfirmed) return;
    }
    saving.value = true;
    try {
        const formData = new FormData();
        formData.append('Nombre', form.Nombre.trim());
        formData.append('Codigo', form.Codigo ? form.Codigo.trim() : '');
        formData.append('Precio', form.Precio);
        formData.append('Ingredientes', JSON.stringify(receta.value.map(i => ({
            IdArticulo: i.IdArticulo,
            Cantidad: i.Cantidad
        }))));

        if (form.Imagen instanceof File) {
            formData.append('Imagen', form.Imagen);
        }
        if (isEditing.value) {
            await comboService.updateCombo(itemId.value, formData);
            await Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false });
        } else {
            await comboService.createCombo(formData);
            await Swal.fire({ icon: 'success', title: '¡Creado!', timer: 1500, showConfirmButton: false });
        }
        router.push('/combos');
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.response?.data?.msg || 'No se pudo guardar.', 'error');
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <router-link to="/combos" class="text-decoration-none text-muted fw-bold small mb-1 d-inline-block">
                    <i class="fa-solid fa-arrow-left me-1"></i> Volver a paquetes
                </router-link>
                <h3 class="fw-bold m-0">{{ isEditing ? 'Editar Paquete' : 'Nuevo Paquete' }}</h3>
            </div>
            <button @click="guardarCombo" class="btn btn-primary fw-bold shadow-sm px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Guardando...' : 'Guardar Paquete' }}
            </button>
        </div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>
        <div v-else class="row g-4">
            <div class="col-12 col-lg-4">
                <div class="card border-0 shadow-sm minimal-card mb-3">
                    <div class="card-body p-3 text-center">
                        <h6 class="text-muted text-uppercase small fw-bold mb-3 text-start">Imagen del Paquete</h6>
                        <div class="image-upload-container mb-3 position-relative overflow-hidden rounded-3 border bg-light cursor-pointer mx-auto" 
                             @click="triggerFileInput"
                             style="aspect-ratio: 1/1; width: 100%; max-width: 250px;">
                            <img v-if="previewImage" :src="previewImage" class="w-100 h-100 object-fit-cover">
                            <div v-else class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                <i class="fa-solid fa-box-open display-1 mb-2"></i>
                                <span class="small fw-bold">Subir Foto</span>
                            </div>
                        </div>
                        <input type="file" ref="fileInput" @change="handleFileUpload" hidden accept="image/*">
                    </div>
                </div>
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Nombre del Paquete <span class="text-danger">*</span></label>
                            <input type="text" v-model="form.Nombre" class="form-control minimal-input fw-bold" placeholder="Ej. Paquete Graduación" maxlength="100">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Código (Opcional)</label>
                            <input type="text" v-model="form.Codigo" class="form-control minimal-input" placeholder="KIT-GRAD-2026" maxlength="50">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-success">Precio de Venta ($) <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-success text-white border-0 fw-bold">$</span>
                                <input type="number" v-model.number="form.Precio" class="form-control minimal-input fs-4 fw-bold text-success" step="0.50" min="0" @keydown="preventNegatives">
                            </div>
                        </div>
                        <div class="alert mt-3 mb-0 py-2 small" 
                             :class="diferenciaPrecio >= 0 ? 'alert-success' : 'alert-warning'">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Valor Real (Suma):</span>
                                <span class="fw-bold">${{ valorRealCombo.toFixed(2) }}</span>
                            </div>
                            <hr class="my-1">
                            <div class="d-flex justify-content-between align-items-center fw-bold">
                                <span>{{ diferenciaPrecio >= 0 ? 'Ahorro Cliente:' : 'Sobreprecio:' }}</span>
                                <span>${{ Math.abs(diferenciaPrecio).toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm minimal-card h-100">
                    <div class="card-header bg-white py-3 border-bottom">
                        <h6 class="m-0 fw-bold text-primary"><i class="fa-solid fa-list-check me-2"></i>Armar Paquete</h6>
                    </div>
                    <div class="card-body p-4">
                        <div class="row g-2 align-items-end mb-4 bg-light p-3 rounded-3 border">
                            <div class="col-12 col-md-6">
                                <label class="small fw-bold text-muted mb-1">Producto a incluir</label>
                                <select v-model="ingredienteActual.IdArticulo" class="form-select minimal-input">
                                    <option value="" disabled>Selecciona producto...</option>
                                    <option v-for="art in articulos" :key="art.IdArticulo" :value="art.IdArticulo">
                                        {{ art.NomArticulo }} (${{ Number(art.PrecioVenta).toFixed(2) }})
                                    </option>
                                </select>
                            </div>
                            <div class="col-6 col-md-2">
                                <label class="small fw-bold text-muted mb-1">Cant.</label>
                                <input type="number" v-model.number="ingredienteActual.Cantidad" class="form-control minimal-input text-center" min="1" @keydown="preventNegatives">
                            </div>
                            <div class="col-6 col-md-4 d-grid">
                                <button @click="agregarIngrediente" class="btn btn-secondary fw-bold" :disabled="!ingredienteActual.IdArticulo">
                                    <i class="fa-solid fa-plus me-1"></i> Agregar
                                </button>
                            </div>
                            <div class="col-12 text-end mt-1" v-if="precioSeleccionado > 0">
                                <small class="text-muted">
                                    Subtotal a agregar: <strong>${{ (precioSeleccionado * ingredienteActual.Cantidad).toFixed(2) }}</strong>
                                </small>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="bg-white text-muted small text-uppercase">
                                    <tr>
                                        <th class="ps-3">Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-end">Precio Unit.</th>
                                        <th class="text-end pe-3">Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="receta.length === 0">
                                        <td colspan="5" class="text-center py-5 text-muted">
                                            <i class="fa-solid fa-basket-shopping fs-1 mb-3 opacity-25"></i>
                                            <p class="m-0">El paquete está vacío.</p>
                                        </td>
                                    </tr>
                                    <tr v-for="(item, index) in receta" :key="index">
                                        <td class="ps-3 fw-bold">{{ item.NomArticulo }}</td>
                                        <td class="text-center">
                                            <span class="badge bg-light text-dark border">{{ item.Cantidad }} {{ item.NombreUnidad }}</span>
                                        </td>
                                        <td class="text-end text-muted small">
                                            ${{ Number(item.PrecioIndividual).toFixed(2) }}
                                        </td>
                                        <td class="text-end fw-bold text-dark pe-3">
                                            ${{ (item.PrecioIndividual * item.Cantidad).toFixed(2) }}
                                        </td>
                                        <td class="text-end">
                                            <button @click="eliminarIngrediente(index)" class="btn btn-sm btn-link text-danger p-0">
                                                <i class="fa-solid fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="receta.length > 0" class="border-top">
                                    <tr class="bg-light fw-bold">
                                        <td colspan="3" class="text-end py-3">Suma Real de Productos:</td>
                                        <td class="text-end py-3 pe-3 text-primary fs-6">${{ valorRealCombo.toFixed(2) }}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
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
.object-fit-cover { object-fit: cover; }
.cursor-pointer { cursor: pointer; }
.minimal-input, .form-select {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 0.6rem 0.8rem;
}
.minimal-input:focus, .form-select:focus {
    background-color: #fff;
    border-color: #198754;
    box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.1);
}
</style>