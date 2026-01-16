const { pool } = require('../config/db');
const { registrarAccion } = require('../utils/logger');

// 1. OBTENER PROVEEDORES
exports.getProveedores = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT * FROM "Proveedores" 
            WHERE "Activo" = true 
            ORDER BY "NomProveedor" ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
};

// 2. OBTENER UN PROVEEDOR POR ID
exports.getProveedorById = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT * FROM "Proveedores" 
            WHERE "IdProveedor" = $1 AND "Activo" = true
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Proveedor no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Error interno.' });
    } finally {
        client.release();
    }
};

// 3. CREAR PROVEEDOR
exports.createProveedor = async (req, res) => {
    const { NomProveedor, RFC, Direccion, Telefono, Email, NombreContacto } = req.body;
    const IdUsuario = req.user ? req.user.IdUsuario : null;
    if (!NomProveedor) {
        return res.status(400).json({ msg: 'El nombre del proveedor es obligatorio.' });
    }
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO "Proveedores" 
              ("NomProveedor", "RFC", "Direccion", "Telefono", "Email", "NombreContacto", "Activo", "FechaCreacion")
              VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
              RETURNING *
        `;
        const result = await client.query(query, [
            NomProveedor, RFC || '', Direccion || '', Telefono || '', Email || '', NombreContacto || ''
        ]);
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'CREAR_PROVEEDOR', `Alta de proveedor: ${NomProveedor}`);
        }
        res.status(201).json({ msg: 'Proveedor registrado.', proveedor: result.rows[0] });
    } catch (error) {
        console.error('Error crear:', error);
        res.status(500).json({ msg: 'Error interno.' });
    } finally {
        client.release();
    }
};

// 4. ACTUALIZAR PROVEEDOR
exports.updateProveedor = async (req, res) => {
    const { id } = req.params;
    const { NomProveedor, RFC, Direccion, Telefono, Email, NombreContacto } = req.body;
    const IdUsuario = req.user.IdUsuario;
    const client = await pool.connect();
    try {
        const query = `
            UPDATE "Proveedores" SET
                "NomProveedor" = $1,
                "RFC" = $2,
                "Direccion" = $3,
                "Telefono" = $4,
                "Email" = $5,
                "NombreContacto" = $6
            WHERE "IdProveedor" = $7 AND "Activo" = true
            RETURNING *
        `;
        const result = await client.query(query, [
            NomProveedor, RFC, Direccion, Telefono, Email, NombreContacto, id
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Proveedor no encontrado.' });
        }
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'EDITAR_PROVEEDOR', `Editó proveedor: ${NomProveedor}`);
        }
        res.json({ msg: 'Proveedor actualizado.', proveedor: result.rows[0] });
    } catch (error) {
        console.error('Error actualizar:', error);
        res.status(500).json({ msg: 'Error interno.' });
    } finally {
        client.release();
    }
};

// 5. ELIMINAR PROVEEDOR
exports.deleteProveedor = async (req, res) => {
    const { id } = req.params;
    const IdUsuario = req.user.IdUsuario;
    const client = await pool.connect();
    try {
        await client.query(`
            UPDATE "Proveedores" SET "Activo" = FALSE 
            WHERE "IdProveedor" = $1
        `, [id]);
        if (IdUsuario) {
            await registrarAccion(IdUsuario, 'BAJA_PROVEEDOR', `Eliminó proveedor ID ${id}`);
        }
        res.json({ msg: 'Proveedor eliminado correctamente.' });
    } catch (error) {
        console.error('Error eliminar:', error);
        res.status(500).json({ msg: 'Error interno.' });
    } finally {
        client.release();
    }
};