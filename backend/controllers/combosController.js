const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER COMBOS
exports.getCombos = async (req, res) => {
    const client = await pool.connect();
    try {
        const queryHeader = `
            SELECT "IdCombo",
                   "Nombre",
                   "Codigo",
                   "Precio",
                   "Activo"
                FROM "Combos"
                WHERE "Activo" = true
                ORDER BY "Nombre" ASC
        `;
        const resultHeader = await client.query(queryHeader);
        const combos = resultHeader.rows;
        for (let combo of combos) {
            const queryDetalle = `
                SELECT a."IdArticulo", 
                       a."NomArticulo", 
                       a."NombreUnidad", 
                       dc."Cantidad"
                    FROM "DetalleCombos" dc
                    JOIN "Articulos" a ON dc."IdArticulo" = a."IdArticulo"
                    WHERE dc."IdCombo" = $1
            `;
            const resultDetalle = await client.query(queryDetalle, [combo.IdCombo]);
            combo.ingredientes = resultDetalle.rows;
        }
        res.json(combos);
    } catch (error) {
        console.error('Error al obtener combos:', error);
        res.status(500).json({ msg: 'Error al obtener los combos.' });
    } finally {
        client.release();
    }
};

// 2. OBTENER UN COMBO POR ID (CON DETALLE)
exports.getComboById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const headerRes = await client.query('SELECT * FROM "Combos" WHERE "IdCombo" = $1', [id]);
        if (headerRes.rows.length === 0) return res.status(404).json({ msg: 'Combo no encontrado.' });
        const detailQuery = `
            SELECT dc."IdArticulo",
                   a."NomArticulo",
                   a."NombreUnidad",
                   dc."Cantidad"
            FROM "DetalleCombos" dc
            JOIN "Articulos" a ON dc."IdArticulo" = a."IdArticulo"
            WHERE dc."IdCombo" = $1
        `;
        const detailRes = await client.query(detailQuery, [id]);
        res.json({ ...headerRes.rows[0], ingredientes: detailRes.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener detalle del combo.' });
    } finally {
        client.release();
    }
};

// 3. CREAR COMBO
exports.createCombo = async (req, res) => {
    const { Nombre, Codigo, Precio, Ingredientes } = req.body;
    const IdUsuario = req.user.IdUsuario;
    const codigoFinal = Codigo && Codigo.trim() !== '' ? Codigo : `KIT-${Date.now()}`;
    if (!Nombre || !Precio || !Ingredientes || Ingredientes.length === 0) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const headerQuery = `
            INSERT INTO "Combos" ("Nombre", "Codigo", "Precio", "Activo", "IdUsuarioCreacion", "FechaCreacion")
            VALUES ($1, $2, $3, true, $4, NOW())
            RETURNING "IdCombo"
        `;
        const headerRes = await client.query(headerQuery, [Nombre, codigoFinal, Precio, IdUsuario]);
        const IdCombo = headerRes.rows[0].IdCombo;
        for (const item of Ingredientes) {
            await client.query(
                'INSERT INTO "DetalleCombos" ("IdCombo", "IdArticulo", "Cantidad") VALUES ($1, $2, $3)',
                [IdCombo, item.IdArticulo, item.Cantidad]
            );
        }
        await client.query('COMMIT');
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CREAR_COMBO', `Creó paquete: ${Nombre}`);
        }
        res.status(201).json({ msg: 'Combo creado exitosamente', IdCombo });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ msg: 'Error al crear combo.' });
    } finally {
        client.release();
    }
};

// 4. ACTUALIZAR COMBO
exports.updateCombo = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Codigo, Precio, Ingredientes } = req.body;
    const IdUsuario = req.user.IdUsuario;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const headerQuery = `
            UPDATE "Combos"
            SET "Nombre" = $1,
                "Codigo" = $2,
                "Precio" = $3
            WHERE "IdCombo" = $4
        `;
        await client.query(headerQuery, [Nombre, Codigo, Precio, id]);
        await client.query('DELETE FROM "DetalleCombos" WHERE "IdCombo" = $1', [id]);
        for (const item of Ingredientes) {
            await client.query(
                'INSERT INTO "DetalleCombos" ("IdCombo", "IdArticulo", "Cantidad") VALUES ($1, $2, $3)',
                [id, item.IdArticulo, item.Cantidad]
            );
        }
        await client.query('COMMIT');
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'EDITAR_COMBO', `Modificó paquete ID ${id}: ${Nombre}`);
        }
        res.json({ msg: 'Combo actualizado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar combo.' });
    } finally {
        client.release();
    }
};

// 5. ELIMINAR COMBO
exports.deleteCombo = async (req, res) => {
    const { id } = req.params;
    const IdUsuario = req.user.IdUsuario;
    const client = await pool.connect();
    try {
        await client.query('UPDATE "Combos" SET "Activo" = false WHERE "IdCombo" = $1', [id]);
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'BAJA_COMBO', `Eliminó paquete ID ${id}`);
        }
        res.json({ msg: 'Combo eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar combo.' });
    } finally {
        client.release();
    }
};