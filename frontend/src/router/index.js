import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import DashboardView from '@/views/DashboardView.vue';
import LoginView from '@/views/LoginView.vue';
import ArticulosView from '@/views/ArticulosView.vue';
import ArticuloForm from '@/views/ArticuloForm.vue';
import MovimientosView from '@/views/MovimientosView.vue';
import ProveedoresView from '@/views/ProveedoresView.vue';
import ProveedorForm from '@/views/ProveedorForm.vue';
import UsuariosView from '@/views/UsuariosView.vue';
import UsuarioForm from '@/views/UsuarioForm.vue';
import PuntoVentaView from '@/views/PuntoVentaView.vue';
import EntradaForm from '@/views/EntradaForm.vue';
import CombosView from '@/views/CombosView.vue';
import ComboForm from '@/views/ComboForm.vue';
import HistorialVentas from '@/views/HistorialVentas.vue';
import HistorialCompras from '@/views/HistorialCompras.vue';
import ConfigTiendaView from '@/views/ConfigTiendaView.vue';
import PuntosEntregaView from '@/views/PuntosEntregaView.vue';
import BitacoraView from '@/views/BitacoraView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/articulos', name: 'Articulos', component: ArticulosView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView, meta: { hideNavbar: true } },
  { path: '/articulos/nuevo', name: 'ArticuloNuevo', component: ArticuloForm, meta: { requiresAuth: true } },
  { path: '/articulos/editar/:id', name: 'ArticuloEditar', component: ArticuloForm, meta: { requiresAuth: true } },
  { path: '/movimientos', name: 'Movimientos', component: MovimientosView, meta: { requiresAuth: true } },
  { path: '/proveedores', name: 'Proveedores', component: ProveedoresView, meta: { requiresAuth: true } },
  { path: '/proveedores/nuevo', name: 'ProveedorNuevo', component: ProveedorForm, meta: { requiresAuth: true } },
  { path: '/proveedores/editar/:id', name: 'ProveedorEditar', component: ProveedorForm, meta: { requiresAuth: true } },
  { path: '/usuarios', name: 'UsuariosList', component: UsuariosView, meta: { requiresAuth: true } },
  { path: '/usuarios/nuevo', name: 'UsuarioNuevo', component: UsuarioForm, meta: { requiresAuth: true } },
  { path: '/usuarios/editar/:id', name: 'UsuarioEditar', component: UsuarioForm, meta: { requiresAuth: true } },
  { path: '/pos', name: 'PuntoVenta', component: PuntoVentaView, meta: { requiresAuth: true } },
  { path: '/entradas/nueva', name: 'NuevaEntrada', component: EntradaForm, meta: { requiresAuth: true } },
  { path: '/combos', name: 'Combos', component: CombosView, meta: { requiresAuth: true } },
  { path: '/combos/nuevo', name: 'ComboNuevo', component: ComboForm, meta: { requiresAuth: true } },
  { path: '/combos/editar/:id', name: 'ComboEditar', component: ComboForm, meta: { requiresAuth: true } },
  { path: '/historial/ventas', name: 'HistorialVentas', component: HistorialVentas, meta: { requiresAuth: true } },
  { path: '/historial/compras', name: 'HistorialCompras', component: HistorialCompras, meta: { requiresAuth: true } },
  { path: '/configuracion', name: 'Configuracion', component: ConfigTiendaView, meta: { requiresAuth: true } },
  { path: '/puntos-entrega', component: PuntosEntregaView, meta: { requiresAuth: true } },
  { path: '/bitacora', name: 'Bitacora', component: BitacoraView, meta: { requiresAuth: true } },
  { path: '/:catchAll(.*)', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Articulos' });
  } else {
    next(); 
  }
});

export default router;