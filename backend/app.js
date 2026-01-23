require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// 1. INICIALIZAR LA APP (Primero que nada)
const app = express();
const server = http.createServer(app);
const socket = require('./socket');

// 2. MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// 3. ARCHIVOS ESTÁTICOS
// Sirve la carpeta 'dist' que está DENTRO de backend (según lo que movimos)
app.use(express.static(path.join(__dirname, 'dist')));
// Sirve las imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 4. INICIALIZAR SOCKET
socket.init(server);

// 5. IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes');
const articuloRoutes = require('./routes/articuloRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const combosRoutes = require('./routes/combosRoutes');
const entradasRoutes = require('./routes/entradasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const configRoutes = require('./routes/configRoutes');
const puntosRoutes = require('./routes/puntosEntregaRoutes');
const bitacoraRoutes = require('./routes/bitacoraRoutes');

// 6. DEFINIR RUTAS DE API (Antes del comodín del frontend)
app.use('/api', authRoutes);
app.use('/api', articuloRoutes);
app.use('/api', movimientoRoutes);
app.use('/api', proveedorRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api/puntos-entrega', puntosRoutes);
app.use('/api/bitacora', bitacoraRoutes);

// 7. RUTA COMODÍN PARA EL FRONTEND (SPA)
// IMPORTANTE: Esto debe ir AL FINAL de todo.
// Si la petición no fue para una imagen, ni para la API, entonces entregamos el index.html
// CORRECTO (Usa /.*/ sin comillas)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 8. ARRANCAR SERVIDOR
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});

module.exports = { app, server };
