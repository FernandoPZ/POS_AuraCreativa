<script setup>
import { ref, onMounted } from 'vue';
import configService from '@/services/configService';
import { useConfigStore } from '@/stores/config';
import Swal from 'sweetalert2';

const configStore = useConfigStore();
const loading = ref(false);
const saving = ref(false);
const previewImage = ref(null);
const fileInput = ref(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://20.168.11.169:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const form = ref({
    NombreTienda: '',
    Direccion: '',
    Telefono: '',
    MensajeTicket: '',
    RedSocial: '',
    LogoFile: null
});

const loadData = async () => {
    loading.value = true;
    try {
        const { data } = await configService.getConfig();
        if (data) {
            form.value.NombreTienda = data.NombreTienda || '';
            form.value.Direccion = data.Direccion || '';
            form.value.Telefono = data.Telefono || '';
            form.value.MensajeTicket = data.MensajeTicket || '';
            form.value.RedSocial = data.RedSocial || '';
            if (data.LogoUrl) {
                previewImage.value = `${BASE_URL}/assets/${data.LogoUrl}`;
            }
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la configuración.', 'error');
    } finally {
        loading.value = false;
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            return Swal.fire('Archivo inválido', 'Por favor selecciona una imagen (JPG, PNG).', 'warning');
        }
        form.value.LogoFile = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const guardarCambios = async () => {
    saving.value = true;
    try {
        const formData = new FormData();
        formData.append('NombreTienda', form.value.NombreTienda);
        formData.append('Direccion', form.value.Direccion);
        formData.append('Telefono', form.value.Telefono);
        formData.append('MensajeTicket', form.value.MensajeTicket);
        formData.append('RedSocial', form.value.RedSocial);
        if (form.value.LogoFile) {
            formData.append('Logo', form.value.LogoFile);
        }
        await configService.updateConfig(formData);
        configStore.isLoaded = false;
        await configStore.fetchConfig();
        Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: 'La identidad de la tienda se actualizó correctamente.',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
    } finally {
        saving.value = false;
    }
};

onMounted(loadData);
</script>

<template>
    <div class="container py-4 fade-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Identidad del Negocio</h2>
                <p class="text-muted m-0 small">Personaliza el logo, nombre y datos de contacto.</p>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
                <div class="card minimal-card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div v-if="loading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                        <form v-else @submit.prevent="guardarCambios">
                            <div class="row g-4">
                                <div class="col-12 text-center mb-2">
                                    <div class="position-relative d-inline-block">
                                        <div class="border rounded-3 p-1 bg-white shadow-sm" style="width: 140px; height: 140px;">
                                            <img :src="previewImage || '/placeholder-logo.png'" 
                                                 class="w-100 h-100 object-fit-contain rounded-2"
                                                 alt="Logo Tienda">
                                        </div>
                                        <button type="button" 
                                                @click="triggerFileInput"
                                                class="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle shadow border-2 border-white"
                                                style="width: 36px; height: 36px; transform: translate(25%, 25%);"
                                                title="Cambiar Logo">
                                            <i class="fa-solid fa-camera"></i>
                                        </button>
                                        <input type="file" ref="fileInput" @change="handleFileUpload" hidden accept="image/*">
                                    </div>
                                    <p class="small text-muted mt-3 mb-0">Haz clic en la cámara para subir tu logo.</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold text-primary text-uppercase small border-bottom pb-2 mb-3">
                                        Datos Generales
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold text-muted">Nombre de la Tienda</label>
                                        <input type="text" v-model="form.NombreTienda" class="form-control minimal-input" required placeholder="Ej: Mi Negocio">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold text-muted">Redes Sociales / Web</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-hashtag text-muted"></i></span>
                                            <input type="text" v-model="form.RedSocial" class="form-control border-start-0 ps-0 minimal-input" placeholder="@mi_negocio">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold text-primary text-uppercase small border-bottom pb-2 mb-3">
                                        Contacto y Ticket
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold text-muted">Teléfono / WhatsApp</label>
                                        <input type="text" v-model="form.Telefono" class="form-control minimal-input" placeholder="55 1234 5678">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold text-muted">Dirección Física</label>
                                        <textarea v-model="form.Direccion" class="form-control minimal-input" rows="2" placeholder="Calle, Número, Ciudad..."></textarea>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted">Mensaje al pie del Ticket</label>
                                    <input type="text" v-model="form.MensajeTicket" class="form-control minimal-input" placeholder="¡Gracias por su compra! Vuelva pronto.">
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-4 pt-3 border-top">
                                <button type="submit" class="btn btn-primary px-4 fw-bold shadow-sm" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fa-solid fa-floppy-disk me-2"></i>
                                    {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
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
</style>