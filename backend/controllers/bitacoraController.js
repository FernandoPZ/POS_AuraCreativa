const { pool } = require('../config/db');
// 1. OBTENER BITÁCORA DE ACTIVIDADES
exports.getBitacora = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                b.id,
                b.accion,
                b.detalles,
                b.fecha,
                COALESCE(u."Nombre", 'Usuario Eliminado') as "Usuario",
                u."Rol"
            FROM bitacora_actividades b
            LEFT JOIN "Usuario" u ON b.usuario_id = u."IdUsuario"
            ORDER BY b.fecha DESC
            LIMIT 100
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al leer bitácora:", error);
        res.status(500).json({ msg: 'Error al obtener bitácora' });
    } finally {
        client.release();
    }
};