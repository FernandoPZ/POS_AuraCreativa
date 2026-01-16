const { pool } = require('../config/db');

exports.registrarAccion = async (idUsuario, accion, detalle) => {
    try {
        const query = `
            INSERT INTO bitacora_actividades (usuario_id, accion, detalles, fecha)
            VALUES ($1, $2, $3, NOW())
        `;
        await pool.query(query, [idUsuario, accion, detalle]);
    } catch (error) {
        console.error("Error al registrar bitácora:", error.message);
    }
};