<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isEditing = computed(() => !!route.params.id);
const itemId = computed(() => route.params.id);
const articulos = ref([]);
const loading = ref(false);
const saving = ref(false);
const form = reactive({
    Nombre: '',
    Codigo: '',
    Precio: 0
});
const receta = ref([]);
const ingredienteActual = reactive({
    IdArticulo: '',
    Cantidad: 1
});
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { Authorization: `Bearer ${authStore.token}` }
});

onMounted(async () => {
    loading.value = true;
    try {
        const artRes = await api.get('/articulos');
        articulos.value = artRes.data;

        if (isEditing.value) {
            const { data } = await api.get(`/combos/${itemId.value}`);
            form.Nombre = data.Nombre;
            form.Codigo = data.Codigo;
            form.Precio = Number(data.Precio);
            // Mapear ingredientes
            receta.value = data.ingredientes.map(i => ({
                IdArticulo: i.IdArticulo,
                NomArticulo: i.NomArticulo,
                NombreUnidad: i.NombreUnidad || 'Pza',
                Cantidad: i.Cantidad
            }));
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    } finally {
        loading.value = false;
    }
});

const agregarIngrediente = () => {
    if (!ingredienteActual.IdArticulo) return;
    const art = articulos.value.find(a => a.IdArticulo === ingredienteActual.IdArticulo);
    const existe = receta.value.find(r => r.IdArticulo === art.IdArticulo);
    if (existe) {
        existe.Cantidad += ingredienteActual.Cantidad;
    } else {
        receta.value.push({
            IdArticulo: art.IdArticulo,
            NomArticulo: art.NomArticulo,
            NombreUnidad: art.NombreUnidad || 'Pza',
            Cantidad: ingredienteActual.Cantidad
        });
    }
    ingredienteActual.IdArticulo = '';
    ingredienteActual.Cantidad = 1;
};

const eliminarIngrediente = (index) => {
    receta.value.splice(index, 1);
};

const guardarCombo = async () => {
    if (!form.Nombre || !form.Precio || receta.value.length === 0) {
        return Swal.fire('Faltan datos', 'Nombre, Precio e Ingredientes son obligatorios.', 'warning');
    }

    saving.value = true;
    try {
        const payload = {
            ...form,
            Ingredientes: receta.value
        };

        if (isEditing.value) {
            await api.put(`/combos/${itemId.value}`, payload);
            Swal.fire('¡Actualizado!', 'El combo se modificó correctamente.', 'success');
        } else {
            await api.post('/combos', payload);
            Swal.fire('¡Creado!', 'Nuevo combo registrado.', 'success');
        }
        router.push('/combos');
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo guardar el combo.', 'error');
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="mb-3">
            <router-link to="/combos" class="text-decoration-none text-muted fw-bold small">
                <i class="fa-solid fa-arrow-left me-1"></i> Volver a la lista
            </router-link>
        </div>
        <div class="row g-4">
            <div class="col-12 col-lg-4">
                <div class="card minimal-card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-3">{{ isEditing ? 'Editar Combo' : 'Nuevo Combo' }}</h5>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Nombre del Paquete</label>
                            <input type="text" v-model="form.Nombre" class="form-control minimal-input" placeholder="Ej. Paquete Graduación">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Código (Opcional)</label>
                            <input type="text" v-model="form.Codigo" class="form-control minimal-input" placeholder="KIT-GRAD-2026">
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-success">Precio de Venta ($)</label>
                            <input type="number" v-model.number="form.Precio" class="form-control minimal-input" step="0.50">
                        </div>
                        <hr>
                        <h6 class="text-primary small fw-bold mb-3">Agregar Contenido</h6>
                        <div class="mb-2">
                            <select v-model="ingredienteActual.IdArticulo" class="form-select minimal-input">
                                <option value="" disabled>Selecciona producto...</option>
                                <option v-for="art in articulos" :key="art.IdArticulo" :value="art.IdArticulo">
                                    {{ art.NomArticulo }}
                                </option>
                            </select>
                        </div>
                        <div class="d-flex gap-2 mb-3">
                            <input type="number" v-model.number="ingredienteActual.Cantidad" class="form-control minimal-input" placeholder="Cant." style="width: 80px;" min="1">
                            <button @click="agregarIngrediente" class="btn btn-secondary minimal-btn flex-grow-1">
                                <i class="fa-solid fa-plus"></i> Agregar
                            </button>
                        </div>
                        <div class="d-grid mt-4">
                            <button @click="guardarCombo" class="btn btn-primary minimal-btn fw-bold shadow-sm" :disabled="saving">
                                {{ saving ? 'Guardando...' : 'Guardar Combo' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="card minimal-card border-0 shadow-sm h-100">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 fw-bold">Contenido del Paquete</h6>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4">Producto a descontar</th>
                                    <th>Cantidad</th>
                                    <th class="text-end pe-4">Quitar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="receta.length === 0">
                                    <td colspan="3" class="text-center py-5 text-muted">Agrega productos al combo.</td>
                                </tr>
                                <tr v-for="(item, index) in receta" :key="index">
                                    <td class="ps-4 fw-bold">{{ item.NomArticulo }}</td>
                                    <td>
                                        <span class="badge bg-light text-dark border">{{ item.Cantidad }} {{ item.NombreUnidad }}</span>
                                    </td>
                                    <td class="text-end pe-4">
                                        <button @click="eliminarIngrediente(index)" class="btn btn-sm btn-outline-danger border-0">
                                            <i class="fa-solid fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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