const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const procesarImagen = async (file) => {
    if (!file) return null;
    try {
        const originalPath = file.path;
        const filename = file.filename;
        const outputFilename = `sq-${filename}`;
        const outputPath = path.join(file.destination, outputFilename);
        await sharp(originalPath)
            .resize(500, 500, {
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
            })
            .toFile(outputPath);
        fs.unlink(originalPath, (err) => {
            if (err) console.error("Error eliminando original:", err);
        });
        return outputFilename;
    } catch (error) {
        console.error("Error Sharp:", error);
        return file.filename;
    }
};

// 1. OBTENER ARTÍCULOS
exports.getArticulos = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT A."IdArticulo",
                   A."CodArticulo",
                   A."NomArticulo",
                   A."StockActual", 
                   A."PrecioVenta",
                   A."FechaCreacion",
                   A."Categoria",
                   A."Talla",
                   A."Color",
                   A."DetallesTecnicos",
                   A."NombreUnidad",
                   A."Imagen",
                   CS."CantidadMaxima",
                   CS."CantidadMinima",
                   P."NomProveedor"
                FROM "Articulos" AS A
                LEFT JOIN "CfgStock" AS CS ON A."IdCfgStock" = CS."IdCfgStock"
                LEFT JOIN "Proveedores" AS P ON A."IdProveedor" = P."IdProveedor"
                WHERE A."Activo" = true 
                ORDER BY A."NomArticulo" ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener artículos:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
};

