require('dotenv').config();
const express = require('express');
const http = require('http');

const cors = require('cors');
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

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

const app = express();
const server = http.createServer(app); // Creamos el servidor HTTP
const socket = require('./socket'); // Importa el manejador de socket
socket.init(server); // Inicializa Socket.IO usando el manejador externo

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite a Express leer JSON en el body de las peticiones
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Sirve archivos estáticos desde la carpeta 'public/uploads'

// Rutas
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

// El manejador de conexiones está en socket.js

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});

// Exportamos app y server para usarlo en otros archivos
module.exports = { app, server };

// coemtario generico
