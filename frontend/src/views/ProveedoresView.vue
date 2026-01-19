<script setup>
import { ref, onMounted } from 'vue';
import proveedorService from '@/services/proveedorService';
import Swal from 'sweetalert2';

const proveedores = ref([]);
const loading = ref(false);
const loadProveedores = async () => {
    loading.value = true;
    try {
        const { data } = await proveedorService.getProveedores();
        proveedores.value = data;
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la lista de proveedores.', 'error');
    } finally {
        loading.value = false;
    }
};

onMounted(loadProveedores);

const confirmDelete = (prov) => {
    Swal.fire({
        title: '¿Eliminar proveedor?',
        text: `Se dará de baja a: ${prov.NomProveedor}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await proveedorService.deleteProveedor(prov.IdProveedor);
                Swal.fire({
                    icon: 'success', title: 'Eliminado',
                    text: 'El proveedor ha sido dado de baja.',
                    timer: 1500, showConfirmButton: false
                });
                loadProveedores();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el proveedor.', 'error');
            }
        }
    });
};
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Proveedores</h2>
                <p class="text-muted m-0 small">Gestión de socios comerciales.</p>
            </div>
            <router-link to="/proveedores/nuevo" class="btn btn-primary fw-bold minimal-btn shadow-sm">
                <i class="fa-solid fa-truck-fast me-2"></i>Nuevo Proveedor
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
                                <th class="ps-4 py-3 text-muted small text-uppercase">Empresa / Nombre</th>
                                <th class="py-3 text-muted small text-uppercase">Contacto</th>
                                <th class="py-3 text-muted small text-uppercase">Comunicación</th>
                                <th class="py-3 text-muted small text-uppercase">Ubicación</th>
                                <th class="text-end pe-4 py-3 text-muted small text-uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="proveedores.length === 0">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    No hay proveedores registrados.
                                </td>
                            </tr>
                            <tr v-for="prov in proveedores" :key="prov.IdProveedor">
                                <td class="ps-4">
                                    <div class="fw-bold">{{ prov.NomProveedor }}</div>
                                    <div class="small text-muted" v-if="prov.RFC">RFC: {{ prov.RFC }}</div>
                                </td>
                                <td>
                                    <span v-if="prov.NombreContacto" class="d-flex align-items-center text-muted">
                                        <i class="fa-regular fa-user me-2"></i> {{ prov.NombreContacto }}
                                    </span>
                                    <span v-else class="text-muted small">-</span>
                                </td>
                                <td>
                                    <div v-if="prov.Telefono" class="small mb-1">
                                        <i class="fa-solid fa-phone me-1 text-success"></i> {{ prov.Telefono }}
                                    </div>
                                    <div v-if="prov.Email" class="small">
                                        <i class="fa-regular fa-envelope me-1 text-primary"></i> {{ prov.Email }}
                                    </div>
                                    <span v-if="!prov.Telefono && !prov.Email" class="text-muted small">-</span>
                                </td>
                                <td class="small text-muted text-truncate" style="max-width: 200px;">
                                    <i class="fa-solid fa-map-pin me-1" v-if="prov.Direccion"></i>
                                    {{ prov.Direccion || '-' }}
                                </td>
                                <td class="text-end pe-4">
                                    <router-link :to="`/proveedores/editar/${prov.IdProveedor}`" 
                                                 class="btn btn-sm btn-outline-secondary me-2 border-0 bg-transparent" title="Editar">
                                        <i class="fa-solid fa-pen"></i>
                                    </router-link>
                                    <button @click="confirmDelete(prov)" 
                                            class="btn btn-sm btn-outline-danger border-0 bg-transparent" title="Eliminar">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top py-3">
                <small class="text-muted">Total: {{ proveedores.length }} proveedores</small>
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