// 2. OBTENER UN ARTÍCULO
exports.getArticuloById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT A."IdArticulo",
                   A."CodArticulo",
                   A."NomArticulo",
                   A."StockActual", 
                   A."PrecioVenta",
                   A."IdProveedor",
                   A."IdCfgStock",
                   A."Categoria",
                   A."Talla",
                   A."Color",
                   A."DetallesTecnicos",
                   A."NombreUnidad",
                   A."Imagen",
                   CS."CantidadMaxima",
                   CS."CantidadMinima"
                FROM "Articulos" AS A
                LEFT JOIN "CfgStock" AS CS ON A."IdCfgStock" = CS."IdCfgStock"
                WHERE A."IdArticulo" = $1 AND A."Activo" = true`, 
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Artículo no encontrado.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Error interno.' });
    } finally {
        client.release();
    }
};

// 3. CREAR ARTÍCULO
exports.createArticulo = async (req, res) => {
    const { 
        CodArticulo, NomArticulo, IdProveedor, CantidadMaxima, CantidadMinima, 
        PrecioVenta, Categoria, Talla, Color, DetallesTecnicos, NombreUnidad 
    } = req.body;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    const StockInicial = 0;
    const nombreImagen = await procesarImagen(req.file);
    if (!NomArticulo || !IdProveedor) return res.status(400).json({ msg: 'Nombre y Proveedor son obligatorios.' });
    const codigoFinal = CodArticulo && CodArticulo.trim() !== '' 
        ? CodArticulo.substring(0, 50) 
        : `ART-${Date.now()}`;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const cfgRes = await client.query(
            `INSERT INTO "CfgStock" ("CantidadMaxima", "CantidadMinima", "FechaAlta", "Activo") 
                VALUES ($1, $2, NOW(), TRUE)
                RETURNING "IdCfgStock"`,
            [CantidadMaxima || 10, CantidadMinima || 1]
        );
        const IdCfgStock = cfgRes.rows[0].IdCfgStock;
        const artQuery = `
            INSERT INTO "Articulos" ("CodArticulo", "NomArticulo", "IdProveedor", "IdCfgStock",
                                     "StockActual", "PrecioVenta", "Activo",
                                     "IdUsuarioCreacion", "FechaCreacion",
                                     "Categoria", "Talla", "Color", "DetallesTecnicos", "NombreUnidad", "Imagen")
                VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, NOW(), $8, $9, $10, $11, $12, $13)
                RETURNING *
        `;
        const result = await client.query(artQuery, [
            codigoFinal,
            NomArticulo.substring(0, 100),
            IdProveedor, 
            IdCfgStock, 
            StockInicial, 
            PrecioVenta || 0, 
            IdUsuario,
            (Categoria || 'GENERAL').substring(0, 50),
            Talla ? Talla.substring(0, 20) : null,
            Color ? Color.substring(0, 30) : null,
            DetallesTecnicos ? DetallesTecnicos.substring(0, 255) : '',
            (NombreUnidad || 'Pza').substring(0, 20),
            nombreImagen
        ]);
        await client.query('COMMIT');
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CREAR_ARTICULO', `Alta de producto: ${NomArticulo}`);
        }
        res.status(201).json({ msg: 'Artículo creado exitosamente', articulo: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error crear:', error);
        res.status(500).json({ msg: 'Error interno al crear artículo.' });
    } finally {
        client.release();
    }
};

// 4. ACTUALIZAR ARTÍCULO
exports.updateArticulo = async (req, res) => {
    const { id } = req.params;
    const { 
        NomArticulo, CantidadMaxima, CantidadMinima, IdProveedor, PrecioVenta,
        Categoria, Talla, Color, DetallesTecnicos, NombreUnidad 
    } = req.body;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    const nombreImagen = await procesarImagen(req.file);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const artCheck = await client.query('SELECT "IdCfgStock" FROM "Articulos" WHERE "IdArticulo" = $1', [id]);
        if (artCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Artículo no encontrado.' });
        }
        await client.query(
            'UPDATE "CfgStock" SET "CantidadMaxima" = $1, "CantidadMinima" = $2 WHERE "IdCfgStock" = $3',
            [CantidadMaxima, CantidadMinima, artCheck.rows[0].IdCfgStock]
        );
        let result;
        if (nombreImagen) {
            const updateQueryConImagen = `
                UPDATE "Articulos"
                    SET "NomArticulo" = $1,
                        "IdProveedor" = $2,
                        "PrecioVenta" = $3,
                        "Categoria" = $4,
                        "Talla" = $5,
                        "Color" = $6,
                        "DetallesTecnicos" = $7,
                        "NombreUnidad" = $8,
                        "FechaModificacion" = NOW(),
                        "Imagen" = $10
                    WHERE "IdArticulo" = $9
                    RETURNING *
            `;
            result = await client.query(updateQueryConImagen, [
                NomArticulo.substring(0, 100),
                IdProveedor, 
                PrecioVenta, 
                (Categoria || 'GENERAL').substring(0, 50),
                Talla ? Talla.substring(0, 20) : null,
                Color ? Color.substring(0, 30) : null,
                DetallesTecnicos ? DetallesTecnicos.substring(0, 255) : '',
                (NombreUnidad || 'Pza').substring(0, 20),
                id, 
                nombreImagen
            ]);
        } else {
            const updateQuerySinImagen = `
                UPDATE "Articulos"
                    SET "NomArticulo" = $1,
                        "IdProveedor" = $2,
                        "PrecioVenta" = $3,
                        "Categoria" = $4,
                        "Talla" = $5,
                        "Color" = $6,
                        "DetallesTecnicos" = $7,
                        "NombreUnidad" = $8,
                        "FechaModificacion" = NOW()
                    WHERE "IdArticulo" = $9
                    RETURNING *
            `;
            result = await client.query(updateQuerySinImagen, [
                NomArticulo.substring(0, 100),
                IdProveedor, 
                PrecioVenta, 
                (Categoria || 'GENERAL').substring(0, 50),
                Talla ? Talla.substring(0, 20) : null,
                Color ? Color.substring(0, 30) : null,
                DetallesTecnicos ? DetallesTecnicos.substring(0, 255) : '',
                (NombreUnidad || 'Pza').substring(0, 20),
                id
            ]);
        }
        await client.query('COMMIT');
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'EDITAR_ARTICULO', `Modificó producto ID ${id}: ${NomArticulo}`);
        }
        res.json({ msg: 'Artículo actualizado correctamente', articulo: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error actualizar:', error);
        res.status(500).json({ msg: 'Error interno al actualizar.' });
    } finally {
        client.release();
    }
};

// 5. ELIMINAR ARTÍCULO
exports.deleteArticulo = async (req, res) => {
    const { id } = req.params;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    const client = await pool.connect();
    try {
        await client.query(`
            UPDATE "Articulos"
                SET "Activo" = FALSE,
                    "FechaModificacion" = NOW()
                WHERE "IdArticulo" = $1
        `, [id]);
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'BAJA_ARTICULO', `Eliminó producto ID ${id}`);
        }
        res.json({ msg: 'Artículo eliminado correctamente.' });
    } catch (error) {
        console.error('Error eliminar:', error);
        res.status(500).json({ msg: 'Error interno al eliminar.' });
    } finally {
        client.release();
    }
};