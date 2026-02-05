<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import { useConfigStore } from '@/stores/config';

const route = useRoute();
const configStore = useConfigStore();
onMounted(() => {
    configStore.fetchConfig();
});
</script>

<template>
  <div class="app-main-container">
    <Navbar v-if="!route.meta.hideNavbar" />
    
    <router-view />
  </div>
</template>