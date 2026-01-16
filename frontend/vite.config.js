import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Necesitas importar 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Configuración de resolución de alias
  resolve: {
    alias: {
      // Mapea el alias '@/' a la carpeta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})