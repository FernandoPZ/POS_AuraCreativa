// 1. OBTENER HISTORIAL DE MOVIMIENTOS
exports.getHistorialMovimientos = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT E."IdEntrada" AS "IdMovimiento",
                   E."IdArticulo",
                   A."NomArticulo",
                   'ENTRADA' AS "TipoMovimiento",
                   E."Cantidad",
                   A."StockActual" AS "StockFinal",
                   E."FechaMovimiento"
                FROM "Entradas" E
                JOIN "Articulos" A ON E."IdArticulo" = A."IdArticulo"
                WHERE E."BajaLogica" = TRUE
                UNION ALL
            SELECT S."IdSalida" AS "IdMovimiento",
                   S."IdArticulo",
                   A."NomArticulo",
                   'SALIDA' AS "TipoMovimiento",
                   S."Cantidad",
                   A."StockActual" AS "StockFinal",
                   S."FechaMovimiento"
                FROM "Salidas" S
                JOIN "Articulos" A ON S."IdArticulo" = A."IdArticulo"
                WHERE S."BajaLogica" = TRUE
                ORDER BY "FechaMovimiento" DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener historial de movimientos:', error);
        res.status(500).json({ msg: 'Error interno al obtener historial de movimientos.' });
    } finally {
        client.release();
    }
};
const { query, pool } = require('../config/db');
const { getIO } = require('../socket');
const getUserInfo = (req) => {
    const ClaUserMod = req.user ? req.user.id : 0; 
    const NombrePcMod = 'WEB_APP_MOV';
    return { ClaUserMod, NombrePcMod };
};
const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);
// 2. ENTRADA DE INSUMO
exports.entradaInsumo = async (req, res) => {
    const { IdArticulo, Cantidad, Comentarios } = req.body;
    const { ClaUserMod, NombrePcMod } = getUserInfo(req);
    const client = await pool.connect();
    if (!IdArticulo || !Cantidad || !isNumeric(Cantidad) || !isNumeric(IdArticulo)) {
        return res.status(400).json({ msg: 'Debe especificar el artículo y una cantidad numérica válida.' });
    }
    const cantidadNumerica = parseInt(Cantidad);
    if (cantidadNumerica <= 0) {
        return res.status(400).json({ msg: 'La cantidad de entrada debe ser mayor a cero.' });
    }
    try {
        await client.query('BEGIN');
        const stockQuery = await client.query(
            `SELECT A."StockActual",
                    CS."CantidadMaxima" 
                FROM "Articulos" AS A
                JOIN "CfgStock" AS CS ON A."IdCfgStock" = CS."IdCfgStock"
                WHERE A."IdArticulo" = $1 AND A."BajaLogica" = TRUE`,
            [IdArticulo]
        );
        if (stockQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Artículo no encontrado o dado de baja.' });
        }
        const { StockActual, CantidadMaxima } = stockQuery.rows[0];
        const nuevoStock = StockActual + cantidadNumerica;
        if (nuevoStock > CantidadMaxima) {
            await client.query('ROLLBACK');
            const excedente = nuevoStock - CantidadMaxima;
            return res.status(400).json({ 
                msg: `Advertencia: La entrada excede la cantidad máxima de ${CantidadMaxima}. Se excede por ${excedente} unidad(es).`,
                alertType: 'warning' 
            });
        }
        await client.query(
            `UPDATE "Articulos" SET "StockActual" = $1, "FechaUltMod" = NOW(), "ClaUserMod" = $2, "NombrePcMod" = $3 
             WHERE "IdArticulo" = $4`,
            [nuevoStock, ClaUserMod, NombrePcMod, IdArticulo]
        );
        await client.query(
            `INSERT INTO "Entradas" ("IdArticulo", "Cantidad", "Comentarios", "FechaMovimiento", "FechaUltMod", "ClaUserMod", "NombrePcMod", "BajaLogica") 
                VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, TRUE)`,
            [IdArticulo, cantidadNumerica, Comentarios, ClaUserMod, NombrePcMod]
        );
       await client.query('COMMIT');
        getIO().emit('stockUpdate', { 
            id: IdArticulo, 
            newStock: nuevoStock,
            message: `El stock del artículo ${IdArticulo} ha sido actualizado a ${nuevoStock}.`
        });
        res.json({ msg: 'Entrada registrada exitosamente.', nuevoStock });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en entrada de insumo (ROLLBACK):', error);
        res.status(500).json({ msg: 'Error interno del servidor al registrar entrada.' });
    } finally {
        client.release();
    }
};
// 3. SALIDA DE INSUMO
exports.salidaInsumo = async (req, res) => {
    const { IdArticulo, Cantidad, Comentarios } = req.body;
    const { ClaUserMod, NombrePcMod } = getUserInfo(req);
    const client = await pool.connect();
    if (!IdArticulo || !Cantidad || !isNumeric(Cantidad) || !isNumeric(IdArticulo)) {
        return res.status(400).json({ msg: 'Debe especificar el artículo y una cantidad numérica válida.' });
    }
    const cantidadNumerica = parseInt(Cantidad);
    if (cantidadNumerica <= 0) {
        return res.status(400).json({ msg: 'La cantidad de salida debe ser mayor a cero.' });
    }
    try {
        await client.query('BEGIN');
        const stockQuery = await client.query(
            `SELECT A."StockActual",
                    CS."CantidadMinima" 
                FROM "Articulos" AS A
                JOIN "CfgStock" AS CS ON A."IdCfgStock" = CS."IdCfgStock"
                WHERE A."IdArticulo" = $1 AND A."BajaLogica" = TRUE`,
            [IdArticulo]
        );
        if (stockQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Artículo no encontrado o dado de baja.' });
        }
        const { StockActual, CantidadMinima } = stockQuery.rows[0];
        const nuevoStock = StockActual - cantidadNumerica;
        if (nuevoStock < 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                msg: `No se puede realizar la salida. Stock actual insuficiente: ${StockActual} unidad(es).`,
                alertType: 'error' 
            });
        }
        let stockAlert = null;
        if (nuevoStock <= CantidadMinima) {
            stockAlert = `ATENCIÓN: La salida deja el stock en ${nuevoStock}, alcanzando el límite mínimo de ${CantidadMinima}.`;
        }
        await client.query(
            `UPDATE "Articulos"
                SET "StockActual" = $1,
                    "FechaUltMod" = NOW(),
                    "ClaUserMod" = $2,
                    "NombrePcMod" = $3
                WHERE "IdArticulo" = $4`,
            [nuevoStock, ClaUserMod, NombrePcMod, IdArticulo]
        );
        await client.query(
            `INSERT INTO "Salidas" ("IdArticulo", "Cantidad", "Comentarios", "FechaMovimiento", "FechaUltMod", "ClaUserMod", "NombrePcMod", "BajaLogica") 
                VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, TRUE)`,
            [IdArticulo, cantidadNumerica, Comentarios, ClaUserMod, NombrePcMod]
        );
        await client.query('COMMIT');
    getIO().emit('stockUpdate', { message: `Stock de artículo ${IdArticulo} actualizado.` });
        const response = { 
            msg: 'Salida registrada exitosamente.', 
            nuevoStock, 
            alert: stockAlert 
        };
        res.json(response);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en salida de insumo (ROLLBACK):', error);
        res.status(500).json({ msg: 'Error interno del servidor al registrar salida.' });
    } finally {
        client.release();
    }
};