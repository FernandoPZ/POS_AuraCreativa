<script setup>
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();
</script>

<template>
  <div class="app-main-container">
    <Navbar v-if="!route.meta.hideNavbar" />
    
    <router-view />
  </div>
</template>