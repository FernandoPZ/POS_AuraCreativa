const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER VENTAS (HISTORIAL)
exports.getVentas = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT v."IdVenta", 
                   v."Fecha", 
                   v."Total", 
                   v."Estado", 
                   v."ClienteNombre",
                   COALESCE(u."Nombre", 'Usuario Desconocido') as "Vendedor",
                   COALESCE(pe."NombrePunto", 'Mostrador General') as "PuntoEntrega" -- AGREGADO
            FROM "Ventas" v
            LEFT JOIN "Usuario" u ON v."IdUsuario" = u."IdUsuario"
            LEFT JOIN "PuntosEntrega" pe ON v."IdPuntoEntrega" = pe."IdPunto" -- JOIN con Puntos
            ORDER BY v."Fecha" DESC
            LIMIT 100
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    } finally {
        client.release();
    }
};

// 2. OBTENER DETALLES (TICKET)
exports.getVentaDetalles = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const query = `
            SELECT dv."Cantidad",
                   dv."PrecioUnitario",
                   dv."Subtotal",
                   COALESCE(a."NomArticulo", c."Nombre", 'Producto Eliminado') as "Producto",
                   CASE WHEN dv."IdCombo" IS NOT NULL THEN 'COMBO' ELSE 'ARTICULO' END as "Tipo"
            FROM "DetalleVentas" dv
            LEFT JOIN "Articulos" a ON dv."IdArticulo" = a."IdArticulo"
            LEFT JOIN "Combos" c ON dv."IdCombo" = c."IdCombo"
            WHERE dv."IdVenta" = $1
        `;
        const result = await client.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener detalles' });
    } finally {
        client.release();
    }
};

// 3. CREAR VENTA (POS)
exports.crearVenta = async (req, res) => {
    const client = await pool.connect();
    try {
        const { total, productos, clienteNombre, idPuntoEntrega } = req.body;
        const idUsuario = req.user ? req.user.IdUsuario : null;
        if (!productos || productos.length === 0) {
            return res.status(400).json({ msg: 'El carrito está vacío' });
        }
        if (!idPuntoEntrega) {
            return res.status(400).json({ msg: 'Debes seleccionar un Punto de Entrega' });
        }
        await client.query('BEGIN');
        const ventaQuery = `
            INSERT INTO "Ventas" 
                ("IdUsuario", "Total", "Fecha", "Estado", "ClienteNombre", "IdPuntoEntrega")
            VALUES ($1, $2, NOW(), 'COMPLETADA', $3, $4)
            RETURNING "IdVenta";
        `;
        const ventaResult = await client.query(ventaQuery, [
            idUsuario, 
            total, 
            clienteNombre || 'Público General', 
            idPuntoEntrega
        ]);
        const idVenta = ventaResult.rows[0].IdVenta;
        for (const item of productos) {
            const subtotal = item.cantidad * item.precio;
            if (item.tipo === 'COMBO') {
                await client.query(
                    `INSERT INTO "DetalleVentas" ("IdVenta", "IdCombo", "Cantidad", "PrecioUnitario", "Subtotal") 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [idVenta, item.id, item.cantidad, item.precio, subtotal]
                );
                const recetaRes = await client.query(
                    `SELECT "IdArticulo", "Cantidad" FROM "DetalleCombos" WHERE "IdCombo" = $1`,
                    [item.id]
                );
                for (const ing of recetaRes.rows) {
                    await client.query(
                        `UPDATE "Articulos" SET "StockActual" = "StockActual" - $1 WHERE "IdArticulo" = $2`,
                        [item.cantidad * ing.Cantidad, ing.IdArticulo]
                    );
                }
            } else {
                await client.query(
                    `INSERT INTO "DetalleVentas" ("IdVenta", "IdArticulo", "Cantidad", "PrecioUnitario", "Subtotal") 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [idVenta, item.id, item.cantidad, item.precio, subtotal]
                );
                await client.query(
                    `UPDATE "Articulos" SET "StockActual" = "StockActual" - $1 WHERE "IdArticulo" = $2`,
                    [item.cantidad, item.id]
                );
            }
        }

        await client.query('COMMIT');

        if (idUsuario) {
            await registrarAccion(
                idUsuario, 
                'NUEVA_VENTA', 
                `Venta #${idVenta} por $${total} en punto ID ${idPuntoEntrega}`
            );
        }
        res.status(201).json({ message: 'Venta registrada exitosamente', idVenta });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en venta:', error);
        res.status(500).json({ message: 'Error al procesar la venta: ' + error.message });
    } finally {
        client.release();
    }
};