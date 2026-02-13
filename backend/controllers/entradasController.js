const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER HISTORIAL DE ENTRADAS
exports.getEntradas = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT e."IdEntrada",
                   e."Fecha",
                   e."Total",
                   e."Comentarios",
                   p."NomProveedor",
                   p."RFC",
                   u."Nombre" as "Usuario"
                FROM "Entradas" e
                JOIN "Proveedores" p ON e."IdProveedor" = p."IdProveedor"
                LEFT JOIN "Usuario" u ON e."IdUsuarioCreacion" = u."IdUsuario"
                ORDER BY e."Fecha" DESC
                LIMIT 100
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener historial de compras.' });
    } finally {
        client.release();
    }
};

// 2. REGISTRAR ENTRADA (COMPRA) + CÁLCULO DE COSTO PROMEDIO
exports.createEntrada = async (req, res) => {
    const client = await pool.connect();
    try {
        const { IdProveedor, Total, Productos, Comentarios } = req.body;
        const IdUsuario = req.user.IdUsuario;
        if (!Productos || Productos.length === 0) {
            return res.status(400).json({ msg: 'No hay productos en la compra.' });
        }
        await client.query('BEGIN');
        const entradaQuery = `
            INSERT INTO "Entradas" 
                ("IdProveedor", "Total", "Comentarios", "IdUsuarioCreacion", "Fecha")
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING "IdEntrada"
        `;
        const entradaRes = await client.query(entradaQuery, [IdProveedor, Total, Comentarios || '', IdUsuario]);
        const IdEntrada = entradaRes.rows[0].IdEntrada;
        for (const prod of Productos) {
            const CantidadEntrante = Number(prod.Cantidad);
            const CostoUnitarioEntrante = Number(prod.Costo);
            const subtotal = CantidadEntrante * CostoUnitarioEntrante;
            const detalleQuery = `
                INSERT INTO "DetalleEntradas" ("IdEntrada", "IdArticulo", "Cantidad", "CostoUnitario", "Subtotal")
                    VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(detalleQuery, [IdEntrada, prod.IdArticulo, CantidadEntrante, CostoUnitarioEntrante, subtotal]);
            const artActual = await client.query(
                'SELECT "StockActual", "CostoPromedio" FROM "Articulos" WHERE "IdArticulo" = $1', 
                [prod.IdArticulo]
            );
            if (artActual.rows.length > 0) {
                const StockActual = Number(artActual.rows[0].StockActual) || 0;
                const CostoPromedioActual = Number(artActual.rows[0].CostoPromedio) || 0;
                const NuevoStockTotal = StockActual + CantidadEntrante;
                let NuevoCostoPromedio = CostoUnitarioEntrante;
                if (NuevoStockTotal > 0) {
                    const ValorTotalInventario = (StockActual * CostoPromedioActual) + (CantidadEntrante * CostoUnitarioEntrante);
                    NuevoCostoPromedio = ValorTotalInventario / NuevoStockTotal;
                }
                const updateQuery = `
                    UPDATE "Articulos"
                        SET "StockActual" = $1,
                            "CostoPromedio" = $2,
                            "FechaModificacion" = NOW()
                        WHERE "IdArticulo" = $3
                `;
                await client.query(updateQuery, [NuevoStockTotal, NuevoCostoPromedio, prod.IdArticulo]);
            }
        }

        await client.query('COMMIT');

        // Log de auditoría
        if (IdUsuario) {
            await registrarAccion(
                IdUsuario, 
                'NUEVA_COMPRA', 
                `Entrada #${IdEntrada} - Prov: ${IdProveedor} - Total: $${Number(Total).toFixed(2)}`
            );
        }
        res.status(201).json({ msg: 'Compra registrada y stock actualizado.', IdEntrada });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en createEntrada:", error);
        res.status(500).json({ msg: 'Error al procesar la compra.' });
    } finally {
        client.release();
    }
};

// 3. OBTENER DETALLES DE UNA ENTRADA
exports.getDetalleEntrada = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const query = `
            SELECT d."Cantidad",
                   d."CostoUnitario",
                   d."Subtotal",
                   a."NomArticulo",
                   a."CodArticulo",
                   a."Talla",
                   a."Color",
                   a."NombreUnidad"
                FROM "DetalleEntradas" d
                JOIN "Articulos" a ON d."IdArticulo" = a."IdArticulo"
                WHERE d."IdEntrada" = $1
        `;
        const result = await client.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener detalles.' });
    } finally {
        client.release();
    }
};