const { pool } = require('../config/db');
// 1. OBTENER RESUMEN DEL DASHBOARD
exports.getResumen = async (req, res) => {
    const client = await pool.connect();
    try {
        const ventasQuery = `
            SELECT COALESCE(SUM("Total"), 0) as total
                FROM "Ventas"
                WHERE DATE("Fecha") = CURRENT_DATE
        `;
        const comprasQuery = `
            SELECT COALESCE(SUM("Total"), 0) as total
                FROM "Entradas"
                WHERE DATE("Fecha") = CURRENT_DATE
        `;
        const stockBajoQuery = `
            SELECT "NomArticulo",
                   "StockActual"
                FROM "Articulos"
                WHERE "StockActual" <= 5 AND "BajaLogica" IS NOT TRUE
                LIMIT 5
        `;
        const recientesQuery = `
            SELECT v."IdVenta",
                   v."Total",
                   v."Fecha",
                   u."Nombre" as "Vendedor"
                FROM "Ventas" v
                LEFT JOIN "Usuario" u ON v."IdUsuario" = u."IdUsuario"
                ORDER BY v."Fecha" DESC
                LIMIT 5
        `;
        const [ventasRes, comprasRes, stockRes, recientesRes] = await Promise.all([
            client.query(ventasQuery),
            client.query(comprasQuery),
            client.query(stockBajoQuery),
            client.query(recientesQuery)
        ]);
        res.json({
            ventasHoy: ventasRes.rows[0].total,
            comprasHoy: comprasRes.rows[0].total,
            stockBajo: stockRes.rows,
            ventasRecientes: recientesRes.rows
        });
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.status(500).json({ msg: 'Error al cargar resumen' });
    } finally {
        client.release();
    }
};