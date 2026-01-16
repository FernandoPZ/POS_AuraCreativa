require('dotenv').config();
const { Pool } = require('pg');

// Configuración leída de .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Función para ejecutar queries (consultas)
const query = (text, params) => pool.query(text, params);


module.exports = {
  query,
  pool, // Exportamos pool para usarlo con Socket.IO
};
