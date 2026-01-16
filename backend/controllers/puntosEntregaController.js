const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER PUNTOS ACTIVOS
exports.getPuntos = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM "PuntosEntrega" WHERE "Activo" = TRUE ORDER BY "NombrePunto" ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener puntos' });
    } finally {
        client.release();
    }
};

// 2. CREAR PUNTO
exports.createPunto = async (req, res) => {
    const { NombrePunto, LinkGoogleMaps } = req.body;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    if (!NombrePunto) {
        return res.status(400).json({ msg: 'El nombre del punto es obligatorio' });
    }
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO "PuntosEntrega" ("NombrePunto", "LinkGoogleMaps", "Activo") VALUES ($1, $2, TRUE) RETURNING *',
            [NombrePunto, LinkGoogleMaps]
        );
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CREAR_PUNTO', `Creó punto de entrega: ${NombrePunto}`);
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear punto' });
    } finally {
        client.release();
    }
};

// 3. ACTUALIZAR PUNTO
exports.updatePunto = async (req, res) => {
    const { id } = req.params;
    const { NombrePunto, LinkGoogleMaps } = req.body;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    const client = await pool.connect();
    try {
        await client.query(
            'UPDATE "PuntosEntrega" SET "NombrePunto" = $1, "LinkGoogleMaps" = $2 WHERE "IdPunto" = $3',
            [NombrePunto, LinkGoogleMaps, id]
        );
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'EDITAR_PUNTO', `Editó punto ID ${id}: ${NombrePunto}`);
        }
        res.json({ msg: 'Punto actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar punto' });
    } finally {
        client.release();
    }
};

// 4. ELIMINAR (DESACTIVAR)
exports.deletePunto = async (req, res) => {
    const { id } = req.params;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    const client = await pool.connect();
    try {
        await client.query('UPDATE "PuntosEntrega" SET "Activo" = FALSE WHERE "IdPunto" = $1', [id]);
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'BAJA_PUNTO', `Eliminó punto ID ${id}`);
        }
        res.json({ msg: 'Punto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar punto' });
    } finally {
        client.release();
    }
};