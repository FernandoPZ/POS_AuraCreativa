const { pool } = require('../config/db');

exports.getResumen = async (req, res) => {
    const client = await pool.connect();
    try {
        const ventasHoyQuery = `
            SELECT COALESCE(SUM("Total"), 0) as total
                FROM "Ventas"
                WHERE DATE("Fecha") = CURRENT_DATE
        `;
        const ventasMesQuery = `
            SELECT COALESCE(SUM("Total"), 0) as total
                FROM "Ventas"
                WHERE EXTRACT(MONTH FROM "Fecha") = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM "Fecha") = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const stockBajoQuery = `
            SELECT COUNT(*) as total
                FROM "Articulos" A
                INNER JOIN "CfgStock" C ON A."IdCfgStock" = C."IdCfgStock"
                WHERE A."StockActual" <= C."CantidadMinima"
                AND C."Activo" = true
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
        const [ventasHoyRes, ventasMesRes, stockRes, recientesRes] = await Promise.all([
            client.query(ventasHoyQuery),
            client.query(ventasMesQuery),
            client.query(stockBajoQuery),
            client.query(recientesQuery)
        ]);
        res.json({
            ventasHoy: Number(ventasHoyRes.rows[0].total),
            ventasMes: Number(ventasMesRes.rows[0].total),
            stockBajo: Number(stockRes.rows[0].total),
            ventasRecientes: recientesRes.rows
        });
    } catch (error) {
        console.error('Error en Dashboard:', error.message);
        res.status(500).json({ msg: 'Error al cargar el resumen del sistema.' });
    } finally {
        client.release();
    }
};