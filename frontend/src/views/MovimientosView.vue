<template>
    <div class="container py-4 minimal-bg">
        <div class="row g-4">
            <div class="col-12 col-lg-5 mx-auto">
                <div class="card border-0 shadow-sm minimal-card">
                    <div class="card-body">
                        <h4 class="card-title mb-3 fw-semibold">Nuevo Movimiento</h4>
                        <div v-if="movimientoMsg" class="alert alert-success mb-2">{{ movimientoMsg }}</div>
                        <div v-if="movimientoError" class="alert alert-danger mb-2">{{ movimientoError }}</div>
                        <form @submit.prevent="handleMovimiento" class="row g-3">
                            <div class="col-12">
                                <label for="articulo" class="form-label">Artículo</label>
                                <select id="articulo" v-model.number="form.IdArticulo" class="form-select form-select-lg minimal-input" required>
                                    <option value="" disabled>Seleccione un artículo...</option>
                                    <option v-for="articulo in articulos" :key="articulo.IdArticulo" :value="articulo.IdArticulo">
                                        {{ articulo.NomArticulo }} (Stock: {{ articulo.StockActual }})
                                    </option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label for="tipo" class="form-label">Tipo</label>
                                <select id="tipo" v-model="form.TipoMovimiento" class="form-select form-select-lg minimal-input" required>
                                    <option value="" disabled>Seleccione tipo...</option>
                                    <option value="ENTRADA">ENTRADA (+)</option>
                                    <option value="SALIDA">SALIDA (-)</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label for="cantidad" class="form-label">Cantidad</label>
                                <input type="number" id="cantidad" v-model.number="form.Cantidad" class="form-control form-control-lg minimal-input" required min="1">
                            </div>
                            <div class="col-12">
                                <label for="comentarios" class="form-label">Comentarios</label>
                                <textarea id="comentarios" v-model="form.Comentarios" class="form-control minimal-input" rows="2"></textarea>
                            </div>
                            <div class="col-12 d-grid mt-2">
                                <button type="submit" class="btn btn-dark btn-lg minimal-btn" :disabled="isSaving">
                                    <span v-if="isSaving">Registrando...</span>
                                    <span v-else>Registrar Movimiento</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-7 mx-auto">
                <h3 class="mb-3 fw-semibold">Historial de Movimientos</h3>
                <div v-if="loadingHistorial" class="alert alert-info">Cargando historial...</div>
                <div v-else-if="historialError" class="alert alert-danger">Error al cargar historial: {{ historialError }}</div>
                <div v-else-if="historial.length === 0" class="alert alert-warning text-center">
                    Historial vacío. ¡Registra una <b>Entrada</b> o <b>Salida</b> para empezar!
                </div>
                <div v-else class="table-responsive minimal-table-wrapper">
                    <table class="table table-borderless align-middle minimal-table">
                        <thead>
                            <tr class="bg-light">
                                <th>ID</th>
                                <th>Artículo</th>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Stock Final</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="mov in historial" :key="mov.IdMovimiento">
                                <td class="text-muted">{{ mov.IdMovimiento }}</td>
                                <td class="fw-semibold">{{ mov.NomArticulo }}</td>
                                <td>
                                    <span class="badge px-3 py-2" :class="mov.TipoMovimiento === 'ENTRADA' ? 'bg-success' : 'bg-danger'">
                                        {{ mov.TipoMovimiento }}
                                    </span>
                                </td>
                                <td>{{ mov.Cantidad }}</td>
                                <td>{{ mov.StockFinal }}</td>
                                <td class="text-nowrap">{{ new Date(mov.FechaMovimiento).toLocaleDateString() }}<br><span class="text-muted small">{{ new Date(mov.FechaMovimiento).toLocaleTimeString() }}</span></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="6" class="text-end text-muted">Total: {{ historial.length }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.minimal-bg {
    background: #f8f9fa;
    min-height: 100vh;
}
.minimal-card {
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 2px 16px rgba(0,0,0,0.04);
}
.minimal-input {
    border-radius: 0.5rem;
    border: 1px solid #e0e0e0;
    background: #f9f9f9;
    font-size: 1.1rem;
}
.minimal-btn {
    border-radius: 0.5rem;
    font-weight: 500;
    letter-spacing: 0.03em;
}
.minimal-table-wrapper {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 2px 16px rgba(0,0,0,0.04);
    padding: 1rem;
}
.minimal-table th, .minimal-table td {
    padding: 0.75rem 0.5rem;
    vertical-align: middle;
}
.minimal-table th {
    font-weight: 600;
    color: #333;
    background: #f4f4f4;
}
.minimal-table tr {
    border-bottom: 1px solid #f0f0f0;
}
.minimal-table .badge {
    font-size: 0.95rem;
    border-radius: 0.5rem;
}
@media (max-width: 991px) {
    .minimal-table-wrapper {
        padding: 0.5rem;
    }
    .minimal-card {
        margin-bottom: 2rem;
    }
}
</style>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import articuloService from '@/services/articuloService';

const router = useRouter();
const authStore = useAuthStore();
const form = reactive({
    IdArticulo: '',
    Cantidad: 1, 
    TipoMovimiento: '',
    Comentarios: ''
});
const articulos = ref([]); 
const historial = ref([]);
const isSaving = ref(false);
const loadingHistorial = ref(false);
const movimientoMsg = ref(null);
const movimientoError = ref(null);
const historialError = ref(null);
const loadData = async () => {
    loadingHistorial.value = true;
    historialError.value = null;
    historial.value = []; 

    try {
        articulos.value = await articuloService.getArticulos(); 
        
        try {
            const movimientos = await articuloService.getMovimientos();
            historial.value = movimientos;
        } catch (err) {
            console.warn("Error al cargar historial, posible tabla vacía.", err.response?.status);
            historial.value = []; 
        }

    } catch (err) {
        historialError.value = "Error al cargar los datos necesarios. (Verifique sesión y Backend)";
        console.error("Error loading data:", err);
    } finally {
        loadingHistorial.value = false;
    }
};

const handleMovimiento = async () => {
    isSaving.value = true;
    movimientoMsg.value = null;
    movimientoError.value = null;

    try {
        if (!form.IdArticulo) {
            throw new Error("Debe seleccionar un artículo.");
        }
        if (!form.TipoMovimiento) {
            throw new Error("Debe seleccionar el tipo de movimiento.");
        }
        if (form.Cantidad <= 0) {
            throw new Error("La cantidad debe ser mayor a cero.");
        }
        const payload = {
            IdArticulo: form.IdArticulo,
            Cantidad: form.Cantidad, 
            TipoMovimiento: form.TipoMovimiento,
            Comentarios: form.Comentarios || `Movimiento ${form.TipoMovimiento}`,
        };

        await articuloService.registrarMovimiento(payload);

        movimientoMsg.value = `${form.TipoMovimiento} de ${form.Cantidad} unidades registrada con éxito.`;
        form.IdArticulo = '';
        form.Cantidad = 1; 
        form.TipoMovimiento = '';
        form.Comentarios = ''; 
        loadData(); 
    } catch (err) {
        movimientoError.value = err.message || err.response?.data?.msg || 'Error al registrar el movimiento.';
        console.error("Error en movimiento:", err);
    } finally {
        isSaving.value = false;
    }
};

const handleLogout = () => {
    authStore.logout();
    router.push({ name: 'Login' });
};

onMounted(loadData);
</script>